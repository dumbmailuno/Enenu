import { PageAudio } from "@/components/PageAudio";
import { Portal } from "@/components/Portal";
import { getPageAudio, getSettings } from "@/lib/content";

export const revalidate = 60;

export default async function Home() {
  const [s, audio] = await Promise.all([getSettings(), getPageAudio("portal")]);
  return (
    <>
      <PageAudio {...audio} />
      <Portal
        herName={s.her_name}
        lines={s.opening_lines}
        button={s.envelope_button}
        letterTitle={s.letter_title}
        letterBody={s.letter_body}
        letterSign={s.letter_sign}
      />
    </>
  );
}
