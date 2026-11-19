// Cells. Cards sit on the 40px graph paper, with two cells of air between them.
//
// scale: width is a fraction of the board, height follows `ratio`.
//        These grow and shrink with the window and keep their shape.
// note:  a fixed cell size. These stay put, like a post-it, and only
//        shrink (ratio intact) when the board is too narrow to hold them.
//
// Wide windows flow left to right and wrap, so a growing card
// can sit beside a note that never changes size.
// Medium windows line up in two columns. Scaling cards fill a
// column; notes keep their size until the column is too narrow.
// Narrow windows stack full width, each card keeping its own ratio.

export const CELL = 40
const PAD = 2
const GAP = 2
const TOP = 160
const STACK_WIDTH = 720
const COLUMN_WIDTH = 1120

export const modules = [
  { id: "hero", fit: "scale", size: 0.46, ratio: 3.4 },
  { id: "poster", fit: "note", span: 8, rows: 14 },
  { id: "experiments", fit: "note", span: 11, rows: 14 },
  { id: "brief", fit: "note", span: 12, rows: 8 },
  { id: "photo", fit: "note", span: 8, rows: 11 },
  { id: "about", fit: "scale", size: 0.3, ratio: 1.75 },
  { id: "program", fit: "note", span: 10, rows: 6 },
  { id: "roles", fit: "note", span: 12, rows: 4 },
  { id: "gallery", fit: "note", span: 10, rows: 13 },
  { id: "index", fit: "note", span: 11, rows: 9 },
  { id: "recommended", fit: "scale", size: 0.24, ratio: 0.78 },
  { id: "cover", fit: "note", span: 9, rows: 13 },
  { id: "mixtape", fit: "note", span: 9, rows: 9 },
  { id: "caption", fit: "note", span: 12, rows: 5 },
  { id: "plate", fit: "note", span: 11, rows: 8 },
  { id: "study", fit: "note", span: 10, rows: 11 },
]

export function layoutModules(list, width) {
  const columns = Math.max(8, Math.floor(width / CELL))
  const origin = Math.floor((width - columns * CELL) / 2 / CELL) * CELL
  const mode = width < STACK_WIDTH ? "stack" : width < COLUMN_WIDTH ? "columns" : "flow"
  const placed =
    mode === "stack" ? stackModules(list, columns) : mode === "columns" ? columnModules(list, columns) : flowModules(list, columns)
  const items = placed.map((item) => ({
    ...item,
    x: (item.col - 1) * CELL,
    y: (item.row - 1) * CELL,
    w: item.span * CELL,
    h: item.rows * CELL,
  }))
  const bottom = items.reduce((max, item) => Math.max(max, item.y + item.h), 0)

  return {
    mode,
    columns,
    origin,
    cell: CELL,
    rows: Math.ceil(bottom / CELL) + PAD,
    boardWidth: columns * CELL,
    gap: GAP * CELL,
    items,
  }
}

function flowModules(list, columns) {
  const placed = []

  for (const item of list) {
    const size = measure(item, columns)
    const maxCol = columns - PAD - size.span + 1
    let best = null

    for (let col = PAD + 1; col <= maxCol; col += 1) {
      let row = PAD
      let guard = 0
      while (guard < 200 && blocked(placed, col, row, size)) {
        row += 1
        guard += 1
      }
      if (!best || row < best.row) best = { col, row }
    }

    placed.push({ ...item, col: best.col, row: best.row, ...size })
  }

  return placed
}

function blocked(placed, col, row, size) {
  return placed.some(
    (other) =>
      col < other.col + other.span + GAP &&
      col + size.span + GAP > other.col &&
      row < other.row + other.rows + GAP &&
      row + size.rows + GAP > other.row,
  )
}

function columnModules(list, columns) {
  const lane = Math.max(4, Math.floor((columns - PAD * 2 - GAP) / 2))
  const left = PAD + 1
  const right = left + lane + GAP
  const cursor = { left: PAD, right: PAD }

  return list.map((item, index) => {
    const side = index % 2 === 0 ? "left" : "right"
    const size = measure(item, columns, lane)
    const row = cursor[side]
    cursor[side] += size.rows + GAP
    return { ...item, col: side === "left" ? left : right, row, ...size }
  })
}

function stackModules(list, columns) {
  const span = Math.max(4, columns - PAD * 2)
  let row = PAD
  return list.map((item) => {
    const ratio = item.fit === "scale" ? item.ratio : item.span / item.rows
    const rows = Math.max(3, Math.round(span / ratio))
    const placed = { ...item, col: PAD + 1, row, span, rows }
    row += rows + GAP
    return placed
  })
}

function measure(item, columns, cap = columns - PAD * 2) {
  const maxSpan = Math.max(4, cap)
  if (item.fit === "scale") {
    const span = clamp(Math.round(item.size * columns), 4, maxSpan)
    return { span, rows: Math.max(3, Math.round(span / item.ratio)) }
  }
  const span = Math.min(item.span, maxSpan)
  return { span, rows: Math.max(3, Math.round(item.rows * (span / item.span))) }
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value))
}
