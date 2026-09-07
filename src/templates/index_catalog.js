// SPDX-FileCopyrightText: 2026 Adsmith
// SPDX-License-Identifier: MIT
/**
 * index_catalog.js — the variant index.
 * A catalog / table-of-contents page: a numbered list of variant titles, framed by
 * a big running count. Reads as "here is the library of variants this sheet produces."
 */
import { CANVAS, h, text, brandBar, specFooter, cropMarks } from "../components.js";

const ENTRIES = [
  "Thousands of on-brand variants",
  "Zero marginal cost per image",
  "Correct text, every render",
  "One template, every colorway",
  "No per-image meter",
  "No volume cap, ever",
  "Deterministic build step",
  "Renders on one CPU",
  "Fully offline, self-owned",
  "5–10× more testable creative",
  "Campaign shipped in one loop",
  "Own the template and output",
];

export function indexCatalog(row, T, accent, index, total) {
  const rows = ENTRIES.map((label, i) =>
    h(
      "div",
      {
        style: {
          display: "flex", alignItems: "center", justifyContent: "space-between",
          borderBottom: `2px solid ${T.hairline}`, paddingTop: 14, paddingBottom: 14,
        },
      },
      h(
        "div",
        { style: { display: "flex", alignItems: "baseline" } },
        text(String(i + 1).padStart(2, "0"), { fontFamily: T.mono, fontSize: 22, fontWeight: 700, color: accent, letterSpacing: "1px", marginRight: 24 }),
        text(label, { fontFamily: T.display, fontSize: 30, color: T.ink, letterSpacing: "-0.5px" })
      ),
      h("div", { style: { display: "flex", width: 12, height: 12, backgroundColor: T.accents[i % T.accents.length] } })
    )
  );

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
      h(
        "div",
        { style: { display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginTop: 30, marginBottom: 20 } },
        text((row.eyebrow || "VARIANT INDEX").toUpperCase(), { fontFamily: T.mono, fontSize: 24, fontWeight: 700, color: T.ink, letterSpacing: "3px" }),
        h("div", { style: { display: "flex", fontFamily: T.numeral, fontSize: 120, lineHeight: 0.8, color: accent } }, row.stat || "10,000")
      ),
      h("div", { style: { display: "flex", flexDirection: "column" } }, ...rows)
    ),
    specFooter(T, row.cta ? row.cta : undefined)
  );
}
