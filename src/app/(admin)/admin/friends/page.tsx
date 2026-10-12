"use client";

import { useState, useEffect, useTransition } from "react";
import { DataTable } from "@/components/admin/DataTable";
import { Modal, useModal } from "@/components/admin/Modal";
import { FormField } from "@/components/admin/FormField";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { useToast } from "@/components/admin/Toast";
import { getTableRows, insertRow, updateRow, deleteRow, togglePublished } from "@/lib/admin-actions";

interface FriendRow {
  id: string; sort_order: number; published: boolean;
  name: string; collection: "birthday" | "love" | "future"; is_from_me: boolean;
  intro: string | null; note: string | null;
  photo_path: string | null; video_path: string | null; poster_path: string | null; captions_path: string | null;
}

const EMPTY: Omit<FriendRow, "id"> = {
  sort_order: 0, published: true, name: "", collection: "birthday", is_from_me: false,
  intro: null, note: null, photo_path: null, video_path: null, poster_path: null, captions_path: null,
};

export default function FriendsPage() {
  const [rows, setRows] = useState<FriendRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, startSave] = useTransition();
  const modal = useModal<FriendRow>();
  const toast = useToast();
  const [form, setForm] = useState<Omit<FriendRow, "id"> & { id?: string }>(EMPTY);

  const load = () => { getTableRows<FriendRow>("friends").then((d) => setRows(d)).catch(() => {}).finally(() => setLoading(false)); };
  useEffect(load, []);

  function openCreate() { setForm(EMPTY); modal.openCreate(); }
  function openEdit(row: FriendRow) { setForm(row); modal.openEdit(row); }

  function save() {
    startSave(async () => {
      try {
        if (modal.editItem) await updateRow("friends", modal.editItem.id, form);
        else await insertRow("friends", form);
        toast.success(modal.editItem ? "Friend updated" : "Friend added");
        modal.close(); load();
      } catch (e: unknown) { toast.error(e instanceof Error ? e.message : "Failed"); }
    });
  }

  function handleDelete(id: string) {
    if (!confirm("Delete this friend?")) return;
    startSave(async () => { try { await deleteRow("friends", id); toast.success("Deleted"); load(); } catch (e: unknown) { toast.error(e instanceof Error ? e.message : "Failed"); } });
  }

  function handleToggle(id: string, published: boolean) {
    startSave(async () => { try { await togglePublished("friends", id, published); load(); } catch (e: unknown) { toast.error(e instanceof Error ? e.message : "Failed"); } });
  }

  if (loading) return <p style={{ color: "var(--a-text-dim)" }}>Loading…</p>;

  return (
    <>
      <div className="admin-page-header">
        <div><h1>Friends</h1><p>People who recorded messages — shown on the People page.</p></div>
        <button className="admin-btn admin-btn-primary" onClick={openCreate}>+ Add Friend</button>
      </div>

      <DataTable
        columns={[
          { key: "name", label: "Name" },
          { key: "collection", label: "Collection", render: (r) => <span className="admin-card-badge draft">{r.collection}</span> },
          { key: "is_from_me", label: "From Me", render: (r) => r.is_from_me ? "✓" : "" },
          { key: "sort_order", label: "Order" },
        ]}
        rows={rows} onEdit={openEdit} onDelete={handleDelete} onTogglePublished={handleToggle}
        searchKeys={["name", "intro", "note"]}
      />

      <Modal open={modal.isOpen} onClose={modal.close} title={modal.editItem ? "Edit Friend" : "New Friend"} footer={
        <><button className="admin-btn admin-btn-ghost" onClick={modal.close}>Cancel</button>
        <button className="admin-btn admin-btn-primary" onClick={save} disabled={saving}>{saving ? "Saving…" : "Save"}</button></>
      }>
        <div className="admin-form">
          <FormField label="Name"><input className="admin-input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></FormField>
          <div className="admin-field-row">
            <FormField label="Collection">
              <select className="admin-select" value={form.collection} onChange={(e) => setForm({ ...form, collection: e.target.value as FriendRow["collection"] })}>
                <option value="birthday">Birthday</option><option value="love">Love</option><option value="future">Future</option>
              </select>
            </FormField>
            <FormField label="From Me">
              <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 14 }}>
                <input type="checkbox" checked={form.is_from_me} onChange={(e) => setForm({ ...form, is_from_me: e.target.checked })} />
                This is your own video
              </label>
            </FormField>
          </div>
          <FormField label="Intro" hint="Short intro text"><input className="admin-input" value={form.intro ?? ""} onChange={(e) => setForm({ ...form, intro: e.target.value || null })} /></FormField>
          <FormField label="Note"><textarea className="admin-textarea" value={form.note ?? ""} onChange={(e) => setForm({ ...form, note: e.target.value || null })} rows={3} /></FormField>
          <FormField label="Photo"><ImageUpload currentPath={form.photo_path} onUploaded={(p) => setForm({ ...form, photo_path: p })} /></FormField>
          <FormField label="Video Path" hint="Path in jade-media, e.g. videos/friend.mp4"><input className="admin-input" value={form.video_path ?? ""} onChange={(e) => setForm({ ...form, video_path: e.target.value || null })} /></FormField>
          <FormField label="Poster Path" hint="Thumbnail for the video"><input className="admin-input" value={form.poster_path ?? ""} onChange={(e) => setForm({ ...form, poster_path: e.target.value || null })} /></FormField>
          <FormField label="Captions Path" hint="VTT subtitles file path"><input className="admin-input" value={form.captions_path ?? ""} onChange={(e) => setForm({ ...form, captions_path: e.target.value || null })} /></FormField>
          <FormField label="Sort Order"><input className="admin-input" type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) })} /></FormField>
        </div>
      </Modal>
    </>
  );
}
