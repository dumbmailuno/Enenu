"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { NavItem } from "@/types/admin";

const NAV: (NavItem | { section: string })[] = [
  { label: "Dashboard", href: "/admin/dashboard", icon: "📊" },
  { section: "Content" },
  { label: "Site Settings", href: "/admin/site-settings", icon: "⚙️" },
  { label: "Page Audio", href: "/admin/page-settings", icon: "🎵" },
  { label: "Universe Cards", href: "/admin/universe", icon: "✨" },
  { label: "Memories", href: "/admin/memories", icon: "📸" },
  { label: "Timeline", href: "/admin/timeline", icon: "📅" },
  { label: "Ordinary Things", href: "/admin/ordinary", icon: "🌿" },
  { label: "Letters", href: "/admin/letters", icon: "✉️" },
  { label: "Little Things", href: "/admin/little-things", icon: "💛" },
  { section: "People" },
  { label: "Friends", href: "/admin/friends", icon: "👥" },
  { section: "Private" },
  { label: "Private Letters", href: "/admin/private-letters", icon: "🔒" },
  { label: "Finale", href: "/admin/finale", icon: "🎬" },
  { section: "Assets" },
  { label: "Media Library", href: "/admin/media", icon: "🖼️" },
];

export function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const pathname = usePathname();

  return (
    <>
      <aside className="admin-sidebar" data-open={open}>
        <div className="admin-sidebar-brand">
          <div className="admin-sidebar-brand-icon">J</div>
          <div>
            <div className="admin-sidebar-brand-text">Jade CMS</div>
            <div className="admin-sidebar-brand-sub">Content Manager</div>
          </div>
        </div>

        <nav className="admin-sidebar-nav">
          {NAV.map((item, i) => {
            if ("section" in item && !("href" in item)) {
              return (
                <div key={`s-${i}`} className="admin-sidebar-section">
                  {item.section}
                </div>
              );
            }
            const nav = item as NavItem;
            return (
              <Link
                key={nav.href}
                href={nav.href}
                className="admin-sidebar-link"
                data-active={pathname === nav.href}
                onClick={onClose}
              >
                <span className="admin-sidebar-link-icon">{nav.icon}</span>
                {nav.label}
              </Link>
            );
          })}
        </nav>
      </aside>
      {open && <div className="admin-sidebar-backdrop" onClick={onClose} />}
    </>
  );
}
