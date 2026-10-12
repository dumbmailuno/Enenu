"use client";

import { useRef, useState, type ReactNode } from "react";

interface FormFieldProps {
  label: string;
  hint?: string;
  error?: string;
  children: ReactNode;
}

/** Label + input wrapper with optional hint/error text. */
export function FormField({ label, hint, error, children }: FormFieldProps) {
  return (
    <div className="admin-field">
      <label className="admin-label">{label}</label>
      {children}
      {hint && !error && <span className="admin-hint">{hint}</span>}
      {error && <span className="admin-error-text">{error}</span>}
    </div>
  );
}

interface ArrayFieldProps {
  label: string;
  values: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
  hint?: string;
}

/** Manages an array of text values (for body[], opening_lines[], cake_message[], etc.) */
export function ArrayField({ label, values, onChange, placeholder = "Paragraph…", hint }: ArrayFieldProps) {
  const add = () => onChange([...values, ""]);
  const update = (i: number, v: string) => {
    const next = [...values];
    next[i] = v;
    onChange(next);
  };
  const remove = (i: number) => onChange(values.filter((_, j) => j !== i));

  return (
    <div className="admin-field">
      <label className="admin-label">{label}</label>
      <div className="admin-array-field">
        {values.map((v, i) => (
          <div key={i} className="admin-array-item">
            <textarea
              className="admin-textarea"
              value={v}
              onChange={(e) => update(i, e.target.value)}
              placeholder={placeholder}
              rows={2}
            />
            <button type="button" className="admin-array-remove" onClick={() => remove(i)} title="Remove">✕</button>
          </div>
        ))}
        <button type="button" className="admin-array-add" onClick={add}>+ Add paragraph</button>
      </div>
      {hint && <span className="admin-hint">{hint}</span>}
    </div>
  );
}
