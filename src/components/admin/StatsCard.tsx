import Link from "next/link";

interface StatsCardProps {
  icon: string;
  label: string;
  total: number;
  published: number;
  href: string;
  accentClass?: string;
}

export function StatsCard({ icon, label, total, published, href, accentClass = "gold" }: StatsCardProps) {
  const drafts = total - published;
  return (
    <Link href={href} className="admin-card admin-card-clickable">
      <div className="admin-card-header">
        <div className={`admin-card-icon ${accentClass}`}>{icon}</div>
        {drafts > 0 && <span className="admin-card-badge draft">{drafts} draft{drafts > 1 ? "s" : ""}</span>}
        {drafts === 0 && total > 0 && <span className="admin-card-badge live">All live</span>}
      </div>
      <div className="admin-card-value">{total}</div>
      <div className="admin-card-label">{label}</div>
      <div className="admin-card-footer">
        <span>Published</span>
        <span className="admin-card-footer-value">{published}</span>
      </div>
    </Link>
  );
}
