<script setup>
import { computed, nextTick, onMounted, onUnmounted, provide, readonly, shallowRef, watch } from "vue"
import { pages } from "./pages/pages.js"
import { layoutById, layoutFromHash, layouts } from "./layouts.js"
import { provideCardOptions } from "./options.js"
import { site } from "./site.js"
import { useViewport } from "./composables/useViewport.js"
import Board from "./board/Board.vue"
import SiteNav from "./nav/SiteNav.vue"
import StyleMenu from "./menu/StyleMenu.vue"
import PageLayer from "./pages/PageLayer.vue"
import GalleryLayer from "./gallery/GalleryLayer.vue"

const dropMs = 980
const returnMs = 740
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches

const stackRefresh = shallowRef(0)
provide("gallery-stack-refresh", readonly(stackRefresh))

const styleId = shallowRef(layoutFromHash(location.hash).id)
const menuOpen = shallowRef(false)
const navOpen = shallowRef(false)
const openId = shallowRef(null)
const phase = shallowRef("idle")
const shotLabel = shallowRef("")
const shotDismiss = shallowRef(0)
let returnFocus = null
let pageReturnFocus = null
let galleryTimer = 0

const { toggle: toggleOptions } = provideCardOptions()
const { width, ready, measure } = useViewport(() => openId.value !== null || phase.value !== "idle")
const contentHeights = shallowRef(Object.create(null))

const current = computed(() => layoutById(styleId.value))

const board = computed(() => current.value.place(current.value.items, width.value, contentHeights.value))

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

const overlay = computed(() => openId.value !== null || phase.value !== "idle")
const pageOpen = computed(() => openId.value !== null || shotLabel.value !== "")
const navLabel = computed(() => pages[openId.value]?.navTitle || shotLabel.value || site.name)
const cardsAway = computed(() => phase.value === "drop" || phase.value === "open" || phase.value === "lift")
const galleryShown = computed(() => phase.value === "open")
const galleryMotion = { enter: 1, leave: reduceMotion ? 0 : 1100 }
const baseTitle = document.title

watch(phase, (value) => {
  if (value !== "open") shotLabel.value = ""
})

watch([openId, phase, shotLabel], () => {
  const pageName = pages[openId.value]?.navTitle
  const galleryName = phase.value !== "idle" && phase.value !== "return" ? "Canvas" : ""
  const name = pageName || shotLabel.value || galleryName
  document.title = name ? `${name} — ${site.name}` : baseTitle
})

function onMeasure({ id, height }) {
  if (contentHeights.value[id] === height) return
  contentHeights.value = { ...contentHeights.value, [id]: height }
}

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
  if (id === "gallery") {
    openGallery()
    return
  }
  if (!pages[id]) return
  pageReturnFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null
  navOpen.value = false
  openId.value = id
}

function openGallery() {
  if (phase.value !== "idle") return
  returnFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null
  navOpen.value = false
  menuOpen.value = false
  document.documentElement.classList.add("is-grid-locked")
  window.clearTimeout(galleryTimer)
  if (reduceMotion) {
    phase.value = "open"
    return
  }
  phase.value = "drop"
  galleryTimer = window.setTimeout(() => {
    if (phase.value === "drop") phase.value = "open"
  }, dropMs)
}

function closeGallery() {
  if (phase.value === "open") {
    phase.value = "lift"
    return
  }
  if (phase.value !== "drop") return
  window.clearTimeout(galleryTimer)
  phase.value = "return"
  galleryTimer = window.setTimeout(finishGallery, reduceMotion ? 0 : returnMs)
}

function onGalleryLeave(el) {
  el.prepareExit?.()
}

function onGalleryLeft() {
  if (phase.value !== "lift") return
  phase.value = "return"
  window.clearTimeout(galleryTimer)
  galleryTimer = window.setTimeout(finishGallery, reduceMotion ? 0 : returnMs)
}

function finishGallery() {
  if (phase.value !== "return") return
  phase.value = "idle"
  document.documentElement.classList.remove("is-grid-locked")
  stackRefresh.value += 1
  if (openId.value) return
  const back = returnFocus
  returnFocus = null
  nextTick(() => {
    back?.focus({ preventScroll: true })
    measure()
  })
}

function closePage() {
  openId.value = null
}

function restoreFocus() {
  const back = pageReturnFocus
  pageReturnFocus = null
  back?.focus()
  measure()
}

function goHome() {
  navOpen.value = false
  menuOpen.value = false
  if (openId.value) closePage()
  if (phase.value === "drop" || phase.value === "open") closeGallery()
  if (styleId.value !== "mosaic") choose("mosaic")
  window.scrollTo(0, 0)
}

function onNavSelect(link) {
  const name = String(link).toLowerCase()
  if (name === "canvas") openGallery()
  if (name === "home") goHome()
  if (name === "about") openPage("about")
}

function onShot(label) {
  shotLabel.value = label || ""
  if (label) navOpen.value = false
}

function closeShot() {
  if (!shotLabel.value) return
  shotDismiss.value += 1
}

function toggleNav() {
  if (openId.value) {
    closePage()
    return
  }
  if (shotLabel.value) {
    closeShot()
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
    if (shotLabel.value) {
      closeShot()
      return
    }
    if (navOpen.value) {
      navOpen.value = false
      return
    }
    if (phase.value === "drop" || phase.value === "open") {
      closeGallery()
      return
    }
    menuOpen.value = false
    return
  }
  if (openId.value || phase.value !== "idle") return
  if (event.key === "a" || event.key === "A") {
    if (import.meta.env.DEV) {
      import("./agentation.js").then(({ toggleAgentation }) => toggleAgentation())
    }
    return
  }
  if (event.key === "o" || event.key === "O") {
    toggleOptions()
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
  window.clearTimeout(galleryTimer)
  document.documentElement.classList.remove("is-grid-locked")
})
</script>

<template>
  <a class="skip-link" href="#main">Skip to content</a>
  <Board
    :board="board"
    :ready="ready"
    :style-id="styleId"
    :locked="overlay"
    :away="cardsAway"
    :title="site.name"
    @open="openPage"
    @measure="onMeasure"
  />
  <SiteNav :label="navLabel" :links="site.links" :open="navOpen" :page="pageOpen" @toggle="toggleNav" @select="onNavSelect" />
  <StyleMenu
    :open="menuOpen"
    :styles="styleOptions"
    :current="styleId"
    :readout="readout"
    :locked="overlay"
    @choose="choose"
  />
  <PageLayer :id="openId" @close="closePage" @closed="restoreFocus" />
  <Transition name="gallery" :duration="galleryMotion" @before-leave="onGalleryLeave" @after-leave="onGalleryLeft">
    <GalleryLayer v-if="galleryShown" :dismiss="shotDismiss" :quiet="openId !== null" @view="onShot" />
  </Transition>
</template>
