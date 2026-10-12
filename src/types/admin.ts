// Admin CMS types

export interface AdminGate {
  id: number;
  password_hash: string;
}

/** Stats shown on a dashboard card. */
export interface TableStats {
  table: string;
  label: string;
  slug: string;
  total: number;
  published: number;
  icon: string;
}

/** Generic form state returned by server actions. */
export interface FormState {
  ok: boolean;
  error: string | null;
  message: string | null;
}

/** Result of a media upload. */
export interface UploadResult {
  ok: boolean;
  path: string | null;
  error: string | null;
}

/** A row in any publishable table (minimal common shape). */
export interface AdminRow {
  id: string;
  sort_order: number;
  published: boolean;
  [key: string]: unknown;
}

/** Sidebar navigation item. */
export interface NavItem {
  label: string;
  href: string;
  icon: string;
  section?: string;
}

/** Media file from storage. */
export interface MediaFile {
  name: string;
  bucket: string;
  path: string;
  size: number;
  updatedAt: string;
  url: string;
}
