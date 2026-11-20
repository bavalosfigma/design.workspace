<script setup>
import { computed, inject, nextTick, onBeforeUnmount, onMounted, ref, shallowRef, useTemplateRef, watch } from "vue"
import { previewIds, shots as galleryShots } from "./shots.js"

const emit = defineEmits(["open"])

const shots = previewIds.map((id) => {
  const shot = galleryShots.find((item) => item.id === id)
  return { src: shot.src, alt: shot.alt }
})

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches
const ease = "cubic-bezier(0.4, 0, 0.2, 1)"
const stage = useTemplateRef("stage")
const deck = ref(shots.map((shot) => ({ src: shot.src, alt: shot.alt })))
const exits = ref([])
const held = shallowRef(!reduceMotion)
const dealing = shallowRef(!reduceMotion)
const flights = new Set()
let taken = 0
let flightId = 0
let alive = true

registerDeal()

const done = computed(() => deck.value.length === 0)
const status = computed(() => {
  const top = deck.value[deck.value.length - 1]
  if (!top) return "That's all."
  return `${top.alt}. Photo ${deck.value.length} of ${shots.length}.`
})

function depth(i) {
  return deck.value.length - 1 - i
}

function freshDeck() {
  return shots.map((shot) => ({ src: shot.src, alt: shot.alt }))
}

function dismiss() {
  if (dealing.value) return
  const top = deck.value[deck.value.length - 1]
  const root = stage.value
  if (!top || !root) return
  const node = root.querySelector("[data-depth='0'] img")
  const from = node?.getBoundingClientRect()
  const bounds = root.getBoundingClientRect()
  const side = taken % 2 === 0 ? 1 : -1
  taken += 1
  deck.value = deck.value.slice(0, -1)
  if (reduceMotion || !from || !bounds.width) return
  const distance = side > 0 ? bounds.right - from.left + 12 : from.right - bounds.left + 12
  const exit = {
    id: ++flightId,
    src: top.src,
    left: from.left - bounds.left,
    top: from.top - bounds.top,
    width: from.width,
    height: from.height,
    x: side * distance,
    y: -20,
    turn: side * 8,
  }
  exits.value = [...exits.value, exit]
  nextTick(() => play(exit))
}

function play(exit) {
  const node = stage.value?.querySelector(`[data-flight="${exit.id}"]`)
  if (!node) return
  const animation = node.animate(
    [
      { transform: "translate3d(0px, 0px, 0px) rotate(0deg)" },
      { transform: `translate3d(${exit.x}px, ${exit.y}px, 0px) rotate(${exit.turn}deg)` },
    ],
    { duration: 540, easing: ease, fill: "forwards" },
  )
  flights.add(animation)
  animation.onfinish = () => {
    flights.delete(animation)
    exits.value = exits.value.filter((item) => item.id !== exit.id)
  }
}

function openGallery() {
  emit("open", "gallery")
}

function refresh() {
  for (const animation of flights) animation.cancel()
  flights.clear()
  exits.value = []
  taken = 0
  deck.value = freshDeck()
  held.value = !reduceMotion
  dealing.value = !reduceMotion
  nextTick(() => begin())
}

function begin() {
  if (!alive) return
  if (reduceMotion) {
    held.value = false
    dealing.value = false
    return
  }
  const root = stage.value
  if (!root) return
  const images = [...root.querySelectorAll(".shot img")]
  const decoded = Promise.all(images.map((img) => (img.decode ? img.decode().catch(() => {}) : Promise.resolve())))
  const timeout = new Promise((resolve) => window.setTimeout(resolve, 700))
  Promise.race([decoded, timeout]).then(() => {
    requestAnimationFrame(() => deal())
  })
}

function deal() {
  const root = stage.value
  if (!alive || !root) return
  const stack = root.querySelector(".gallery-stack")
  const bounds = root.getBoundingClientRect()
  const local = stack?.offsetWidth || 0
  const visual = stack?.getBoundingClientRect().width || 0
  const scale = local > 0 && visual > 0 ? visual / local : 1
  const cards = [...root.querySelectorAll(".shot")].sort((a, b) => Number(b.dataset.depth) - Number(a.dataset.depth))
  if (!cards.length || !bounds.width) {
    held.value = false
    dealing.value = false
    return
  }
  const animations = cards.map((el, index) => {
    const from = el.querySelector("img").getBoundingClientRect()
    const side = index % 2 === 0 ? -1 : 1
    const distance = side > 0 ? bounds.right - from.left + 16 : from.right - bounds.left + 16
    const animation = el.animate(
      [
        { "--deal-x": `${(side * distance) / scale}px`, "--deal-y": `${-20 / scale}px`, "--deal-turn": `${side * 8}deg` },
        { "--deal-x": "0px", "--deal-y": "0px", "--deal-turn": "0deg" },
      ],
      { duration: 540, delay: index * 70, easing: ease, fill: "backwards" },
    )
    flights.add(animation)
    animation.onfinish = () => flights.delete(animation)
    return animation.finished.catch(() => {})
  })
  held.value = false
  Promise.all(animations).then(() => {
    if (alive) dealing.value = false
  })
}

const stackRefresh = inject("gallery-stack-refresh", null)
if (stackRefresh) watch(stackRefresh, () => refresh())

function onPageShow(event) {
  if (event.persisted) refresh()
}

onMounted(() => {
  window.addEventListener("pageshow", onPageShow)
  begin()
})

onBeforeUnmount(() => {
  alive = false
  window.removeEventListener("pageshow", onPageShow)
  for (const animation of flights) animation.cancel()
  flights.clear()
})

function registerDeal() {
  if (typeof CSS === "undefined" || !CSS.registerProperty) return
  const props = [
    ["--deal-x", "<length>", "0px"],
    ["--deal-y", "<length>", "0px"],
    ["--deal-turn", "<angle>", "0deg"],
  ]
  for (const [name, syntax, initialValue] of props) {
    try {
      CSS.registerProperty({ name, syntax, inherits: false, initialValue })
    } catch {
      // Registered by an earlier load of this card.
    }
  }
}
</script>

<template>
  <article class="gallery">
    <div class="gallery-bar">
      <p class="gallery-labels">
        <span class="gallery-name">Canvas</span>
        <span class="gallery-recent">Recently Added</span>
      </p>
      <button type="button" class="button gallery-open" @click="openGallery">View canvas</button>
    </div>
    <div ref="stage" class="gallery-stage">
      <p v-if="done" class="gallery-done">That's all.</p>
      <div class="gallery-stack" :class="{ 'is-held': held }">
        <div v-for="(shot, i) in deck" :key="shot.src" class="shot" :data-depth="depth(i)">
          <button v-if="depth(i) === 0" type="button" class="shot-hit" :aria-label="`Remove ${shot.alt}`" @click="dismiss">
            <img :src="shot.src" alt="" />
          </button>
          <img v-else :src="shot.src" alt="" aria-hidden="true" />
        </div>
      </div>
      <img
        v-for="exit in exits"
        :key="exit.id"
        class="flyer"
        :data-flight="exit.id"
        :src="exit.src"
        alt=""
        :style="{
          left: `${exit.left}px`,
          top: `${exit.top}px`,
          width: `${exit.width}px`,
          height: `${exit.height}px`,
        }"
      />
    </div>
    <p class="visually-hidden" aria-live="polite">{{ status }}</p>
  </article>
</template>

<style scoped>
.gallery {
  position: absolute;
  inset: 0;
  display: grid;
  grid-template-rows: auto minmax(0, 1fr);
  overflow: hidden;
  background: #fdfdfd;
  border-radius: inherit;
  color: #000;
  font-family: "Figma Sans VF", "Figma Sans", sans-serif;
  font-variation-settings: "wdth" 100;
}

.gallery-bar {
  position: relative;
  z-index: 1;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 16px 16px 0;
}

.gallery-stage {
  position: relative;
  min-height: 0;
  container-type: size;
  overflow: hidden;
}

.gallery-done {
  position: absolute;
  inset: 0;
  z-index: 0;
  display: grid;
  place-items: center;
  margin: 0;
  padding: 16px;
  font-size: 0.875rem;
  font-weight: 700;
  line-height: 1.1;
  letter-spacing: -0.045em;
  text-align: center;
}

.gallery-stack {
  position: absolute;
  z-index: 1;
  top: 50%;
  left: 50%;
  width: 433.19px;
  height: 332px;
  transform: translate(-50%, -50%)
    scale(min(calc((100cqw - 16px) / 433.19px), calc((100cqh - 16px) / 332px)));
  transform-origin: center;
}

.gallery-stack.is-held .shot {
  opacity: 0;
}

.shot {
  position: absolute;
  top: 50%;
  left: 50%;
  z-index: 1;
  width: max-content;
  transform: translate(calc(-50% + var(--deal-x, 0px)), calc(-50% + var(--deal-y, 0px))) rotate(var(--deal-turn, 0deg))
    scale(0.92);
  transform-origin: center;
}

.shot img {
  display: block;
  width: auto;
  height: auto;
  max-width: 340px;
  max-height: 320px;
}

.shot[data-depth="0"] {
  z-index: 4;
  transform: translate(calc(-50% + var(--deal-x, 0px)), calc(-50% + var(--deal-y, 0px))) rotate(var(--deal-turn, 0deg))
    scale(1);
}

.shot[data-depth="1"] {
  z-index: 3;
  transform: translate(calc(-50% + 18px + var(--deal-x, 0px)), calc(-50% + 14px + var(--deal-y, 0px)))
    rotate(var(--deal-turn, 0deg)) scale(0.92);
}

.shot[data-depth="2"] {
  z-index: 2;
  transform: translate(calc(-50% - 20px + var(--deal-x, 0px)), calc(-50% + 8px + var(--deal-y, 0px)))
    rotate(var(--deal-turn, 0deg)) scale(0.92);
}

.shot[data-depth="3"] {
  z-index: 1;
  transform: translate(calc(-50% + 6px + var(--deal-x, 0px)), calc(-50% - 16px + var(--deal-y, 0px)))
    rotate(var(--deal-turn, 0deg)) scale(0.92);
}

.shot-hit {
  display: block;
  padding: 0;
  border: 0;
  background: transparent;
  color: inherit;
  line-height: 0;
  cursor: pointer;
}

.shot-hit:focus-visible {
  outline: 2px solid #000;
  outline-offset: 4px;
}

.flyer {
  position: absolute;
  z-index: 2;
  pointer-events: none;
}

.gallery-labels {
  display: flex;
  flex-wrap: wrap;
  gap: 4px 12px;
  max-width: 100%;
  margin: 0;
  font-size: 0.875rem;
  font-weight: 700;
  line-height: 1.1;
  letter-spacing: -0.045em;
}

.gallery-labels span {
  white-space: nowrap;
}

.gallery-name {
  opacity: 1;
}

.gallery-recent {
  opacity: 0.5;
}

.gallery-open {
  flex: none;
  margin-left: auto;
}
</style>
