"use client";

import { useState, useEffect, useTransition } from "react";
import { DataTable } from "@/components/admin/DataTable";
import { Modal, useModal } from "@/components/admin/Modal";
import { FormField } from "@/components/admin/FormField";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { useToast } from "@/components/admin/Toast";
import { getTableRows, insertRow, updateRow, deleteRow, togglePublished } from "@/lib/admin-actions";

interface Memory {
  id: string;
  sort_order: number;
  published: boolean;
  kind: "photo" | "note" | "card";
  title: string | null;
  caption: string | null;
  body: string | null;
  when_text: string | null;
  photo_path: string | null;
  rotation: number;
}

const EMPTY: Omit<Memory, "id"> = { sort_order: 0, published: true, kind: "photo", title: null, caption: null, body: null, when_text: null, photo_path: null, rotation: 0 };

export default function MemoriesPage() {
  const [rows, setRows] = useState<Memory[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, startSave] = useTransition();
  const modal = useModal<Memory>();
  const toast = useToast();
  const [form, setForm] = useState<Omit<Memory, "id"> & { id?: string }>(EMPTY);

  const load = () => { getTableRows<Memory>("memories").then((d) => setRows(d)).catch(() => {}).finally(() => setLoading(false)); };
  useEffect(load, []);

  function openCreate() { setForm(EMPTY); modal.openCreate(); }
  function openEdit(row: Memory) { setForm(row); modal.openEdit(row); }

  function save() {
    startSave(async () => {
      try {
        if (modal.editItem) await updateRow("memories", modal.editItem.id, form);
        else await insertRow("memories", form);
        toast.success(modal.editItem ? "Memory updated" : "Memory created");
        modal.close(); load();
      } catch (e: unknown) { toast.error(e instanceof Error ? e.message : "Failed"); }
    });
  }

  function handleDelete(id: string) {
    if (!confirm("Delete this memory?")) return;
    startSave(async () => { try { await deleteRow("memories", id); toast.success("Deleted"); load(); } catch (e: unknown) { toast.error(e instanceof Error ? e.message : "Failed"); } });
  }

  function handleToggle(id: string, published: boolean) {
    startSave(async () => { try { await togglePublished("memories", id, published); load(); } catch (e: unknown) { toast.error(e instanceof Error ? e.message : "Failed"); } });
  }

  if (loading) return <p style={{ color: "var(--a-text-dim)" }}>Loading…</p>;

  return (
    <>
      <div className="admin-page-header">
        <div><h1>Memories</h1><p>Photos, notes, and memory cards for the scrapbook page.</p></div>
        <button className="admin-btn admin-btn-primary" onClick={openCreate}>+ Add Memory</button>
      </div>

      <DataTable
        columns={[
          { key: "kind", label: "Kind", render: (r) => <span className="admin-card-badge draft">{r.kind}</span> },
          { key: "title", label: "Title", render: (r) => r.title ?? r.caption ?? "—" },
          { key: "when_text", label: "When" },
          { key: "sort_order", label: "Order" },
        ]}
        rows={rows}
        onEdit={openEdit}
        onDelete={handleDelete}
        onTogglePublished={handleToggle}
        searchKeys={["title", "caption", "body"]}
      />

      <Modal open={modal.isOpen} onClose={modal.close} title={modal.editItem ? "Edit Memory" : "New Memory"} footer={
        <><button className="admin-btn admin-btn-ghost" onClick={modal.close}>Cancel</button>
        <button className="admin-btn admin-btn-primary" onClick={save} disabled={saving}>{saving ? "Saving…" : "Save"}</button></>
      }>
        <div className="admin-form">
          <FormField label="Kind">
            <select className="admin-select" value={form.kind} onChange={(e) => setForm({ ...form, kind: e.target.value as Memory["kind"] })}>
              <option value="photo">Photo</option><option value="note">Note</option><option value="card">Card</option>
            </select>
          </FormField>
          <FormField label="Title"><input className="admin-input" value={form.title ?? ""} onChange={(e) => setForm({ ...form, title: e.target.value || null })} /></FormField>
          <FormField label="Caption"><input className="admin-input" value={form.caption ?? ""} onChange={(e) => setForm({ ...form, caption: e.target.value || null })} /></FormField>
          <FormField label="Body"><textarea className="admin-textarea" value={form.body ?? ""} onChange={(e) => setForm({ ...form, body: e.target.value || null })} rows={4} /></FormField>
          <FormField label="When" hint='e.g. "Summer 2023" or "2024-03-09"'><input className="admin-input" value={form.when_text ?? ""} onChange={(e) => setForm({ ...form, when_text: e.target.value || null })} /></FormField>
          <FormField label="Photo"><ImageUpload currentPath={form.photo_path} onUploaded={(p) => setForm({ ...form, photo_path: p })} /></FormField>
          <div className="admin-field-row">
            <FormField label="Rotation (degrees)"><input className="admin-input" type="number" value={form.rotation} onChange={(e) => setForm({ ...form, rotation: Number(e.target.value) })} /></FormField>
            <FormField label="Sort Order"><input className="admin-input" type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) })} /></FormField>
          </div>
        </div>
      </Modal>
    </>
  );
}
