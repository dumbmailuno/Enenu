// Row shapes for the public tables (matches the database).
// Regenerate the full typed client any time with:
//   npx supabase gen types typescript --project-id ttfmordpzfwqakmwadfh > src/types/database.ts
export interface Base { id: string; sort_order: number; published: boolean }

export interface SiteSettings {
  id: number;
  her_name: string;
  opening_lines: string[];
  envelope_button: string;
  letter_title: string | null;
  letter_body: string[];
  letter_sign: string | null;
  cake_message: string[];
  hub_message: string | null;
  hero_photo_path: string | null;
}
export interface PageSettings { slug: string; song_path: string | null; song_volume: number; scribble_enabled: boolean }
export interface Finale { id: number; title: string | null; greeting: string | null; body: string[]; sign: string | null; photo_path: string | null; published: boolean }

export interface UniverseCard extends Base { title: string; tag: string | null; body: string; event_date: string | null; photo_path: string | null; note: string | null }
export interface Memory extends Base { kind: "photo" | "note" | "card"; title: string | null; caption: string | null; body: string | null; when_text: string | null; photo_path: string | null; rotation: number }
export interface TimelineEntry extends Base { title: string; when_text: string | null; body: string }
export interface OrdinaryThing extends Base { body: string }
export interface Letter extends Base { title: string; hint: string | null; greeting: string | null; body: string[]; sign: string | null; scan_path: string | null }
export interface Friend extends Base { name: string; collection: "birthday" | "love" | "future"; is_from_me: boolean; intro: string | null; note: string | null; photo_path: string | null; video_path: string | null; poster_path: string | null; captions_path: string | null }
export interface LittleThing extends Base { prompt: string; body: string }

export interface PublishedTables {
  universe_cards: UniverseCard;
  memories: Memory;
  timeline_entries: TimelineEntry;
  ordinary_things: OrdinaryThing;
  letters: Letter;
  friends: Friend;
  little_things: LittleThing;
}
export type PageSlug = "portal" | "hub" | "universe" | "memories" | "letters" | "people" | "little" | "private" | "finale";
