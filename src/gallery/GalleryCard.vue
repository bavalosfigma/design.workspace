<script setup>
import { onBeforeUnmount, ref } from "vue"

const shots = [
  { src: `${import.meta.env.BASE_URL}gallery/back.png`, alt: "Person in a Geneva sweatshirt carrying a blue tote" },
  { src: `${import.meta.env.BASE_URL}gallery/mid.png`, alt: "Framed Figma posters along a hallway" },
  { src: `${import.meta.env.BASE_URL}gallery/posters.png`, alt: "Colorful graphic posters" },
  { src: `${import.meta.env.BASE_URL}gallery/front.png`, alt: "Person holding a Hello Kitty Figma poster" },
]

const count = shots.length
const frontIndex = ref(count - 1)
const motion = ref("")
let settle = 0

function depth(i) {
  return (frontIndex.value - i + count) % count
}

function cycle(direction) {
  motion.value = direction > 0 ? "next" : "prev"
  frontIndex.value = (frontIndex.value + (direction > 0 ? count - 1 : 1)) % count
  window.clearTimeout(settle)
  settle = window.setTimeout(() => {
    motion.value = ""
  }, 680)
}

function showPrev() {
  cycle(-1)
}

function showNext() {
  cycle(1)
}

onBeforeUnmount(() => {
  window.clearTimeout(settle)
})
</script>

<template>
  <article class="gallery">
    <div class="gallery-bar">
      <p class="gallery-labels">
        <span>Gallery</span>
        <span>Recently Added</span>
      </p>
      <button type="button" class="button gallery-open">Open Gallery</button>
    </div>
    <div class="gallery-stage">
      <div class="gallery-stack">
        <div
          v-for="(shot, i) in shots"
          :key="shot.src"
          class="shot"
          :data-depth="depth(i)"
          :class="{
            'is-to-back': motion === 'next' && depth(i) === count - 1,
            'is-to-front': motion === 'prev' && depth(i) === 0,
          }"
        >
          <img :src="shot.src" :alt="shot.alt" />
        </div>
      </div>
    </div>
    <div class="gallery-arrows">
      <button type="button" aria-label="Previous photo" @click="showPrev">
        <span class="flip">→</span>
      </button>
      <button type="button" aria-label="Next photo" @click="showNext">→</button>
    </div>
  </article>
</template>

<style scoped>
.gallery {
  position: absolute;
  inset: 0;
  display: grid;
  grid-template-rows: auto minmax(0, 1fr) auto;
  overflow: hidden;
  background: #fdfdfd;
  border-radius: inherit;
  color: #000;
  font-family: "Figma Sans VF", "Figma Sans", sans-serif;
  font-variation-settings: "wdth" 100;
}

.gallery-bar,
.gallery-arrows {
  position: relative;
  z-index: 1;
}

.gallery-bar {
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

.gallery-stack {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 433.19px;
  height: 332px;
  transform: translate(-50%, -50%)
    scale(min(calc((100cqw - 16px) / 433.19px), calc((100cqh - 16px) / 332px)));
  transform-origin: center;
}

.shot {
  position: absolute;
  top: 50%;
  left: 50%;
  z-index: 1;
  width: max-content;
  transform: translate(-50%, -50%) scale(0.92);
  transform-origin: center;
  transition: transform 620ms cubic-bezier(0.22, 0.75, 0.2, 1);
}

.shot img {
  display: block;
  width: auto;
  height: auto;
  max-width: 340px;
  max-height: 320px;
  pointer-events: none;
}

.shot[data-depth="0"] {
  z-index: 4;
  transform: translate(-50%, -50%) scale(1);
}

.shot[data-depth="1"] {
  z-index: 3;
  transform: translate(calc(-50% + 18px), calc(-50% + 14px)) scale(0.92);
}

.shot[data-depth="2"] {
  z-index: 2;
  transform: translate(calc(-50% - 20px), calc(-50% + 8px)) scale(0.92);
}

.shot[data-depth="3"] {
  z-index: 1;
  transform: translate(calc(-50% + 6px), calc(-50% - 16px)) scale(0.92);
}

.shot.is-to-back {
  animation: gallery-tuck 620ms linear;
}

.shot.is-to-front {
  z-index: 6;
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

.gallery-labels span:first-child {
  opacity: 0.4;
}

.gallery-open {
  flex: none;
  margin-left: auto;
}

.gallery-arrows button:hover {
  background: rgba(0, 0, 0, 0.16);
}

.gallery-arrows button:active {
  background: rgba(0, 0, 0, 0.22);
}

.gallery-arrows button:focus-visible {
  outline: 2px solid #000;
  outline-offset: 3px;
}

.gallery-arrows {
  display: flex;
  justify-content: center;
  gap: 8px;
  padding: 0 16px 20px;
}

.gallery-arrows button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  padding: 0;
  border: 0;
  border-radius: 0;
  background: rgba(0, 0, 0, 0.1);
  color: #000;
  font: inherit;
  font-size: 1rem;
  font-weight: 700;
  letter-spacing: -0.63px;
  cursor: pointer;
}

.flip {
  display: block;
  transform: rotate(180deg);
}

@keyframes gallery-tuck {
  0%,
  42% {
    z-index: 6;
  }

  43%,
  100% {
    z-index: 1;
  }
}

@media (prefers-reduced-motion: reduce) {
  .shot,
  .shot.is-to-back {
    transition: none;
    animation: none;
  }
}
</style>
