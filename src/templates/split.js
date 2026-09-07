// SPDX-FileCopyrightText: 2026 Adsmith
// SPDX-License-Identifier: MIT
/**
 * split.js — the duotone split.
 * Left: a full-height accent panel with one giant Anton value. Right: paper with
 * the headline and spec. High-contrast, block-colour — distinct from the paper-on-
 * paper `stat` layout.
 */
import { CANVAS, h, text, pickInk } from "../components.js";

const pad = (n) => String(n).padStart(4, "0");
const commas = (n) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ",");

export function split(row, T, accent, index, total) {
  const LW = 460;
  const on = pickInk(accent, T);
  const val = row.stat || "0";
  const numSize = val.length >= 6 ? 116 : val.length === 5 ? 150 : 200;

  return h(
    "div",
    { style: { position: "relative", width: CANVAS.W, height: CANVAS.H, display: "flex", backgroundColor: T.paper } },

    // left accent panel
    h(
      "div",
      {
        style: {
          width: LW, height: CANVAS.H, backgroundColor: accent, display: "flex",
          flexDirection: "column", justifyContent: "space-between", padding: 56, overflow: "hidden",
        },
      },
      text((row.eyebrow || "THE NUMBER").toUpperCase(), { fontFamily: T.mono, fontSize: 22, fontWeight: 700, color: on, letterSpacing: "3px" }),
      h("div", { style: { display: "flex", fontFamily: T.numeral, fontSize: numSize, lineHeight: 0.86, color: on, letterSpacing: "-1px" } }, val),
      text(`${String(T.brand.name).toUpperCase()}\n${pad(index + 1)} / ${commas(total)}`, { fontFamily: T.mono, fontSize: 20, color: on, letterSpacing: "1px", lineHeight: 1.5 })
    ),

    // right paper panel
    h(
      "div",
      {
        style: {
          flexGrow: 1, height: CANVAS.H, display: "flex", flexDirection: "column",
          justifyContent: "space-between", padding: `${T.margin}px 64px`,
        },
      },
      h(
        "div",
        { style: { display: "flex", flexDirection: "column" } },
        h("div", { style: { display: "flex", width: 90, height: 12, backgroundColor: accent, marginBottom: 30 } }),
        h("div", { style: { display: "flex", fontFamily: T.display, fontSize: 66, lineHeight: 1.02, color: T.ink, letterSpacing: "-1px", maxWidth: 520 } }, row.headline || ""),
        text(row.subhead || "", { fontFamily: T.mono, fontSize: 25, lineHeight: 1.4, color: T.muted, marginTop: 26, maxWidth: 500 })
      ),
      // compact footer sized for the narrow column
      h(
        "div",
        { style: { display: "flex", flexDirection: "column", borderTop: `${T.hairlineW}px solid ${T.ink}`, paddingTop: 20 } },
        text("SATORI → RESVG · DETERMINISTIC", { fontFamily: T.mono, fontSize: 17, color: T.muted, letterSpacing: "1px" }),
        text(row.cta || T.brand.url, { fontFamily: T.mono, fontSize: 18, fontWeight: 700, color: T.ink, letterSpacing: "1px", marginTop: 6 })
      )
    )
  );
}
