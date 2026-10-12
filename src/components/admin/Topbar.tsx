"use client";

interface TopbarProps {
  title: string;
  onMenuToggle: () => void;
  onLogout: () => void;
}

export function Topbar({ title, onMenuToggle, onLogout }: TopbarProps) {
  return (
    <header className="admin-topbar">
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <button
          className="admin-btn admin-btn-ghost admin-btn-sm admin-topbar-menu-btn"
          onClick={onMenuToggle}
          aria-label="Toggle menu"
        >
          ☰
        </button>
        <h1 className="admin-topbar-title">{title}</h1>
      </div>
      <div className="admin-topbar-actions">
        <a href="/" target="_blank" rel="noopener" className="admin-btn admin-btn-ghost admin-btn-sm">
          👁️ View Site
        </a>
        <button onClick={onLogout} className="admin-btn admin-btn-ghost admin-btn-sm">
          Sign Out
        </button>
      </div>
    </header>
  );
}
