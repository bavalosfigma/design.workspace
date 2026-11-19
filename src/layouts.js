import { layoutModules, modules } from "./grid.js"
import { layoutMosaic, mosaic } from "./mosaic.js"

// Append a layout here. `hash` is the URL fragment that selects it.
export const layouts = [
  { id: "mosaic", name: "Mosaic", hash: "", items: mosaic, place: layoutMosaic },
  { id: "home", name: "Cells", hash: "#cells", items: modules, place: layoutModules },
]

export function layoutById(id) {
  return layouts.find((layout) => layout.id === id) ?? layouts[0]
}

export function layoutFromHash(hash) {
  return layouts.find((layout) => layout.hash !== "" && hash === layout.hash) ?? layouts[0]
}
