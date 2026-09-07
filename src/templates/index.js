// SPDX-FileCopyrightText: 2026 Adsmith
// SPDX-License-Identifier: MIT
/**
 * templates/index.js — the layout registry.
 * Each data row names a `layout`; this maps the name to its builder. Seven distinct
 * layouts ship by default — add a file here and every row can use it.
 */
import { poster } from "./poster.js";
import { stat } from "./stat.js";
import { spectrum } from "./spectrum.js";
import { ticket } from "./ticket.js";
import { grid9 } from "./grid9.js";
import { split } from "./split.js";
import { indexCatalog } from "./index_catalog.js";

export const LAYOUTS = { poster, stat, spectrum, ticket, grid9, split, index: indexCatalog };

export function build(row, T, accent, index, total) {
  const fn = LAYOUTS[row.layout] || poster;
  return fn(row, T, accent, index, total);
}
