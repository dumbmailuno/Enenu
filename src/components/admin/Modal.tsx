"use client";

import { useState, type ReactNode } from "react";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
}

export function Modal({ open, onClose, title, children, footer }: ModalProps) {
  if (!open) return null;
  return (
    <div className="admin-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="admin-modal">
        <div className="admin-modal-header">
          <h2 className="admin-modal-title">{title}</h2>
          <button className="admin-modal-close" onClick={onClose} aria-label="Close">✕</button>
        </div>
        <div className="admin-modal-body">{children}</div>
        {footer && <div className="admin-modal-footer">{footer}</div>}
      </div>
    </div>
  );
}

/** Convenience hook for managing modal open/close + editing item. */
export function useModal<T = unknown>() {
  const [isOpen, setIsOpen] = useState(false);
  const [editItem, setEditItem] = useState<T | null>(null);

  return {
    isOpen,
    editItem,
    openCreate: () => { setEditItem(null); setIsOpen(true); },
    openEdit: (item: T) => { setEditItem(item); setIsOpen(true); },
    close: () => { setEditItem(null); setIsOpen(false); },
  };
}
