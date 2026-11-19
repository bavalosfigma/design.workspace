# Module system

Open this file from the sidebar. Press M for the style menu.

**Mosaic** is the primary layout. The live layout is `src/mosaic.js`.

**Cells** is the other grid, in `src/grid.js`. Open it from the style menu.

The page is 40px graph paper. Every edge snaps to a cell. Two cells (80px) sit between modules, and the page keeps the same margin.

## Kinds

**Scale.** Width is a fraction of the board. Height is that width divided by `ratio`. These grow and shrink with the window and keep their shape. Use one for a banner, a statement, or a feature.

**Note.** Width and height are a fixed cell count. These stay the same size on every desktop. They shrink, ratio intact, only when the column is narrower than they are. Use one for a picture or a single object.

## Sizes

Pixels at 1440px (36 columns) and 1920px (48 columns). Notes do not change between those widths.

| Module | Kind | Authored | 1440 | 1920 |
| --- | --- | --- | --- | --- |
| hero | scale | 46% wide, ratio 3.4 | 680 × 200 | 880 × 240 |
| about | scale | 30% wide, ratio 1.75 | 440 × 240 | 560 × 320 |
| recommended | scale | 24% wide, ratio 0.78 | 360 × 480 | 480 × 600 |
| experiments | note | 11 × 14 cells | 440 × 560 | 440 × 560 |
| photo | note | 8 × 11 cells | 320 × 440 | 320 × 440 |
| roles | note | 12 × 4 cells | 480 × 160 | 480 × 160 |
| gallery | note | 10 × 13 cells | 400 × 520 | 400 × 520 |
| mixtape | note | 9 × 9 cells | 360 × 360 | 360 × 360 |
| poster | note | 8 × 14 cells | 320 × 560 | 320 × 560 |
| brief | note | 12 × 8 cells | 480 × 320 | 480 × 320 |
| program | note | 10 × 6 cells | 400 × 240 | 400 × 240 |
| index | note | 11 × 9 cells | 440 × 360 | 440 × 360 |
| cover | note | 9 × 13 cells | 360 × 520 | 360 × 520 |
| caption | note | 12 × 5 cells | 480 × 200 | 480 × 200 |
| plate | note | 11 × 8 cells | 440 × 320 | 440 × 320 |
| study | note | 10 × 11 cells | 400 × 440 | 400 × 440 |

Ratio means width divided by height.

## Breakpoints

- Under 720px, every module is full width and keeps its ratio.
- From 720px to 1120px, modules alternate into two columns. Scale modules fill the column. Notes keep their size until the column is too narrow, then they shrink in proportion.
- At 1120px and wider, modules pack into the first open spot that leaves two cells of air on every side.

## Adding a module

1. Snap every edge to the 40px cell.
2. Leave two cells of air around every module. The gap belongs to the page, not the card.
3. Keep about three scale modules in a set this size. If most of them grow with the window, the notes stop reading as objects.
4. A new scale module should sit between recommended (24%) and hero (46%). Do not add a second banner at hero's width.
5. Notes stay 8–12 cells wide and 4–14 cells tall, which is 320–480px across. Roles is the short strip.
6. Vary the ratio on purpose. A new module should take a proportion the set does not already have.
7. A scale module carries the sentence of the page. A note carries one picture or one object.
8. List order in `src/grid.js` is reading order. The packer places earlier modules first.

## Mosaic

Mosaic is the page you land on. Cells is the other style in the menu. The move is the same curve.

This page does not pack into the first open cell. It plays a score of twelve seats, then repeats. The canvas keeps a 64px margin on the left and right. The first row starts at 200px. The navigation is fixed in the center of the screen. Seats are column ranges on a 12-column grid. The gap is 40px on desk and wide, and 20px on a phone, horizontally and between rows. Row height is a fraction of the board, so every card scales together. After a seat lands, a nudge pulls it off the line so neighboring cards do not share an edge. On a phone the score is one column: every card is the full width of the board, still 4:5, and the next card starts after the gap. Phone seats do not nudge.

The live score is `src/mosaic.js`. The CSS below is that score written as custom properties. A new size is a new variant. The grid measures it.

## The grid

The board width is the window minus 64px on each side. Everything else is a percentage or a count of that board.

```css
.mosaic {
  --board: calc(100vw - 128px);
  --vw: calc(var(--board) * 0.01);
  --columns: 12;
  --gap: 40px;
  --pad: 80px;
  --cn: 22px;
  --gutter: var(--pad);
  --row: calc(var(--board) * 0.085 - 19px);

  display: grid;
  grid-template-columns: repeat(var(--columns), minmax(0, 1fr));
  column-gap: var(--gap);
  row-gap: var(--gap);
  grid-auto-rows: var(--row);
  padding-inline: var(--pad);
}
```

One column is `(board − pad × 2 − gap × (columns − 1)) / columns`. One row is `--row`. A tile never sets its own width or height. It spans cells, and the cells add up.

Phone, desk, and wide change the variables. The tile rules stay put.

| | Phone, under 768 | Desk, 768–1519 | Wide, 1520 and up |
| --- | --- | --- | --- |
| columns | 1 | 12 | 12 |
| gap | 20px | 40px | 40px |
| pad | 0 | 80px | 80px |
| cn | the pad | 22px | 22px |
| row | 40px | below | `board × 0.058 + 2px` |

Desk row height, still from `--board`:

- 768–1023: `board × 0.067`
- 1024–1279: `board × 0.08 − 13px`
- 1280–1519: `board × 0.085 − 19px`

## A tile

A tile has a size and a seat.

The size is two integers. `--span` is how many columns it covers. `--rows` reserves the seat. The box is 4:5:

```text
width  = span × column + (span − 1) × gap − left margin − right margin
height = width × 5 / 4
```

The seat is where that size starts (`grid-column`) and how it nudges. The same size is reused. Seats 3, 5, 7, and 10 are all a 4×5, each in its own column.

Two kinds of nudge:

- **Margin** (`--ml`, `--mr`, `--mt`, `--mb`) changes the box. A positive margin shrinks the tile inside its cells. A negative margin lets it hang into the gap or the page pad.
- **Shift** (`--ox`, `--oy`) slides the tile after the size is set. Width and height stay. This is what lets a card tuck into the hole above its neighbor.

Units match the helpers in `src/mosaic.js`. A seat can add them.

| Unit | One step | CSS |
| --- | --- | --- |
| vw | 1% of the board | `calc(var(--vw) * 0.9)` |
| cn | 22px on a desk, the pad on a phone | `calc(var(--cn) * -1)` |
| gutter | the side pad | `calc(var(--gutter) * 1)` |
| row | one row | `calc(var(--row) * -1)` |
| px | one pixel | `-10px` |

`margin-right: calc(var(--cn) * -1 - var(--vw) * 2.05)` is the seat field `mr: { cn: -1, vw: -2.05 }`.

## Sizes

Name a variant by its span and its rows. The rows reserve the seat. The drawn box is 4:5 either way, so two seats with the same span are the same size. Pixels are the unnudged box at a 1440px window, where the board is 1312px and a column is 59.3px.

| Span | Seats that use it | At 1440 |
| --- | --- | --- |
| 5 | 5×6, 5×5 | 457 × 571 |
| 4 | 4×5 | 357 × 446 |
| 3 | 3×4 | 258 × 323 |

The wide score uses spans 4, 3, and 2. At a 1920px window a 2-column card is 239 × 299 before nudges, and a 4-column card is 517 × 646.

On a phone every tile spans the single column and stays 4:5. The row is that card. There is no second phone size.

## Writing a variant

The variant sets the two numbers. The seat sets the column and the nudge. `:nth-child(12n + k)` is seat k, because the score repeats every twelve cards.

```css
.tile {
  --span: 3;
  --rows: 4;
  --ml: 0px;
  --mr: 0px;
  --mt: 0px;
  --mb: 0px;
  --ox: 0px;
  --oy: 0px;

  aspect-ratio: 4 / 5;
  grid-column-end: span var(--span);
  grid-row-end: span var(--rows);
  margin: var(--mt) var(--mr) var(--mb) var(--ml);
  position: relative;
  left: var(--ox);
  top: var(--oy);
}

.tile[data-size="5x6"] { --span: 5; --rows: 6; }
.tile[data-size="5x5"] { --span: 5; --rows: 5; }
.tile[data-size="4x5"] { --span: 4; --rows: 5; }
.tile[data-size="3x4"] { --span: 3; --rows: 4; }

/* seat 2 on the desk. The tile carries data-size="3x4". */
.mosaic[data-mode="desk"] .tile:nth-child(12n + 2) {
  grid-column: 6 / span var(--span);
  --mr: calc(var(--vw) * -0.9);
  --ox: calc(var(--cn) * -1);
}
```

The same seat in `src/mosaic.js`:

```js
{ col: 6, span: 3, rows: 4, mr: vw(-0.9), ox: cn(-1) }
```

`col` is the `grid-column` start. `span` and `rows` are the variant. `ml`, `mr`, `mt`, `mb` are the margins. `ox` and `oy` are the shift.

Phone tiles are the one column, at the same 4:5 ratio:

```css
.mosaic[data-mode="phone"] .tile {
  --span: 1;
  grid-column: 1;
  grid-row-end: auto;
  aspect-ratio: 4 / 5;
}
```

## Adding a size

1. Choose a span and a row count the score does not already use. Desk is using 5×6, 5×5, 4×5, and 3×4. Stay inside 2–6 columns and 4–6 rows so the card still reads as one object in the set.
2. Add one rule, `.tile[data-size="6x3"] { --span: 6; --rows: 3; }`. Leave width and height alone.
3. Point a seat at it. `grid-column` start plus the span has to finish inside 12 columns. A phone seat is always the one column.
4. Nudge with margin when the tile should grow or shrink. Nudge with `left` and `top` when it should only move.
5. Copy the same numbers into the matching score in `src/mosaic.js` (`PHONE_SCORE`, `DESK_SCORE`, or `WIDE_SCORE`). The page lays out from that file. A 6×3 banner on the desk is `{ col: 4, span: 6, rows: 3 }`.
6. On a phone, skip `--rows` and the nudge. The seat is `{ col: 1, span: 1, rows: 1 }`, and the 4:5 rule is the whole type.
