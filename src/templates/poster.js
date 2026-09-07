/**
 * poster.js — the hero layout.
 * Big Archivo Black headline over a field of on-brand swatches, capped with the
 * zero-cost stamp. This is the flagship "thousands of variants at $0" statement.
 */
import {
  CANVAS, h, text, brandBar, variantMatrix, costStamp, specFooter, cropMarks,
} from "../components.js";

export function poster(row, T, accent, index, total) {
  const headline = row.headline || "";
  const size = headline.length > 40 ? 76 : headline.length > 28 ? 88 : 100;

  return h(
    "div",
    {
      style: {
        position: "relative",
        width: CANVAS.W,
        height: CANVAS.H,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        backgroundColor: T.paper,
        padding: `${T.margin}px`,
        fontFamily: T.mono,
      },
    },
    cropMarks(T),

    // ---- top: brand bar + headline block ----
    h(
      "div",
      { style: { display: "flex", flexDirection: "column" } },
      brandBar(T, accent, index, total),

      // eyebrow tag
      h(
        "div",
        { style: { display: "flex", alignItems: "center", marginTop: 54 } },
        h("div", { style: { width: 14, height: 14, backgroundColor: accent, marginRight: 12, display: "flex" } }),
        text((row.eyebrow || "ON-BRAND · AT SCALE").toUpperCase(), {
          fontFamily: T.mono, fontSize: 22, fontWeight: 700, color: T.ink, letterSpacing: "3px",
        })
      ),

      // headline
      h(
        "div",
        {
          style: {
            display: "flex", marginTop: 26, fontFamily: T.display, fontSize: size,
            lineHeight: 1.0, color: T.ink, letterSpacing: "-1.5px", maxWidth: 912,
          },
        },
        headline
      ),

      // accent rule + subhead
      h("div", { style: { display: "flex", width: 132, height: 12, backgroundColor: accent, marginTop: 30 } }),
      text(row.subhead || "", {
        fontFamily: T.mono, fontSize: 27, lineHeight: 1.4, color: T.muted, marginTop: 26, maxWidth: 860,
      })
    ),

    // ---- bottom: variant matrix + cost stamp + spec footer ----
    h(
      "div",
      { style: { display: "flex", flexDirection: "column" } },
      variantMatrix(T, accent, index, { cols: 18, rows: 5, cell: 42, gap: 6 }),
      h(
        "div",
        {
          style: {
            display: "flex", alignItems: "center", justifyContent: "space-between",
            marginTop: 40, marginBottom: 30,
          },
        },
        costStamp(T, accent, row.stamp || "$0.00", row.stampSub || "PER IMAGE"),
        text(row.cta || "clone · run · ship", {
          fontFamily: T.mono, fontSize: 22, fontWeight: 700, color: T.ink, letterSpacing: "1px",
        })
      ),
      specFooter(T)
    )
  );
}
