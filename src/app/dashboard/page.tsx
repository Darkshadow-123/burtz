"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import styles from "./page.module.css";

interface Transcript {
  id: string;
  content: string;
  createdAt: string;
}

export default function Dashboard() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();

  const [transcripts, setTranscripts] = useState<Transcript[]>([]);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [transcribing, setTranscribing] = useState(false);
  const [message, setMessage] = useState("");
  const [isNavVisible, setIsNavVisible] = useState(true);
  const [isDragging, setIsDragging] = useState(false);

  const fetchTranscripts = async () => {
    try {
      const res = await fetch("/api/transcripts");
      const data = await res.json();
      if (data.transcripts) {
        setTranscripts(data.transcripts);
      }
    } catch (error) {
      console.error("Failed to fetch transcripts:", error);
    }
  };



  useEffect(() => {
    if (!isPending) {
      if (!session) {
        router.push("/");
      } else {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        fetchTranscripts();
      }
    }
  }, [session, isPending, router]);

  useEffect(() => {
    let lastScrollY = window.scrollY;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY && currentScrollY > 50) {
        setIsNavVisible(false);
      } else {
        setIsNavVisible(true);
      }
      lastScrollY = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);



  const handleLogout = async () => {
    try {
      await authClient.signOut({
        fetchOptions: {
          onSuccess: () => {
            router.push("/");
          },
        },
      });
    } catch (error) {
      console.error("Failed to logout", error);
    }
  };

  const handleTranscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!audioFile) {
      setMessage("Please select an audio file");
      return;
    }

    setTranscribing(true);
    setMessage("");

    try {
      const formData = new FormData();
      formData.append("audio", audioFile);

      const res = await fetch("/api/transcribe", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.error || "Transcription failed");
        return;
      }

      setMessage("Transcription complete!");
      setAudioFile(null);
      fetchTranscripts();
    } catch {
      setMessage("Transcription failed");
    } finally {
      setTranscribing(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith("audio/")) {
        setAudioFile(file);
      } else {
        setMessage("Please drop an audio file.");
      }
    }
  };

  if (isPending) {
    return <div className={styles.loading}>Loading...</div>;
  }

  return (
    <div className={styles.container}>
      <header className={`${styles.header} ${isNavVisible ? "" : styles.hidden}`}>
        <h1 className={styles.title}>The Project</h1>
        <div className={styles.headerRight}>
          <span className={styles.username}>{session?.user?.name || session?.user?.email || "Admin"}</span>
          <button onClick={handleLogout} className={styles.logoutButton}>
            Logout
          </button>
        </div>
      </header>

      <main className={styles.main}>
        <section className={styles.uploadSection}>
          <h2 className={styles.sectionTitle}>Upload Audio</h2>
          <form onSubmit={handleTranscribe} className={styles.uploadForm}>
            {audioFile ? (
              <div className={styles.selectedFile}>
                <span className={styles.fileName}>{audioFile.name}</span>
                <button 
                  type="button" 
                  onClick={() => setAudioFile(null)} 
                  className={styles.removeButton}
                  aria-label="Remove audio file"
                >
                  ✕
                </button>
              </div>
            ) : (
              <div className={styles.fileInput}>
                <input
                  type="file"
                  accept="audio/*"
                  onChange={(e) => setAudioFile(e.target.files?.[0] || null)}
                  id="audioFile"
                />
                <label 
                  htmlFor="audioFile" 
                  className={`${styles.fileLabel} ${isDragging ? styles.dragging : ""}`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  Drag & drop audio here, or click to select
                </label>
              </div>
            )}
            <button
              type="submit"
              disabled={transcribing || !audioFile}
              className={styles.transcribeButton}
            >
              {transcribing ? "Transcribing..." : "Transcribe"}
            </button>
          </form>
          {message && (
            <p
              className={
                message.includes("complete") ? styles.success : styles.error
              }
            >
              {message}
            </p>
          )}
        </section>

        <section className={styles.transcriptsSection}>
          <h2 className={styles.sectionTitle}>Transcripts</h2>
          {transcripts.length === 0 ? (
            <p className={styles.emptyState}>No transcripts yet</p>
          ) : (
            <ul className={styles.transcriptList}>
              {transcripts.map((t) => (
                <li key={t.id} className={styles.transcriptCard}>
                  <time className={styles.transcriptDate}>
                    {formatDate(t.createdAt)}
                  </time>
                  <p className={styles.transcriptContent}>{t.content}</p>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
}