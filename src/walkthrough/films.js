const entries = [
  ["Code Layer Experiments", "Nikolas Klein", { bg: "#c4baff", accent: "#874fff", ink: "#000000" }],
  ["Improving Figma Agent's 0-1 design ability", "Tom Duncalf", { bg: "#0a5c35", accent: "#e4ff97", ink: "#ffffff" }],
  ["Parametric Design", "Tom Duncalf", { bg: "#5d4493", accent: "#c7f8fb", ink: "#ffffff" }],
  ["A code format for design systems in Figma", "Jay Ransijn", { bg: "#721c1c", accent: "#ffc9c1", ink: "#ffffff" }],
  ["Design systems on autopilot", "Jay Ransijn", { bg: "#c7f8fb", accent: "#4d49fc", ink: "#000000" }],
  ["System check in Agent", "Jay Ransijn", { bg: "#6d6e6d", accent: "#ffc9c1", ink: "#ffffff" }],
  ["Meet the Pals", "Jay Ransijn", { bg: "#f3ffe3", accent: "#045481", ink: "#000000" }],
  ["Shared context for better Agent outputs", "Cai Charniga", { bg: "#4d49fc", accent: "#67ff7f", ink: "#ffffff" }],
  ["Figma Capture", "Adam Pavloff", { bg: "#045481", accent: "#24cb71", ink: "#ffffff" }],
]

export const walkthroughFilms = entries.map(([title, guest, tone], index) => ({
  id: title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, ""),
  episode: `Ep. ${String(index + 1).padStart(2, "0")}`,
  title,
  guest,
  tone,
}))
