import { Fade, TypeInView } from "@/components/InView";
import { PageAudio } from "@/components/PageAudio";
import { Visit } from "@/components/Visit";
import { ZoomImage } from "@/components/ZoomImage";
import { getPageAudio, getPublished } from "@/lib/content";

export const revalidate = 60;
export const metadata = { title: "Memory lane" };

export default async function Memories() {
  const [memories, timeline, ordinary, audio] = await Promise.all([
    getPublished("memories"),
    getPublished("timeline_entries"),
    getPublished("ordinary_things"),
    getPageAudio("memories"),
  ]);
  const empty = !memories.length && !timeline.length && !ordinary.length;

  return (
    <main className="page">
      <PageAudio {...audio} />
      <Visit slug="memories" />
      <div className="column">
        <h1 className="title">Memory lane</h1>
        <p className="soft">The little scrapbook of us.</p>
        {empty && <p className="soft">Nothing here yet.</p>}
      </div>

      {memories.map((m) => (
        <Fade key={m.id} className="memory">
          {m.kind === "photo" ? (
            <>
              <div className="bleed"><ZoomImage path={m.photo_path} alt={m.caption ?? ""} ratio="auto" caption={m.caption} /></div>
              {m.when_text && <div className="column"><p className="when">{m.when_text}</p></div>}
            </>
          ) : m.kind === "note" ? (
            <div className="column"><p className="hand big">{m.body ?? m.caption}</p></div>
          ) : (
            <div className="column">
              {m.when_text && <p className="when">{m.when_text}</p>}
              {m.title && <h2 className="sub">{m.title}</h2>}
              {m.body && <p className="line">{m.body}</p>}
            </div>
          )}
        </Fade>
      ))}

      {timeline.length > 0 && (
        <section className="column block">
          <hr className="rule" />
          <TypeInView as="h2" className="title" text="How it went" />
          <ol className="timeline">
            {timeline.map((t) => (
              <Fade key={t.id}>
                <li>
                  {t.when_text && <p className="when">{t.when_text}</p>}
                  <h3 className="sub">{t.title}</h3>
                  <p className="line">{t.body}</p>
                </li>
              </Fade>
            ))}
          </ol>
        </section>
      )}

      {ordinary.length > 0 && (
        <section className="column block">
          <hr className="rule" />
          <TypeInView as="h2" className="title" text="The ordinary things" />
          <p className="soft">Small moments nobody else noticed.</p>
          <ul className="plain">
            {ordinary.map((o) => (
              <Fade key={o.id}><li className="hand">{o.body}</li></Fade>
            ))}
          </ul>
        </section>
      )}
    </main>
  );
}
