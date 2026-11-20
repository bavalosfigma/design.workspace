<script setup>
import { onBeforeUnmount, onMounted, reactive, shallowRef, useTemplateRef, watch } from "vue"
import createGlobe from "cobe"
import { useCardOptions } from "../options.js"

// San Francisco. Phi and theta start the globe facing this point.
const cities = [
  { id: "nyc", location: [40.7128, -74.006] },
  { id: "portland", location: [45.5152, -122.6784] },
  { id: "san-francisco", location: [37.775, -122.419] },
  { id: "los-angeles", location: [34.0522, -118.2437] },
  { id: "san-diego", location: [32.7157, -117.1611] },
  { id: "denver", location: [39.7392, -104.9903] },
  { id: "london", location: [51.5074, -0.1278] },
  { id: "tokyo", location: [35.6762, 139.6503] },
  { id: "paris", location: [48.8566, 2.3522] },
  { id: "bengaluru", location: [12.9716, 77.5946] },
]
const phi0 = 5.435
const theta0 = 0.825
const TAU = Math.PI * 2
const HALF_PI = Math.PI / 2

const preset = {
  dark: 0,
  diffuse: 0,
  mapSamples: 13000,
  mapBrightness: 1,
  mapBaseBrightness: 0,
  baseColor: "#b591ba",
  dotColor: "#000000",
  markerColor: "#67ff7f",
  glowColor: "#cb9fd2",
  arcColor: "#67ff7f",
  arcWidth: 0.5,
  arcHeight: 0.3,
  markerElevation: 0,
  scale: 0.6,
  offsetX: 0,
  offsetY: -220,
  opacity: 1,
  markerSize: 0.026,
  showArc: false,
  cardColor: "#cb9fd2",
  fontColor: "#000000",
  devicePixelRatio: 2,
  width: 775,
  height: 368,
  antialias: true,
  alpha: true,
}

const groups = [
  {
    title: "View",
    fields: [
      { key: "dark", min: 0, max: 1, step: 0.01 },
      { key: "diffuse", min: 0, max: 3, step: 0.01 },
      { key: "scale", min: 0.25, max: 2.5, step: 0.01 },
      { key: "opacity", min: 0, max: 1, step: 0.01 },
      { key: "offsetX", label: "offset x", min: -300, max: 300, step: 1 },
      { key: "offsetY", label: "offset y", min: -300, max: 300, step: 1 },
    ],
  },
  {
    title: "Map",
    fields: [
      { key: "mapSamples", min: 1000, max: 100000, step: 1000 },
      { key: "mapBrightness", min: 1, max: 20, step: 0.1 },
      { key: "mapBaseBrightness", min: 0, max: 1, step: 0.01 },
    ],
  },
  {
    title: "Marker",
    fields: [
      { key: "markerSize", label: "size", min: 0, max: 0.2, step: 0.001 },
      { key: "markerElevation", min: 0, max: 0.2, step: 0.001 },
    ],
  },
  {
    title: "Arc",
    fields: [
      { key: "arcWidth", min: 0.1, max: 2, step: 0.01 },
      { key: "arcHeight", min: 0.1, max: 0.5, step: 0.01 },
    ],
  },
  {
    title: "Canvas",
    fields: [
      { key: "width", min: 64, max: 1600, step: 1, size: true },
      { key: "height", min: 64, max: 1600, step: 1, size: true },
      { key: "devicePixelRatio", min: 1, max: 3, step: 0.25 },
    ],
  },
]

const colors = [
  { key: "cardColor" },
  { key: "fontColor" },
  { key: "baseColor" },
  { key: "dotColor" },
  { key: "markerColor" },
  { key: "glowColor" },
  { key: "arcColor" },
]

const canvas = useTemplateRef("canvas")
const stage = useTemplateRef("stage")
const { shown: optionsShown } = useCardOptions()
const open = shallowRef(false)
const spin = shallowRef(true)
const copied = shallowRef(false)
const angle = reactive({ phi: phi0, theta: theta0 })
const tune = reactive({ ...preset })

const ink = {
  baseColor: [181 / 255, 145 / 255, 186 / 255],
  dotColor: [0, 0, 0],
  markerColor: [103 / 255, 1, 127 / 255],
  glowColor: [203 / 255, 159 / 255, 210 / 255],
  arcColor: [103 / 255, 1, 127 / 255],
  cardColor: [203 / 255, 159 / 255, 210 / 255],
  fontColor: [0, 0, 0],
}

let globe
let frame = 0
let observer
let live = false
let sizeLocked = false
let phi = phi0
let theta = theta0
let dragging = false
let pointerX = 0
let pointerY = 0
let contextKey = ""
let dprKey = 0
let copyTimer = 0

function hexToRgb(value) {
  const raw = String(value).trim().replace(/^#/, "")
  const hex = raw.length === 3 ? raw.replace(/(.)/g, "$1$1") : raw
  if (!/^[\da-f]{6}$/i.test(hex)) return null
  const n = parseInt(hex, 16)
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255]
}

function rgbToHex(rgb) {
  const part = (channel) => Math.round(Math.min(1, Math.max(0, channel)) * 255).toString(16).padStart(2, "0")
  return `#${part(rgb[0])}${part(rgb[1])}${part(rgb[2])}`
}

function colorOf(key) {
  const next = hexToRgb(tune[key])
  if (next) ink[key] = next
  return ink[key]
}

function swatch(key) {
  return rgbToHex(hexToRgb(tune[key]) ?? ink[key])
}

function num(key, fallback) {
  const value = Number(tune[key])
  return Number.isFinite(value) ? value : fallback
}

function payload() {
  const size = num("markerSize", 0.026)
  const sanFrancisco = cities.find((city) => city.id === "san-francisco").location
  const newYork = cities.find((city) => city.id === "nyc").location
  return {
    devicePixelRatio: num("devicePixelRatio", 1),
    width: num("width", 320),
    height: num("height", 320),
    phi,
    theta,
    dark: num("dark", 0),
    diffuse: num("diffuse", 3),
    mapSamples: num("mapSamples", 40000),
    mapBrightness: num("mapBrightness", 1.5),
    mapBaseBrightness: num("mapBaseBrightness", 0),
    baseColor: colorOf("baseColor"),
    dotColor: colorOf("dotColor"),
    markerColor: colorOf("markerColor"),
    glowColor: colorOf("glowColor"),
    arcColor: colorOf("arcColor"),
    arcWidth: num("arcWidth", 0.5),
    arcHeight: num("arcHeight", 0.3),
    markerElevation: num("markerElevation", 0),
    scale: num("scale", 1),
    offset: [num("offsetX", 0), num("offsetY", 0)],
    opacity: num("opacity", 1),
    markers: cities.map((city) => ({ location: city.location, size, id: city.id })),
    arcs: tune.showArc ? [{ from: sanFrancisco, to: newYork, id: "hop" }] : [],
    context: { antialias: tune.antialias, alpha: tune.alpha, preserveDrawingBuffer: false },
  }
}

function view() {
  const node = stage.value
  if (!node) return null
  const box = node.getBoundingClientRect()
  if (box.width < 2 || box.height < 2) return null
  return { width: Math.round(box.width), height: Math.round(box.height) }
}

function unwrap(node) {
  const wrap = node?.parentElement
  if (node && wrap && !wrap.classList.contains("hold")) wrap.replaceWith(node)
}

function turn() {
  globe?.update({ phi, theta })
}

function publishAngles() {
  angle.phi = Math.round((((phi % TAU) + TAU) % TAU) * 1000) / 1000
  angle.theta = Math.round(theta * 1000) / 1000
}

function remount(replace) {
  let node = canvas.value
  if (!node) return
  globe?.destroy()
  globe = undefined
  unwrap(node)
  if (replace) {
    const next = node.cloneNode(false)
    node.replaceWith(next)
    canvas.value = next
    node = next
  }
  globe = createGlobe(node, payload())
}

function push() {
  const nextContext = `${tune.antialias}|${tune.alpha}`
  const nextDpr = num("devicePixelRatio", 1)
  const replace = nextContext !== contextKey
  const recreate = replace || nextDpr !== dprKey || !globe
  contextKey = nextContext
  dprKey = nextDpr
  if (recreate) remount(replace)
  else globe.update(payload())
}

function tick() {
  frame = requestAnimationFrame(tick)
  if (!spin.value || open.value || dragging || document.hidden) return
  phi += 0.003
  turn()
}

function onPointerDown(event) {
  dragging = true
  pointerX = event.clientX
  pointerY = event.clientY
  event.currentTarget.setPointerCapture(event.pointerId)
}

function onPointerMove(event) {
  if (!dragging) return
  phi += (event.clientX - pointerX) / 220
  theta = Math.min(HALF_PI, Math.max(-HALF_PI, theta + (event.clientY - pointerY) / 420))
  pointerX = event.clientX
  pointerY = event.clientY
  if (open.value) publishAngles()
  turn()
}

function onPointerUp() {
  dragging = false
}

function onKey(event) {
  const step = event.shiftKey ? 0.28 : 0.12
  if (event.key === "ArrowLeft") phi -= step
  else if (event.key === "ArrowRight") phi += step
  else if (event.key === "ArrowUp") theta = Math.min(HALF_PI, theta + step * 0.6)
  else if (event.key === "ArrowDown") theta = Math.max(-HALF_PI, theta - step * 0.6)
  else return
  event.preventDefault()
  if (open.value) publishAngles()
  turn()
}

function setPhi(raw) {
  const value = Number(raw)
  if (!Number.isFinite(value)) return
  phi = value
  angle.phi = value
  turn()
}

function setTheta(raw) {
  const value = Number(raw)
  if (!Number.isFinite(value)) return
  theta = Math.min(HALF_PI, Math.max(-HALF_PI, value))
  angle.theta = theta
  turn()
}

function onSize() {
  sizeLocked = true
}

function fitSize() {
  const next = view()
  if (!next) return
  sizeLocked = false
  tune.width = next.width
  tune.height = next.height
}

function onHex(key, raw) {
  tune[key] = raw
  const next = hexToRgb(raw)
  if (next) ink[key] = next
}

function commitHex(key) {
  tune[key] = rgbToHex(ink[key])
}

function trimNum(value) {
  if (!Number.isFinite(value)) return "0"
  return String(Math.round(value * 1000) / 1000)
}

function promptForSettings() {
  const lines = [
    ["phi", trimNum(angle.phi)],
    ["theta", trimNum(angle.theta)],
    ["spin", spin.value],
  ]
  for (const group of groups) {
    for (const field of group.fields) {
      const value = tune[field.key]
      lines.push([field.key, typeof value === "number" ? trimNum(value) : value])
    }
  }
  lines.push(["showArc", tune.showArc])
  for (const field of colors) lines.push([field.key, swatch(field.key)])
  lines.push(["antialias", tune.antialias], ["alpha", tune.alpha])
  const body = lines.map(([key, value]) => `${key}: ${value}`).join("\n")
  return `Apply these exact settings to the Cobe globe card. Do not change anything else.\n\n${body}`
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

function reset() {
  const previous = contextKey
  const size = view()
  live = false
  sizeLocked = false
  Object.assign(tune, preset)
  if (size) {
    tune.width = size.width
    tune.height = size.height
  }
  phi = phi0
  theta = theta0
  publishAngles()
  const nextKey = `${tune.antialias}|${tune.alpha}`
  const replace = previous !== nextKey
  contextKey = nextKey
  dprKey = tune.devicePixelRatio
  live = true
  remount(replace)
}

watch(tune, () => {
  if (live) push()
})

watch(open, (isOpen) => {
  if (isOpen) publishAngles()
})

watch(optionsShown, (shown) => {
  if (!shown) open.value = false
})

onMounted(() => {
  const size = view()
  if (size) {
    tune.width = size.width
    tune.height = size.height
  }
  spin.value = !window.matchMedia("(prefers-reduced-motion: reduce)").matches
  contextKey = `${tune.antialias}|${tune.alpha}`
  dprKey = tune.devicePixelRatio
  remount(false)
  observer = new ResizeObserver(() => {
    if (sizeLocked) return
    const next = view()
    if (!next || (next.width === tune.width && next.height === tune.height)) return
    tune.width = next.width
    tune.height = next.height
  })
  observer.observe(stage.value)
  live = true
  frame = requestAnimationFrame(tick)
})

onBeforeUnmount(() => {
  cancelAnimationFrame(frame)
  window.clearTimeout(copyTimer)
  observer?.disconnect()
  const node = canvas.value
  globe?.destroy()
  globe = undefined
  unwrap(node)
})
</script>

<template>
  <article class="globe" :class="{ 'is-open': open }" :style="{ background: swatch('cardColor'), color: swatch('fontColor') }">
    <header class="bar">
      <p class="label">Team location</p>
      <button
        v-if="optionsShown"
        type="button"
        class="toggle"
        :aria-expanded="open"
        aria-controls="globe-options"
        @click="open = !open"
      >
        {{ open ? "Close" : "Options" }}
      </button>
    </header>
    <form v-if="open" id="globe-options" class="play" aria-label="Globe options" @submit.prevent @pointerdown.stop @keydown.esc="open = false">
      <div v-for="group in groups" :key="group.title" class="group">
        <p class="group-title">{{ group.title }}</p>
        <template v-if="group.title === 'View'">
          <label class="field">
            <span class="name">phi</span>
            <input
              class="range"
              type="range"
              min="0"
              :max="TAU"
              step="0.01"
              :value="angle.phi"
              @input="setPhi($event.target.value)"
            />
            <input class="num" type="number" min="0" :max="TAU" step="0.01" :value="angle.phi" @input="setPhi($event.target.value)" />
          </label>
          <label class="field">
            <span class="name">theta</span>
            <input
              class="range"
              type="range"
              :min="-HALF_PI"
              :max="HALF_PI"
              step="0.01"
              :value="angle.theta"
              @input="setTheta($event.target.value)"
            />
            <input
              class="num"
              type="number"
              :min="-HALF_PI"
              :max="HALF_PI"
              step="0.01"
              :value="angle.theta"
              @input="setTheta($event.target.value)"
            />
          </label>
          <label class="check">
            <input v-model="spin" type="checkbox" />
            <span>spin</span>
          </label>
        </template>
        <label v-if="group.title === 'Arc'" class="check">
          <input v-model="tune.showArc" type="checkbox" />
          <span>arcs · San Francisco to New York</span>
        </label>
        <label v-for="field in group.fields" :key="field.key" class="field">
          <span class="name">{{ field.label || field.key }}</span>
          <input
            class="range"
            type="range"
            :min="field.min"
            :max="field.max"
            :step="field.step"
            v-model.number="tune[field.key]"
            @input="field.size && onSize()"
          />
          <input
            class="num"
            type="number"
            :min="field.min"
            :max="field.max"
            :step="field.step"
            v-model.number="tune[field.key]"
            @input="field.size && onSize()"
          />
        </label>
        <button v-if="group.title === 'Canvas'" type="button" class="text" @click="fitSize">Fit canvas</button>
      </div>

      <div class="group">
        <p class="group-title">Color</p>
        <label v-for="field in colors" :key="field.key" class="field">
          <span class="name">{{ field.key }}</span>
          <input class="swatch" type="color" :value="swatch(field.key)" @input="onHex(field.key, $event.target.value)" />
          <input
            class="hex"
            type="text"
            spellcheck="false"
            maxlength="7"
            :value="tune[field.key]"
            @input="onHex(field.key, $event.target.value)"
            @blur="commitHex(field.key)"
          />
        </label>
      </div>

      <div class="group">
        <p class="group-title">context</p>
        <label class="check">
          <input v-model="tune.antialias" type="checkbox" />
          <span>antialias</span>
        </label>
        <label class="check">
          <input v-model="tune.alpha" type="checkbox" />
          <span>alpha</span>
        </label>
      </div>

      <div class="actions">
        <button type="button" class="text" @click="copyPrompt">{{ copied ? "Copied" : "Copy prompt" }}</button>
        <button type="button" class="text" @click="reset">Reset</button>
      </div>
    </form>
    <div
      ref="stage"
      class="stage"
      tabindex="0"
      aria-label="Globe. Drag or use arrow keys to turn it."
      @pointerdown="onPointerDown"
      @pointermove="onPointerMove"
      @pointerup="onPointerUp"
      @pointercancel="onPointerUp"
      @keydown="onKey"
    >
      <!-- cobe wraps this canvas. v-once keeps a later render from removing that wrap. -->
      <div v-once class="hold">
        <canvas ref="canvas" class="sphere" aria-hidden="true"></canvas>
      </div>
    </div>
  </article>
</template>

<style scoped>
.globe {
  position: absolute;
  inset: 0;
  background: #fff;
  border-radius: inherit;
  color: #141414;
  font-family: "Figma Sans VF", "Figma Sans", sans-serif;
  font-variation-settings: "wdth" 100;
}

.globe.is-open {
  display: grid;
  grid-template-rows: auto minmax(0, 1fr) minmax(132px, 38%);
  overflow: hidden;
}

.bar {
  position: absolute;
  z-index: 2;
  top: 25px;
  left: 22px;
  right: 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.globe.is-open .bar {
  position: relative;
  top: auto;
  left: auto;
  right: auto;
  padding: 16px 16px 8px;
}

.label {
  margin: 0;
  font-size: 14px;
  font-weight: 700;
  line-height: 15.4px;
  letter-spacing: -0.63px;
  text-box: trim-both cap alphabetic;
}

.toggle,
.text {
  margin: 0;
  padding: 0;
  border: 0;
  background: transparent;
  color: inherit;
  font: inherit;
  font-weight: 700;
  letter-spacing: -0.04em;
  cursor: pointer;
}

.toggle {
  font-size: 14px;
  letter-spacing: -0.63px;
}

.play {
  min-height: 0;
  overflow: auto;
  overscroll-behavior: contain;
  padding: 0 16px 12px;
  font-family: ui-monospace, "SF Mono", Menlo, monospace;
  font-size: 10px;
  font-weight: 400;
  line-height: 1.3;
  letter-spacing: 0;
}

.group {
  padding: 8px 0;
  border-top: 1px solid color-mix(in srgb, currentColor 16%, transparent);
}

.group-title {
  margin: 0 0 4px;
  color: color-mix(in srgb, currentColor 62%, transparent);
  font: inherit;
  text-box: trim-both cap alphabetic;
}

.field {
  display: grid;
  grid-template-columns: minmax(92px, 38%) minmax(0, 1fr) 58px;
  gap: 6px;
  align-items: center;
  min-height: 24px;
}

.name {
  text-box: trim-both cap alphabetic;
}

.range {
  width: 100%;
  margin: 0;
  accent-color: currentColor;
}

.num,
.hex,
.swatch {
  box-sizing: border-box;
  margin: 0;
  border: 1px solid color-mix(in srgb, currentColor 28%, transparent);
  background: transparent;
  color: inherit;
  font: inherit;
  font-variant-numeric: tabular-nums;
}

.num,
.hex {
  width: 100%;
  height: 20px;
  padding: 0 4px;
}

.num {
  appearance: textfield;
}

.num::-webkit-outer-spin-button,
.num::-webkit-inner-spin-button {
  margin: 0;
  -webkit-appearance: none;
}

.field:has(.swatch) {
  grid-template-columns: minmax(92px, 38%) 28px minmax(0, 1fr);
}

.swatch {
  width: 28px;
  height: 20px;
  padding: 1px;
}

.check {
  display: flex;
  align-items: center;
  gap: 6px;
  min-height: 22px;
}

.actions {
  display: flex;
  gap: 16px;
  margin-top: 6px;
}

.text {
  font-family: inherit;
  font-size: 10px;
  letter-spacing: 0;
}

.stage {
  position: absolute;
  left: 50%;
  bottom: -14%;
  width: 132%;
  aspect-ratio: 1;
  transform: translateX(-50%);
  cursor: grab;
  touch-action: none;
}

.globe.is-open .stage {
  position: relative;
  left: auto;
  bottom: auto;
  width: auto;
  height: auto;
  min-height: 0;
  aspect-ratio: auto;
  transform: none;
  border-top: 1px solid color-mix(in srgb, currentColor 16%, transparent);
}

.stage:active {
  cursor: grabbing;
}

.stage:focus-visible {
  outline: 2px solid currentColor;
  outline-offset: -8px;
}

.hold,
.sphere {
  display: block;
  width: 100%;
  height: 100%;
}
</style>
