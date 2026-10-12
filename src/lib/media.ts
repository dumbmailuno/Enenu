const base = process.env.NEXT_PUBLIC_SUPABASE_URL;

/** Public URL for a file stored in the `jade-media` bucket, e.g. mediaUrl("photos/beach.jpg"). */
export function mediaUrl(path?: string | null): string | null {
  if (!path || !base) return null;
  return `${base}/storage/v1/object/public/jade-media/${path.split("/").map(encodeURIComponent).join("/")}`;
}
