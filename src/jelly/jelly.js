// The jelly widget. Edit this file to change what the card shows.
// Shape files live in public/jelly. `x` and `z` place a shape on the
// floor; `scale` is its size. `rotate` turns the silhouette a quarter turn.
//
// Lighting starts the card. The Light button on the card edits it live.
// `seeThrough` is how glassy a shape is. The body keeps its own color.
// `exposure` is the overall brightness. `environment` is the soft room light.
// `key` is the highlight panels. `fill` is light from above and below.
// `sky`, `ground`, and `room` are those light colors, separate from the card.

export const jelly = {
  background: "#0A5C35",
  lighting: {
    seeThrough: 0.1,
    exposure: 1.1,
    environment: 1.6,
    key: 1.39,
    fill: 0.52,
    sky: "#ffffff",
    ground: "#ffffff",
    room: "#787878",
  },
  shapes: [
    { name: "Yellow flower", file: "sunburst.svg", color: "#f7ff49", x: 0, z: -0.35, scale: 1.55 },
    { name: "Green clover", file: "clover.png", color: "#53fa6d", x: -1.15, z: 0.75, scale: 1.35 },
    { name: "Teal curl", file: "curl.png", color: "#2bd5d8", x: 1.15, z: 0.75, scale: 1.45 },
  ],
}
