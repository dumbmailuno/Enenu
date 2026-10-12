"use client";

import { useState, useEffect, useTransition } from "react";
import { DataTable } from "@/components/admin/DataTable";
import { Modal, useModal } from "@/components/admin/Modal";
import { FormField } from "@/components/admin/FormField";
import { useToast } from "@/components/admin/Toast";
import { getTableRows, insertRow, updateRow, deleteRow, togglePublished } from "@/lib/admin-actions";

interface TEntry {
  id: string; sort_order: number; published: boolean; title: string; when_text: string | null; body: string;
}

const EMPTY: Omit<TEntry, "id"> = { sort_order: 0, published: true, title: "", when_text: null, body: "" };

export default function TimelinePage() {
  const [rows, setRows] = useState<TEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, startSave] = useTransition();
  const modal = useModal<TEntry>();
  const toast = useToast();
  const [form, setForm] = useState<Omit<TEntry, "id"> & { id?: string }>(EMPTY);

  const load = () => { getTableRows<TEntry>("timeline_entries").then((d) => setRows(d)).catch(() => {}).finally(() => setLoading(false)); };
  useEffect(load, []);

  function openCreate() { setForm(EMPTY); modal.openCreate(); }
  function openEdit(row: TEntry) { setForm(row); modal.openEdit(row); }

  function save() {
    startSave(async () => {
      try {
        if (modal.editItem) await updateRow("timeline_entries", modal.editItem.id, form);
        else await insertRow("timeline_entries", form);
        toast.success(modal.editItem ? "Updated" : "Created");
        modal.close(); load();
      } catch (e: unknown) { toast.error(e instanceof Error ? e.message : "Failed"); }
    });
  }

  function handleDelete(id: string) {
    if (!confirm("Delete this entry?")) return;
    startSave(async () => { try { await deleteRow("timeline_entries", id); toast.success("Deleted"); load(); } catch (e: unknown) { toast.error(e instanceof Error ? e.message : "Failed"); } });
  }

  function handleToggle(id: string, published: boolean) {
    startSave(async () => { try { await togglePublished("timeline_entries", id, published); load(); } catch (e: unknown) { toast.error(e instanceof Error ? e.message : "Failed"); } });
  }

  if (loading) return <p style={{ color: "var(--a-text-dim)" }}>Loading…</p>;

  return (
    <>
      <div className="admin-page-header">
        <div><h1>Timeline Entries</h1><p>The "How it went" section on the memories page.</p></div>
        <button className="admin-btn admin-btn-primary" onClick={openCreate}>+ Add Entry</button>
      </div>

      <DataTable
        columns={[
          { key: "title", label: "Title" },
          { key: "when_text", label: "When" },
          { key: "sort_order", label: "Order" },
        ]}
        rows={rows} onEdit={openEdit} onDelete={handleDelete} onTogglePublished={handleToggle}
        searchKeys={["title", "body"]}
      />

      <Modal open={modal.isOpen} onClose={modal.close} title={modal.editItem ? "Edit Entry" : "New Entry"} footer={
        <><button className="admin-btn admin-btn-ghost" onClick={modal.close}>Cancel</button>
        <button className="admin-btn admin-btn-primary" onClick={save} disabled={saving}>{saving ? "Saving…" : "Save"}</button></>
      }>
        <div className="admin-form">
          <FormField label="Title"><input className="admin-input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></FormField>
          <FormField label="When" hint='e.g. "The first week"'><input className="admin-input" value={form.when_text ?? ""} onChange={(e) => setForm({ ...form, when_text: e.target.value || null })} /></FormField>
          <FormField label="Body"><textarea className="admin-textarea" value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} rows={4} /></FormField>
          <FormField label="Sort Order"><input className="admin-input" type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) })} /></FormField>
        </div>
      </Modal>
    </>
  );
}
