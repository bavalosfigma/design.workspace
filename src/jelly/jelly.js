// The jelly widget. Edit this file to change what the card shows.
// Shape files live in public/jelly. `x` and `z` place a shape on the
// floor; `scale` is its size. `rotate` turns the silhouette a quarter turn.

export const jelly = {
  background: "#c4baff",
  shapes: [
    { name: "Yellow flower", file: "sunburst.svg", color: "#f7ff49", x: 0, z: -0.35, scale: 1.55 },
    { name: "Green clover", file: "clover.png", color: "#53fa6d", x: -1.15, z: 0.75, scale: 1.35 },
    { name: "Teal curl", file: "curl.png", color: "#2bd5d8", x: 1.15, z: 0.75, scale: 1.45 },
  ],
}
