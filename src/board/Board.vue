<script setup>
import { computed, onBeforeUnmount, onMounted, shallowRef, useTemplateRef, watch } from "vue"
import { cards } from "../cards.js"

const { board, ready = false, styleId, locked = false, away = false, title } = defineProps({
  board: { type: Object, required: true },
  ready: Boolean,
  styleId: { type: String, required: true },
  locked: Boolean,
  away: Boolean,
  title: { type: String, required: true },
})

const emit = defineEmits(["open", "measure"])

const frame = useTemplateRef("frame")
let hugObserver

const frameStyle = computed(() => ({
  width: `${board.boardWidth}px`,
  height: `${board.rows * board.cell}px`,
  marginLeft: `${board.origin}px`,
}))

const falls = shallowRef(Object.create(null))

watch(
  () => away,
  (isAway) => {
    if (!isAway) return
    falls.value = measureFalls(board.items, window.scrollY, window.innerHeight)
  },
  { flush: "sync" },
)

const placed = computed(() =>
  board.items.map((item) => {
    const fall = falls.value[item.id]
    return {
      id: item.id,
      hug: Boolean(item.hug),
      card: item.widget ? cards[item.widget] ?? null : null,
      style: {
        left: `${item.x}px`,
        top: `${item.y}px`,
        width: `${item.w}px`,
        height: item.hug ? "auto" : `${item.h}px`,
        ...(fall
          ? {
              "--fall": fall.y,
              "--tilt": fall.tilt,
              "--drift": fall.drift,
              "--drop-delay": fall.delay,
            }
          : {}),
      },
    }
  }),
)

function reportHug(node) {
  const id = node.dataset.module
  const item = board.items.find((entry) => entry.id === id)
  const box = node.getBoundingClientRect()
  const height = Math.round(box.height)
  if (!item?.hug || height < 1 || Math.abs(item.h - height) <= 1) return
  emit("measure", { id, height })
}

function observeHugs() {
  hugObserver?.disconnect()
  const root = frame.value
  if (!root || !hugObserver) return
  root.querySelectorAll("[data-hug]").forEach((node) => hugObserver.observe(node))
}

onMounted(() => {
  hugObserver = new ResizeObserver((entries) => {
    entries.forEach((entry) => reportHug(entry.target))
  })
  observeHugs()
})

onBeforeUnmount(() => {
  hugObserver?.disconnect()
})

watch(
  () => board.items.map((item) => `${item.id}:${item.hug ? 1 : 0}`).join("|"),
  () => observeHugs(),
  { flush: "post" },
)

function measureFalls(items, scroll, height) {
  const next = Object.create(null)
  items.forEach((item, index) => {
    const top = item.y - scroll
    const bottom = top + item.h
    let distance = 0
    if (bottom < 0) distance = top - 48
    else if (top <= height + 8) distance = height - top + 64
    const delay = top > height || bottom < 0 ? 0 : Math.round((1 - Math.min(Math.max(top, 0), height) / height) * 160)
    next[item.id] = {
      y: `${Math.round(distance)}px`,
      tilt: `${(((index % 7) - 3) * 1.4).toFixed(2)}deg`,
      drift: `${((index % 5) - 2) * 18}px`,
      delay: `${delay}ms`,
    }
  })
  return next
}
</script>

<template>
  <main
    ref="frame"
    id="main"
    tabindex="-1"
    class="board"
    :class="{ 'is-ready': ready, 'is-away': away }"
    :inert="locked ? true : undefined"
    :data-page="styleId"
    :data-mode="board.mode"
    :style="frameStyle"
  >
    <h1 class="visually-hidden">{{ title }}</h1>
    <div
      v-for="item in placed"
      :key="item.id"
      class="module"
      :data-module="item.id"
      :data-hug="item.hug ? '' : undefined"
      :style="item.style"
    >
      <component :is="item.card" v-if="item.card" @open="emit('open', $event)" />
    </div>
  </main>
</template>
