// SPDX-FileCopyrightText: 2026 Adsmith
// SPDX-License-Identifier: MIT
/**
 * ticket.js — the build manifest / receipt.
 * Pure-monospace "printout" that frames each creative as a deterministic build
 * artifact: engine, rows, rate, and a $0.00 total. Reinforces "this is a build
 * step, not a slot machine."
 */
import { CANVAS, h, text, cropMarks } from "../components.js";

const pad = (n) => String(n).padStart(4, "0");
const commas = (n) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ",");

function kv(T, k, v, accentV, accent) {
  return h(
    "div",
    {
      style: {
        display: "flex", justifyContent: "space-between", alignItems: "flex-end",
        borderBottom: `2px dashed ${T.hairline}`, paddingBottom: 14, marginBottom: 18,
      },
    },
    text(k, { fontFamily: T.mono, fontSize: 24, color: T.muted, letterSpacing: "1px" }),
    text(v, { fontFamily: T.mono, fontSize: 26, fontWeight: 700, color: accentV ? accent : T.ink, letterSpacing: "1px" })
  );
}

export function ticket(row, T, accent, index, total) {
  // barcode-ish strip: deterministic bars from the row index
  const bars = [];
  for (let i = 0; i < 60; i++) {
    const w = ((i * 7 + index * 3) % 5) + 2;
    const on = (i * 13 + index * 5) % 3 !== 0;
    bars.push(h("div", { style: { display: "flex", width: w, height: 70, marginRight: 3, backgroundColor: on ? T.ink : "transparent" } }));
  }

  return h(
    "div",
    {
      style: {
        position: "relative", width: CANVAS.W, height: CANVAS.H, display: "flex",
        flexDirection: "column", backgroundColor: T.paper, padding: `${T.margin}px`, fontFamily: T.mono,
      },
    },
    cropMarks(T),

    // header
    h(
      "div",
      { style: { display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: `4px solid ${T.ink}`, paddingBottom: 22 } },
      h(
        "div",
        { style: { display: "flex", alignItems: "center" } },
        h("div", { style: { width: 30, height: 30, backgroundColor: accent, marginRight: 16, display: "flex" } }),
        text(`${String(T.brand.name).toUpperCase()} · BUILD MANIFEST`, { fontFamily: T.mono, fontSize: 26, fontWeight: 700, color: T.ink, letterSpacing: "1px" })
      ),
      text(`#${pad(index + 1)}`, { fontFamily: T.mono, fontSize: 24, color: T.muted })
    ),

    // title
    h("div", { style: { display: "flex", fontFamily: T.display, fontSize: 62, lineHeight: 1.02, color: T.ink, letterSpacing: "-1px", marginTop: 40, marginBottom: 12, maxWidth: 912 } }, row.headline || ""),
    text(row.subhead || "", { fontFamily: T.mono, fontSize: 24, lineHeight: 1.4, color: T.muted, marginBottom: 40, maxWidth: 860 }),

    // manifest rows
    kv(T, "TEMPLATE", (row.eyebrow || "poster").toLowerCase()),
    kv(T, "DATA ROWS", `${commas(total)} → ${commas(total)} PNG`),
    kv(T, "ENGINE", "satori → resvg"),
    kv(T, "RENDER RATE", "~17 ms / image"),
    kv(T, "VOLUME CAP", "none"),
    kv(T, "MARGINAL COST", "$0.00", true, accent),

    // total + barcode pinned to bottom
    h(
      "div",
      { style: { display: "flex", flexDirection: "column", marginTop: "auto" } },
      h(
        "div",
        { style: { display: "flex", justifyContent: "space-between", alignItems: "baseline", borderTop: `4px solid ${T.ink}`, paddingTop: 20, marginBottom: 24 } },
        text("TOTAL DUE PER IMAGE", { fontFamily: T.mono, fontSize: 26, fontWeight: 700, color: T.ink, letterSpacing: "1px" }),
        h("div", { style: { display: "flex", fontFamily: T.numeral, fontSize: 96, color: accent, letterSpacing: "-1px" } }, "$0.00")
      ),
      h("div", { style: { display: "flex" } }, ...bars),
      text(`${T.brand.url}  ·  clone-and-run  ·  deterministic`, { fontFamily: T.mono, fontSize: 18, color: T.muted, letterSpacing: "1px", marginTop: 18 })
    )
  );
}
