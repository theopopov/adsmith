/**
 * agentic.js — the AI-authored path.
 * ----------------------------------
 * The deterministic templates in src/templates/ are fast, free, and byte-identical
 * — but they can only make designs you have already coded. This path removes that
 * ceiling: an LLM (Claude) AUTHORS a complete, self-contained SVG per brief, so you
 * can ask for any layout and any level of design — isometric illustration, mesh
 * gradients, a faux build console — without hand-coding a template first. That is
 * how you build a *bespoke* graphics library instead of a fixed one.
 *
 *   data/briefs.json → Claude (SVG author) → resvg (SVG → PNG)
 *
 * TRADE-OFFS (deliberate, and the whole point):
 *   - Slower: seconds per image, not ~30 ms.  - Costs tokens: this calls the API.
 *   - Non-deterministic: same brief can yield different art (we cache to stabilise).
 *   + In exchange you can produce designs the templates simply cannot.
 *
 * Two modes:
 *   --mock (default when ANTHROPIC_API_KEY is unset): render the committed,
 *          Claude-authored SVGs in examples/agentic/. No key, no cost, fully offline
 *          — so anyone can `npm run agentic` and see what the path produces.
 *   live  (ANTHROPIC_API_KEY set, no --mock): actually call Claude to author each
 *          SVG, cache it under cache/, then rasterise. Needs `@anthropic-ai/sdk`.
 *
 * Run:  npm run agentic            # offline, renders the committed examples
 *       ANTHROPIC_API_KEY=… npm run agentic:live
 */

import { readFile, writeFile, mkdir, readdir, unlink } from "node:fs/promises";
import { existsSync } from "node:fs";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { Resvg } from "@resvg/resvg-js";
import { loadTokens } from "./tokens.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const FONT_DIR = join(ROOT, "assets", "fonts");
const BRIEFS = join(ROOT, "data", "briefs.json");
const EXAMPLES = join(ROOT, "examples", "agentic");
const CACHE = join(ROOT, "cache");
const OUT = join(ROOT, "out-agentic");
const W = 1080, H = 1350;

const FONT_FILES = ["ArchivoBlack-Regular.ttf", "Anton-Regular.ttf", "SpaceMono-Regular.ttf", "SpaceMono-Bold.ttf"];

const MODEL = "claude-opus-4-8";

const hasFlag = (f) => process.argv.includes(f);

function systemPrompt(T) {
  return [
    "You are a senior brand designer who outputs a SINGLE self-contained SVG ad creative.",
    `Canvas: exactly ${W}x${H} (portrait 4:5). Output ONLY the SVG — start at <svg and end at </svg>, no markdown, no prose.`,
    "Hard rules:",
    "- Self-contained: only vector shapes, paths, and gradients. NO <image>, NO external URLs, NO rasters, NO scripts.",
    `- Use ONLY these font families for any <text>: "${T.display}" (heavy display), "${T.numeral}" (condensed numerals), "${T.mono}" (mono labels). They are provided to the renderer.`,
    "- Spell every word exactly as given in the brief. Text is real <text>, never decorative fake letters.",
    `- Brand palette (use as accents on the paper/ink base): ${T.accents.join(", ")}.`,
    `- Base colours: paper ${T.paper}, ink ${T.ink}, muted ${T.muted}.`,
    "- Include a small 'ADSMITH' wordmark and the exact headline from the brief.",
    "Design freely and ambitiously — this is the path that exists BECAUSE templates can't. Use gradients, depth, illustration, unusual composition. Make it genuinely on-brand and unmistakably about the message.",
  ].join("\n");
}

function briefPrompt(brief) {
  return [
    `Brief id: ${brief.id}`,
    `Art direction (do something a rigid flexbox template could NOT): ${brief.direction}`,
    `Headline (verbatim): ${brief.headline}`,
    brief.subhead ? `Subhead (verbatim): ${brief.subhead}` : "",
    `Every creative must land the same core message: generate thousands of on-brand creative variants at zero marginal cost.`,
    "Return the SVG only.",
  ].filter(Boolean).join("\n");
}

function extractSvg(s) {
  const m = s.match(/<svg[\s\S]*?<\/svg>/i);
  if (!m) throw new Error("model output contained no <svg>…</svg>");
  return m[0];
}

async function authorLive(brief, T) {
  let Anthropic;
  try {
    Anthropic = (await import("@anthropic-ai/sdk")).default;
  } catch {
    throw new Error("live mode needs `@anthropic-ai/sdk` — run `npm install`, or use `npm run agentic` (mock).");
  }
  const client = new Anthropic(); // reads ANTHROPIC_API_KEY / ant profile
  // Stream because SVGs are long output; adaptive thinking for composition quality.
  const stream = client.messages.stream({
    model: MODEL,
    max_tokens: 16000,
    thinking: { type: "adaptive" },
    system: systemPrompt(T),
    messages: [{ role: "user", content: briefPrompt(brief) }],
  });
  const msg = await stream.finalMessage();
  const out = msg.content.filter((b) => b.type === "text").map((b) => b.text).join("");
  return extractSvg(out);
}

async function svgForBrief(brief, T, live) {
  if (live) {
    await mkdir(CACHE, { recursive: true });
    const key = createHash("sha1").update(`${MODEL}|${brief.id}|${brief.direction}|${brief.headline}`).digest("hex").slice(0, 12);
    const cached = join(CACHE, `${brief.id}-${key}.svg`);
    if (existsSync(cached)) return { svg: await readFile(cached, "utf8"), source: "cache" };
    const svg = await authorLive(brief, T);
    await writeFile(cached, svg);
    return { svg, source: "claude" };
  }
  // mock: the committed, Claude-authored example
  const p = join(EXAMPLES, `${brief.id}.svg`);
  if (!existsSync(p)) throw new Error(`no committed example for "${brief.id}" (${p}); run live mode to generate it.`);
  return { svg: await readFile(p, "utf8"), source: "example" };
}

async function main() {
  const live = process.env.ANTHROPIC_API_KEY && !hasFlag("--mock");
  const T = await loadTokens();
  const briefs = JSON.parse(await readFile(BRIEFS, "utf8"));
  const fonts = FONT_FILES.map((f) => join(FONT_DIR, f)).filter(existsSync);

  await mkdir(OUT, { recursive: true });
  for (const f of await readdir(OUT)) {
    if (f.endsWith(".png") || f.endsWith(".svg")) await unlink(join(OUT, f));
  }

  console.log(`\n[adsmith·agentic] mode=${live ? "LIVE (Claude authors each SVG)" : "MOCK (committed examples)"}  briefs=${briefs.length}\n`);
  const t0 = Date.now();
  let ok = 0;

  for (let i = 0; i < briefs.length; i++) {
    const brief = briefs[i];
    const { svg, source } = await svgForBrief(brief, T, live);
    const png = new Resvg(svg, {
      fitTo: { mode: "width", value: W },
      font: { fontFiles: fonts, loadSystemFonts: false, defaultFontFamily: T.mono },
    }).render().asPng();
    const name = `${String(i + 1).padStart(2, "0")}-${brief.id}`;
    await writeFile(join(OUT, `${name}.svg`), svg);
    await writeFile(join(OUT, `${name}.png`), png);
    ok++;
    console.log(`  [${String(i + 1).padStart(2, "0")}/${briefs.length}] ${name}.png   (${source})`);
  }

  const ms = Date.now() - t0;
  console.log(
    `\n[adsmith·agentic] ${ok} creatives → ${OUT}\n` +
      (live
        ? `[adsmith·agentic] ${ms} ms · authored by ${MODEL} · costs tokens · non-deterministic (cached in ./cache)\n`
        : `[adsmith·agentic] ${ms} ms · rendered committed examples · $0 · set ANTHROPIC_API_KEY + \`npm run agentic:live\` to author fresh\n`)
  );
}

main().catch((e) => { console.error("[adsmith·agentic]", e.message); process.exit(1); });
