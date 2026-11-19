<script setup>
import { computed, nextTick, ref, watch } from "vue"
import { pages } from "./pages.js"
import SlimPage from "./SlimPage.vue"

const props = defineProps({
  id: { type: String, default: null },
})

const emit = defineEmits(["close", "closed"])

const root = ref(null)
const closeButton = ref(null)
const page = computed(() => (props.id ? pages[props.id] ?? null : null))
let gridScroll = 0

function close() {
  emit("close")
}

watch(page, async (value) => {
  if (!value) return
  gridScroll = window.scrollY
  document.documentElement.style.setProperty("--grid-lock", `${gridScroll}px`)
  window.scrollTo(0, 0)
  await nextTick()
  closeButton.value?.focus()
})

function onAfterLeave() {
  if (page.value) return
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
      <SlimPage v-if="page.kind === 'slim'" :page="page" />
    </div>
  </Transition>
</template>

<style scoped>
.page-layer {
  position: relative;
  z-index: 4;
  padding: 104px 0 40px;
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

.page-enter-active :deep(.slim),
.page-leave-active :deep(.slim) {
  transition: transform 520ms cubic-bezier(0.22, 1, 0.3, 1);
}

.page-enter-from .scrim,
.page-leave-to .scrim,
.page-enter-from .page-close,
.page-leave-to .page-close {
  opacity: 0;
}

.page-enter-from :deep(.slim),
.page-leave-to :deep(.slim) {
  transform: translateY(100%);
}

@media (prefers-reduced-motion: reduce) {
  .page-enter-active .scrim,
  .page-leave-active .scrim,
  .page-enter-active .page-close,
  .page-leave-active .page-close,
  .page-enter-active :deep(.slim),
  .page-leave-active :deep(.slim) {
    transition: none;
  }
}
</style>
