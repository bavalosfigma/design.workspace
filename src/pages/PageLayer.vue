<script setup>
import { computed, nextTick, ref, watch } from "vue"
import { resolvePage } from "./pages.js"
import { useFocusTrap } from "../composables/useFocusTrap.js"
import PlayerPage from "./PlayerPage.vue"
import SlimPage from "./SlimPage.vue"

const props = defineProps({
  id: { type: String, default: null },
})

const emit = defineEmits(["close", "closed"])

const root = ref(null)
const closeButton = ref(null)
const page = computed(() => {
  const value = resolvePage(props.id)
  if (!value || value.kind === "rearrange") return null
  return value
})
let gridScroll = 0
let heldScroll = false

useFocusTrap(
  () => root.value,
  () => page.value !== null,
)

function close() {
  emit("close")
}

function holdScroll() {
  const root = document.documentElement
  if (root.classList.contains("is-grid-locked")) return
  heldScroll = true
  root.classList.add("is-grid-locked")
}

function releaseScroll() {
  if (!heldScroll) return
  heldScroll = false
  document.documentElement.classList.remove("is-grid-locked")
}

function placeScroll(y) {
  window.scrollTo(0, y)
  requestAnimationFrame(() => {
    if (window.scrollY !== y) window.scrollTo(0, y)
  })
}

watch(page, async (value, previous) => {
  if (!value) return
  if (value.kind === "player") {
    if (!previous) gridScroll = window.scrollY
    await nextTick()
    document.documentElement.style.removeProperty("--grid-lock")
    holdScroll()
    placeScroll(gridScroll)
    closeButton.value?.focus({ preventScroll: true })
    return
  }
  if (!previous) {
    releaseScroll()
    gridScroll = window.scrollY
    document.documentElement.style.setProperty("--grid-lock", `${gridScroll}px`)
    window.scrollTo(0, 0)
  }
  await nextTick()
  closeButton.value?.focus()
})

function onAfterLeave() {
  if (page.value) return
  releaseScroll()
  document.documentElement.style.removeProperty("--grid-lock")
  window.scrollTo(0, gridScroll)
  emit("closed")
}
</script>

<template>
  <Transition name="page" :duration="520" @after-leave="onAfterLeave">
    <div
      v-if="page"
      ref="root"
      class="page-layer"
      :class="{ 'is-player': page.kind === 'player' }"
      role="dialog"
      aria-modal="true"
      aria-labelledby="page-title"
    >
      <div class="scrim" @click="close"></div>
      <button ref="closeButton" type="button" class="page-close" aria-label="Close" @click="close">
        <svg viewBox="0 0 16 16" aria-hidden="true">
          <path d="M3.5 3.5l9 9M12.5 3.5l-9 9" />
        </svg>
      </button>
      <div v-if="page.kind !== 'player'" class="sheet">
        <SlimPage v-if="page.kind === 'slim'" :page="page" />
      </div>
      <PlayerPage v-else :page="page" />
    </div>
  </Transition>
</template>

<style scoped>
.page-layer {
  position: relative;
  /* Above the canvas and its lightbox (4), below the nav (50). */
  z-index: 40;
  padding: 104px 0 40px;
  pointer-events: none;
  font-family: "Figma Sans VF", "Figma Sans", sans-serif;
  font-variation-settings: "wdth" 100;
}

.page-layer.is-player {
  padding: 0;
}

.sheet {
  position: relative;
  z-index: 1;
  width: min(640px, calc(100vw - 32px));
  margin-inline: auto;
  background: #fff;
  color: #141414;
  box-shadow: 0 18px 50px rgba(0, 0, 0, 0.28);
  pointer-events: auto;
  font-family: "Figma Sans VF", "Figma Sans", sans-serif;
  font-variation-settings: "wdth" 100;
}

.scrim {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.72);
  pointer-events: auto;
}

.page-close {
  position: fixed;
  z-index: 2;
  top: 4px;
  right: 6px;
  pointer-events: auto;
  display: grid;
  place-items: center;
  width: 36px;
  height: 36px;
  padding: 0;
  border: 0;
  border-radius: 4px;
  background: transparent;
  color: #d6d6d6;
  cursor: pointer;
}

.page-close svg {
  width: 14px;
  height: 14px;
}

.page-close path {
  fill: none;
  stroke: currentColor;
  stroke-width: 1.5;
  stroke-linecap: round;
}

.page-close:hover {
  color: #fff;
}

.page-close:focus-visible {
  outline: 2px solid #fff;
  outline-offset: 2px;
}

.page-enter-active .scrim,
.page-leave-active .scrim,
.page-enter-active .page-close,
.page-leave-active .page-close {
  transition: opacity 240ms ease;
}

.page-enter-active .sheet,
.page-leave-active .sheet,
.page-enter-active :deep(.player-anchor),
.page-leave-active :deep(.player-anchor) {
  transition: transform 520ms cubic-bezier(0.22, 1, 0.3, 1);
}

.page-enter-from .scrim,
.page-leave-to .scrim,
.page-enter-from .page-close,
.page-leave-to .page-close {
  opacity: 0;
}

.page-enter-from .sheet,
.page-leave-to .sheet,
.page-enter-from :deep(.player-anchor),
.page-leave-to :deep(.player-anchor) {
  transform: translateY(100%);
}

@media (prefers-reduced-motion: reduce) {
  .page-enter-active .scrim,
  .page-leave-active .scrim,
  .page-enter-active .page-close,
  .page-leave-active .page-close,
  .page-enter-active .sheet,
  .page-leave-active .sheet,
  .page-enter-active :deep(.player-anchor),
  .page-leave-active :deep(.player-anchor) {
    transition: none;
  }
}
</style>
