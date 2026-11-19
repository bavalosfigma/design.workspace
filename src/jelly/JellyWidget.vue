<script setup>
import { onMounted, onUnmounted, ref } from "vue"
import { jelly } from "./jelly.js"
import { mountJelly } from "./engine.js"

const root = ref(null)
let release = () => {}

onMounted(() => {
  release = mountJelly(root.value, jelly)
})

onUnmounted(() => {
  release()
  release = () => {}
})
</script>

<template>
  <div ref="root" class="jelly-stage" :style="{ '--jelly-background': jelly.background }">
    <canvas aria-label="Jelly shapes. Drag one to squish it."></canvas>
    <button type="button" class="sound-toggle">Sound off</button>
    <p class="jelly-status" aria-live="polite"></p>
    <div class="jelly-hops">
      <button v-for="shape in jelly.shapes" :key="shape.name" type="button" data-shape>
        {{ shape.name }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.jelly-stage {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background: var(--jelly-background);
  border-radius: inherit;
}

.jelly-stage canvas {
  display: block;
  width: 100%;
  height: 100%;
  background: var(--jelly-background);
  opacity: 0;
  touch-action: none;
  cursor: grab;
}

.jelly-stage canvas:active {
  cursor: grabbing;
}

.jelly-stage.ready canvas {
  opacity: 1;
}

.sound-toggle,
.jelly-status,
.jelly-hops {
  position: absolute;
  width: 1px;
  height: 1px;
  margin: -1px;
  padding: 0;
  overflow: hidden;
  clip: rect(0 0 0 0);
  border: 0;
}

.sound-toggle:focus,
.jelly-hops:focus-within {
  position: absolute;
  z-index: 1;
  width: auto;
  height: auto;
  margin: 0;
  padding: 8px;
  overflow: visible;
  clip: auto;
  background: #fff;
  color: #141414;
}

.sound-toggle:focus {
  top: 12px;
  left: 12px;
}

.jelly-hops:focus-within {
  right: 12px;
  bottom: 12px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  max-width: calc(100% - 24px);
}

.jelly-hops button {
  font: inherit;
  min-height: 24px;
}
</style>
