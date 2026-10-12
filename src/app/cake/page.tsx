import { Cake } from "@/components/Cake";
import { PageAudio } from "@/components/PageAudio";
import { getPageAudio, getSettings } from "@/lib/content";
import { plain } from "@/lib/format";

export const revalidate = 60;
export const metadata = { title: "For Jade" };

export default async function CakePage() {
  // The cake keeps the opening's song (same file, so it carries on without restarting).
  const [s, audio] = await Promise.all([getSettings(), getPageAudio("portal")]);
  const lines = s.cake_message.map(plain).filter(Boolean);
  return (
    <>
      <PageAudio {...audio} />
      <Cake lines={lines.length ? lines : ["One more year of you.", "The world is a little better for it."]} />
    </>
  );
}
