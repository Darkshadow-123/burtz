import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "The Project - Audio Transcription",
  description: "Audio transcription app using Gemini API",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <html lang="en"><body>{children}</body></html>;
}