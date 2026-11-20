<script setup>
import { computed, nextTick, onBeforeUnmount, shallowRef, useTemplateRef } from "vue"

function place(dots) {
  const cx = dots.reduce((sum, dot) => sum + dot.x, 0) / dots.length
  const cy = dots.reduce((sum, dot) => sum + dot.y, 0) / dots.length
  return dots.map((dot) => {
    let dx = dot.x - cx
    let dy = dot.y - cy
    const len = Math.hypot(dx, dy) || 1
    dx /= len
    dy /= len
    return { ...dot, ox: dx * 15, oy: dy * 15 }
  })
}

function numeral(index) {
  return String(index + 1).padStart(2, "0")
}

function sketch(x1, y1, x2, y2, salt) {
  const dx = x2 - x1
  const dy = y2 - y1
  const len = Math.hypot(dx, dy) || 1
  const nx = -dy / len
  const ny = dx / len
  const bend = ((salt % 5) - 2) * 0.85
  const dust = ((salt % 3) - 1) * 0.45
  const mx = (x1 + x2) / 2
  const my = (y1 + y2) / 2
  return {
    core: `M ${x1} ${y1} Q ${mx + nx * bend} ${my + ny * bend} ${x2} ${y2}`,
    soft: `M ${x1} ${y1} Q ${mx + nx * (bend + dust)} ${my + ny * (bend + dust)} ${x2} ${y2}`,
  }
}

const dots = place([
  { x: 50, y: 18 },
  { x: 57.9, y: 39.1 },
  { x: 80.4, y: 40.1 },
  { x: 62.8, y: 54.2 },
  { x: 68.8, y: 75.9 },
  { x: 50, y: 63.5 },
  { x: 31.2, y: 75.9 },
  { x: 37.2, y: 54.2 },
  { x: 19.6, y: 40.1 },
  { x: 42.1, y: 39.1 },
])

const step = shallowRef(0)
const miss = shallowRef(-1)
const field = useTemplateRef("field")
let missTimer = 0
let missFrame = 0

const nextIndex = computed(() => {
  const total = dots.length
  if (step.value < total) return step.value
  if (step.value === total) return 0
  return -1
})

const segments = computed(() => {
  const drawn = Math.min(step.value, dots.length)
  const lines = []
  for (let i = 1; i < drawn; i += 1) {
    const from = dots[i - 1]
    const to = dots[i]
    lines.push({ key: `star-${i}`, ...sketch(from.x, from.y, to.x, to.y, i * 3) })
  }
  if (step.value > dots.length) {
    const from = dots[dots.length - 1]
    const to = dots[0]
    lines.push({ key: "star-close", ...sketch(from.x, from.y, to.x, to.y, dots.length * 3) })
  }
  return lines
})

const status = computed(() => {
  if (step.value === 0) return "Start at dot 1."
  if (nextIndex.value === 0) return "Connect dot 1 to close the line."
  if (nextIndex.value < 0) return `${dots.length} connected.`
  return `${step.value} connected. Dot ${step.value + 1} is next.`
})

function shake(dot) {
  window.clearTimeout(missTimer)
  window.cancelAnimationFrame(missFrame)
  miss.value = -1
  missFrame = window.requestAnimationFrame(() => {
    miss.value = dot
    missTimer = window.setTimeout(() => {
      miss.value = -1
    }, 280)
  })
}

function tap(dot) {
  const next = nextIndex.value
  if (next < 0 || dot !== next) {
    if (next >= 0) shake(dot)
    return
  }
  step.value += 1
  nextTick(() => {
    const upcoming = field.value?.querySelector(`[data-dot="${nextIndex.value}"]`)
    if (upcoming instanceof HTMLElement) upcoming.focus({ preventScroll: true })
  })
}

function again() {
  step.value = 0
  miss.value = -1
}

function dotLabel(dot) {
  const number = dot + 1
  if (dot === nextIndex.value) return `Dot ${number}, connect next`
  return `Dot ${number}`
}

onBeforeUnmount(() => {
  window.clearTimeout(missTimer)
  window.cancelAnimationFrame(missFrame)
})
</script>

<template>
  <article class="dots" aria-label="Connect the dots">
    <div class="bar">
      <p class="kicker">Connect the dots</p>
      <button type="button" class="button" @click="again">Again</button>
    </div>
    <div ref="field" class="field">
      <div class="stage">
        <svg class="lines" viewBox="0 0 100 100" aria-hidden="true">
          <defs>
            <filter id="pencil" x="-20%" y="-20%" width="140%" height="140%" filterUnits="objectBoundingBox" primitiveUnits="userSpaceOnUse">
              <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="2" seed="4" result="noise" />
              <feDisplacementMap in="SourceGraphic" in2="noise" scale="0.7" xChannelSelector="R" yChannelSelector="G" />
            </filter>
          </defs>
          <g class="pencil" filter="url(#pencil)">
            <path v-for="seg in segments" :key="`${seg.key}-soft`" class="stroke-soft" :d="seg.soft" />
            <path v-for="seg in segments" :key="seg.key" class="stroke" :d="seg.core" />
          </g>
        </svg>
        <button
          v-for="(dot, i) in dots"
          :key="i"
          type="button"
          class="point"
          :class="{ 'is-on': i < step, 'is-miss': miss === i }"
          :style="{ left: `${dot.x}%`, top: `${dot.y}%` }"
          :data-dot="i"
          :tabindex="i === nextIndex ? 0 : -1"
          :aria-label="dotLabel(i)"
          @click="tap(i)"
        >
          <span class="pip"></span>
          <span class="num" :style="{ transform: `translate(calc(-50% + ${dot.ox}px), calc(-50% + ${dot.oy}px))` }">
            {{ numeral(i) }}
          </span>
        </button>
      </div>
    </div>
    <p class="visually-hidden" aria-live="polite">{{ status }}</p>
  </article>
</template>

<style scoped>
.dots {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: #c7f8fb;
  border-radius: inherit;
  color: #000;
  font-family: "Figma Sans VF", "Figma Sans", sans-serif;
  font-variation-settings: "wdth" 100;
  user-select: none;
}

.bar {
  position: relative;
  z-index: 1;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 8px 12px;
  padding: 16px 16px 0;
}

.kicker {
  margin: 0;
  color: #000;
  opacity: 1;
  font-size: 0.875rem;
  font-weight: 700;
  line-height: 1.1;
  letter-spacing: -0.045em;
}

.field {
  container-type: size;
  display: grid;
  flex: 1;
  place-items: center;
  min-height: 0;
  padding: 8px 8px 16px;
}

.stage {
  position: relative;
  width: min(100cqw, 100cqh);
  aspect-ratio: 1;
}

.lines {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  overflow: visible;
  pointer-events: none;
}

.stroke,
.stroke-soft {
  fill: none;
  stroke-linecap: round;
  vector-effect: non-scaling-stroke;
}

.stroke-soft {
  stroke: #5c5c5c;
  stroke-width: 2.6px;
  opacity: 0.35;
}

.stroke {
  stroke: #2a2a2a;
  stroke-width: 1.05px;
  opacity: 0.88;
}

.point {
  position: absolute;
  z-index: 1;
  width: 22px;
  height: 22px;
  margin: 0;
  padding: 0;
  border: 0;
  border-radius: 0;
  background: transparent;
  color: #000;
  font-family: inherit;
  font-variation-settings: inherit;
  text-box: none;
  transform: translate(-50%, -50%);
  cursor: pointer;
  touch-action: manipulation;
}

.pip {
  position: absolute;
  top: 50%;
  left: 50%;
  box-sizing: border-box;
  width: 8px;
  height: 8px;
  border: 1.25px solid #2a2a2a;
  border-radius: 50%;
  background: #c7f8fb;
  transform: translate(-50%, -50%);
  pointer-events: none;
}

.point.is-on .pip {
  background: #2a2a2a;
}

.num {
  position: absolute;
  top: 50%;
  left: 50%;
  font-size: 11px;
  font-weight: 500;
  line-height: 1;
  letter-spacing: -0.03em;
  white-space: nowrap;
}

.point.is-miss {
  animation: dots-miss 280ms ease;
}

.point:focus-visible {
  outline: none;
}

.point:focus-visible .num {
  outline: 2px solid #000;
  outline-offset: 2px;
}

@keyframes dots-miss {
  0%,
  100% {
    transform: translate(-50%, -50%);
  }

  30% {
    transform: translate(calc(-50% - 3px), -50%);
  }

  70% {
    transform: translate(calc(-50% + 3px), -50%);
  }
}

@media (prefers-reduced-motion: reduce) {
  .point {
    animation: none;
  }
}
</style>
