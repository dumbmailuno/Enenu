import { PageAudio } from "@/components/PageAudio";
import { UniverseList } from "@/components/UniverseList";
import { Visit } from "@/components/Visit";
import { getPageAudio, getPublished } from "@/lib/content";

export const revalidate = 60;
export const metadata = { title: "Our little universe" };

export default async function Universe() {
  const [cards, audio] = await Promise.all([getPublished("universe_cards"), getPageAudio("universe")]);
  return (
    <main className="page">
      <PageAudio {...audio} />
      <Visit slug="universe" />
      <div className="column">
        <h1 className="title">Our little universe</h1>
        <p className="soft">Everything here is something only the two of us would understand. Tap one.</p>
        <UniverseList cards={cards} />
      </div>
    </main>
  );
}
