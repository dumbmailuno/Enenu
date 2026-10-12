import { PageAudio } from "@/components/PageAudio";
import { Visit } from "@/components/Visit";
import { Wall, type WallFriend } from "@/components/Wall";
import { getPageAudio, getPublished } from "@/lib/content";
import { mediaUrl } from "@/lib/media";

export const revalidate = 60;
export const metadata = { title: "Messages from your people" };

export default async function People() {
  const [rows, audio] = await Promise.all([getPublished("friends"), getPageAudio("people")]);
  const friends: WallFriend[] = rows.map((f) => ({
    id: f.id, name: f.name, collection: f.collection, isFromMe: f.is_from_me, intro: f.intro, note: f.note,
    photo: mediaUrl(f.photo_path), video: mediaUrl(f.video_path), poster: mediaUrl(f.poster_path), captions: mediaUrl(f.captions_path),
  }));
  return (
    <main className="page">
      <PageAudio {...audio} />
      <Visit slug="people" />
      <div className="column">
        <h1 className="title">Messages from your people</h1>
        <p className="soft">Some of the people who love you recorded something just for today. Watch one, or watch them all.</p>
        <Wall friends={friends} />
      </div>
    </main>
  );
}
