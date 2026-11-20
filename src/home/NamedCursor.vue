<script setup>
import { computed } from "vue"

const { name, color = "#14AE5C" } = defineProps({
  name: { type: String, required: true },
  color: String,
})

const tone = computed(() => ({
  "--cursor": color,
  "--cursor-ink": inkFor(color),
}))

function inkFor(value) {
  const channels = hexChannels(value)
  if (!channels) return "#fff"
  const [red, green, blue] = channels
  const luminance = (0.2126 * red + 0.7152 * green + 0.0722 * blue) / 255
  return luminance > 0.72 ? "rgba(0, 0, 0, 0.9)" : "#fff"
}

function hexChannels(value) {
  const hex = String(value).trim().replace("#", "")
  const full = hex.length === 3 ? hex.replace(/./g, (digit) => digit + digit) : hex
  if (!/^[0-9a-fA-F]{6}$/.test(full)) return null
  return [full.slice(0, 2), full.slice(2, 4), full.slice(4, 6)].map((channel) => parseInt(channel, 16))
}
</script>

<template>
  <span class="named-cursor" :style="tone" aria-hidden="true">
    <span class="named-cursor-pointer">
      <svg class="named-cursor-svg" viewBox="0 0 17 17">
        <path
          class="named-cursor-edge"
          fill-rule="evenodd"
          clip-rule="evenodd"
          d="M2.93938 2.93938C3.35531 2.52345 3.97597 2.38901 4.52673 2.59555L15.5267 6.72055C16.1416 6.95111 16.535 7.55477 16.4976 8.21034C16.4603 8.86592 16.0009 9.421 15.3638 9.58026L10.737 10.737L9.58026 15.3638C9.421 16.0009 8.86592 16.4603 8.21034 16.4976C7.55477 16.535 6.95111 16.1416 6.72055 15.5267L2.59555 4.52673C2.38901 3.97597 2.52345 3.35531 2.93938 2.93938Z"
        />
        <path
          class="named-cursor-fill"
          fill-rule="evenodd"
          clip-rule="evenodd"
          d="M4.17558 3.53185C3.99199 3.463 3.7851 3.50782 3.64646 3.64646C3.50782 3.7851 3.463 3.99199 3.53185 4.17558L7.65685 15.1756C7.7337 15.3805 7.93492 15.5117 8.15345 15.4992C8.37197 15.4868 8.557 15.3336 8.61009 15.1213L9.91232 9.91232L15.1213 8.61009C15.3336 8.557 15.4868 8.37197 15.4992 8.15345C15.5117 7.93492 15.3805 7.7337 15.1756 7.65685L4.17558 3.53185Z"
        />
      </svg>
    </span>
    <span class="named-cursor-name">{{ name }}</span>
  </span>
</template>

<style>
@font-face {
  font-family: Inter;
  font-style: normal;
  font-weight: 100 900;
  font-display: swap;
  src: url("../assets/fonts/inter-latin.woff2") format("woff2");
}
</style>

<style scoped>
.named-cursor {
  --s: 1.7143;
  position: relative;
  display: inline-block;
  width: calc(17px * var(--s));
  height: calc(17px * var(--s));
  color: var(--cursor-ink, #fff);
  line-height: 0;
}

.named-cursor-pointer {
  display: block;
  filter: drop-shadow(0 calc(1px * var(--s)) calc(1.5px * var(--s)) rgba(0, 0, 0, 0.35));
}

.named-cursor-svg {
  display: block;
  width: 100%;
  height: 100%;
  overflow: visible;
}

.named-cursor-edge {
  fill: #fff;
}

.named-cursor-fill {
  fill: var(--cursor, #14ae5c);
}

.named-cursor-name {
  position: absolute;
  top: calc(16px * var(--s));
  left: calc(16px * var(--s));
  display: flex;
  align-items: center;
  height: calc(18px * var(--s));
  padding: 0 calc(5px * var(--s));
  border-radius: calc(2px * var(--s));
  background: var(--cursor, #14ae5c);
  box-shadow: 0 calc(1px * var(--s)) calc(3px * var(--s)) rgba(0, 0, 0, 0.1);
  color: inherit;
  font-family: Inter, sans-serif;
  font-size: calc(11px * var(--s));
  font-weight: 550;
  font-variation-settings: "wght" 550;
  letter-spacing: 0.005em;
  line-height: calc(16px * var(--s));
  white-space: nowrap;
}
</style>
