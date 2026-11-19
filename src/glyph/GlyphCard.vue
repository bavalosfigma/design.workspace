<script setup>
import { onMounted, onUnmounted, ref } from "vue"
import { mountGlyph } from "./clay.js"
import { glyph } from "./glyph.js"

const canvas = ref(null)
let release = () => {}

onMounted(() => {
  release = mountGlyph(canvas.value, glyph)
})

onUnmounted(() => {
  release()
  release = () => {}
})
</script>

<template>
  <canvas
    ref="canvas"
    class="glyph"
    :style="{ background: glyph.background }"
    tabindex="0"
    aria-label="Clay glyph. Use the arrow keys to turn it, or drag. Press Enter to level it."
  ></canvas>
</template>

<style scoped>
.glyph {
  position: absolute;
  inset: 0;
  display: block;
  width: 100%;
  height: 100%;
  border-radius: inherit;
  touch-action: none;
  cursor: grab;
  user-select: none;
}

.glyph:active {
  cursor: grabbing;
}
</style>
