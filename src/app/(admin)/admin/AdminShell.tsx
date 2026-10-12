"use client";

import { useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/admin/Sidebar";
import { Topbar } from "@/components/admin/Topbar";
import { ToastProvider } from "@/components/admin/Toast";
import { adminLogout } from "@/lib/admin-actions";

const TITLES: Record<string, string> = {
  "/admin/dashboard": "Dashboard",
  "/admin/site-settings": "Site Settings",
  "/admin/page-settings": "Page Audio Settings",
  "/admin/universe": "Universe Cards",
  "/admin/memories": "Memories",
  "/admin/timeline": "Timeline Entries",
  "/admin/ordinary": "Ordinary Things",
  "/admin/letters": "Letters",
  "/admin/friends": "Friends",
  "/admin/little-things": "Little Things",
  "/admin/private-letters": "Private Letters",
  "/admin/finale": "Finale",
  "/admin/media": "Media Library",
};

export function AdminShell({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const title = TITLES[pathname] ?? "Admin";

  return (
    <ToastProvider>
      <div className="admin-shell">
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <Topbar
          title={title}
          onMenuToggle={() => setSidebarOpen((o) => !o)}
          onLogout={() => adminLogout()}
        />
        <main className="admin-main">{children}</main>
      </div>
    </ToastProvider>
  );
}
