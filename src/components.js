/**
 * components.js
 * -------------
 * Shared, reusable pieces of the Adsmith visual system. Templates compose these.
 * Everything is a plain object tree (no JSX) so it runs on bare Node via Satori.
 *
 * Signature motifs (this is what makes an Adsmith card recognisable):
 *   - crop / registration marks in every corner   -> "this came off a press"
 *   - a serial counter  VARIANT 0247 / 10,000      -> scale, one of thousands
 *   - the variant matrix: a field of small swatches -> a wall of on-brand variants
 *   - the cost stamp  $0.00 PER IMAGE               -> zero marginal cost
 *   - a mono spec footer  SATORI -> RESVG ...        -> deterministic, no API
 */

export const CANVAS = { W: 1080, H: 1350 };

/** No-JSX element helper: (type, props, ...children) -> Satori node. */
export const h = (type, props = {}, ...children) => ({
  type,
  props: {
    ...props,
    children:
      children.length === 0 ? undefined : children.length === 1 ? children[0] : children,
  },
});

/** A plain text box (Satori wants display set on every node). */
export const text = (str, style = {}) =>
  h("div", { style: { display: "flex", ...style } }, str);

const pad = (n, w = 4) => String(n).padStart(w, "0");
const commas = (n) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ",");

/* ------------------------------------------------------------------ */
/* Corner crop marks — four thin ink L-shapes, absolutely positioned.  */
/* ------------------------------------------------------------------ */
export function cropMarks(T) {
  const len = 34;
  const w = 3;
  const inset = 30;
  const arm = (style) =>
    h("div", { style: { position: "absolute", backgroundColor: T.hairline, ...style } });
  const corner = (v, hh) => [
    arm({ [v]: inset, [hh]: inset, width: len, height: w }),
    arm({ [v]: inset, [hh]: inset, width: w, height: len }),
  ];
  return h(
    "div",
    { style: { position: "absolute", top: 0, left: 0, width: CANVAS.W, height: CANVAS.H, display: "flex" } },
    ...corner("top", "left"),
    ...corner("top", "right"),
    ...corner("bottom", "left"),
    ...corner("bottom", "right")
  );
}

/* ------------------------------------------------------------------ */
/* Brand bar — mark + wordmark on the left, serial counter on right.   */
/* ------------------------------------------------------------------ */
export function brandBar(T, accent, index, total) {
  return h(
    "div",
    {
      style: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        borderBottom: `${T.hairlineW}px solid ${T.ink}`,
        paddingBottom: 22,
      },
    },
    // wordmark
    h(
      "div",
      { style: { display: "flex", alignItems: "center" } },
      h("div", { style: { width: 30, height: 30, backgroundColor: accent, marginRight: 16, display: "flex" } }),
      text(String(T.brand.name).toUpperCase(), {
        fontFamily: T.mono,
        fontSize: 27,
        fontWeight: 700,
        color: T.ink,
        letterSpacing: "1px",
      })
    ),
    // serial
    text(`VARIANT ${pad(index + 1)} / ${commas(total)}`, {
      fontFamily: T.mono,
      fontSize: 21,
      fontWeight: 400,
      color: T.muted,
      letterSpacing: "1px",
    })
  );
}

/* ------------------------------------------------------------------ */
/* Variant matrix — a deterministic field of swatches. The visual      */
/* argument: "here is a wall of on-brand variants, all from one sheet". */
/* ------------------------------------------------------------------ */
export function variantMatrix(T, accent, index, { cols = 18, rows = 6, cell = 44, gap = 8 } = {}) {
  const rowEls = [];
  for (let r = 0; r < rows; r++) {
    const cells = [];
    for (let c = 0; c < cols; c++) {
      const n = r * cols + c;
      // deterministic fill pattern seeded by the row index — no randomness
      const k = (n * 7 + index * 13) % 11;
      let bg = "transparent";
      let border = `2px solid ${T.hairline}`;
      if (k === 0) {
        bg = accent; // the row's own colour recurs most
        border = `2px solid ${accent}`;
      } else if (k === 3 || k === 7) {
        const col = T.accents[(n + index) % T.accents.length];
        bg = col;
        border = `2px solid ${col}`;
      }
      cells.push(
        h("div", {
          style: {
            width: cell,
            height: cell,
            marginRight: c === cols - 1 ? 0 : gap,
            backgroundColor: bg,
            border,
            display: "flex",
          },
        })
      );
    }
    rowEls.push(
      h(
        "div",
        { style: { display: "flex", marginBottom: r === rows - 1 ? 0 : gap } },
        ...cells
      )
    );
  }
  return h("div", { style: { display: "flex", flexDirection: "column" } }, ...rowEls);
}

/* ------------------------------------------------------------------ */
/* Cost stamp — the zero-marginal-cost badge.                          */
/* ------------------------------------------------------------------ */
export function costStamp(T, accent, label = "$0.00", sub = "PER IMAGE") {
  return h(
    "div",
    { style: { display: "flex", alignItems: "stretch", border: `3px solid ${T.ink}` } },
    h(
      "div",
      {
        style: {
          display: "flex",
          alignItems: "center",
          backgroundColor: accent,
          color: pickInk(accent, T),
          fontFamily: T.numeral,
          fontSize: 46,
          padding: "6px 22px 10px",
          letterSpacing: "1px",
        },
      },
      label
    ),
    h(
      "div",
      {
        style: {
          display: "flex",
          alignItems: "center",
          color: T.ink,
          fontFamily: T.mono,
          fontWeight: 700,
          fontSize: 20,
          padding: "0 20px",
          letterSpacing: "2px",
        },
      },
      sub
    )
  );
}

/* ------------------------------------------------------------------ */
/* Spec footer — the engineering fine print.                           */
/* ------------------------------------------------------------------ */
export function specFooter(T, extra) {
  return h(
    "div",
    {
      style: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        borderTop: `${T.hairlineW}px solid ${T.ink}`,
        paddingTop: 20,
      },
    },
    text(T.brand.spec_line, {
      fontFamily: T.mono,
      fontSize: 18,
      color: T.muted,
      letterSpacing: "1px",
    }),
    text(extra || T.brand.url, {
      fontFamily: T.mono,
      fontSize: 18,
      fontWeight: 700,
      color: T.ink,
      letterSpacing: "1px",
    })
  );
}

/** Choose readable text colour on an accent fill. */
export function pickInk(hex, T) {
  const c = hex.replace("#", "");
  const r = parseInt(c.slice(0, 2), 16);
  const g = parseInt(c.slice(2, 4), 16);
  const b = parseInt(c.slice(4, 6), 16);
  const L = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return L > 0.6 ? "#141414" : "#FFFFFF";
}
