import "server-only";
import { publicClient } from "./supabase";
import { mediaUrl } from "./media";
import type { Finale, PageSettings, PageSlug, PublishedTables, SiteSettings } from "@/types/content";

export const DEFAULT_SETTINGS: SiteSettings = {
  id: 1, her_name: "Jade", opening_lines: ["For Jade."], envelope_button: "Come, let me show you something.",
  letter_title: null, letter_body: [], letter_sign: null, cake_message: [], hub_message: null, hero_photo_path: null,
};

export async function getSettings(): Promise<SiteSettings> {
  try {
    const { data, error } = await publicClient().from("site_settings").select("*").eq("id", 1).maybeSingle();
    if (error || !data) return DEFAULT_SETTINGS;
    return data as SiteSettings;
  } catch { return DEFAULT_SETTINGS; }
}

/** What a page needs to play its song and pen sound. */
export async function getPageAudio(slug: PageSlug): Promise<{ song: string | null; volume: number; scribble: boolean }> {
  try {
    const { data } = await publicClient().from("page_settings").select("*").eq("slug", slug).maybeSingle();
    const p = data as PageSettings | null;
    return { song: mediaUrl(p?.song_path), volume: Number(p?.song_volume ?? 0.35), scribble: p?.scribble_enabled ?? true };
  } catch { return { song: null, volume: 0.35, scribble: true }; }
}

export async function getPublished<T extends keyof PublishedTables>(table: T): Promise<PublishedTables[T][]> {
  try {
    const { data, error } = await publicClient().from(table).select("*").eq("published", true).order("sort_order");
    if (error || !data) return [];
    return data as unknown as PublishedTables[T][];
  } catch { return []; }
}

export async function getFinale(): Promise<Finale | null> {
  try {
    const { data } = await publicClient().from("finale").select("*").eq("id", 1).maybeSingle();
    return (data as Finale | null) ?? null;
  } catch { return null; }
}
