/**
 * render.js — the engine.
 * ------------------------
 * data/variants.json  →  Satori (element tree → SVG)  →  resvg (SVG → PNG).
 *
 * There is NO network or model API call in this loop. Given the same data sheet,
 * the same theme, and the same fonts, it emits byte-for-byte identical PNGs every
 * run. Marginal cost per additional image is local CPU time only: $0. No cap.
 *
 * Run:  npm install && node src/render.js
 *       node src/render.js --theme carbon      # re-skin the whole pack
 */

import { readFile, writeFile, mkdir, readdir, unlink } from "node:fs/promises";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import satori from "satori";
import { Resvg } from "@resvg/resvg-js";

import { CANVAS } from "./components.js";
import { build } from "./templates/index.js";
import { loadTokens, accentFor } from "./tokens.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const FONT_DIR = join(ROOT, "assets", "fonts");
const DATA_PATH = join(ROOT, "data", "variants.json");
const OUT_DIR = join(ROOT, "out");

// Every font is a STATIC weight on purpose — Satori's opentype parser does not
// reliably read variable-font fvar tables. One family, one file, one weight.
const FONT_FACES = [
  { name: "Archivo Black", weight: 400, file: "ArchivoBlack-Regular.ttf" },
  { name: "Anton", weight: 400, file: "Anton-Regular.ttf" },
  { name: "Space Mono", weight: 400, file: "SpaceMono-Regular.ttf" },
  { name: "Space Mono", weight: 700, file: "SpaceMono-Bold.ttf" },
];

function slug(row, i) {
  const base = `${row.layout || "poster"}-${row.slug || row.eyebrow || "variant"}`
    .toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  return `${String(i + 1).padStart(2, "0")}-${base}`;
}

function argVal(flag) {
  const i = process.argv.indexOf(flag);
  return i > -1 ? process.argv[i + 1] : undefined;
}

async function main() {
  const missing = FONT_FACES.filter((f) => !existsSync(join(FONT_DIR, f.file)));
  if (missing.length) {
    console.error(
      `\n[adsmith] Missing font file(s): ${missing.map((m) => m.file).join(", ")}\n` +
        `          Satori needs real font buffers. Run:  npm run fetch-fonts\n`
    );
    process.exit(1);
  }

  const T = await loadTokens(argVal("--theme"));
  const rows = JSON.parse(await readFile(DATA_PATH, "utf8"));
  await mkdir(OUT_DIR, { recursive: true });

  // Clean prior output so the run is reproducible.
  for (const f of await readdir(OUT_DIR)) {
    if (f.endsWith(".png") || f.endsWith(".svg")) await unlink(join(OUT_DIR, f));
  }

  const fonts = await Promise.all(
    FONT_FACES.map(async ({ name, weight, file }) => ({
      name, weight, style: "normal", data: await readFile(join(FONT_DIR, file)),
    }))
  );

  console.log(`\n[adsmith] theme="${T.themeKey}"  rows=${rows.length}  size=${CANVAS.W}x${CANVAS.H}\n`);
  const t0 = Date.now();
  let ok = 0;

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const accent = row.accent || accentFor(T, i);
    const name = slug(row, i);

    // 1) element tree → SVG (real CSS layout + real glyph outlines, not an AI guess)
    const svg = await satori(build(row, T, accent, i, T.brand.run_total), {
      width: CANVAS.W, height: CANVAS.H, fonts,
    });

    // 2) SVG → PNG (headless rasteriser, no browser)
    const png = new Resvg(svg, {
      fitTo: { mode: "width", value: CANVAS.W },
      font: { loadSystemFonts: false },
    }).render().asPng();

    await writeFile(join(OUT_DIR, `${name}.svg`), svg);
    await writeFile(join(OUT_DIR, `${name}.png`), png);
    ok++;
    console.log(`  [${String(i + 1).padStart(2, "0")}/${rows.length}] ${name}.png  (${row.layout || "poster"})`);
  }

  const ms = Date.now() - t0;
  console.log(
    `\n[adsmith] ${ok} creatives → ${OUT_DIR}\n` +
      `[adsmith] ${ms} ms total · ~${Math.round(ms / ok)} ms/image · $0 marginal cost · 0 API calls\n`
  );
}

main().catch((err) => { console.error(err); process.exit(1); });
