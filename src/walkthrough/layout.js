// The walkthrough wall. Cards keep the 381px width from the file, and the
// row count follows from that. Height hugs the title, so a short episode
// is shorter than a long one. A row is as tall as its tallest card.
// They are not mosaic seats: those seats are large and would stretch
// a card this small into one of the home-board shapes.
// One column shrinks to the board when the window is narrower than a card.
// Anything wider stays at the design width and centers in the row.

const CARD_W = 381
const ESTIMATE = 320
const GAP = 40
const MARGIN = 64
const TOP = 200

export function layoutFilms(list, width, heights = {}) {
  const inner = Math.max(240, width - MARGIN * 2)
  const columns = Math.max(1, Math.floor((inner + GAP) / (CARD_W + GAP)))
  const cardW = columns === 1 ? Math.min(CARD_W, inner) : CARD_W
  const rowWidth = columns * cardW + (columns - 1) * GAP
  const offset = Math.max(0, Math.round((inner - rowWidth) / 2))
  const items = []
  let y = TOP

  for (let index = 0; index < list.length; index += columns) {
    const row = list.slice(index, index + columns)
    const rowH = Math.max(...row.map((film) => heights[film.id] || ESTIMATE))
    row.forEach((film, column) => {
      items.push({
        id: film.id,
        widget: "film",
        hug: true,
        props: { film },
        x: offset + column * (cardW + GAP),
        y,
        w: Math.round(cardW),
        h: heights[film.id] || rowH,
      })
    })
    y += rowH + GAP
  }

  const bottom = items.reduce((max, item) => Math.max(max, item.y + item.h), 0)

  return {
    mode: columns === 1 ? "stack" : "flow",
    columns,
    origin: MARGIN,
    cell: 1,
    rows: Math.ceil(bottom + MARGIN),
    boardWidth: inner,
    gap: GAP,
    items,
  }
}
