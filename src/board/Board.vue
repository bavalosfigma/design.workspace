<script setup>
import { computed } from "vue"
import { cards } from "../cards.js"

const { board, ready = false, styleId, locked = false } = defineProps({
  board: { type: Object, required: true },
  ready: Boolean,
  styleId: { type: String, required: true },
  locked: Boolean,
})

const emit = defineEmits(["open"])

const frameStyle = computed(() => ({
  width: `${board.boardWidth}px`,
  height: `${board.rows * board.cell}px`,
  marginLeft: `${board.origin}px`,
}))

const placed = computed(() =>
  board.items.map((item) => ({
    id: item.id,
    card: item.widget ? cards[item.widget] ?? null : null,
    style: {
      left: `${item.x}px`,
      top: `${item.y}px`,
      width: `${item.w}px`,
      height: `${item.h}px`,
    },
  })),
)
</script>

<template>
  <main
    class="board"
    :class="{ 'is-ready': ready }"
    :inert="locked ? true : undefined"
    :data-page="styleId"
    :data-mode="board.mode"
    :style="frameStyle"
  >
    <div v-for="item in placed" :key="item.id" class="module" :data-module="item.id" :style="item.style">
      <component :is="item.card" v-if="item.card" @open="emit('open', $event)" />
    </div>
  </main>
</template>
