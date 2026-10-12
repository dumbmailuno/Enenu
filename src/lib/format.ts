const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

/** "2024-03-09" becomes "9 March 2024". Anything else (like "Summer 2023") is shown as written. Same output on server and browser. */
export function niceDate(value?: string | null): string {
  if (!value) return "";
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
  if (!m) return value;
  const month = MONTHS[Number(m[2]) - 1];
  return month ? `${Number(m[3])} ${month} ${m[1]}` : value;
}

/** Text from the database may hold a paragraph array or one string with blank lines between paragraphs. */
export function paragraphs(value: unknown): string[] {
  if (Array.isArray(value)) return value.map(String).filter((s) => s.trim());
  if (typeof value === "string") return value.split(/\n{2,}/).map((s) => s.trim()).filter(Boolean);
  return [];
}

/** Removes any stray HTML tags (an earlier draft used <em> in the cake message). */
export const plain = (s: string) => s.replace(/<[^>]+>/g, "");
