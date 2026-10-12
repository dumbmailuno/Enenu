"use client";

import { useState, useEffect, useTransition } from "react";
import { FormField } from "@/components/admin/FormField";
import { Toggle } from "@/components/admin/Toggle";
import { useToast } from "@/components/admin/Toast";
import { getTableRows, upsertRow } from "@/lib/admin-actions";

interface PageSetting {
  slug: string;
  song_path: string | null;
  song_volume: number;
  scribble_enabled: boolean;
}

const SLUGS = ["portal", "hub", "universe", "memories", "letters", "people", "little", "private", "finale"] as const;

export default function PageSettingsPage() {
  const [rows, setRows] = useState<PageSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, startSave] = useTransition();
  const toast = useToast();

  useEffect(() => {
    getTableRows<PageSetting>("page_settings")
      .then((data) => {
        const map = new Map(data.map((r) => [r.slug, r]));
        setRows(SLUGS.map((slug) => map.get(slug) ?? { slug, song_path: null, song_volume: 0.35, scribble_enabled: true }));
      })
      .catch(() => {
        setRows(SLUGS.map((slug) => ({ slug, song_path: null, song_volume: 0.35, scribble_enabled: true })));
      })
      .finally(() => setLoading(false));
  }, []);

  function update(slug: string, field: string, value: unknown) {
    setRows((prev) => prev.map((r) => (r.slug === slug ? { ...r, [field]: value } : r)));
  }

  function saveRow(row: PageSetting) {
    startSave(async () => {
      try {
        await upsertRow("page_settings", row);
        toast.success(`Saved ${row.slug}`);
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
          <h1>Page Audio Settings</h1>
          <p>Song, volume, and pen sound per page.</p>
        </div>
      </div>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Page</th>
              <th>Song Path</th>
              <th>Volume</th>
              <th>Pen Sound</th>
              <th style={{ width: 80 }}></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.slug}>
                <td style={{ fontWeight: 600 }}>{r.slug}</td>
                <td>
                  <input
                    className="admin-input"
                    value={r.song_path ?? ""}
                    onChange={(e) => update(r.slug, "song_path", e.target.value || null)}
                    placeholder="songs/track.mp3"
                    style={{ width: "100%", minWidth: 200 }}
                  />
                </td>
                <td>
                  <input
                    className="admin-input"
                    type="number"
                    min={0}
                    max={1}
                    step={0.05}
                    value={r.song_volume}
                    onChange={(e) => update(r.slug, "song_volume", Number(e.target.value))}
                    style={{ width: 80 }}
                  />
                </td>
                <td>
                  <Toggle
                    checked={r.scribble_enabled}
                    onChange={(v) => update(r.slug, "scribble_enabled", v)}
                    label={`Pen sound for ${r.slug}`}
                  />
                </td>
                <td>
                  <button className="admin-btn admin-btn-ghost admin-btn-sm" onClick={() => saveRow(r)} disabled={saving}>
                    Save
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
