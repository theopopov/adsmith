/**
 * tokens.js
 * ---------
 * Loads brand.json + theme.json and resolves them into a flat `T` object the
 * templates read from. Because every template reads colour/type ONLY from `T`,
 * flipping `active` in theme.json (press <-> carbon) or editing the palette
 * re-skins the entire pack on the next render. Tokens-first, not per-image.
 */

import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

export async function loadTokens(themeOverride) {
  const brand = JSON.parse(await readFile(join(ROOT, "brand", "brand.json"), "utf8"));
  const theme = JSON.parse(await readFile(join(ROOT, "brand", "theme.json"), "utf8"));

  const activeKey = themeOverride || theme.active;
  const t = theme.themes[activeKey];
  if (!t) throw new Error(`theme "${activeKey}" not found in theme.json`);

  return {
    brand,
    themeKey: activeKey,
    // colours
    paper: t.paper,
    panel: t.panel,
    ink: t.ink,
    muted: t.muted,
    hairline: t.hairline,
    accents: theme.palette.accents,
    // type
    display: theme.type.display,
    numeral: theme.type.numeral,
    mono: theme.type.mono,
    // grid
    margin: theme.grid.margin,
    hairlineW: theme.grid.hairline_w,
  };
}

/** Deterministic accent for a given row index — same index, same colour, forever. */
export function accentFor(T, i) {
  return T.accents[i % T.accents.length];
}
