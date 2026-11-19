import { defineConfig } from "vite"
import vue from "@vitejs/plugin-vue"

// GitHub Actions sets BASE_PATH (for example /design.workspace). Local dev stays at /.
const basePath = process.env.BASE_PATH?.replace(/\/$/, "")

export default defineConfig({
  base: basePath ? `${basePath}/` : "/",
  plugins: [vue()],
  server: {
    port: 5173,
  },
})
