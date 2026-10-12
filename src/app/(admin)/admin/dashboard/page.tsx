import { redirect } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { getTableStats, getSingletonRow } from "@/lib/admin-actions";
import { StatsCard } from "@/components/admin/StatsCard";
import Link from "next/link";

export default async function DashboardPage() {
  if (!(await isAdminAuthenticated())) redirect("/admin/login");

  const tables = [
    { table: "universe_cards", label: "Universe Cards", icon: "✨", href: "/admin/universe", accent: "gold" },
    { table: "memories", label: "Memories", icon: "📸", href: "/admin/memories", accent: "rose" },
    { table: "timeline_entries", label: "Timeline", icon: "📅", href: "/admin/timeline", accent: "blue" },
    { table: "ordinary_things", label: "Ordinary Things", icon: "🌿", href: "/admin/ordinary", accent: "green" },
    { table: "letters", label: "Letters", icon: "✉️", href: "/admin/letters", accent: "gold" },
    { table: "friends", label: "Friends", icon: "👥", href: "/admin/friends", accent: "rose" },
    { table: "little_things", label: "Little Things", icon: "💛", href: "/admin/little-things", accent: "gold" },
    { table: "private_letters", label: "Private Letters", icon: "🔒", href: "/admin/private-letters", accent: "blue" },
  ] as const;

  const stats = await Promise.all(tables.map(async (t) => ({ ...t, ...(await getTableStats(t.table)) })));

  let finale: { published?: boolean } | null = null;
  let siteSettings: { hero_photo_path?: string | null; opening_lines?: string[]; hub_message?: string | null; cake_message?: string[] } | null = null;
  try { finale = await getSingletonRow<{ published?: boolean }>("finale", 1); } catch {}
  try { siteSettings = await getSingletonRow<{ hero_photo_path?: string | null; opening_lines?: string[]; hub_message?: string | null; cake_message?: string[] }>("site_settings", 1); } catch {}

  const totalContent = stats.reduce((s, t) => s + t.total, 0);
  const totalPublished = stats.reduce((s, t) => s + t.published, 0);

  return (
    <>
      {/* Overview banner */}
      <div className="admin-page-header">
        <div>
          <h1>Dashboard</h1>
          <p>{totalContent} total items · {totalPublished} published · {totalContent - totalPublished} drafts</p>
        </div>
      </div>

      {/* Stats grid */}
      <div className="admin-grid">
        {stats.map((s) => (
          <StatsCard
            key={s.table}
            icon={s.icon}
            label={s.label}
            total={s.total}
            published={s.published}
            href={s.href}
            accentClass={s.accent}
          />
        ))}
      </div>

      {/* Quick actions */}
      <h2 className="admin-section-title" style={{ marginTop: 36, marginBottom: 16 }}>Quick Actions</h2>
      <div className="admin-quick-actions">
        <Link href="/admin/site-settings" className="admin-quick-action">
          <span className="admin-quick-action-icon">⚙️</span>
          Edit Site Settings
        </Link>
        <Link href="/admin/finale" className="admin-quick-action">
          <span className="admin-quick-action-icon">🎬</span>
          Edit Finale
          {finale && !(finale as { published?: boolean }).published && (
            <span className="admin-card-badge draft" style={{ marginLeft: 8 }}>Not published</span>
          )}
        </Link>
        <Link href="/admin/page-settings" className="admin-quick-action">
          <span className="admin-quick-action-icon">🎵</span>
          Page Audio
        </Link>
        <Link href="/admin/media" className="admin-quick-action">
          <span className="admin-quick-action-icon">🖼️</span>
          Media Library
        </Link>
      </div>

      {/* Status checks */}
      <h2 className="admin-section-title" style={{ marginTop: 36, marginBottom: 16 }}>Site Status</h2>
      <div className="admin-card" style={{ maxWidth: 480 }}>
        <table className="admin-table" style={{ margin: -24 }}>
          <tbody>
            <StatusRow label="Hero photo set" ok={!!(siteSettings as Record<string, unknown> | null)?.hero_photo_path} />
            <StatusRow label="Finale published" ok={!!(finale as Record<string, unknown> | null)?.published} />
            <StatusRow label="Opening lines set" ok={!!((siteSettings as Record<string, unknown> | null)?.opening_lines as string[] | undefined)?.length} />
            <StatusRow label="Hub message set" ok={!!(siteSettings as Record<string, unknown> | null)?.hub_message} />
            <StatusRow label="Cake message set" ok={!!((siteSettings as Record<string, unknown> | null)?.cake_message as string[] | undefined)?.length} />
          </tbody>
        </table>
      </div>
    </>
  );
}

function StatusRow({ label, ok }: { label: string; ok: boolean }) {
  return (
    <tr>
      <td style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <span className={`admin-dot ${ok ? "live" : "draft"}`} />
        {label}
      </td>
      <td style={{ textAlign: "right", color: ok ? "var(--a-green)" : "var(--a-text-dim)" }}>
        {ok ? "Ready" : "Missing"}
      </td>
    </tr>
  );
}
