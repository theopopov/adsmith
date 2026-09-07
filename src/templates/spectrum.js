// SPDX-FileCopyrightText: 2026 Adsmith
// SPDX-License-Identifier: MIT
/**
 * spectrum.js — the full-bleed colourway band.
 * Every accent in the palette becomes a vertical stripe; a paper panel floats on
 * top with the statement. The literal visual argument: one template, every
 * colorway, still one brand family.
 */
import { CANVAS, h, text, specFooter } from "../components.js";

export function spectrum(row, T, accent, index, total) {
  const stripes = T.accents.map((c) =>
    h("div", { style: { display: "flex", flexGrow: 1, height: CANVAS.H, backgroundColor: c } })
  );

  const pad = (n) => String(n).padStart(4, "0");
  const commas = (n) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ",");

  return h(
    "div",
    { style: { position: "relative", width: CANVAS.W, height: CANVAS.H, display: "flex", backgroundColor: T.ink } },

    // background: the full palette as stripes
    h("div", { style: { position: "absolute", top: 0, left: 0, width: CANVAS.W, height: CANVAS.H, display: "flex" } }, ...stripes),

    // floating panel
    h(
      "div",
      {
        style: {
          position: "absolute", top: 150, left: 90, width: 900, height: 1050,
          backgroundColor: T.paper, display: "flex", flexDirection: "column",
          justifyContent: "space-between", padding: 70, border: `3px solid ${T.ink}`,
        },
      },
      // header
      h(
        "div",
        { style: { display: "flex", alignItems: "center", justifyContent: "space-between" } },
        h(
          "div",
          { style: { display: "flex", alignItems: "center" } },
          h("div", { style: { width: 30, height: 30, backgroundColor: accent, marginRight: 16, display: "flex" } }),
          text(String(T.brand.name).toUpperCase(), { fontFamily: T.mono, fontSize: 26, fontWeight: 700, color: T.ink, letterSpacing: "1px" })
        ),
        text(`VARIANT ${pad(index + 1)} / ${commas(total)}`, { fontFamily: T.mono, fontSize: 20, color: T.muted, letterSpacing: "1px" })
      ),
      // statement
      h(
        "div",
        { style: { display: "flex", flexDirection: "column" } },
        text((row.eyebrow || "ONE TEMPLATE · EVERY COLORWAY").toUpperCase(), {
          fontFamily: T.mono, fontSize: 22, fontWeight: 700, color: accent, letterSpacing: "3px", marginBottom: 22,
        }),
        h("div", { style: { display: "flex", fontFamily: T.display, fontSize: 84, lineHeight: 1.0, color: T.ink, letterSpacing: "-1.5px" } }, row.headline || ""),
        text(row.subhead || "", { fontFamily: T.mono, fontSize: 26, lineHeight: 1.4, color: T.muted, marginTop: 26, maxWidth: 720 })
      ),
      specFooter(T, row.cta ? row.cta : undefined)
    )
  );
}
