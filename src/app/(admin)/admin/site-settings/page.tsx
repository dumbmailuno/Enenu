"use client";

import { useState, useEffect, useTransition } from "react";
import { FormField, ArrayField } from "@/components/admin/FormField";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { useToast } from "@/components/admin/Toast";
import { getSingletonRow, upsertRow } from "@/lib/admin-actions";

interface Settings {
  id: number;
  her_name: string;
  opening_lines: string[];
  envelope_button: string;
  letter_title: string | null;
  letter_body: string[];
  letter_sign: string | null;
  cake_message: string[];
  hub_message: string | null;
  hero_photo_path: string | null;
}

const DEFAULTS: Settings = {
  id: 1,
  her_name: "Jade",
  opening_lines: ["For Jade."],
  envelope_button: "Come, let me show you something.",
  letter_title: null,
  letter_body: [],
  letter_sign: null,
  cake_message: [],
  hub_message: null,
  hero_photo_path: null,
};

export default function SiteSettingsPage() {
  const [data, setData] = useState<Settings>(DEFAULTS);
  const [loading, setLoading] = useState(true);
  const [saving, startSave] = useTransition();
  const toast = useToast();

  useEffect(() => {
    getSingletonRow<Settings>("site_settings", 1)
      .then((row) => { if (row) setData(row); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  function save() {
    startSave(async () => {
      try {
        await upsertRow("site_settings", data);
        toast.success("Site settings saved");
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
          <h1>Site Settings</h1>
          <p>Global settings that appear on the opening, hub, and cake pages.</p>
        </div>
        <button className="admin-btn admin-btn-primary" onClick={save} disabled={saving}>
          {saving ? "Saving…" : "Save Changes"}
        </button>
      </div>

      <div className="admin-settings-card">
        <div className="admin-form">
          <FormField label="Her Name" hint="Displayed on the hub page heading">
            <input className="admin-input" value={data.her_name} onChange={(e) => setData({ ...data, her_name: e.target.value })} />
          </FormField>

          <ArrayField
            label="Opening Lines"
            values={data.opening_lines}
            onChange={(v) => setData({ ...data, opening_lines: v })}
            placeholder="A line that types out on the opening…"
            hint="Each line types sequentially on the opening page"
          />

          <FormField label="Envelope Button Text" hint="The text on the opening envelope">
            <input className="admin-input" value={data.envelope_button} onChange={(e) => setData({ ...data, envelope_button: e.target.value })} />
          </FormField>

          <FormField label="Hub Message" hint="Shown below her name on the hub page">
            <textarea className="admin-textarea" value={data.hub_message ?? ""} onChange={(e) => setData({ ...data, hub_message: e.target.value || null })} rows={3} />
          </FormField>

          <FormField label="Hero Photo">
            <ImageUpload currentPath={data.hero_photo_path} onUploaded={(path) => setData({ ...data, hero_photo_path: path })} hint="Shown at the top of the hub page" />
          </FormField>

          <hr style={{ border: "none", borderTop: "1px solid var(--a-border)", margin: "8px 0" }} />

          <FormField label="Opening Letter Title" hint="Optional title above the letter that appears after the envelope">
            <input className="admin-input" value={data.letter_title ?? ""} onChange={(e) => setData({ ...data, letter_title: e.target.value || null })} />
          </FormField>

          <ArrayField
            label="Opening Letter Body"
            values={data.letter_body}
            onChange={(v) => setData({ ...data, letter_body: v })}
            placeholder="A paragraph of the opening letter…"
          />

          <FormField label="Opening Letter Sign-off">
            <input className="admin-input" value={data.letter_sign ?? ""} onChange={(e) => setData({ ...data, letter_sign: e.target.value || null })} />
          </FormField>

          <hr style={{ border: "none", borderTop: "1px solid var(--a-border)", margin: "8px 0" }} />

          <ArrayField
            label="Cake Message"
            values={data.cake_message}
            onChange={(v) => setData({ ...data, cake_message: v })}
            placeholder="A line that appears after the candles are out…"
            hint="Shown on the cake page after all candles are blown out"
          />
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
