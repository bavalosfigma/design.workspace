<script setup>
const { open = false, styles, current, readout, locked = false, cursors = false } = defineProps({
  open: Boolean,
  styles: { type: Array, required: true },
  current: { type: String, required: true },
  readout: { type: Array, required: true },
  locked: Boolean,
  cursors: Boolean,
})

const emit = defineEmits(["choose", "cursors"])

function choose(id) {
  emit("choose", id)
}

function toggleCursors() {
  emit("cursors")
}
</script>

<template>
  <Transition name="menu">
    <aside v-if="open" class="menu" aria-label="Grid styles" :inert="locked ? true : undefined">
      <header class="menu-head">
        <span>Styles</span>
        <kbd class="menu-key">M</kbd>
      </header>
      <div class="menu-styles">
        <button
          v-for="style in styles"
          :key="style.id"
          type="button"
          class="menu-style"
          :class="{ 'is-on': current === style.id }"
          :aria-pressed="current === style.id"
          @click="choose(style.id)"
        >
          <span>{{ style.name }}</span>
          <span>{{ style.count }}</span>
        </button>
      </div>
      <button type="button" class="menu-style menu-option" :class="{ 'is-on': cursors }" :aria-pressed="cursors" @click="toggleCursors">
        <span>Cursors</span>
        <span>{{ cursors ? "On" : "Off" }}</span>
      </button>
      <dl class="menu-readout">
        <div v-for="row in readout" :key="row.label" class="menu-row">
          <dt>{{ row.label }}</dt>
          <dd class="menu-value">{{ row.value }}</dd>
        </div>
      </dl>
    </aside>
  </Transition>
</template>

<style scoped>
.menu {
  position: fixed;
  top: 16px;
  left: 16px;
  z-index: 2;
  min-width: 168px;
  padding: 10px 12px 12px;
  background: var(--paper);
  color: #1c1b19;
  border-radius: 4px;
  box-shadow: 0 0 0 1px rgba(28, 27, 25, 0.16);
  font-family: ui-monospace, "SF Mono", Menlo, monospace;
  font-size: 11px;
  line-height: 1.45;
}

.menu-head,
.menu-style,
.menu-row {
  display: flex;
  justify-content: space-between;
  gap: 16px;
}

.menu-head {
  color: var(--muted);
}

.menu-key {
  font: inherit;
}

.menu-styles {
  display: grid;
  margin: 6px -12px 0;
}

.menu-style {
  margin: 0;
  padding: 2px 12px;
  border: 0;
  background: transparent;
  color: inherit;
  font: inherit;
  text-align: left;
}

.menu-style.menu-option {
  width: calc(100% + 24px);
  margin: 6px -12px 0;
  padding-top: 8px;
  border-top: 1px solid rgba(28, 27, 25, 0.12);
}

.menu-style.is-on {
  background: var(--module);
}

.menu-readout {
  margin: 8px 0 0;
  padding-top: 8px;
  border-top: 1px solid rgba(28, 27, 25, 0.12);
}

.menu-value {
  margin: 0;
  font-variant-numeric: tabular-nums;
}

.menu-enter-active,
.menu-leave-active {
  transition:
    opacity 240ms ease,
    transform var(--move) var(--ease);
}

.menu-enter-from,
.menu-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

@media (prefers-reduced-motion: reduce) {
  .menu-enter-active,
  .menu-leave-active {
    transition: none;
  }
}
</style>
