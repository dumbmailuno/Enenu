import { mediaUrl } from "@/lib/media";

/**
 * A plain picture, no frame. On a computer with a mouse, hovering slowly zooms in a little.
 * Touch screens and reduced-motion settings get a still image (see globals.css).
 * `path` is a file in the public media bucket. `src` is a ready URL (used for private, signed links) and wins over `path`.
 * `ratio="auto"` keeps the photo's own shape.
 */
export function ZoomImage({ path, src: direct, alt, ratio = "4 / 5", caption, priority = false }: { path?: string | null; src?: string | null; alt: string; ratio?: string; caption?: string | null; priority?: boolean }) {
  const src = direct ?? mediaUrl(path);
  if (!src) return null;
  return (
    <figure className="zoom">
      <div className="zoom-frame" style={{ aspectRatio: ratio }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt={alt} loading={priority ? "eager" : "lazy"} decoding="async" />
      </div>
      {caption && <figcaption className="hand">{caption}</figcaption>}
    </figure>
  );
}
