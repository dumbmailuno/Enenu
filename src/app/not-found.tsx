import Link from "next/link";

export default function NotFound() {
  return (
    <main className="page">
      <div className="column">
        <h1 className="title">There is nothing here.</h1>
        <p className="line"><Link href="/hub">Go back to the beginning</Link></p>
      </div>
    </main>
  );
}
