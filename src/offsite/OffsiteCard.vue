<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from "vue"

const slides = [
  { src: `${import.meta.env.BASE_URL}offsite/workflows.png`, alt: "A person presenting beside a screen that reads The New Workflows" },
  { src: `${import.meta.env.BASE_URL}offsite/taste.png`, alt: "A talk with a red character and the words Disable Taste on the screen" },
  { src: `${import.meta.env.BASE_URL}offsite/tiles.jpg`, alt: "A person presenting in front of a blue tiled wall" },
  { src: `${import.meta.env.BASE_URL}offsite/board.png`, alt: "Two people standing at a whiteboard" },
  { src: `${import.meta.env.BASE_URL}offsite/table.png`, alt: "Two people talking at a table with flowers" },
  { src: `${import.meta.env.BASE_URL}offsite/room.jpg`, alt: "A crowded room during a workshop" },
]

const count = slides.length
const index = ref(0)
const shift = ref(0)
const arm = ref(0)
const labelIndex = computed(() => {
  const dir = shift.value < 0 ? 1 : shift.value > 0 ? -1 : arm.value
  if (!dir) return index.value
  return (index.value + (dir > 0 ? 1 : count - 1)) % count
})
const root = ref(null)
const footEl = ref(null)
const nudge = ref("0px")
let observer

function place() {
  const card = root.value
  const bar = footEl.value
  if (!card || !bar) return
  const cardH = card.clientHeight
  const footH = bar.offsetHeight
  const stageH = cardH - footH
  const slideH = (310 * card.clientWidth) / 406
  const room = (stageH - slideH) / 2
  const shiftDown = Math.min(footH / 2, Math.max(0, room))
  nudge.value = `${shiftDown}px`
}

onMounted(() => {
  place()
  observer = new ResizeObserver(place)
  observer.observe(root.value)
  observer.observe(footEl.value)
})

onBeforeUnmount(() => {
  observer?.disconnect()
})

function baseSlot(i) {
  let delta = i - index.value
  delta = ((delta % count) + count) % count
  if (delta > count / 2) delta -= count
  return delta
}

function shown(i) {
  const slot = baseSlot(i)
  if (Math.abs(slot) <= 1) return true
  if (arm.value !== 0 && slot === arm.value * 2) return true
  if (shift.value !== 0 && Math.abs(slot + shift.value) <= 1) return true
  return false
}

function step(delta) {
  if (shift.value !== 0 || arm.value !== 0) return
  const dir = delta > 0 ? 1 : -1
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    index.value = (index.value + (dir > 0 ? 1 : count - 1)) % count
    return
  }
  arm.value = dir
  nextTick(() => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (arm.value !== dir) return
        shift.value = -dir
        arm.value = 0
      })
    })
  })
}

function onSlide(i) {
  const slot = baseSlot(i)
  if (slot === -1 || slot === 1) step(slot)
}

function settle(event) {
  if (shift.value === 0 || event.propertyName !== "transform") return
  const dir = shift.value < 0 ? 1 : -1
  index.value = (index.value + (dir > 0 ? 1 : count - 1)) % count
  shift.value = 0
}

function onKey(event) {
  if (event.altKey || event.metaKey || event.ctrlKey) return
  if (event.key === "ArrowLeft") {
    event.preventDefault()
    step(-1)
  } else if (event.key === "ArrowRight") {
    event.preventDefault()
    step(1)
  }
}
</script>

<template>
  <article
    ref="root"
    class="offsite"
    :style="{ '--nudge': nudge }"
    aria-roledescription="carousel"
    aria-label="Team Offsite 2026"
    @keydown="onKey"
  >
    <div class="reel-stage">
      <div class="reel" :style="{ '--shift': shift }" @transitionend="settle">
        <img
          v-for="(slide, i) in slides"
          :key="slide.src"
          :src="slide.src"
          :alt="baseSlot(i) === 0 ? slide.alt : ''"
          :aria-hidden="baseSlot(i) === 0 ? undefined : true"
          class="slide"
          :class="{ 'is-side': Math.abs(baseSlot(i)) === 1, 'is-out': !shown(i) }"
          :style="{ '--slot': baseSlot(i) }"
          draggable="false"
          @click="onSlide(i)"
        />
      </div>
    </div>
    <p class="visually-hidden" aria-live="polite">
      {{ slides[labelIndex].alt }}. Photo {{ labelIndex + 1 }} of {{ slides.length }}.
    </p>
    <div ref="footEl" class="foot">
      <p class="label">Team Offsite 2026</p>
      <div class="controls">
        <button type="button" aria-label="Previous photo" @click="step(-1)">
          <span class="flip">→</span>
        </button>
        <p class="count">{{ labelIndex + 1 }}/{{ slides.length }}</p>
        <button type="button" aria-label="Next photo" @click="step(1)">→</button>
      </div>
    </div>
  </article>
</template>

<style scoped>
.offsite {
  position: absolute;
  inset: 0;
  display: grid;
  grid-template-rows: minmax(0, 1fr) auto;
  overflow: hidden;
  background: #cb9fd2;
  border-radius: inherit;
  color: #000;
  font-family: "Figma Sans VF", "Figma Sans", sans-serif;
  font-variation-settings: "wdth" 100;
}

.reel-stage {
  position: relative;
  min-height: 0;
  container-type: size;
  overflow: hidden;
}

.reel {
  position: absolute;
  top: calc(50% + var(--nudge, 0px));
  left: 50%;
  width: 406px;
  height: 508px;
  transform: translate(-50%, -50%) scale(calc(100cqw / 406px));
  transform-origin: center;
}

.slide {
  --stride: 330px;
  position: absolute;
  top: 50%;
  left: calc(50% + 0.5px);
  width: 207px;
  height: 310px;
  object-fit: cover;
  transform: translate(-50%, -50%) translateX(calc((var(--slot) + var(--shift, 0)) * var(--stride)));
  transition: transform 520ms cubic-bezier(0.22, 1, 0.3, 1);
}

.slide.is-out {
  visibility: hidden;
  pointer-events: none;
  transition: none;
}

.count {
  margin: 0;
}

.foot {
  position: relative;
  z-index: 1;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 8px 12px;
  padding: 12px 16px 16px;
}

.label {
  margin: 0;
  font-size: 0.875rem;
  font-weight: 700;
  line-height: 1.1;
  letter-spacing: -0.045em;
}

.controls {
  display: flex;
  flex: none;
  gap: 2px;
  align-items: center;
  width: 92px;
  height: 24px;
}

.controls button,
.count {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 24px;
  border-radius: 0;
  background: rgba(0, 0, 0, 0.1);
  font-size: 14px;
  font-weight: 700;
  line-height: 15.4px;
  letter-spacing: -0.63px;
}

.controls button {
  flex: none;
  width: 24px;
  padding: 0;
  border: 0;
  color: inherit;
  font: inherit;
  font-size: 14px;
  font-weight: 700;
  letter-spacing: -0.63px;
}

.count {
  flex: 1;
  min-width: 0;
}

.flip {
  display: block;
  transform: rotate(180deg);
}

.controls button:hover {
  background: rgba(0, 0, 0, 0.16);
}

.controls button:active {
  background: rgba(0, 0, 0, 0.22);
}

.controls button:focus-visible {
  outline: 2px solid #000;
  outline-offset: 3px;
}

@media (prefers-reduced-motion: reduce) {
  .slide {
    transition: none;
  }
}
</style>
