"use client";

import { useState, useEffect, useTransition } from "react";
import { FormField, ArrayField } from "@/components/admin/FormField";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { Toggle } from "@/components/admin/Toggle";
import { useToast } from "@/components/admin/Toast";
import { getSingletonRow, upsertRow } from "@/lib/admin-actions";

interface FinaleData {
  id: number;
  title: string | null;
  greeting: string | null;
  body: string[];
  sign: string | null;
  photo_path: string | null;
  published: boolean;
}

const DEFAULTS: FinaleData = {
  id: 1, title: null, greeting: null, body: [], sign: null, photo_path: null, published: false,
};

export default function FinalePage() {
  const [data, setData] = useState<FinaleData>(DEFAULTS);
  const [loading, setLoading] = useState(true);
  const [saving, startSave] = useTransition();
  const toast = useToast();

  useEffect(() => {
    getSingletonRow<FinaleData>("finale", 1)
      .then((row) => { if (row) setData(row); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  function save() {
    startSave(async () => {
      try {
        await upsertRow("finale", data);
        toast.success("Finale saved");
      } catch (e: unknown) {
        toast.error(e instanceof Error ? e.message : "Save failed");
      }
    });
  }

  if (loading) return <p style={{ color: "var(--a-text-dim)" }}>Loading…</p>;

  return (
    <>
      <div className="admin-page-header">
        <div>
          <h1>Finale</h1>
          <p>The closing letter — the last page visitors see.</p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <span style={{ fontSize: 13, color: "var(--a-text-mute)" }}>Published</span>
          <Toggle checked={data.published} onChange={(v) => setData({ ...data, published: v })} />
          <button className="admin-btn admin-btn-primary" onClick={save} disabled={saving}>
            {saving ? "Saving…" : "Save"}
          </button>
        </div>
      </div>

      <div className="admin-settings-card">
        <div className="admin-form">
          <FormField label="Title" hint="Optional heading above the letter">
            <input className="admin-input" value={data.title ?? ""} onChange={(e) => setData({ ...data, title: e.target.value || null })} />
          </FormField>

          <FormField label="Greeting" hint='e.g. "Dear Jade,"'>
            <input className="admin-input" value={data.greeting ?? ""} onChange={(e) => setData({ ...data, greeting: e.target.value || null })} />
          </FormField>

          <ArrayField
            label="Body"
            values={data.body}
            onChange={(v) => setData({ ...data, body: v })}
            placeholder="A paragraph of the closing letter…"
          />

          <FormField label="Sign-off" hint='e.g. "With all my love"'>
            <input className="admin-input" value={data.sign ?? ""} onChange={(e) => setData({ ...data, sign: e.target.value || null })} />
          </FormField>

          <FormField label="Photo">
            <ImageUpload currentPath={data.photo_path} onUploaded={(path) => setData({ ...data, photo_path: path })} hint="Shown at the top of the finale page" />
          </FormField>
        </div>

        <div className="admin-settings-actions">
          <button className="admin-btn admin-btn-primary" onClick={save} disabled={saving}>
            {saving ? "Saving…" : "Save Changes"}
          </button>
        </div>
      </div>
    </>
  );
}
