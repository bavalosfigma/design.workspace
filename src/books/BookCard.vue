<script setup>
import { computed, nextTick, shallowRef } from "vue"

const books = [
  {
    src: `${import.meta.env.BASE_URL}books/program.png`,
    alt: "Cover of A New Program for Graphic Design by David Reinfurt",
    title: "A New Program for Graphic Design",
    by: "Brendon",
    ratio: 666 / 1000,
  },
  {
    src: `${import.meta.env.BASE_URL}books/pasta.png`,
    alt: "Cover of The Book of Pasta, published by Phaidon",
    title: "The Book of Pasta",
    by: "Taryn",
    ratio: 754 / 994,
  },
  {
    src: `${import.meta.env.BASE_URL}books/visual.png`,
    alt: "Cover of Design and Visual Communication by Bruno Munari",
    title: "Design and Visual Communication",
    by: "Kat",
    ratio: 576 / 886,
  },
  {
    src: `${import.meta.env.BASE_URL}books/dublab.png`,
    alt: "Cover of dublab: Future Roots Radio",
    title: "dublab: Future Roots Radio",
    by: "Jefferson",
    ratio: 614 / 819,
  },
  {
    src: `${import.meta.env.BASE_URL}books/japan.png`,
    alt: "Cover of Japan Works by Aglaia Konrad",
    title: "Japan Works",
    by: "Maria",
    ratio: 792 / 1000,
  },
]

const count = books.length
const index = shallowRef(0)
const shift = shallowRef(0)
const arm = shallowRef(0)
const labelIndex = computed(() => {
  const dir = shift.value < 0 ? 1 : shift.value > 0 ? -1 : arm.value
  if (!dir) return index.value
  return (index.value + (dir > 0 ? 1 : count - 1)) % count
})
const book = computed(() => books[labelIndex.value])
const byline = computed(() => `Submitted  by ${book.value.by}`)
const status = computed(() => `${book.value.title}. ${byline.value}. ${labelIndex.value + 1} of ${count}.`)

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
  <article class="book" aria-roledescription="carousel" aria-label="Recommended books" @keydown="onKey">
    <div class="stage">
      <div class="reel" :style="{ '--shift': shift }" @transitionend="settle">
        <div
          v-for="(item, i) in books"
          :key="item.src"
          class="cover"
          :class="{ 'is-side': Math.abs(baseSlot(i)) === 1, 'is-out': !shown(i) }"
          :style="{ '--slot': baseSlot(i), '--ratio': item.ratio }"
          @click="onSlide(i)"
        >
          <img
            class="shot"
            :src="item.src"
            :alt="baseSlot(i) === 0 ? item.alt : ''"
            :aria-hidden="baseSlot(i) === 0 ? undefined : true"
            draggable="false"
          />
        </div>
      </div>
    </div>
    <div class="bar">
      <p class="kicker">Recommended books</p>
      <button type="button" class="button info">Info</button>
    </div>
    <div class="foot">
      <div class="meta">
        <p class="title">{{ book.title }}</p>
        <p class="byline">{{ byline }}</p>
      </div>
      <div class="controls">
        <button type="button" aria-label="Previous book" @click="step(-1)">
          <span class="flip">→</span>
        </button>
        <p class="count">{{ labelIndex + 1 }}/{{ count }}</p>
        <button type="button" aria-label="Next book" @click="step(1)">→</button>
      </div>
    </div>
    <p class="visually-hidden" aria-live="polite">{{ status }}</p>
  </article>
</template>

<style scoped>
.book {
  position: absolute;
  inset: 0;
  overflow: hidden;
  background: #67ff7f;
  border-radius: inherit;
  color: #000;
  font-family: "Figma Sans VF", "Figma Sans", sans-serif;
  font-variation-settings: "wdth" 100;
}

.stage {
  position: absolute;
  inset: 0;
  container-type: size;
  overflow: hidden;
}

.reel {
  position: absolute;
  top: 0;
  left: 0;
  width: 536px;
  height: 670px;
  transform: scale(calc(100cqw / 536px));
  transform-origin: top left;
}

.kicker,
.title,
.byline {
  font-size: 0.875rem;
  font-weight: 700;
  line-height: 1.1;
  letter-spacing: -0.045em;
}

.bar,
.foot {
  z-index: 1;
}

.bar {
  position: absolute;
  top: 14px;
  right: 14px;
  left: 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.kicker {
  min-width: 0;
  margin: 0;
  color: #000;
}

.info {
  flex: none;
  padding-inline: 24px;
}

.cover {
  --stride: 440px;
  position: absolute;
  top: calc(50% + 0.5px);
  left: 50%;
  width: calc(375px * var(--ratio));
  height: 375px;
  border: 1px solid #000;
  box-shadow:
    0 258px 72px rgba(0, 0, 0, 0),
    0 165px 66px rgba(0, 0, 0, 0.01),
    0 93px 56px rgba(0, 0, 0, 0.05),
    0 41px 41px rgba(0, 0, 0, 0.09),
    0 10px 23px rgba(0, 0, 0, 0.1);
  transform: translate(-50%, -50%) translateX(calc((var(--slot) + var(--shift, 0)) * var(--stride)));
  transition: transform 520ms cubic-bezier(0.22, 1, 0.3, 1);
}

.shot {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.cover.is-out {
  visibility: hidden;
  pointer-events: none;
  transition: none;
}

.foot {
  position: absolute;
  right: 16px;
  bottom: 16px;
  left: 16px;
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 12px;
}

.meta {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}

.title,
.byline {
  margin: 0;
}

.byline {
  opacity: 0.4;
  white-space: pre-wrap;
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
  margin: 0;
  background: rgba(0, 0, 0, 0.1);
  font-size: 0.875rem;
  font-weight: 700;
  line-height: 1.1;
  letter-spacing: -0.045em;
}

.controls button {
  flex: none;
  width: 24px;
  padding: 0;
  border: 0;
  border-radius: 4px;
  color: inherit;
  font-family: inherit;
  font-variation-settings: inherit;
}

.count {
  flex: 1;
  min-width: 0;
  border-radius: 0;
}

.flip {
  display: block;
  transform: rotate(180deg);
}

.info:hover,
.controls button:hover {
  background: rgba(0, 0, 0, 0.16);
}

.info:active,
.controls button:active {
  background: rgba(0, 0, 0, 0.22);
}

.info:focus-visible,
.controls button:focus-visible {
  outline: 2px solid #000;
  outline-offset: 3px;
}

@media (prefers-reduced-motion: reduce) {
  .cover {
    transition: none;
  }
}
</style>
