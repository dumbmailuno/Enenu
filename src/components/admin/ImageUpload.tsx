"use client";

import { useRef, useState } from "react";

interface ImageUploadProps {
  /** Current file path (relative to bucket, e.g. "photos/beach.jpg"). */
  currentPath: string | null;
  /** Bucket to upload to. */
  bucket?: string;
  /** Called with the new storage path after a successful upload. */
  onUploaded: (path: string) => void;
  /** Hint text below the upload area. */
  hint?: string;
}

export function ImageUpload({ currentPath, bucket = "jade-media", onUploaded, hint }: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [dragover, setDragover] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const currentUrl = currentPath && base
    ? `${base}/storage/v1/object/public/${bucket}/${currentPath}`
    : null;

  async function handleFile(file: File) {
    if (!file) return;
    setUploading(true);
    setError(null);
    setPreview(URL.createObjectURL(file));

    try {
      const form = new FormData();
      form.append("file", file);
      form.append("bucket", bucket);

      const res = await fetch("/api/admin/upload", { method: "POST", body: form });
      const json = await res.json();

      if (!res.ok || !json.path) {
        setError(json.error || "Upload failed");
        setPreview(null);
      } else {
        onUploaded(json.path);
      }
    } catch {
      setError("Upload failed");
      setPreview(null);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div>
      <div
        className={`admin-upload ${dragover ? "dragover" : ""}`}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragover(true); }}
        onDragLeave={() => setDragover(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragover(false);
          const file = e.dataTransfer.files[0];
          if (file) handleFile(file);
        }}
      >
        <div className="admin-upload-icon">{uploading ? "⏳" : "📁"}</div>
        <div>{uploading ? "Uploading…" : "Click or drag a file here"}</div>
        {(preview || currentUrl) && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview || currentUrl || ""} alt="Preview" className="admin-upload-preview" />
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*,video/*,audio/*"
        style={{ display: "none" }}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
      />
      {error && <p className="admin-error-text">{error}</p>}
      {currentPath && !error && (
        <p className="admin-hint" style={{ marginTop: 6 }}>Current: {currentPath}</p>
      )}
      {hint && <p className="admin-hint" style={{ marginTop: 4 }}>{hint}</p>}
    </div>
  );
}
