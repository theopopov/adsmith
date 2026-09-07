// SPDX-FileCopyrightText: 2026 Adsmith
// SPDX-License-Identifier: MIT
/**
 * stat.js — one enormous number.
 * The row supplies `stat` ("10,000", "$0.00", "17ms", "∞"). Anton condensed sets
 * it huge in the accent colour. Used to hammer scale and zero-cost single-mindedly.
 */
import { CANVAS, h, text, brandBar, specFooter, cropMarks } from "../components.js";

export function stat(row, T, accent, index, total) {
  const value = row.stat || "0";
  const size = value.length > 7 ? 250 : value.length > 5 ? 300 : 360;

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
    brandBar(T, accent, index, total),

    // center block
    h(
      "div",
      { style: { display: "flex", flexDirection: "column", justifyContent: "center", flexGrow: 1, paddingTop: 20 } },
      text((row.eyebrow || "THE NUMBER").toUpperCase(), {
        fontFamily: T.mono, fontSize: 24, fontWeight: 700, color: T.ink, letterSpacing: "4px", marginBottom: 8,
      }),
      h(
        "div",
        { style: { display: "flex", fontFamily: T.numeral, fontSize: size, lineHeight: 0.86, color: accent, letterSpacing: "-2px" } },
        value
      ),
      h("div", { style: { display: "flex", width: 180, height: 12, backgroundColor: T.ink, marginTop: 26, marginBottom: 30 } }),
      text(row.headline || "", {
        fontFamily: T.display, fontSize: 46, lineHeight: 1.05, color: T.ink, letterSpacing: "-0.5px", maxWidth: 860,
      }),
      text(row.subhead || "", {
        fontFamily: T.mono, fontSize: 25, lineHeight: 1.4, color: T.muted, marginTop: 22, maxWidth: 820,
      })
    ),

    specFooter(T, row.cta ? row.cta : undefined)
  );
}
