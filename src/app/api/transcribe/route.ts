import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { GoogleGenerativeAI } from "@google/generative-ai";

async function callWithRetry<T>(fn: () => Promise<T>, maxRetries = 3): Promise<T> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error: unknown) {
      if (i === maxRetries - 1) throw error;
      const err = error as { status?: number; message?: string };
      if (err?.status === 503 || err?.message?.includes("high demand")) {
        await new Promise(resolve => setTimeout(resolve, 2000 * (i + 1)));
        continue;
      }
      if (err?.status === 429) throw error;
      throw error;
    }
  }
  throw new Error("Max retries exceeded");
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const audioFile = formData.get("audio") as File | null;

    if (!audioFile) {
      return NextResponse.json({ error: "No audio file provided" }, { status: 400 });
    }

    const allowedTypes = ["audio/mpeg", "audio/wav", "audio/webm", "audio/mp4", "audio/x-m4a"];
    if (!allowedTypes.includes(audioFile.type)) {
      return NextResponse.json({ error: "Invalid audio file type" }, { status: 400 });
    }

    if (audioFile.size > 50 * 1024 * 1024) {
      return NextResponse.json({ error: "File too large (max 50MB)" }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === "your-gemini-api-key-here") {
      return NextResponse.json({ error: "GEMINI_API_KEY not configured" }, { status: 500 });
    }

    const arrayBuffer = await audioFile.arrayBuffer();
    const base64Audio = Buffer.from(arrayBuffer).toString("base64");

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const mimeType = audioFile.type || "audio/mpeg";
    
    const result = await callWithRetry(async () => {
      return await model.generateContent({
        contents: [{
          role: "user",
          parts: [
            { text: "Please transcribe this audio accurately. Return only the transcription text." },
            { inlineData: { data: base64Audio, mimeType } }
          ]
        }]
      });
    });

    const transcription = result?.response?.text() || "";

    if (!transcription) {
      return NextResponse.json({ error: "No transcription returned" }, { status: 500 });
    }

    const transcript = await prisma.transcript.create({
      data: {
        content: transcription,
        userId: session.user.id,
      },
    });

    return NextResponse.json({ success: true, transcript });
  } catch (error: unknown) {
    console.error("Transcription error:", error);
    
    const err = error as { status?: number };
    if (err?.status === 429) {
      return NextResponse.json(
        { error: "Gemini API rate limit. Please wait and try again." },
        { status: 429 }
      );
    }
    
    if (err?.status === 503) {
      return NextResponse.json(
        { error: "Gemini is busy. Please wait a moment and try again." },
        { status: 503 }
      );
    }
    
    return NextResponse.json(
      { error: "Transcription failed" },
      { status: 500 }
    );
  }
}