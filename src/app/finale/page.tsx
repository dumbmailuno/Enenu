import Link from "next/link";
import { PageAudio } from "@/components/PageAudio";
import { TypedSequence, type SequenceItem } from "@/components/Typewriter";
import { Visit } from "@/components/Visit";
import { ZoomImage } from "@/components/ZoomImage";
import { getFinale, getPageAudio } from "@/lib/content";

export const revalidate = 60;
export const metadata = { title: "One last letter" };

export default async function FinalePage() {
  const [f, audio] = await Promise.all([getFinale(), getPageAudio("finale")]);
  const ready = f && f.published;
  const items: SequenceItem[] = ready
    ? [
        ...(f.title ? [{ text: f.title, as: "h1", className: "title" } satisfies SequenceItem] : []),
        ...(f.greeting ? [{ text: f.greeting, className: "hand big" } satisfies SequenceItem] : []),
        ...(f.body ?? []).map((text): SequenceItem => ({ text, className: "line" })),
        ...(f.sign ? [{ text: f.sign, className: "hand big" } satisfies SequenceItem] : []),
      ]
    : [];
  return (
    <main className="page">
      <PageAudio {...audio} />
      <Visit slug="finale" />
      {ready && f.photo_path && <div className="bleed top"><ZoomImage path={f.photo_path} alt="" ratio="4 / 5" priority /></div>}
      <div className="column">
        {ready ? <TypedSequence items={items} startDelay={900} gap={700} /> : <p className="soft">This one is not ready yet.</p>}
        <hr className="rule thin" />
        <p><Link className="act" href="/hub">Back to the beginning</Link></p>
      </div>
    </main>
  );
}
