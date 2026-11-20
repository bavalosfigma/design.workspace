const entries = [
  ["Figma merch deep dive", "Chelsea White"],
  ["Improving Figma Agent's 0-1 design ability", "Tom Duncalf"],
  ["Parametric Design", "Tom Duncalf"],
  ["A code format for design systems in Figma", "Jay Ransijn"],
  ["Design systems on autopilot", "Jay Ransijn"],
  ["System check in Agent", "Jay Ransijn"],
  ["Meet the Pals", "Jay Ransijn"],
  ["Shared context for better Agent outputs", "Cai Charniga"],
  ["Figma Capture", "Adam Pavloff"],
]

export const walkthroughFilms = entries.map(([title, guest]) => ({
  id: title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, ""),
  title,
  guest,
}))
