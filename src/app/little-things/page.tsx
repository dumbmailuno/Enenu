import { LittleCards } from "@/components/LittleCards";
import { PageAudio } from "@/components/PageAudio";
import { Visit } from "@/components/Visit";
import { getPageAudio, getPublished } from "@/lib/content";

export const revalidate = 60;
export const metadata = { title: "The things I love about you" };

export default async function LittleThings() {
  const [items, audio] = await Promise.all([getPublished("little_things"), getPageAudio("little")]);
  return (
    <main className="page">
      <PageAudio {...audio} />
      <Visit slug="little-things" />
      <div className="column">
        <h1 className="title">The things I love about you</h1>
        <p className="soft">Tap each one to see what is behind it.</p>
        <LittleCards items={items} />
      </div>
    </main>
  );
}
