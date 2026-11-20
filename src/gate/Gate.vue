<script setup>
import { onMounted, useTemplateRef } from "vue"

const phrase = "wip"
const emit = defineEmits(["open"])
const field = useTemplateRef("field")

function matches(value) {
  return value.toLowerCase().replace(/\s/g, "").endsWith(phrase)
}

function onInput(event) {
  if (!matches(event.target.value)) return
  emit("open")
}

onMounted(() => {
  field.value?.focus()
})
</script>

<template>
  <form class="gate" @submit.prevent>
    <input
      ref="field"
      class="gate-input"
      type="text"
      aria-label="Password"
      autocomplete="off"
      autocapitalize="off"
      spellcheck="false"
      @input="onInput"
    />
  </form>
</template>

<style scoped>
.gate {
  position: fixed;
  z-index: 100;
  inset: 0;
  display: grid;
  place-items: center;
  background: var(--paper);
}

.gate-input {
  width: 9rem;
  height: 2.5rem;
  margin: 0;
  border: 1px solid var(--ink);
  border-radius: 4px;
  padding: 0 0.75rem;
  background: #fff;
  color: var(--ink);
  font-family: "Figma Sans VF", "Figma Sans", sans-serif;
  font-size: 16px;
  font-weight: 500;
  letter-spacing: -0.03em;
  line-height: 1;
  text-align: center;
}
</style>
