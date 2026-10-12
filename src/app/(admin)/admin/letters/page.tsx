"use client";

import { useState, useEffect, useTransition } from "react";
import { DataTable } from "@/components/admin/DataTable";
import { Modal, useModal } from "@/components/admin/Modal";
import { FormField, ArrayField } from "@/components/admin/FormField";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { useToast } from "@/components/admin/Toast";
import { getTableRows, insertRow, updateRow, deleteRow, togglePublished } from "@/lib/admin-actions";

interface LetterRow {
  id: string; sort_order: number; published: boolean;
  title: string; hint: string | null; greeting: string | null;
  body: string[]; sign: string | null; scan_path: string | null;
}

const EMPTY: Omit<LetterRow, "id"> = { sort_order: 0, published: true, title: "", hint: null, greeting: null, body: [], sign: null, scan_path: null };

export default function LettersPage() {
  const [rows, setRows] = useState<LetterRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, startSave] = useTransition();
  const modal = useModal<LetterRow>();
  const toast = useToast();
  const [form, setForm] = useState<Omit<LetterRow, "id"> & { id?: string }>(EMPTY);

  const load = () => { getTableRows<LetterRow>("letters").then((d) => setRows(d)).catch(() => {}).finally(() => setLoading(false)); };
  useEffect(load, []);

  function openCreate() { setForm(EMPTY); modal.openCreate(); }
  function openEdit(row: LetterRow) { setForm(row); modal.openEdit(row); }

  function save() {
    startSave(async () => {
      try {
        if (modal.editItem) await updateRow("letters", modal.editItem.id, form);
        else await insertRow("letters", form);
        toast.success(modal.editItem ? "Letter updated" : "Letter created");
        modal.close(); load();
      } catch (e: unknown) { toast.error(e instanceof Error ? e.message : "Failed"); }
    });
  }

  function handleDelete(id: string) {
    if (!confirm("Delete this letter?")) return;
    startSave(async () => { try { await deleteRow("letters", id); toast.success("Deleted"); load(); } catch (e: unknown) { toast.error(e instanceof Error ? e.message : "Failed"); } });
  }

  function handleToggle(id: string, published: boolean) {
    startSave(async () => { try { await togglePublished("letters", id, published); load(); } catch (e: unknown) { toast.error(e instanceof Error ? e.message : "Failed"); } });
  }

  if (loading) return <p style={{ color: "var(--a-text-dim)" }}>Loading…</p>;

  return (
    <>
      <div className="admin-page-header">
        <div><h1>Letters</h1><p>The letters that open and type out paragraph by paragraph.</p></div>
        <button className="admin-btn admin-btn-primary" onClick={openCreate}>+ Add Letter</button>
      </div>

      <DataTable
        columns={[
          { key: "title", label: "Title" },
          { key: "hint", label: "Hint" },
          { key: "sort_order", label: "Order" },
        ]}
        rows={rows} onEdit={openEdit} onDelete={handleDelete} onTogglePublished={handleToggle}
        searchKeys={["title", "hint", "greeting"]}
      />

      <Modal open={modal.isOpen} onClose={modal.close} title={modal.editItem ? "Edit Letter" : "New Letter"} footer={
        <><button className="admin-btn admin-btn-ghost" onClick={modal.close}>Cancel</button>
        <button className="admin-btn admin-btn-primary" onClick={save} disabled={saving}>{saving ? "Saving…" : "Save"}</button></>
      }>
        <div className="admin-form">
          <FormField label="Title"><input className="admin-input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></FormField>
          <FormField label="Hint" hint="Subtitle shown in the list"><input className="admin-input" value={form.hint ?? ""} onChange={(e) => setForm({ ...form, hint: e.target.value || null })} /></FormField>
          <FormField label="Greeting" hint='e.g. "My dearest,"'><input className="admin-input" value={form.greeting ?? ""} onChange={(e) => setForm({ ...form, greeting: e.target.value || null })} /></FormField>
          <ArrayField label="Body Paragraphs" values={form.body} onChange={(v) => setForm({ ...form, body: v })} />
          <FormField label="Sign-off"><input className="admin-input" value={form.sign ?? ""} onChange={(e) => setForm({ ...form, sign: e.target.value || null })} /></FormField>
          <FormField label="Scan / Image"><ImageUpload currentPath={form.scan_path} onUploaded={(p) => setForm({ ...form, scan_path: p })} hint="Optional scan or image of the handwritten letter" /></FormField>
          <FormField label="Sort Order"><input className="admin-input" type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) })} /></FormField>
        </div>
      </Modal>
    </>
  );
}
