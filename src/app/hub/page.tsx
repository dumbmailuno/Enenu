import { HubLinks } from "@/components/HubLinks";
import { TypedSequence } from "@/components/Typewriter";
import { PageAudio } from "@/components/PageAudio";
import { Visit } from "@/components/Visit";
import { ZoomImage } from "@/components/ZoomImage";
import { getPageAudio, getSettings } from "@/lib/content";

export const revalidate = 60;
export const metadata = { title: "Happy birthday" };

export default async function Hub() {
  const [s, audio] = await Promise.all([getSettings(), getPageAudio("hub")]);
  return (
    <main className="page">
      <PageAudio {...audio} />
      <Visit slug="hub" />
      {s.hero_photo_path && (
        <div className="bleed top">
          <ZoomImage path={s.hero_photo_path} alt={s.her_name} ratio="4 / 5" priority />
        </div>
      )}
      <div className="column">
        <p className="hand">Happy birthday</p>
        <TypedSequence
          startDelay={500}
          items={[
            { text: s.her_name, as: "h1", className: "display", speed: 90 },
            ...(s.hub_message ? [{ text: s.hub_message, className: "line" }] : []),
          ]}
        />
        <hr className="rule" />
        <HubLinks />
      </div>
    </main>
  );
}
