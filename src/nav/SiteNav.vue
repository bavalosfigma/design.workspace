<script setup>
import { computed } from "vue"
import closeIcon from "../assets/nav-close.svg"

const leaveMs = 360
const enterMs = 420

const { label, links, open = false, page = false } = defineProps({
  label: { type: String, required: true },
  links: { type: Array, required: true },
  open: Boolean,
  page: Boolean,
})

const emit = defineEmits(["toggle"])

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches

const showingLinks = computed(() => open && !page)
const motion = computed(() => (reduceMotion ? 0 : { leave: leaveMs, enter: enterMs }))

function toggle() {
  emit("toggle")
}
</script>

<template>
  <nav class="nav" :class="{ 'is-page': page }" :aria-label="label">
    <Transition name="nav-swap" mode="out-in" :duration="motion">
      <div v-if="showingLinks" key="open" class="nav-open">
        <button type="button" class="nav-close" aria-label="Close" aria-expanded="true" @click="toggle">
          <img class="nav-close-icon" :src="closeIcon" alt="" />
        </button>
        <div class="nav-links">
          <button v-for="link in links" :key="link" type="button" class="nav-link">{{ link }}</button>
        </div>
        <span class="nav-balance" aria-hidden="true"></span>
      </div>
      <div v-else key="closed" class="nav-bar">
        <div class="nav-name">
          <p class="nav-title">{{ label }}</p>
        </div>
        <button type="button" class="nav-menu" :aria-expanded="page ? undefined : false" @click="toggle">
          <span class="nav-menu-label">{{ page ? "Close" : "Menu" }}</span>
        </button>
      </div>
    </Transition>
  </nav>
</template>

<style scoped>
.nav {
  position: fixed;
  z-index: 50;
  top: 40px;
  left: 50%;
  display: flex;
  width: max-content;
  min-width: 346px;
  height: 39px;
  transform: translateX(-50%);
  transform-origin: center top;
  font-family: "Figma Sans VF", "Figma Sans", sans-serif;
  font-size: 16px;
  font-weight: 500;
  font-variation-settings: "wdth" 100;
  letter-spacing: -0.2557px;
  line-height: 1.2;
  --leave: 360ms;
  --enter: 420ms;
}

.nav-bar,
.nav-open {
  display: flex;
  align-items: center;
  width: 346px;
  height: 39px;
  overflow: hidden;
  background: #000;
  color: #fff;
}

.nav-open {
  justify-content: space-between;
  padding: 0 16px;
}

.nav-name,
.nav-menu {
  display: flex;
  align-items: center;
  height: 39px;
  margin: 0;
  white-space: nowrap;
}

.nav-name {
  flex: none;
  width: max-content;
  min-width: 272px;
  padding: 0 8px 0 16px;
}

.nav-title,
.nav-menu-label {
  margin: 0;
}

.nav-menu {
  flex: none;
  justify-content: center;
  width: 74px;
  padding: 0 8px;
  border: 0;
  background: #67ff7f;
  color: #000;
  font: inherit;
  letter-spacing: inherit;
  cursor: pointer;
}

.nav.is-page .nav-name {
  width: 272px;
  min-width: 272px;
  padding: 0 8px;
}

.nav.is-page .nav-menu {
  background: linear-gradient(rgb(255 255 255 / 0.3), rgb(255 255 255 / 0.3)), #000;
  color: #fff;
}

.nav-menu:focus-visible {
  outline: 1px solid #000;
  outline-offset: -3px;
}

.nav.is-page .nav-menu:focus-visible {
  outline-color: #fff;
}

.nav-close:focus-visible {
  outline: 1px solid #fff;
  outline-offset: 3px;
}

.nav-close {
  position: relative;
  flex: none;
  width: 12px;
  height: 12px;
  margin: 0;
  padding: 0;
  border: 0;
  background: transparent;
  color: inherit;
  cursor: pointer;
}

.nav-close-icon {
  position: absolute;
  top: 0.15px;
  left: 0.65px;
  display: block;
  max-width: none;
}

.nav-balance {
  flex: none;
  width: 12px;
  height: 12px;
}

.nav-links {
  display: flex;
  align-items: center;
  gap: 16px;
}

.nav-link {
  margin: 0;
  padding: 0;
  border: 0;
  background: transparent;
  color: inherit;
  font: inherit;
  letter-spacing: inherit;
  white-space: nowrap;
  cursor: pointer;
}

.nav-link:focus-visible {
  outline: 1px solid #fff;
  outline-offset: 2px;
}

.nav-swap-leave-active .nav-title {
  animation: nav-fade-out var(--leave) ease-in forwards;
}

.nav-swap-leave-active .nav-menu {
  animation: nav-slide-out var(--leave) ease-in forwards;
}

.nav-swap-leave-active .nav-close {
  animation: nav-x-out var(--leave) ease-in forwards;
}

.nav-swap-leave-active .nav-links {
  animation: nav-fade-out var(--leave) ease-in forwards;
}

.nav-swap-enter-active .nav-close {
  animation: nav-x-in var(--enter) cubic-bezier(0.22, 1, 0.36, 1);
}

.nav-swap-enter-active .nav-links {
  animation: nav-fade-in var(--enter) ease-out;
}

.nav-swap-enter-active .nav-title {
  animation: nav-fade-in var(--enter) ease-out;
}

.nav-swap-enter-active .nav-menu {
  animation: nav-slide-in var(--enter) cubic-bezier(0.22, 1, 0.36, 1);
}

@keyframes nav-fade-out {
  to {
    opacity: 0;
  }
}

@keyframes nav-fade-in {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}

@keyframes nav-slide-out {
  to {
    transform: translateX(100%);
  }
}

@keyframes nav-slide-in {
  from {
    transform: translateX(100%);
  }

  to {
    transform: translateX(0);
  }
}

@keyframes nav-x-in {
  from {
    transform: translateX(-40px);
  }

  to {
    transform: translateX(0);
  }
}

@keyframes nav-x-out {
  to {
    transform: translateX(-40px);
  }
}

@media (prefers-reduced-motion: reduce) {
  .nav-swap-leave-active .nav-title,
  .nav-swap-leave-active .nav-menu,
  .nav-swap-leave-active .nav-close,
  .nav-swap-leave-active .nav-links,
  .nav-swap-enter-active .nav-close,
  .nav-swap-enter-active .nav-links,
  .nav-swap-enter-active .nav-title,
  .nav-swap-enter-active .nav-menu {
    animation: none;
  }
}
</style>
