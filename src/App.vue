<script setup>
import { computed, nextTick, onMounted, onUnmounted, provide, readonly, shallowRef, watch } from "vue"
import { resolvePage } from "./pages/pages.js"
import { layoutById, layoutFromHash, layouts } from "./layouts.js"
import { layoutMosaic } from "./mosaic.js"
import { layoutFilms } from "./walkthrough/layout.js"
import HomeIntro from "./home/HomeIntro.vue"
import { provideCardOptions } from "./options.js"
import { site } from "./site.js"
import { useViewport } from "./composables/useViewport.js"
import Board from "./board/Board.vue"
import SiteNav from "./nav/SiteNav.vue"
import StyleMenu from "./menu/StyleMenu.vue"
import PageLayer from "./pages/PageLayer.vue"
import GalleryLayer from "./gallery/GalleryLayer.vue"
import Gate from "./gate/Gate.vue"

const gateKey = "wip-open"

function storedOpen() {
  try {
    return sessionStorage.getItem(gateKey) === "1"
  } catch {
    return false
  }
}

const unlocked = shallowRef(storedOpen())

function unlock() {
  unlocked.value = true
  try {
    sessionStorage.setItem(gateKey, "1")
  } catch {
    // Storage can be blocked. The page still opens for this load.
  }
}

const dropMs = 980
const returnMs = 740
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches

const stackRefresh = shallowRef(0)
provide("gallery-stack-refresh", readonly(stackRefresh))

const styleId = shallowRef(layoutFromHash(location.hash).id)
const cursors = shallowRef(false)
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
const underId = shallowRef(null)
let catalogScroll = 0

const wallPhase = shallowRef("idle")
const arriving = shallowRef(false)
let wallTimer = 0

const { width, ready, measure } = useViewport(() => {
  const page = resolvePage(openId.value)
  const blocking = Boolean(page && page.kind !== "rearrange")
  return blocking || phase.value !== "idle" || wallPhase.value !== "idle"
})
const contentHeights = shallowRef(Object.create(null))
const introSpace = shallowRef(0)

const current = computed(() => layoutById(styleId.value))

const filmPage = computed(() => {
  const open = resolvePage(openId.value)
  const under = resolvePage(underId.value)
  const page = open?.kind === "rearrange" ? open : under?.kind === "rearrange" ? under : null
  if (wallPhase.value === "leaving") return null
  return page
})

const showIntro = computed(() => styleId.value === "mosaic" && filmPage.value == null)

const board = computed(() => {
  const films = filmPage.value
  if (films) return layoutFilms(films.films, width.value, contentHeights.value)
  if (showIntro.value) {
    const top = introSpace.value > 0 ? introSpace.value : Math.max(window.innerHeight - 96, 320)
    return layoutMosaic(current.value.items, width.value, contentHeights.value, top)
  }
  return current.value.place(current.value.items, width.value, contentHeights.value)
})

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
const boardLocked = computed(() => {
  if (wallPhase.value !== "idle") return true
  const page = resolvePage(openId.value)
  if (page?.kind === "rearrange") return phase.value !== "idle"
  return overlay.value
})
const pageOpen = computed(() => openId.value !== null || shotLabel.value !== "")
const navLabel = computed(() => resolvePage(openId.value)?.navTitle || shotLabel.value || site.name)
const cardsAway = computed(
  () =>
    phase.value === "drop" ||
    phase.value === "open" ||
    phase.value === "lift" ||
    wallPhase.value === "leaving" ||
    wallPhase.value === "returning",
)
const galleryShown = computed(() => phase.value === "open")
const galleryMotion = { enter: 1, leave: reduceMotion ? 0 : 1100 }
const baseTitle = document.title

watch(phase, (value) => {
  if (value !== "open") shotLabel.value = ""
})

watch([openId, phase, shotLabel], () => {
  const pageName = resolvePage(openId.value)?.navTitle
  const galleryName = phase.value !== "idle" && phase.value !== "return" ? "Gallery" : ""
  const name = pageName || shotLabel.value || galleryName
  document.title = name ? `${name} — ${site.name}` : baseTitle
})

function onMeasure({ id, height }) {
  if (contentHeights.value[id] === height) return
  contentHeights.value = { ...contentHeights.value, [id]: height }
}

function onIntroMeasure(height) {
  if (introSpace.value === height) return
  introSpace.value = height
}

function choose(id) {
  const layout = layoutById(id)
  styleId.value = layout.id
  history.replaceState(null, "", layout.hash || location.pathname + location.search)
}

function toggleCursors() {
  cursors.value = !cursors.value
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
  const next = resolvePage(id)
  if (!next) return
  const currentPage = resolvePage(openId.value)
  if (openId.value === null) {
    pageReturnFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null
  }
  if (next.kind === "rearrange" && currentPage?.kind !== "rearrange") {
    beginWall(id)
    return
  }
  if (currentPage?.kind === "rearrange" && next.kind !== "rearrange") underId.value = openId.value
  navOpen.value = false
  openId.value = id
}

function releaseWallLock() {
  if (phase.value === "idle" || phase.value === "return") {
    document.documentElement.classList.remove("is-grid-locked")
  }
}

function beginWall(id) {
  catalogScroll = window.scrollY
  navOpen.value = false
  underId.value = null
  openId.value = id
  if (reduceMotion) {
    window.scrollTo(0, 0)
    return
  }
  arriving.value = false
  wallPhase.value = "leaving"
  document.documentElement.classList.add("is-grid-locked")
  window.clearTimeout(wallTimer)
  wallTimer = window.setTimeout(finishLeave, dropMs)
}

function finishLeave() {
  if (wallPhase.value !== "leaving") return
  arriving.value = true
  wallPhase.value = "idle"
  nextTick(() => {
    window.scrollTo(0, 0)
    releaseWallLock()
  })
}

function beginReturn() {
  if (wallPhase.value === "returning") return
  if (reduceMotion || wallPhase.value === "leaving") {
    window.clearTimeout(wallTimer)
    const y = wallPhase.value === "leaving" ? window.scrollY : catalogScroll
    wallPhase.value = "idle"
    arriving.value = false
    openId.value = null
    underId.value = null
    releaseWallLock()
    nextTick(() => {
      window.scrollTo(0, y)
      restoreFocus()
    })
    return
  }
  wallPhase.value = "returning"
  document.documentElement.classList.add("is-grid-locked")
  window.clearTimeout(wallTimer)
  wallTimer = window.setTimeout(finishReturn, dropMs)
}

function finishReturn() {
  if (wallPhase.value !== "returning") return
  const y = catalogScroll
  arriving.value = true
  openId.value = null
  underId.value = null
  wallPhase.value = "idle"
  nextTick(() => {
    window.scrollTo(0, y)
    releaseWallLock()
    restoreFocus()
  })
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
  const currentPage = resolvePage(openId.value)
  if (wallPhase.value === "leaving" || wallPhase.value === "returning" || currentPage?.kind === "rearrange") {
    beginReturn()
    return
  }
  if (underId.value && currentPage?.kind !== "rearrange") {
    openId.value = underId.value
    underId.value = null
    return
  }
  openId.value = null
  underId.value = null
}

function restoreFocus() {
  if (resolvePage(openId.value)) return
  const back = pageReturnFocus
  pageReturnFocus = null
  back?.focus({ preventScroll: true })
  measure()
}

function goHome() {
  navOpen.value = false
  menuOpen.value = false
  window.clearTimeout(wallTimer)
  wallPhase.value = "idle"
  arriving.value = false
  underId.value = null
  if (openId.value) openId.value = null
  releaseWallLock()
  if (phase.value === "drop" || phase.value === "open") closeGallery()
  if (styleId.value !== "mosaic") choose("mosaic")
  window.scrollTo(0, 0)
}

function onNavSelect(link) {
  const name = String(link).toLowerCase()
  if (name === "gallery") openGallery()
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
  if (!unlocked.value) return
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
  window.clearTimeout(wallTimer)
  document.documentElement.classList.remove("is-grid-locked")
})
</script>

<template>
  <Gate v-if="!unlocked" @open="unlock" />
  <template v-else>
    <a class="skip-link" href="#main">Skip to content</a>
    <Board
      :board="board"
      :ready="ready"
      :style-id="styleId"
      :locked="boardLocked"
      :away="cardsAway"
      :arrive="arriving"
      :title="site.name"
      @open="openPage"
      @measure="onMeasure"
    >
      <HomeIntro v-if="showIntro" :hidden="overlay" :cursors="cursors" @measure="onIntroMeasure" @open="openPage" />
    </Board>
    <SiteNav :label="navLabel" :links="site.links" :open="navOpen" :page="pageOpen" @toggle="toggleNav" @select="onNavSelect" />
    <StyleMenu
      :open="menuOpen"
      :styles="styleOptions"
      :current="styleId"
      :readout="readout"
      :locked="overlay"
      :cursors="cursors"
      @choose="choose"
      @cursors="toggleCursors"
    />
    <PageLayer :id="openId" @close="closePage" @closed="restoreFocus" />
    <Transition name="gallery" :duration="galleryMotion" @before-leave="onGalleryLeave" @after-leave="onGalleryLeft">
      <GalleryLayer v-if="galleryShown" :dismiss="shotDismiss" :quiet="openId !== null" @view="onShot" />
    </Transition>
  </template>
</template>
