const base = import.meta.env.BASE_URL

// A loose field, like the canvas prototype: pictures sit in the open
// instead of in a column. `ratio` is height / width.
export const shots = [
  {
    id: "hello",
    src: `${base}gallery/front.png`,
    alt: "Person holding a Hello Kitty Figma poster",
    label: "Hello Kitty poster",
    x: 520,
    y: 0,
    w: 268,
    ratio: 501 / 399,
    delay: 0,
  },
  {
    id: "tote",
    src: `${base}gallery/back.png`,
    alt: "Person in a Geneva sweatshirt carrying a blue tote",
    label: "Geneva tote",
    x: 0,
    y: 200,
    w: 236,
    ratio: 1280 / 960,
    delay: 80,
  },
  {
    id: "posters",
    src: `${base}gallery/posters.png`,
    alt: "Colorful graphic posters",
    label: "Graphic posters",
    x: 1000,
    y: 32,
    w: 372,
    ratio: 675 / 1200,
    delay: 150,
  },
  {
    id: "hallway",
    src: `${base}gallery/mid.png`,
    alt: "Framed Figma posters along a hallway",
    label: "Poster hallway",
    x: 380,
    y: 420,
    w: 460,
    ratio: 2731 / 4096,
    delay: 220,
  },
]

const caption = 28

export const frame = {
  width: Math.max(...shots.map((shot) => shot.x + shot.w)),
  height: Math.max(...shots.map((shot) => shot.y + shot.w * shot.ratio)) + caption,
}
