// SPDX-FileCopyrightText: 2026 Adsmith
// SPDX-License-Identifier: MIT
/**
 * grid9.js — the mosaic.
 * A 3×3 wall of miniature creatives, each a different colorway, under one header.
 * The most literal "one sheet → many on-brand variants" statement in the set.
 */
import { CANVAS, h, text, brandBar, specFooter, cropMarks } from "../components.js";

// Nine micro-headlines — the "variants" tiled in the mosaic.
const CELLS = [
  "Thousands of variants",
  "Zero marginal cost",
  "One template",
  "Correct text, always",
  "No API in the loop",
  "Deterministic build",
  "Every colorway",
  "No volume cap",
  "Own the output",
];

export function grid9(row, T, accent, index, total) {
  const rows = [];
  for (let r = 0; r < 3; r++) {
    const cells = [];
    for (let c = 0; c < 3; c++) {
      const n = r * 3 + c;
      const a = T.accents[(n + index) % T.accents.length];
      cells.push(
        h(
          "div",
          {
            style: {
              display: "flex", flexDirection: "column", justifyContent: "space-between",
              width: 268, height: 268, marginRight: c === 2 ? 0 : 14, backgroundColor: T.panel,
              border: `3px solid ${T.ink}`, padding: 22,
            },
          },
          h("div", { style: { display: "flex", width: 54, height: 12, backgroundColor: a } }),
          text(CELLS[n], { fontFamily: T.display, fontSize: 27, lineHeight: 1.05, color: T.ink, letterSpacing: "-0.5px" }),
          text(`0${n + 1} / 09`, { fontFamily: T.mono, fontSize: 15, color: T.muted, letterSpacing: "1px" })
        )
      );
    }
    rows.push(h("div", { style: { display: "flex", marginBottom: r === 2 ? 0 : 14 } }, ...cells));
  }

  return h(
    "div",
    {
      style: {
        position: "relative", width: CANVAS.W, height: CANVAS.H, display: "flex",
        flexDirection: "column", justifyContent: "space-between",
        backgroundColor: T.paper, padding: `${T.margin}px`, fontFamily: T.mono,
      },
    },
    cropMarks(T),
    h(
      "div",
      { style: { display: "flex", flexDirection: "column" } },
      brandBar(T, accent, index, total),
      h("div", { style: { display: "flex", marginTop: 34, fontFamily: T.display, fontSize: 60, lineHeight: 1.0, color: T.ink, letterSpacing: "-1px", maxWidth: 912 } }, row.headline || "One sheet. Nine variants. Same brand."),
      text(row.subhead || "", { fontFamily: T.mono, fontSize: 22, color: T.muted, marginTop: 18, maxWidth: 860 })
    ),
    h("div", { style: { display: "flex", flexDirection: "column" } }, ...rows),
    specFooter(T, row.cta ? row.cta : undefined)
  );
}
