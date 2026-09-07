/**
 * fetch-fonts.js — self-heal helper.
 * Re-downloads the bundled static fonts if assets/fonts is empty. The fonts are
 * committed to the repo, so this is only a fallback. All are OFL 1.1 (free to
 * redistribute); their licenses live beside them as *-OFL.txt.
 */
import { writeFile, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DIR = join(__dirname, "..", "assets", "fonts");
const BASE = "https://raw.githubusercontent.com/google/fonts/main";

const FILES = [
  ["ArchivoBlack-Regular.ttf", `${BASE}/ofl/archivoblack/ArchivoBlack-Regular.ttf`],
  ["Anton-Regular.ttf", `${BASE}/ofl/anton/Anton-Regular.ttf`],
  ["SpaceMono-Regular.ttf", `${BASE}/ofl/spacemono/SpaceMono-Regular.ttf`],
  ["SpaceMono-Bold.ttf", `${BASE}/ofl/spacemono/SpaceMono-Bold.ttf`],
];

await mkdir(DIR, { recursive: true });
for (const [name, url] of FILES) {
  const dest = join(DIR, name);
  if (existsSync(dest)) { console.log(`  have  ${name}`); continue; }
  const res = await fetch(url);
  if (!res.ok) { console.error(`  FAIL  ${name} (${res.status})`); continue; }
  await writeFile(dest, Buffer.from(await res.arrayBuffer()));
  console.log(`  saved ${name}`);
}
console.log("[adsmith] fonts ready in assets/fonts");
