"use client";

import { useState, useEffect, useTransition, useRef } from "react";
import { useToast } from "@/components/admin/Toast";

interface MediaFile {
  name: string;
  id: string;
  metadata: Record<string, unknown>;
  created_at: string;
}

export default function MediaPage() {
  const [bucket, setBucket] = useState<"jade-media" | "jade-private">("jade-media");
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, startUpload] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);
  const toast = useToast();

  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;

  function load() {
    setLoading(true);
    fetch(`/api/admin/media?bucket=${bucket}`)
      .then((r) => r.json())
      .then((d) => setFiles(d.files ?? []))
      .catch(() => setFiles([]))
      .finally(() => setLoading(false));
  }

  useEffect(load, [bucket]);

  function handleUpload(file: File) {
    startUpload(async () => {
      const form = new FormData();
      form.append("file", file);
      form.append("bucket", bucket);
      try {
        const res = await fetch("/api/admin/upload", { method: "POST", body: form });
        const json = await res.json();
        if (json.ok) { toast.success(`Uploaded: ${json.path}`); load(); }
        else toast.error(json.error || "Upload failed");
      } catch { toast.error("Upload failed"); }
    });
  }

  function copyPath(path: string) {
    navigator.clipboard.writeText(path);
    toast.success("Path copied!");
  }

  return (
    <>
      <div className="admin-page-header">
        <div>
          <h1>Media Library</h1>
          <p>Browse and upload files in your storage buckets.</p>
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          <button
            className={`admin-btn ${bucket === "jade-media" ? "admin-btn-primary" : "admin-btn-ghost"}`}
            onClick={() => setBucket("jade-media")}
          >
            Public Media
          </button>
          <button
            className={`admin-btn ${bucket === "jade-private" ? "admin-btn-primary" : "admin-btn-ghost"}`}
            onClick={() => setBucket("jade-private")}
          >
            Private Media
          </button>
        </div>
      </div>

      <div
        className="admin-upload"
        style={{ marginBottom: 24 }}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleUpload(f); }}
      >
        <div className="admin-upload-icon">{uploading ? "⏳" : "📁"}</div>
        <div>{uploading ? "Uploading…" : `Drop a file here or click to upload to ${bucket}`}</div>
      </div>
      <input ref={inputRef} type="file" accept="image/*,video/*,audio/*" style={{ display: "none" }}
        onChange={(e) => { const f = e.target.files?.[0]; if (f) handleUpload(f); }} />

      {loading ? (
        <p style={{ color: "var(--a-text-dim)" }}>Loading files…</p>
      ) : files.length === 0 ? (
        <div className="admin-table-wrap">
          <div className="admin-table-empty">No files in this bucket yet.</div>
        </div>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Preview</th>
                <th>Name</th>
                <th>Created</th>
                <th style={{ width: 100 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {files.map((f) => {
                const isImage = /\.(jpe?g|png|gif|webp|avif|svg)$/i.test(f.name);
                const publicUrl = base
                  ? `${base}/storage/v1/object/public/${bucket}/${f.name}`
                  : "";
                return (
                  <tr key={f.id || f.name}>
                    <td style={{ width: 60 }}>
                      {isImage ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={publicUrl}
                          alt={f.name}
                          style={{ width: 48, height: 48, objectFit: "cover", borderRadius: 6, background: "var(--a-surface2)" }}
                        />
                      ) : (
                        <span style={{ fontSize: 24 }}>📄</span>
                      )}
                    </td>
                    <td>
                      <div style={{ fontWeight: 500 }}>{f.name.split("/").pop()}</div>
                      <div style={{ fontSize: 11, color: "var(--a-text-dim)" }}>{f.name}</div>
                    </td>
                    <td style={{ fontSize: 12, color: "var(--a-text-dim)" }}>
                      {f.created_at ? new Date(f.created_at).toLocaleDateString() : "—"}
                    </td>
                    <td>
                      <button className="admin-btn admin-btn-ghost admin-btn-sm" onClick={() => copyPath(f.name)}>
                        Copy Path
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
