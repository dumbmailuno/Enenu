"use client";

import { useState, useEffect, useTransition } from "react";
import { DataTable } from "@/components/admin/DataTable";
import { Modal, useModal } from "@/components/admin/Modal";
import { FormField } from "@/components/admin/FormField";
import { useToast } from "@/components/admin/Toast";
import { getTableRows, insertRow, updateRow, deleteRow, togglePublished } from "@/lib/admin-actions";

interface OThing {
  id: string; sort_order: number; published: boolean; body: string;
}

const EMPTY: Omit<OThing, "id"> = { sort_order: 0, published: true, body: "" };

export default function OrdinaryPage() {
  const [rows, setRows] = useState<OThing[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, startSave] = useTransition();
  const modal = useModal<OThing>();
  const toast = useToast();
  const [form, setForm] = useState<Omit<OThing, "id"> & { id?: string }>(EMPTY);

  const load = () => { getTableRows<OThing>("ordinary_things").then((d) => setRows(d)).catch(() => {}).finally(() => setLoading(false)); };
  useEffect(load, []);

  function openCreate() { setForm(EMPTY); modal.openCreate(); }
  function openEdit(row: OThing) { setForm(row); modal.openEdit(row); }

  function save() {
    startSave(async () => {
      try {
        if (modal.editItem) await updateRow("ordinary_things", modal.editItem.id, form);
        else await insertRow("ordinary_things", form);
        toast.success(modal.editItem ? "Updated" : "Created");
        modal.close(); load();
      } catch (e: unknown) { toast.error(e instanceof Error ? e.message : "Failed"); }
    });
  }

  function handleDelete(id: string) {
    if (!confirm("Delete this item?")) return;
    startSave(async () => { try { await deleteRow("ordinary_things", id); toast.success("Deleted"); load(); } catch (e: unknown) { toast.error(e instanceof Error ? e.message : "Failed"); } });
  }

  function handleToggle(id: string, published: boolean) {
    startSave(async () => { try { await togglePublished("ordinary_things", id, published); load(); } catch (e: unknown) { toast.error(e instanceof Error ? e.message : "Failed"); } });
  }

  if (loading) return <p style={{ color: "var(--a-text-dim)" }}>Loading…</p>;

  return (
    <>
      <div className="admin-page-header">
        <div><h1>Ordinary Things</h1><p>Small moments nobody else noticed — shown on the memories page.</p></div>
        <button className="admin-btn admin-btn-primary" onClick={openCreate}>+ Add Thing</button>
      </div>

      <DataTable
        columns={[
          { key: "body", label: "Text", render: (r) => <span style={{ maxWidth: 400, display: "inline-block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.body}</span> },
          { key: "sort_order", label: "Order" },
        ]}
        rows={rows} onEdit={openEdit} onDelete={handleDelete} onTogglePublished={handleToggle}
        searchKeys={["body"]}
      />

      <Modal open={modal.isOpen} onClose={modal.close} title={modal.editItem ? "Edit" : "New"} footer={
        <><button className="admin-btn admin-btn-ghost" onClick={modal.close}>Cancel</button>
        <button className="admin-btn admin-btn-primary" onClick={save} disabled={saving}>{saving ? "Saving…" : "Save"}</button></>
      }>
        <div className="admin-form">
          <FormField label="Text"><textarea className="admin-textarea" value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} rows={3} /></FormField>
          <FormField label="Sort Order"><input className="admin-input" type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) })} /></FormField>
        </div>
      </Modal>
    </>
  );
}
