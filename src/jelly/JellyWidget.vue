<script setup>
import { onMounted, onUnmounted, reactive, shallowRef, useTemplateRef, watch } from "vue"
import { useCardOptions } from "../options.js"
import { jelly } from "./jelly.js"
import { mountJelly } from "./engine.js"

const root = useTemplateRef("root")
const { shown: optionsShown } = useCardOptions()
const open = shallowRef(false)
const copied = shallowRef(false)
const lighting = reactive({ ...jelly.lighting })
let copyTimer = 0

const sliders = [
  { key: "seeThrough", label: "See-through", min: 0, max: 0.92, step: 0.01 },
  { key: "exposure", label: "Exposure", min: 0.4, max: 1.8, step: 0.01 },
  { key: "environment", label: "Soft light", min: 0, max: 1.6, step: 0.01 },
  { key: "fill", label: "Fill", min: 0, max: 1.8, step: 0.01 },
  { key: "key", label: "Highlights", min: 0.2, max: 2.4, step: 0.01 },
]

const colors = [
  { key: "sky", label: "Sky" },
  { key: "ground", label: "Ground" },
  { key: "room", label: "Room" },
]

let stop = () => {}
let setLighting = () => {}

watch(lighting, () => {
  setLighting({ ...lighting })
})

watch(optionsShown, (shown) => {
  if (!shown) open.value = false
})

function resetLighting() {
  Object.assign(lighting, jelly.lighting)
}

function trimNum(value) {
  if (!Number.isFinite(value)) return "0"
  return String(Math.round(value * 1000) / 1000)
}

function promptForSettings() {
  const lines = [
    ...sliders.map((field) => [field.key, trimNum(lighting[field.key])]),
    ...colors.map((field) => [field.key, lighting[field.key]]),
  ]
  const body = lines.map(([key, value]) => `${key}: ${value}`).join("\n")
  return `Apply these exact settings to the jelly lighting in src/jelly/jelly.js. Do not change anything else.\n\n${body}`
}

async function copyPrompt() {
  const text = promptForSettings()
  try {
    await navigator.clipboard.writeText(text)
  } catch {
    const area = document.createElement("textarea")
    area.value = text
    document.body.append(area)
    area.select()
    document.execCommand("copy")
    area.remove()
  }
  copied.value = true
  window.clearTimeout(copyTimer)
  copyTimer = window.setTimeout(() => {
    copied.value = false
  }, 1400)
}

onMounted(() => {
  const handle = mountJelly(root.value, jelly)
  stop = handle.stop
  setLighting = handle.setLighting
})

onUnmounted(() => {
  window.clearTimeout(copyTimer)
  stop()
  stop = () => {}
  setLighting = () => {}
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
    <button
      v-if="optionsShown"
      type="button"
      class="light-toggle"
      :aria-expanded="open"
      aria-controls="jelly-light"
      @click="open = !open"
      @pointerdown.stop
    >
      {{ open ? "Close" : "Light" }}
    </button>
    <form
      v-show="open"
      id="jelly-light"
      class="light-panel"
      aria-label="Jelly lighting"
      @submit.prevent
      @pointerdown.stop
      @keydown.stop
    >
      <label v-for="field in sliders" :key="field.key" class="light-field">
        <span class="light-name">{{ field.label }}</span>
        <input
          class="light-range"
          type="range"
          :min="field.min"
          :max="field.max"
          :step="field.step"
          v-model.number="lighting[field.key]"
        />
        <input
          class="light-num"
          type="number"
          :min="field.min"
          :max="field.max"
          :step="field.step"
          v-model.number="lighting[field.key]"
        />
      </label>
      <label v-for="field in colors" :key="field.key" class="light-field">
        <span class="light-name">{{ field.label }}</span>
        <input class="light-swatch" type="color" v-model="lighting[field.key]" />
        <input class="light-hex" type="text" spellcheck="false" maxlength="7" v-model="lighting[field.key]" />
      </label>
      <div class="light-actions">
        <button type="button" class="light-action" @click="copyPrompt">{{ copied ? "Copied" : "Copy prompt" }}</button>
        <button type="button" class="light-action" @click="resetLighting">Reset</button>
      </div>
    </form>
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
  font-family: "Figma Sans VF", "Figma Sans", sans-serif;
  font-variation-settings: "wdth" 100;
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

.light-toggle {
  position: absolute;
  z-index: 2;
  top: 10px;
  right: 10px;
  margin: 0;
  padding: 4px 8px;
  border: 0;
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.92);
  color: #141414;
  font: inherit;
  font-size: 13px;
  font-weight: 700;
  letter-spacing: -0.03em;
}

.light-panel {
  position: absolute;
  z-index: 2;
  right: 8px;
  bottom: 8px;
  left: 8px;
  display: grid;
  gap: 6px;
  max-height: 62%;
  margin: 0;
  padding: 10px;
  overflow: auto;
  overscroll-behavior: contain;
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.94);
  color: #141414;
}

.light-field {
  display: grid;
  grid-template-columns: 88px minmax(0, 1fr) 64px;
  gap: 6px;
  align-items: center;
  min-height: 22px;
  font-size: 12px;
  font-weight: 500;
  letter-spacing: -0.03em;
}

.light-name {
  text-box: trim-both cap alphabetic;
}

.light-range {
  width: 100%;
  margin: 0;
  accent-color: #141414;
}

.light-num,
.light-hex,
.light-swatch {
  box-sizing: border-box;
  margin: 0;
  border: 1px solid rgba(20, 20, 20, 0.28);
  background: transparent;
  color: inherit;
  font: inherit;
  font-variant-numeric: tabular-nums;
}

.light-num,
.light-hex {
  width: 100%;
  height: 22px;
  padding: 0 4px;
}

.light-num {
  appearance: textfield;
}

.light-num::-webkit-outer-spin-button,
.light-num::-webkit-inner-spin-button {
  margin: 0;
  -webkit-appearance: none;
}

.light-swatch {
  width: 100%;
  height: 22px;
  padding: 0;
}

.light-actions {
  display: flex;
  gap: 16px;
  margin-top: 2px;
}

.light-action {
  margin: 0;
  padding: 0;
  border: 0;
  background: transparent;
  color: inherit;
  font: inherit;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: -0.03em;
}
</style>
