import { Gate } from "@/components/Gate";
import { LetterDesk, type DeskLetter } from "@/components/LetterDesk";
import { PageAudio } from "@/components/PageAudio";
import { Visit } from "@/components/Visit";
import { getPageAudio } from "@/lib/content";
import { paragraphs } from "@/lib/format";
import { isUnlocked } from "@/lib/private";
import { adminClient } from "@/lib/supabase";
import { lock } from "./actions";

// Never cached: what this page shows depends on the cookie.
export const dynamic = "force-dynamic";
export const metadata = { title: "Just between us" };

type Row = Record<string, unknown>;
const str = (v: unknown) => (typeof v === "string" && v.trim() ? v : null);

/** Private letters are read with the server key, only after the password cookie checks out. Photos get a short-lived signed link. */
async function loadPrivate(): Promise<DeskLetter[]> {
  try {
    const db = adminClient();
    const { data, error } = await db.from("private_letters").select("*");
    if (error || !data) return [];
    const rows = (data as Row[])
      .filter((r) => r.published !== false)
      .sort((a, b) => Number(a.sort_order ?? 0) - Number(b.sort_order ?? 0));
    return await Promise.all(
      rows.map(async (r, i): Promise<DeskLetter> => {
        const file = str(r.scan_path) ?? str(r.photo_path);
        let scanUrl: string | null = null;
        if (file) {
          const { data: signed } = await db.storage.from("jade-private").createSignedUrl(file, 60 * 60);
          scanUrl = signed?.signedUrl ?? null;
        }
        return {
          id: String(r.id ?? i),
          title: str(r.title) ?? "For you",
          hint: str(r.hint),
          greeting: str(r.greeting),
          body: paragraphs(r.body),
          sign: str(r.sign),
          scanUrl,
        };
      }),
    );
  } catch {
    return [];
  }
}

export default async function JustBetweenUs() {
  const [open, audio] = await Promise.all([isUnlocked(), getPageAudio("private")]);
  const letters = open ? await loadPrivate() : [];
  return (
    <main className="page">
      <PageAudio {...audio} />
      {open && <Visit slug="just-between-us" />}
      <div className="column">
        <h1 className="title">Just between us</h1>
        {open ? (
          <>
            <p className="soft">Some things are meant for just two people.</p>
            <LetterDesk letters={letters} noun="read" />
            <form action={lock}><button type="submit" className="act quiet">lock this again</button></form>
          </>
        ) : (
          <>
            <p className="soft">This part has a password.</p>
            <Gate />
          </>
        )}
      </div>
    </main>
  );
}
