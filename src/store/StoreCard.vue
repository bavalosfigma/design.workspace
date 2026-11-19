<script setup>
import { computed, nextTick, shallowRef } from "vue"

const slides = [
  { src: `${import.meta.env.BASE_URL}store/tote.png`, alt: "Blue Figma tote bag", label: "Tote" },
  { src: `${import.meta.env.BASE_URL}store/tee.png`, alt: "Orange t-shirt with a character drawing", label: "Tee" },
  { src: `${import.meta.env.BASE_URL}store/sleeve.png`, alt: "White long-sleeve shirt that reads time to make", label: "Long Sleeve" },
  { src: `${import.meta.env.BASE_URL}store/socks.png`, alt: "Green and blue checkerboard socks", label: "Socks" },
  { src: `${import.meta.env.BASE_URL}store/software.png`, alt: "Yellow t-shirt that reads Idea Software", label: "Software" },
]

const count = slides.length
const index = shallowRef(0)
const shift = shallowRef(0)
const arm = shallowRef(0)
const labelIndex = computed(() => {
  const dir = shift.value < 0 ? 1 : shift.value > 0 ? -1 : arm.value
  if (!dir) return index.value
  return (index.value + (dir > 0 ? 1 : count - 1)) % count
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
  <article class="store" aria-roledescription="carousel" aria-label="Store" @keydown="onKey">
    <button type="button" class="button visit">Visit Store</button>
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
      {{ slides[labelIndex].label }}, {{ labelIndex + 1 }} of {{ slides.length }}
    </p>
    <div class="foot">
      <p class="label">{{ slides[labelIndex].label }}</p>
      <div class="controls">
        <button type="button" aria-label="Previous item" @click="step(-1)">
          <span class="flip">→</span>
        </button>
        <p class="count">{{ labelIndex + 1 }}/{{ slides.length }}</p>
        <button type="button" aria-label="Next item" @click="step(1)">→</button>
      </div>
    </div>
  </article>
</template>

<style scoped>
.store {
  position: absolute;
  inset: 0;
  overflow: hidden;
  background: #e2e2e2;
  border-radius: inherit;
  color: #000;
  font-family: "Figma Sans VF", "Figma Sans", sans-serif;
  font-variation-settings: "wdth" 100;
}

.visit {
  position: absolute;
  top: 14px;
  right: 14px;
  z-index: 2;
}

.reel-stage {
  position: absolute;
  inset: 0;
  container-type: size;
  overflow: hidden;
}

.reel {
  position: absolute;
  top: 0;
  left: 50%;
  width: 381px;
  height: 476.25px;
  transform: translateX(-50%) scale(calc(100cqw / 381px));
  transform-origin: top center;
}

.slide {
  --stride: 500px;
  position: absolute;
  top: -50px;
  left: 50%;
  width: 383.75px;
  height: 576.25px;
  object-fit: cover;
  transform: translateX(-50%) translateX(calc((var(--slot) + var(--shift, 0)) * var(--stride)));
  transition: transform 520ms cubic-bezier(0.22, 1, 0.3, 1);
}

.slide.is-side {
  cursor: pointer;
}

.slide.is-out {
  visibility: hidden;
  pointer-events: none;
  transition: none;
}

.foot {
  position: absolute;
  right: 15px;
  bottom: 9px;
  left: 15px;
  z-index: 1;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 8px 12px;
}

.label,
.count {
  margin: 0;
}

.label {
  font-size: 14px;
  font-weight: 700;
  line-height: 15.4px;
  letter-spacing: -0.63px;
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
  border-radius: 4px;
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
  cursor: pointer;
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
