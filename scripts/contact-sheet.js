/**
 * contact-sheet.js — tile every rendered PNG into one overview image.
 * The point of the whole repo in a single frame: many on-brand variants, one
 * data sheet. Reads out/*.png (skipping any prior sheet) and writes
 * out/_contact-sheet.png via the same resvg rasteriser — no extra dependency.
 */
import { readFile, writeFile, readdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { Resvg } from "@resvg/resvg-js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, "..", "out");

const COLS = 4;
const THUMB_W = 300;
const THUMB_H = 375; // 1080x1350 -> 4:5
const GAP = 24;
const PAD = 40;

const files = (await readdir(OUT))
  .filter((f) => f.endsWith(".png") && !f.startsWith("_"))
  .sort();

if (!files.length) {
  console.error("[adsmith] no PNGs in out/ — run `npm run render` first.");
  process.exit(1);
}

const rows = Math.ceil(files.length / COLS);
const W = PAD * 2 + COLS * THUMB_W + (COLS - 1) * GAP;
const H = PAD * 2 + rows * THUMB_H + (rows - 1) * GAP;

let cells = "";
for (let i = 0; i < files.length; i++) {
  const b64 = (await readFile(join(OUT, files[i]))).toString("base64");
  const x = PAD + (i % COLS) * (THUMB_W + GAP);
  const y = PAD + Math.floor(i / COLS) * (THUMB_H + GAP);
  cells +=
    `<image x="${x}" y="${y}" width="${THUMB_W}" height="${THUMB_H}" ` +
    `href="data:image/png;base64,${b64}"/>` +
    `<rect x="${x}" y="${y}" width="${THUMB_W}" height="${THUMB_H}" ` +
    `fill="none" stroke="#181510" stroke-width="2"/>`;
}

const svg =
  `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">` +
  `<rect width="${W}" height="${H}" fill="#181510"/>${cells}</svg>`;

const png = new Resvg(svg, { fitTo: { mode: "width", value: W } }).render().asPng();
await writeFile(join(OUT, "_contact-sheet.png"), png);
console.log(`[adsmith] contact sheet → out/_contact-sheet.png  (${files.length} variants, ${W}x${H})`);
