<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, shallowRef, useTemplateRef, watch } from "vue"
import NamedCursor from "./NamedCursor.vue"
import { introCursors } from "./introCursors.js"

const peek = 96
const minScale = 0.7
const limit = 4
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches
const corners = [
  { id: "nw", label: "top left" },
  { id: "ne", label: "top right" },
  { id: "sw", label: "bottom left" },
  { id: "se", label: "bottom right" },
]

const { hidden = false, cursors = false } = defineProps({
  hidden: Boolean,
  cursors: Boolean,
})

const emit = defineEmits(["open", "measure"])

const root = useTemplateRef("root")
const copy = useTemplateRef("copy")
const frame = useTemplateRef("frame")
const gone = shallowRef(false)
const arrive = shallowRef(!reduceMotion && !hidden)
const scale = shallowRef(1)
const framed = shallowRef(false)
const base = shallowRef({ w: 0, h: 0 })
const margin = shallowRef(0)
let observer
let drag = null

function report() {
  const view = root.value?.offsetHeight || window.innerHeight
  const space = Math.round(Math.max(view - peek, 0))
  margin.value = space
  emit("measure", space)
}

function learnMore() {
  emit("open", "about")
}

const frameStyle = computed(() => ({
  transform: `scale(${scale.value})`,
  "--scale": String(scale.value),
}))
const buttonShift = computed(() => {
  if (!base.value.h || scale.value <= 1) return undefined
  const extra = ((scale.value - 1) * base.value.h) / 2
  return { transform: `translateY(${extra}px)` }
})

function measureFrame() {
  const node = frame.value
  if (!node) return
  const w = node.offsetWidth
  const h = node.offsetHeight
  if (!w || !h) return
  if (base.value.w === w && base.value.h === h) return
  base.value = { w, h }
  if (scale.value > limit) scale.value = limit
  report()
}

function showFrame(event) {
  if (event.button !== 0) return
  framed.value = true
}

function hideFrame(event) {
  if (!framed.value) return
  if (frame.value?.contains(event.target)) return
  framed.value = false
}

function onFrameKey(event) {
  if (event.key !== "Escape" || !framed.value) return
  framed.value = false
}

function onHandleDown(event) {
  if (event.button !== 0) return
  const rect = frame.value?.getBoundingClientRect()
  if (!rect) return
  const cx = rect.left + rect.width / 2
  const cy = rect.top + rect.height / 2
  drag = {
    id: event.pointerId,
    cx,
    cy,
    dist: Math.hypot(event.clientX - cx, event.clientY - cy) || 1,
    scale: scale.value,
  }
  event.currentTarget.setPointerCapture(event.pointerId)
}

function onHandleMove(event) {
  if (!drag || event.pointerId !== drag.id) return
  const dist = Math.hypot(event.clientX - drag.cx, event.clientY - drag.cy)
  const next = drag.scale * (dist / drag.dist)
  scale.value = Math.min(limit, Math.max(minScale, next))
}

function onHandleUp(event) {
  if (!drag || event.pointerId !== drag.id) return
  drag = null
}

function onHandleKey(event) {
  const step = event.shiftKey ? 0.08 : 0.04
  if (event.key !== "ArrowUp" && event.key !== "ArrowRight" && event.key !== "ArrowDown" && event.key !== "ArrowLeft") return
  event.preventDefault()
  const grow = event.key === "ArrowUp" || event.key === "ArrowRight"
  scale.value = Math.min(limit, Math.max(minScale, scale.value + (grow ? step : -step)))
}

function held() {
  return document.documentElement.classList.contains("is-intro-held")
}

function onScroll() {
  // Modals reset scroll while they are open. The hold keeps the fade
  // that was already on screen, including after the modal closes.
  if (held()) return
  const node = root.value
  if (!node) return
  const distance = Math.max(node.offsetHeight * 0.45, margin.value - node.offsetHeight * 0.4)
  const progress = distance <= 0 ? 0 : Math.min(1, window.scrollY / distance)
  const faded = reduceMotion ? (progress > 0.98 ? 1 : 0) : progress
  node.style.opacity = String(1 - faded)
  if (copy.value) copy.value.style.filter = faded === 0 ? "" : `blur(${(faded * 16).toFixed(2)}px)`
  const next = faded > 0.98
  if (next !== gone.value) gone.value = next
}

watch(
  () => hidden,
  (isHidden) => {
    if (isHidden) framed.value = false
    if (reduceMotion) return
    if (isHidden) {
      arrive.value = false
      return
    }
    const written = root.value?.style.opacity
    if (gone.value || (written && Number(written) < 0.99)) return
    nextTick(() => {
      requestAnimationFrame(() => {
        arrive.value = true
      })
    })
  },
)

onMounted(() => {
  report()
  measureFrame()
  observer = new ResizeObserver(() => {
    report()
    measureFrame()
  })
  observer.observe(root.value)
  if (frame.value) observer.observe(frame.value)
  onScroll()
  window.addEventListener("scroll", onScroll, { passive: true })
  window.addEventListener("pointerdown", hideFrame, true)
  window.addEventListener("keydown", onFrameKey)
})

onBeforeUnmount(() => {
  observer?.disconnect()
  window.removeEventListener("scroll", onScroll)
  window.removeEventListener("pointerdown", hideFrame, true)
  window.removeEventListener("keydown", onFrameKey)
})
</script>

<template>
  <header ref="root" class="intro" :class="{ 'is-hidden': hidden }" :inert="gone || hidden || undefined">
    <div ref="copy" class="intro-copy" :class="{ 'is-arriving': arrive }">
      <div ref="frame" class="intro-frame" :class="{ 'is-framed': framed }" :style="frameStyle">
        <p class="intro-title" @pointerdown="showFrame">
          Welcome to the Figma Design Department. Look around and see what we've been up to.
        </p>
        <template v-if="cursors">
          <span v-for="cursor in introCursors" :key="cursor.id" class="intro-cursor" :style="cursor.style">
            <NamedCursor :name="cursor.name" :color="cursor.color" />
          </span>
        </template>
        <template v-if="framed">
          <div
            v-for="corner in corners"
            :key="corner.id"
            class="intro-handle"
            :class="`is-${corner.id}`"
            role="slider"
            tabindex="0"
            :aria-label="`Scale intro from the ${corner.label}`"
            :aria-valuemin="Math.round(minScale * 100)"
            :aria-valuemax="Math.round(limit * 100)"
            :aria-valuenow="Math.round(scale * 100)"
            @pointerdown="onHandleDown"
            @pointermove="onHandleMove"
            @pointerup="onHandleUp"
            @pointercancel="onHandleUp"
            @keydown="onHandleKey"
          ></div>
        </template>
      </div>
      <button type="button" class="button intro-more" :style="buttonShift" @click="learnMore">Learn more</button>
    </div>
  </header>
</template>

<style scoped>
.intro {
  position: fixed;
  z-index: 0;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding-inline: 24px;
  font-family: "Figma Sans VF", "Figma Sans", sans-serif;
  font-variation-settings: "wdth" 100;
  text-align: center;
  pointer-events: none;
}

.intro-copy {
  display: flex;
  flex-direction: column;
  align-items: center;
  max-width: 100%;
}

.intro-frame {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  max-width: 1095px;
  padding: 14px 16px;
  transform-origin: center;
}

.intro-frame.is-framed {
  pointer-events: auto;
}

.intro-frame::before {
  content: "";
  position: absolute;
  inset: 0;
  border: calc(1.5px / var(--scale, 1)) solid #0d99ff;
  opacity: 0;
  pointer-events: none;
}

.intro-frame.is-framed::before {
  opacity: 1;
}

.intro-cursor {
  position: absolute;
  z-index: 2;
  pointer-events: none;
  transform-origin: 5px 5px;
  scale: calc(1 / var(--scale, 1));
  user-select: none;
}

.intro-copy.is-arriving .intro-cursor {
  animation: cursor-arrive 680ms cubic-bezier(0.22, 1.25, 0.36, 1) backwards;
  animation-delay: var(--delay, 0ms);
}

.intro-handle {
  position: absolute;
  z-index: 1;
  width: 20px;
  height: 20px;
  pointer-events: auto;
  touch-action: none;
}

.intro-handle::after {
  content: "";
  position: absolute;
  top: 6px;
  left: 6px;
  box-sizing: border-box;
  width: 8px;
  height: 8px;
  border: 1.5px solid #0d99ff;
  background: #fff;
}

.intro-handle.is-nw {
  top: 0;
  left: 0;
  transform: translate(-10px, -10px) scale(calc(1 / var(--scale, 1)));
  cursor: nwse-resize;
}

.intro-handle.is-ne {
  top: 0;
  left: 100%;
  transform: translate(-10px, -10px) scale(calc(1 / var(--scale, 1)));
  cursor: nesw-resize;
}

.intro-handle.is-sw {
  top: 100%;
  left: 0;
  transform: translate(-10px, -10px) scale(calc(1 / var(--scale, 1)));
  cursor: nesw-resize;
}

.intro-handle.is-se {
  top: 100%;
  left: 100%;
  transform: translate(-10px, -10px) scale(calc(1 / var(--scale, 1)));
  cursor: nwse-resize;
}

.intro-handle:focus-visible {
  outline: 2px solid #0d99ff;
  outline-offset: 2px;
}

.intro-copy.is-arriving {
  animation: intro-pop 560ms cubic-bezier(0.22, 1.25, 0.36, 1) backwards;
}

.intro-title {
  margin: 0;
  color: #000;
  font-size: clamp(2.25rem, 5.6vw, 80px);
  font-weight: 400;
  line-height: 1;
  letter-spacing: -0.04em;
  text-align: center;
  pointer-events: auto;
}

.intro.is-hidden {
  visibility: hidden;
}

.intro-more {
  margin-top: 38px;
  pointer-events: auto;
  -webkit-backdrop-filter: blur(16px);
  backdrop-filter: blur(16px);
}

@keyframes intro-pop {
  from {
    opacity: 0;
    transform: translateY(28px) scale(0.92);
  }
}

@keyframes cursor-arrive {
  from {
    opacity: 0;
    translate: var(--from-x, 0px) var(--from-y, 0px);
  }
}

@media (prefers-reduced-motion: reduce) {
  .intro-copy.is-arriving,
  .intro-copy.is-arriving .intro-cursor {
    animation: none;
  }
}
</style>
