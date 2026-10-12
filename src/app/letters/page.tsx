import { LetterDesk, type DeskLetter } from "@/components/LetterDesk";
import { PageAudio } from "@/components/PageAudio";
import { Visit } from "@/components/Visit";
import { getPageAudio, getPublished } from "@/lib/content";
import { mediaUrl } from "@/lib/media";

export const revalidate = 60;
export const metadata = { title: "Letters to Enenu" };

export default async function Letters() {
  const [rows, audio] = await Promise.all([getPublished("letters"), getPageAudio("letters")]);
  const letters: DeskLetter[] = rows.map((l) => ({
    id: l.id, title: l.title, hint: l.hint, greeting: l.greeting, body: l.body ?? [], sign: l.sign, scanUrl: mediaUrl(l.scan_path),
  }));
  return (
    <main className="page">
      <PageAudio {...audio} />
      <Visit slug="letters" />
      <div className="column">
        <h1 className="title">Letters to Enenu</h1>
        <p className="soft">Each one has a time to be opened. Take them in any order.</p>
        <LetterDesk letters={letters} />
      </div>
    </main>
  );
}
