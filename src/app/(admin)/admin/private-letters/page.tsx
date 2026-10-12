"use client";

import { useState, useEffect, useTransition } from "react";
import { DataTable } from "@/components/admin/DataTable";
import { Modal, useModal } from "@/components/admin/Modal";
import { FormField, ArrayField } from "@/components/admin/FormField";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { useToast } from "@/components/admin/Toast";
import { getTableRows, insertRow, updateRow, deleteRow, togglePublished } from "@/lib/admin-actions";

interface PLetterRow {
  id: string; sort_order: number; published: boolean;
  title: string; hint: string | null; greeting: string | null;
  body: string[]; sign: string | null; scan_path: string | null; photo_path: string | null;
}

const EMPTY: Omit<PLetterRow, "id"> = { sort_order: 0, published: true, title: "", hint: null, greeting: null, body: [], sign: null, scan_path: null, photo_path: null };

export default function PrivateLettersPage() {
  const [rows, setRows] = useState<PLetterRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, startSave] = useTransition();
  const modal = useModal<PLetterRow>();
  const toast = useToast();
  const [form, setForm] = useState<Omit<PLetterRow, "id"> & { id?: string }>(EMPTY);

  const load = () => { getTableRows<PLetterRow>("private_letters").then((d) => setRows(d)).catch(() => {}).finally(() => setLoading(false)); };
  useEffect(load, []);

  function openCreate() { setForm(EMPTY); modal.openCreate(); }
  function openEdit(row: PLetterRow) { setForm(row); modal.openEdit(row); }

  function save() {
    startSave(async () => {
      try {
        if (modal.editItem) await updateRow("private_letters", modal.editItem.id, form);
        else await insertRow("private_letters", form);
        toast.success(modal.editItem ? "Updated" : "Created");
        modal.close(); load();
      } catch (e: unknown) { toast.error(e instanceof Error ? e.message : "Failed"); }
    });
  }

  function handleDelete(id: string) {
    if (!confirm("Delete this private letter?")) return;
    startSave(async () => { try { await deleteRow("private_letters", id); toast.success("Deleted"); load(); } catch (e: unknown) { toast.error(e instanceof Error ? e.message : "Failed"); } });
  }

  function handleToggle(id: string, published: boolean) {
    startSave(async () => { try { await togglePublished("private_letters", id, published); load(); } catch (e: unknown) { toast.error(e instanceof Error ? e.message : "Failed"); } });
  }

  if (loading) return <p style={{ color: "var(--a-text-dim)" }}>Loading…</p>;

  return (
    <>
      <div className="admin-page-header">
        <div>
          <h1>Private Letters</h1>
          <p>Password-protected letters — only visible in the "Just Between Us" section.</p>
        </div>
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

      <Modal open={modal.isOpen} onClose={modal.close} title={modal.editItem ? "Edit Private Letter" : "New Private Letter"} footer={
        <><button className="admin-btn admin-btn-ghost" onClick={modal.close}>Cancel</button>
        <button className="admin-btn admin-btn-primary" onClick={save} disabled={saving}>{saving ? "Saving…" : "Save"}</button></>
      }>
        <div className="admin-form">
          <FormField label="Title"><input className="admin-input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></FormField>
          <FormField label="Hint"><input className="admin-input" value={form.hint ?? ""} onChange={(e) => setForm({ ...form, hint: e.target.value || null })} /></FormField>
          <FormField label="Greeting"><input className="admin-input" value={form.greeting ?? ""} onChange={(e) => setForm({ ...form, greeting: e.target.value || null })} /></FormField>
          <ArrayField label="Body Paragraphs" values={form.body} onChange={(v) => setForm({ ...form, body: v })} />
          <FormField label="Sign-off"><input className="admin-input" value={form.sign ?? ""} onChange={(e) => setForm({ ...form, sign: e.target.value || null })} /></FormField>
          <FormField label="Scan / Photo">
            <ImageUpload currentPath={form.scan_path ?? form.photo_path} bucket="jade-private" onUploaded={(p) => setForm({ ...form, scan_path: p })} hint="Uploaded to the private bucket — never publicly accessible" />
          </FormField>
          <FormField label="Sort Order"><input className="admin-input" type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) })} /></FormField>
        </div>
      </Modal>
    </>
  );
}
