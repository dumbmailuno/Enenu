"use client";

import { useState, type ReactNode } from "react";
import { Toggle } from "./Toggle";

interface Column<T> {
  key: string;
  label: string;
  render?: (row: T) => ReactNode;
  sortable?: boolean;
}

interface DataTableProps<T extends { id: string; published?: boolean }> {
  columns: Column<T>[];
  rows: T[];
  onEdit?: (row: T) => void;
  onTogglePublished?: (id: string, published: boolean) => void;
  onDelete?: (id: string) => void;
  searchKeys?: string[];
  emptyMessage?: string;
}

export function DataTable<T extends { id: string; published?: boolean }>({
  columns,
  rows,
  onEdit,
  onTogglePublished,
  onDelete,
  searchKeys = [],
  emptyMessage = "No items yet.",
}: DataTableProps<T>) {
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const readCell = (row: T, key: string) => String((row as Record<string, unknown>)[key] ?? "");

  const filtered = search
    ? rows.filter((r) =>
        searchKeys.some((k) => readCell(r, k).toLowerCase().includes(search.toLowerCase()))
      )
    : rows;

  const sorted = sortKey
    ? [...filtered].sort((a, b) => {
        const av = readCell(a, sortKey);
        const bv = readCell(b, sortKey);
        const cmp = av.localeCompare(bv, undefined, { numeric: true });
        return sortDir === "asc" ? cmp : -cmp;
      })
    : filtered;

  function handleSort(key: string) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  }

  return (
    <div className="admin-table-wrap">
      <div className="admin-table-toolbar">
        <input
          type="text"
          className="admin-table-search"
          placeholder="Search…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <span style={{ fontSize: 12, color: "var(--a-text-dim)" }}>
          {filtered.length} item{filtered.length !== 1 ? "s" : ""}
        </span>
      </div>
      <table className="admin-table">
        <thead>
          <tr>
            {onTogglePublished && <th style={{ width: 60 }}>Live</th>}
            {columns.map((col) => (
              <th
                key={col.key}
                onClick={col.sortable !== false ? () => handleSort(col.key) : undefined}
                style={col.sortable === false ? { cursor: "default" } : undefined}
              >
                {col.label}
                {sortKey === col.key && (sortDir === "asc" ? " ↑" : " ↓")}
              </th>
            ))}
            {(onEdit || onDelete) && <th style={{ width: 120 }}>Actions</th>}
          </tr>
        </thead>
        <tbody>
          {sorted.length === 0 && (
            <tr>
              <td
                colSpan={columns.length + (onTogglePublished ? 1 : 0) + (onEdit || onDelete ? 1 : 0)}
                className="admin-table-empty"
              >
                {emptyMessage}
              </td>
            </tr>
          )}
          {sorted.map((row) => (
            <tr key={row.id}>
              {onTogglePublished && (
                <td>
                  <Toggle
                    checked={row.published ?? false}
                    onChange={(v) => onTogglePublished(row.id, v)}
                    label={`Toggle published for ${row.id}`}
                  />
                </td>
              )}
              {columns.map((col) => (
                <td key={col.key}>
                  {col.render ? col.render(row) : readCell(row, col.key) || "—"}
                </td>
              ))}
              {(onEdit || onDelete) && (
                <td>
                  <div style={{ display: "flex", gap: 8 }}>
                    {onEdit && (
                      <button className="admin-btn admin-btn-ghost admin-btn-sm" onClick={() => onEdit(row)}>
                        Edit
                      </button>
                    )}
                    {onDelete && (
                      <button className="admin-btn admin-btn-danger admin-btn-sm" onClick={() => onDelete(row.id)}>
                        Delete
                      </button>
                    )}
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
