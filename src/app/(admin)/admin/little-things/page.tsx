"use client";

import { useState, useEffect, useTransition } from "react";
import { DataTable } from "@/components/admin/DataTable";
import { Modal, useModal } from "@/components/admin/Modal";
import { FormField } from "@/components/admin/FormField";
import { useToast } from "@/components/admin/Toast";
import { getTableRows, insertRow, updateRow, deleteRow, togglePublished } from "@/lib/admin-actions";

interface LThing {
  id: string; sort_order: number; published: boolean; prompt: string; body: string;
}

const EMPTY: Omit<LThing, "id"> = { sort_order: 0, published: true, prompt: "", body: "" };

export default function LittleThingsPage() {
  const [rows, setRows] = useState<LThing[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, startSave] = useTransition();
  const modal = useModal<LThing>();
  const toast = useToast();
  const [form, setForm] = useState<Omit<LThing, "id"> & { id?: string }>(EMPTY);

  const load = () => { getTableRows<LThing>("little_things").then((d) => setRows(d)).catch(() => {}).finally(() => setLoading(false)); };
  useEffect(load, []);

  function openCreate() { setForm(EMPTY); modal.openCreate(); }
  function openEdit(row: LThing) { setForm(row); modal.openEdit(row); }

  function save() {
    startSave(async () => {
      try {
        if (modal.editItem) await updateRow("little_things", modal.editItem.id, form);
        else await insertRow("little_things", form);
        toast.success(modal.editItem ? "Updated" : "Created");
        modal.close(); load();
      } catch (e: unknown) { toast.error(e instanceof Error ? e.message : "Failed"); }
    });
  }

  function handleDelete(id: string) {
    if (!confirm("Delete this item?")) return;
    startSave(async () => { try { await deleteRow("little_things", id); toast.success("Deleted"); load(); } catch (e: unknown) { toast.error(e instanceof Error ? e.message : "Failed"); } });
  }

  function handleToggle(id: string, published: boolean) {
    startSave(async () => { try { await togglePublished("little_things", id, published); load(); } catch (e: unknown) { toast.error(e instanceof Error ? e.message : "Failed"); } });
  }

  if (loading) return <p style={{ color: "var(--a-text-dim)" }}>Loading…</p>;

  return (
    <>
      <div className="admin-page-header">
        <div><h1>Little Things</h1><p>Tap-to-reveal items on "The things I love about you."</p></div>
        <button className="admin-btn admin-btn-primary" onClick={openCreate}>+ Add Item</button>
      </div>

      <DataTable
        columns={[
          { key: "prompt", label: "Prompt" },
          { key: "body", label: "Hidden Text", render: (r) => <span style={{ maxWidth: 300, display: "inline-block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.body}</span> },
          { key: "sort_order", label: "Order" },
        ]}
        rows={rows} onEdit={openEdit} onDelete={handleDelete} onTogglePublished={handleToggle}
        searchKeys={["prompt", "body"]}
      />

      <Modal open={modal.isOpen} onClose={modal.close} title={modal.editItem ? "Edit" : "New"} footer={
        <><button className="admin-btn admin-btn-ghost" onClick={modal.close}>Cancel</button>
        <button className="admin-btn admin-btn-primary" onClick={save} disabled={saving}>{saving ? "Saving…" : "Save"}</button></>
      }>
        <div className="admin-form">
          <FormField label="Prompt" hint="The line visitors see before tapping"><input className="admin-input" value={form.prompt} onChange={(e) => setForm({ ...form, prompt: e.target.value })} /></FormField>
          <FormField label="Body" hint="What types out after tapping"><textarea className="admin-textarea" value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} rows={4} /></FormField>
          <FormField label="Sort Order"><input className="admin-input" type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) })} /></FormField>
        </div>
      </Modal>
    </>
  );
}
