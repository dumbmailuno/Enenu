"use client";

import { useState, useEffect, useTransition } from "react";
import { DataTable } from "@/components/admin/DataTable";
import { Modal, useModal } from "@/components/admin/Modal";
import { FormField } from "@/components/admin/FormField";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { useToast } from "@/components/admin/Toast";
import { getTableRows, insertRow, updateRow, deleteRow, togglePublished } from "@/lib/admin-actions";

interface Card {
  id: string;
  sort_order: number;
  published: boolean;
  title: string;
  tag: string | null;
  body: string;
  event_date: string | null;
  photo_path: string | null;
  note: string | null;
}

const EMPTY: Omit<Card, "id"> = { sort_order: 0, published: true, title: "", tag: null, body: "", event_date: null, photo_path: null, note: null };

export default function UniversePage() {
  const [rows, setRows] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, startSave] = useTransition();
  const modal = useModal<Card>();
  const toast = useToast();
  const [form, setForm] = useState<Omit<Card, "id"> & { id?: string }>(EMPTY);

  const load = () => {
    getTableRows<Card>("universe_cards").then((d) => setRows(d)).catch(() => {}).finally(() => setLoading(false));
  };
  useEffect(load, []);

  function openCreate() { setForm(EMPTY); modal.openCreate(); }
  function openEdit(row: Card) { setForm(row); modal.openEdit(row); }

  function save() {
    startSave(async () => {
      try {
        if (modal.editItem) {
          await updateRow("universe_cards", modal.editItem.id, form);
        } else {
          await insertRow("universe_cards", form);
        }
        toast.success(modal.editItem ? "Card updated" : "Card created");
        modal.close();
        load();
      } catch (e: unknown) { toast.error(e instanceof Error ? e.message : "Failed"); }
    });
  }

  function handleDelete(id: string) {
    if (!confirm("Delete this card?")) return;
    startSave(async () => {
      try { await deleteRow("universe_cards", id); toast.success("Deleted"); load(); }
      catch (e: unknown) { toast.error(e instanceof Error ? e.message : "Failed"); }
    });
  }

  function handleToggle(id: string, published: boolean) {
    startSave(async () => {
      try { await togglePublished("universe_cards", id, published); load(); }
      catch (e: unknown) { toast.error(e instanceof Error ? e.message : "Failed"); }
    });
  }

  if (loading) return <p style={{ color: "var(--a-text-dim)" }}>Loading…</p>;

  return (
    <>
      <div className="admin-page-header">
        <div><h1>Universe Cards</h1><p>Memories and moments only the two of you would understand.</p></div>
        <button className="admin-btn admin-btn-primary" onClick={openCreate}>+ Add Card</button>
      </div>

      <DataTable
        columns={[
          { key: "title", label: "Title" },
          { key: "tag", label: "Tag" },
          { key: "event_date", label: "Date" },
          { key: "sort_order", label: "Order" },
        ]}
        rows={rows}
        onEdit={openEdit}
        onDelete={handleDelete}
        onTogglePublished={handleToggle}
        searchKeys={["title", "tag", "body"]}
      />

      <Modal
        open={modal.isOpen}
        onClose={modal.close}
        title={modal.editItem ? "Edit Card" : "New Card"}
        footer={
          <>
            <button className="admin-btn admin-btn-ghost" onClick={modal.close}>Cancel</button>
            <button className="admin-btn admin-btn-primary" onClick={save} disabled={saving}>{saving ? "Saving…" : "Save"}</button>
          </>
        }
      >
        <div className="admin-form">
          <FormField label="Title"><input className="admin-input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></FormField>
          <FormField label="Tag" hint="Optional short tag"><input className="admin-input" value={form.tag ?? ""} onChange={(e) => setForm({ ...form, tag: e.target.value || null })} /></FormField>
          <FormField label="Body"><textarea className="admin-textarea" value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} rows={4} /></FormField>
          <FormField label="Event Date" hint="YYYY-MM-DD format"><input className="admin-input" type="date" value={form.event_date ?? ""} onChange={(e) => setForm({ ...form, event_date: e.target.value || null })} /></FormField>
          <FormField label="Note" hint="Optional footnote"><input className="admin-input" value={form.note ?? ""} onChange={(e) => setForm({ ...form, note: e.target.value || null })} /></FormField>
          <FormField label="Photo"><ImageUpload currentPath={form.photo_path} onUploaded={(p) => setForm({ ...form, photo_path: p })} /></FormField>
          <FormField label="Sort Order"><input className="admin-input" type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) })} /></FormField>
        </div>
      </Modal>
    </>
  );
}
