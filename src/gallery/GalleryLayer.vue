<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, shallowRef, useTemplateRef, watch } from "vue"
import { useFocusTrap } from "../composables/useFocusTrap.js"
import { frame, shots } from "./shots.js"
import { usePan } from "./usePan.js"

const { dismiss = 0 } = defineProps({
  dismiss: { type: Number, default: 0 },
})

const emit = defineEmits(["view"])

const viewport = useTemplateRef("viewport")
const dialog = useTemplateRef("dialog")
const closeButton = useTemplateRef("closeButton")
const { worldStyle, panning, onPointerDown, onClickCapture, nudge } = usePan(viewport, frame)

const activeId = shallowRef(null)
const activeIndex = computed(() => shots.findIndex((shot) => shot.id === activeId.value))
const active = computed(() => (activeIndex.value < 0 ? null : shots[activeIndex.value]))
let returnFocus = null

useFocusTrap(
  () => dialog.value,
  () => active.value !== null,
)

function place(shot) {
  return {
    left: `${shot.x}px`,
    top: `${shot.y}px`,
    width: `${shot.w}px`,
    animationDelay: `${shot.delay}ms`,
    zIndex: shot.delay,
  }
}

function openShot(shot, event) {
  returnFocus = event.currentTarget instanceof HTMLElement ? event.currentTarget : null
  activeId.value = shot.id
  emit("view", shot.label)
}

function closeLightbox() {
  if (!activeId.value) return
  const back = returnFocus
  activeId.value = null
  returnFocus = null
  emit("view", "")
  nextTick(() => back?.focus())
}

function stepShot(delta) {
  if (activeIndex.value < 0) return
  const next = (activeIndex.value + delta + shots.length) % shots.length
  const shot = shots[next]
  activeId.value = shot.id
  emit("view", shot.label)
}

function onKey(event) {
  if (event.metaKey || event.ctrlKey || event.altKey) return
  if (activeId.value) {
    if (event.key === "ArrowLeft") stepShot(-1)
    else if (event.key === "ArrowRight") stepShot(1)
    else return
    event.preventDefault()
    return
  }
  const step = event.shiftKey ? 80 : 48
  if (event.key === "ArrowLeft") nudge(step, 0)
  else if (event.key === "ArrowRight") nudge(-step, 0)
  else if (event.key === "ArrowUp") nudge(0, step)
  else if (event.key === "ArrowDown") nudge(0, -step)
  else return
  event.preventDefault()
}

watch(
  () => dismiss,
  (value, previous) => {
    if (value === previous) return
    closeLightbox()
  },
)

watch(activeId, async (id, previous) => {
  if (!id || previous) return
  await nextTick()
  closeButton.value?.focus()
})

onMounted(() => window.addEventListener("keydown", onKey))
onBeforeUnmount(() => window.removeEventListener("keydown", onKey))
</script>

<template>
  <div ref="viewport" class="viewport" role="region" aria-label="Gallery">
    <p class="visually-hidden">Select a picture to view it larger. Drag to move the pictures, or use the arrow keys.</p>
    <div
      class="stage"
      :class="{ 'is-panning': panning }"
      @pointerdown="onPointerDown"
      @click.capture="onClickCapture"
    >
      <div class="world" :style="worldStyle">
        <button
          v-for="shot in shots"
          :key="shot.id"
          type="button"
          class="shot"
          :style="place(shot)"
          :aria-label="`View ${shot.label}`"
          @click="openShot(shot, $event)"
        >
          <img class="photo" :src="shot.src" alt="" draggable="false" />
          <span class="caption">{{ shot.label }}</span>
        </button>
      </div>
    </div>
    <Teleport to="body">
      <Transition name="lightbox" :duration="520">
        <div v-if="active" ref="dialog" class="lightbox" role="dialog" aria-modal="true" :aria-label="active.label">
          <div class="scrim" @click="closeLightbox"></div>
          <button ref="closeButton" type="button" class="lightbox-close" aria-label="Close" @click="closeLightbox">
            <svg viewBox="0 0 16 16" aria-hidden="true">
              <path d="M3.5 3.5l9 9M12.5 3.5l-9 9" />
            </svg>
          </button>
          <button type="button" class="lightbox-nav lightbox-prev" aria-label="Previous picture" @click="stepShot(-1)">
            <svg viewBox="0 0 16 16" aria-hidden="true">
              <path d="M10 3.5 5.5 8 10 12.5" />
            </svg>
          </button>
          <figure class="lightbox-frame">
            <img
              class="lightbox-photo"
              :src="active.src"
              :alt="active.alt"
              :style="{ '--shot-aspect': String(1 / active.ratio) }"
            />
          </figure>
          <button type="button" class="lightbox-nav lightbox-next" aria-label="Next picture" @click="stepShot(1)">
            <svg viewBox="0 0 16 16" aria-hidden="true">
              <path d="M6 3.5 10.5 8 6 12.5" />
            </svg>
          </button>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style scoped>
.viewport {
  position: fixed;
  z-index: 4;
  inset: 0;
  overflow: hidden;
  background: transparent;
  font-family: "Figma Sans VF", "Figma Sans", sans-serif;
  font-variation-settings: "wdth" 100;
}

.viewport.gallery-leave-active {
  transition: opacity 280ms ease;
}

.viewport.gallery-leave-to {
  opacity: 0;
}

.stage {
  position: absolute;
  inset: 0;
  cursor: grab;
  touch-action: none;
  user-select: none;
}

.stage.is-panning {
  cursor: grabbing;
}

.world {
  position: absolute;
  top: 0;
  left: 0;
  width: 0;
  height: 0;
  transform-origin: 0 0;
  will-change: transform;
}

.shot {
  position: absolute;
  margin: 0;
  padding: 0;
  border: 0;
  background: transparent;
  color: inherit;
  font: inherit;
  text-align: left;
  cursor: pointer;
  transform-origin: center center;
  animation: shot-pop 560ms cubic-bezier(0.22, 1.25, 0.36, 1) backwards;
}

.shot:focus-visible {
  outline: 2px solid var(--ink);
  outline-offset: 4px;
}

.photo {
  display: block;
  width: 100%;
  height: auto;
  pointer-events: none;
  background: #d4d4d4;
}

.caption {
  display: block;
  margin-top: 8px;
  color: var(--muted);
  font-size: 12px;
  font-weight: 500;
  letter-spacing: -0.02em;
  line-height: 1.2;
}

.shot:hover {
  transform: scale(1.02);
  transition: transform 240ms ease;
}

.lightbox {
  position: fixed;
  z-index: 4;
  inset: 0;
  display: grid;
  place-items: center;
  padding: 104px 0 40px;
  --lightbox-gutter: 144px;
  --lightbox-chrome: 180px;
  pointer-events: none;
  font-family: "Figma Sans VF", "Figma Sans", sans-serif;
  font-variation-settings: "wdth" 100;
}

.scrim {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.72);
  pointer-events: auto;
}

.lightbox-frame {
  position: relative;
  z-index: 1;
  margin: 0;
  width: fit-content;
  max-width: calc(100vw - var(--lightbox-gutter));
  pointer-events: auto;
}

.lightbox-photo {
  display: block;
  width: min(920px, calc(100vw - var(--lightbox-gutter)), calc((100vh - var(--lightbox-chrome)) * var(--shot-aspect)));
  height: auto;
  max-height: calc(100vh - var(--lightbox-chrome));
  background: #d4d4d4;
}

.lightbox-close {
  position: fixed;
  z-index: 2;
  top: 4px;
  right: 6px;
  display: grid;
  place-items: center;
  width: 36px;
  height: 36px;
  margin: 0;
  padding: 0;
  border: 0;
  border-radius: 4px;
  background: transparent;
  color: #d6d6d6;
  pointer-events: auto;
  cursor: pointer;
}

.lightbox-close svg {
  width: 14px;
  height: 14px;
}

.lightbox-close path {
  fill: none;
  stroke: currentColor;
  stroke-width: 1.5;
  stroke-linecap: round;
}

.lightbox-close:hover {
  color: #fff;
}

.lightbox-close:focus-visible {
  outline: 2px solid #fff;
  outline-offset: 2px;
}

.lightbox-nav {
  position: absolute;
  z-index: 2;
  top: 50%;
  display: grid;
  place-items: center;
  width: 44px;
  height: 44px;
  margin: 0;
  padding: 0;
  border: 0;
  background: rgba(255, 255, 255, 0.12);
  color: #f3f3f1;
  pointer-events: auto;
  transform: translateY(-50%);
  cursor: pointer;
}

.lightbox-prev {
  left: 20px;
}

.lightbox-next {
  right: 20px;
}

.lightbox-nav svg {
  width: 16px;
  height: 16px;
}

.lightbox-nav path {
  fill: none;
  stroke: currentColor;
  stroke-width: 1.5;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.lightbox-nav:hover {
  color: #fff;
  background: rgba(255, 255, 255, 0.2);
}

.lightbox-nav:focus-visible {
  outline: 2px solid #fff;
  outline-offset: 3px;
}

.lightbox-enter-active .scrim,
.lightbox-leave-active .scrim,
.lightbox-enter-active .lightbox-close,
.lightbox-leave-active .lightbox-close,
.lightbox-enter-active .lightbox-nav,
.lightbox-leave-active .lightbox-nav {
  transition: opacity 240ms ease;
}

.lightbox-enter-active .lightbox-frame,
.lightbox-leave-active .lightbox-frame {
  transition: transform 520ms cubic-bezier(0.22, 1, 0.3, 1);
}

.lightbox-enter-from .scrim,
.lightbox-leave-to .scrim,
.lightbox-enter-from .lightbox-close,
.lightbox-leave-to .lightbox-close,
.lightbox-enter-from .lightbox-nav,
.lightbox-leave-to .lightbox-nav {
  opacity: 0;
}

.lightbox-enter-from .lightbox-frame,
.lightbox-leave-to .lightbox-frame {
  transform: translateY(100%);
}

@keyframes shot-pop {
  from {
    opacity: 0;
    transform: translateY(28px) scale(0.92);
  }
}

@media (max-width: 640px) {
  .lightbox {
    --lightbox-gutter: 32px;
    --lightbox-chrome: 220px;
    padding: 72px 16px 80px;
  }

  .lightbox-nav {
    top: auto;
    bottom: 16px;
    transform: none;
  }
}

@media (prefers-reduced-motion: reduce) {
  .viewport.gallery-leave-active,
  .shot,
  .shot:hover {
    transition: none;
    animation: none;
    transform: none;
  }

  .lightbox-enter-active .scrim,
  .lightbox-leave-active .scrim,
  .lightbox-enter-active .lightbox-close,
  .lightbox-leave-active .lightbox-close,
  .lightbox-enter-active .lightbox-nav,
  .lightbox-leave-active .lightbox-nav,
  .lightbox-enter-active .lightbox-frame,
  .lightbox-leave-active .lightbox-frame {
    transition: none;
  }
}
</style>
