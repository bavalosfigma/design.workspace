import { defineConfig } from "vite"
import vue from "@vitejs/plugin-vue"

// GitHub Actions sets BASE_PATH (for example /design.workspace). Local dev stays at /.
const basePath = process.env.BASE_PATH?.replace(/\/$/, "")

// Cobe paints land dots as holes in baseColor. This adds a dotColor uniform so those dots can be any hex, including white.
function cobeDotColor() {
  const swaps = [
    ["uniform vec3 F,w;", "uniform vec3 F,w,dc;"],
    [
      '["t","s","k","x","v","F","w","n","y","z"]',
      '["t","s","k","x","v","F","w","n","y","z","dc"]',
    ],
    ["g=t.baseColor||[1,1,1],", "g=t.baseColor||[1,1,1],dc=t.dotColor||[1,1,1],"],
    [
      "t.baseColor!=q&&(g=t.baseColor),",
      "t.baseColor!=q&&(g=t.baseColor),t.dotColor!=q&&(dc=t.dotColor),",
    ],
    ["a.uniform3fv(I.F,g),", "a.uniform3fv(I.F,g),a.uniform3fv(I.dc,dc),"],
    [
      "m+=vec4(F*(mix((1.-q)*pow(i,.4),q,n.z)+.1)+pow(1.-i,4.)*w,1)",
      "m+=vec4(mix(F*((1.-clamp(q,0.,1.))*pow(i,.4)*(1.-n.z)+.1),dc,clamp(q,0.,1.))+pow(1.-i,4.)*w,1)",
    ],
  ]

  return {
    name: "cobe-dot-color",
    enforce: "pre",
    transform(code, id) {
      if (!id.includes("/cobe/dist/index.esm.js")) return null
      let next = code
      for (const [from, to] of swaps) {
        if (!next.includes(from)) throw new Error(`cobe dot color patch missed: ${from}`)
        next = next.replace(from, to)
      }
      return next
    },
  }
}

export default defineConfig({
  base: basePath ? `${basePath}/` : "/",
  plugins: [vue(), cobeDotColor()],
  optimizeDeps: {
    exclude: ["cobe"],
  },
  server: {
    port: 5173,
  },
})
