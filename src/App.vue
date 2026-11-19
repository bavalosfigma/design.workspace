<script setup>
import { computed, onMounted, onUnmounted, shallowRef } from "vue"
import { pages } from "./pages/pages.js"
import { layoutById, layoutFromHash, layouts } from "./layouts.js"
import { site } from "./site.js"
import { useViewport } from "./composables/useViewport.js"
import Board from "./board/Board.vue"
import SiteNav from "./nav/SiteNav.vue"
import StyleMenu from "./menu/StyleMenu.vue"
import PageLayer from "./pages/PageLayer.vue"

const styleId = shallowRef(layoutFromHash(location.hash).id)
const menuOpen = shallowRef(false)
const navOpen = shallowRef(false)
const openId = shallowRef(null)
let returnFocus = null

const { width, ready, measure } = useViewport(() => openId.value !== null)

const current = computed(() => layoutById(styleId.value))

const board = computed(() => current.value.place(current.value.items, width.value))

const styleOptions = computed(() =>
  layouts.map((layout) => ({
    id: layout.id,
    name: layout.name,
    count: layout.items.length,
  })),
)

const readout = computed(() => [
  { label: "width", value: `${width.value}px` },
  { label: "mode", value: board.value.mode },
  { label: "columns", value: String(board.value.columns) },
  { label: "gap", value: `${board.value.gap}px` },
])

const navLabel = computed(() => pages[openId.value]?.navTitle || site.name)

function choose(id) {
  const layout = layoutById(id)
  styleId.value = layout.id
  history.replaceState(null, "", layout.hash || location.pathname + location.search)
}

function isTyping(event) {
  const target = event.composedPath?.()[0] || event.target
  const tag = target?.tagName
  return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || target?.isContentEditable
}

function openPage(id) {
  if (!pages[id]) return
  returnFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null
  navOpen.value = false
  openId.value = id
}

function closePage() {
  openId.value = null
}

function restoreFocus() {
  const back = returnFocus
  returnFocus = null
  back?.focus()
  measure()
}

function toggleNav() {
  if (openId.value) {
    closePage()
    return
  }
  navOpen.value = !navOpen.value
}

function onKey(event) {
  if (event.repeat || event.metaKey || event.ctrlKey || event.altKey) return
  if (isTyping(event)) return
  if (event.key === "Escape") {
    if (openId.value) {
      closePage()
      return
    }
    menuOpen.value = false
    navOpen.value = false
    return
  }
  if (openId.value) return
  if (event.key === "a" || event.key === "A") {
    if (import.meta.env.DEV) {
      import("./agentation.js").then(({ toggleAgentation }) => toggleAgentation())
    }
    return
  }
  if (event.key !== "m" && event.key !== "M") return
  menuOpen.value = !menuOpen.value
}

onMounted(() => {
  window.addEventListener("keydown", onKey)
})

onUnmounted(() => {
  window.removeEventListener("keydown", onKey)
})
</script>

<template>
  <Board :board="board" :ready="ready" :style-id="styleId" :locked="openId !== null" @open="openPage" />
  <SiteNav :label="navLabel" :links="site.links" :open="navOpen" :page="openId !== null" @toggle="toggleNav" />
  <StyleMenu :open="menuOpen" :styles="styleOptions" :current="styleId" :readout="readout" @choose="choose" />
  <PageLayer :id="openId" @close="closePage" @closed="restoreFocus" />
</template>
