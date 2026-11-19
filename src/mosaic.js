// Mosaic, the primary layout. Twelve seats, repeated in order.
//
// This is the card-grid score from the third section of designart.unibz.it:
// a 12-column grid, and one column on a phone, with a fixed seat for each card.
// The gap is 40px on a desk and 20px on a phone, on both axes.
// Row height grows with the window, so the whole score scales.
// Each seat then nudges — a margin and a shift — so the edges miss
// each other and a card can tuck into the hole above it.
// A phone drops the nudge. Every card is the board's full width and
// the next card starts below it.
//
// Every card is 4:5. Width comes from the column span and the
// horizontal margins. Height is that width times 5/4. Row spans still
// reserve the seat; they do not set the box.
//
// Nudge units: vw (percent of the window), cn (22px, or the phone
// gutter), gutter (the page margin), row (one row).

const PHONE = 768
const WIDE = 1520
const MARGIN = 64
const TOP = 200
const PORTRAIT = 5 / 4

const vw = (n) => ({ vw: n })
const cn = (n) => ({ cn: n })
const gutter = (n) => ({ gutter: n })
const row = (n) => ({ row: n })

const PHONE_SCORE = [{ col: 1, span: 1, rows: 1 }]

const DESK_SCORE = [
  { col: 1, span: 5, rows: 6 },
  { col: 6, span: 3, rows: 4, mr: vw(-0.9), ox: cn(-1) },
  { col: 9, span: 4, rows: 5, mr: vw(-0.45) },
  { col: 3, span: 3, rows: 4, ml: vw(-0.9), ox: cn(-2) },
  { col: 6, span: 4, rows: 5, mr: vw(-0.45), ox: cn(-1), oy: row(-1) },
  { col: 10, span: 3, rows: 4, ml: vw(-0.9), ox: gutter(1), oy: row(-1) },
  { col: 1, span: 4, rows: 5, mr: vw(-0.45), ox: gutter(-1) },
  { col: 5, span: 3, rows: 4, mr: vw(-0.9), ox: cn(-1) },
  { col: 10, span: 3, rows: 4, ml: vw(0.45), mr: vw(-1.35), ox: cn(-2), oy: row(-2) },
  { col: 1, span: 4, rows: 5, ml: vw(-0.45) },
  { col: 5, span: 3, rows: 4, ml: vw(-0.9), ox: cn(1), oy: row(1) },
  { col: 8, span: 5, rows: 5, mt: row(-1), oy: row(-1) },
]

const WIDE_SCORE = [
  { col: 1, span: 4, rows: 6, mr: vw(-0.5), ox: gutter(-1) },
  { col: 5, span: 2, rows: 4, ml: { cn: -1, vw: 0.5 }, mr: { cn: -1, vw: -2.05 } },
  { col: 7, span: 3, rows: 4, ml: vw(2.05), mr: { cn: -1, vw: 2.75 }, oy: row(2) },
  { col: 10, span: 3, rows: 5, ml: vw(-2.75) },
  { col: 2, span: 3, rows: 5, ml: cn(-1), mr: cn(-1) },
  { col: 5, span: 3, rows: 5, mr: cn(-2) },
  { col: 9, span: 2, rows: 4, ml: cn(-3), ox: { gutter: 1, cn: -2 }, oy: row(1) },
  { col: 11, span: 2, rows: 4, ml: cn(-3), ox: gutter(1), oy: row(-1) },
  { col: 1, span: 3, rows: 6, ml: gutter(-1), mr: cn(2), mt: row(1) },
  { col: 4, span: 2, rows: 4, ml: cn(-3) },
  { col: 6, span: 2, rows: 4, ml: cn(-1), mr: cn(-2), oy: row(2) },
  { col: 8, span: 4, rows: 6, mr: { vw: -0.4, px: -10 }, ox: cn(1) },
]

// One seat per card, in reading order. Set `widget` to a name from src/cards.js.
export const mosaic = [
  { id: "m1", widget: "about" },
  { id: "m2", widget: "offsite" },
  { id: "m3", widget: "glyph" },
  { id: "m4", widget: "gallery" },
  { id: "m5" },
  { id: "m6", widget: "store" },
  { id: "m7", widget: "jelly" },
  { id: "m8" },
  { id: "m9" },
  { id: "m10" },
  { id: "m11" },
  { id: "m12" },
]

export function layoutMosaic(list, width) {
  const inner = Math.max(240, width - MARGIN * 2)
  const ctx = metrics(inner)
  ctx.padY = TOP
  const score = ctx.mode === "phone" ? PHONE_SCORE : ctx.mode === "wide" ? WIDE_SCORE : DESK_SCORE
  const seats = list.map((item, index) => ({ ...item, ...score[index % score.length] }))
  const placed = ctx.mode === "phone" ? placeIntrinsic(seats, ctx) : placeFixed(seats, ctx)
  let stack = ctx.padY
  const items = placed.map((item) => {
    const w = Math.round(item.w)
    const h = Math.round(w * PORTRAIT)
    // Phone is one column, so stack the rounded boxes. Rounding each
    // seat on its own leaves a 1px gap that drifts down the page.
    const y = ctx.mode === "phone" ? stack : Math.round(item.y)
    if (ctx.mode === "phone") stack += h + ctx.gap
    return {
      ...item,
      x: Math.round(item.x),
      y: Math.round(y),
      w,
      h,
    }
  })
  const bottom = items.reduce((max, item) => Math.max(max, item.y + item.h), 0)

  return {
    mode: ctx.mode,
    columns: ctx.columns,
    origin: MARGIN,
    cell: 1,
    rows: Math.ceil(bottom + MARGIN),
    boardWidth: inner,
    gap: ctx.gap,
    items,
  }
}

function metrics(width) {
  const phone = width < PHONE
  const wide = width >= WIDE
  const columns = phone ? 1 : 12
  const padX = phone ? 0 : 80
  const gap = phone ? 20 : 40
  const gutterSize = padX
  const cnSize = phone ? gutterSize : 22
  const rowH = phone
    ? 40
    : wide
      ? width * 0.058 + 2
      : width >= 1280
        ? width * 0.085 - 19
        : width >= 1024
          ? width * 0.08 - 13
          : width * 0.067

  return {
    mode: phone ? "phone" : wide ? "wide" : "desk",
    width,
    vw: width / 100,
    columns,
    padX,
    padY: padX,
    gap,
    gutter: gutterSize,
    cn: cnSize,
    rowH,
    colW: (width - padX * 2 - gap * (columns - 1)) / columns,
  }
}

function placeFixed(list, ctx) {
  const occupied = []
  let cursor = 1

  return list.map((item) => {
    let row = cursor
    let guard = 0
    while (guard < 120 && blocked(occupied, item.col, row, item.span, item.rows)) {
      row += 1
      guard += 1
    }
    occupied.push({ col: item.col, row, span: item.span, rows: item.rows })
    cursor = row

    const ml = unit(item.ml, ctx)
    const mr = unit(item.mr, ctx)
    const mt = unit(item.mt, ctx)
    const w = item.span * ctx.colW + (item.span - 1) * ctx.gap - ml - mr

    return {
      ...item,
      x: ctx.padX + (item.col - 1) * (ctx.colW + ctx.gap) + ml + unit(item.ox, ctx),
      y: ctx.padY + (row - 1) * (ctx.rowH + ctx.gap) + mt + unit(item.oy, ctx),
      w,
      h: w * PORTRAIT,
    }
  })
}

function placeIntrinsic(list, ctx) {
  const occupied = []
  let cursor = 1
  const seated = list.map((item) => {
    let row = cursor
    let guard = 0
    while (guard < 120 && blocked(occupied, item.col, row, item.span, 1)) {
      row += 1
      guard += 1
    }
    occupied.push({ col: item.col, row, span: item.span, rows: 1 })
    cursor = row

    const ml = unit(item.ml, ctx)
    const mr = unit(item.mr, ctx)
    const mt = unit(item.mt, ctx)
    const mb = unit(item.mb, ctx)
    const w = item.span * ctx.colW + (item.span - 1) * ctx.gap - ml - mr

    return { ...item, row, ml, mr, mt, mb, w, contentH: w * PORTRAIT }
  })

  const band = new Map()
  for (const item of seated) {
    const contribution = item.mt + item.contentH + item.mb
    band.set(item.row, Math.max(band.get(item.row) || 0, contribution))
  }

  const start = new Map()
  let y = ctx.padY
  for (const row of [...band.keys()].sort((a, b) => a - b)) {
    start.set(row, y)
    y += band.get(row) + ctx.gap
  }

  return seated.map((item) => ({
    ...item,
    x: ctx.padX + (item.col - 1) * (ctx.colW + ctx.gap) + item.ml,
    y: start.get(item.row) + item.mt,
    h: item.contentH,
  }))
}

function blocked(occupied, col, row, span, rows) {
  return occupied.some(
    (other) => col < other.col + other.span && col + span > other.col && row < other.row + other.rows && row + rows > other.row,
  )
}

function unit(part, ctx) {
  if (!part) return 0
  return (part.vw || 0) * ctx.vw + (part.cn || 0) * ctx.cn + (part.gutter || 0) * ctx.gutter + (part.row || 0) * ctx.rowH + (part.px || 0)
}
