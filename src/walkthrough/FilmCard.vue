<script setup>
const { film } = defineProps({
  film: { type: Object, required: true },
})

const emit = defineEmits(["open"])

function play() {
  emit("open", film.id)
}
</script>

<template>
  <article
    class="film"
    :style="{
      '--film-bg': film.tone.bg,
      '--film-accent': film.tone.accent,
      '--film-ink': film.tone.ink,
    }"
  >
    <p class="label">File walkthrough</p>
    <div class="stack">
      <p class="title">
        <span class="episode">{{ film.episode }}</span>
        {{ film.title }}<br />
        w/{{ film.guest }}
      </p>
      <div class="actions">
        <button type="button" class="button watch" :aria-label="`Watch ${film.title} with ${film.guest}`" @click="play">
          Watch
        </button>
      </div>
    </div>
  </article>
</template>

<style scoped>
.film {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 24px;
  width: 100%;
  padding: 25px 22px;
  border-radius: inherit;
  background: var(--film-bg);
  color: var(--film-ink);
  font-family: "Figma Sans VF", "Figma Sans", sans-serif;
  font-variation-settings: "wdth" 100;
  container-type: inline-size;
}

.label,
.title {
  width: 100%;
  margin: 0;
}

.label {
  /* Same sizes as the home walk card. 337px is the text column in the 381px card, so type and the title-to-button gap stay put at that size and only shrink when the column does. */
  font-size: min(14px, calc(100cqw * 14 / 337));
  font-weight: 700;
  line-height: 15.4px;
  letter-spacing: -0.63px;
}

.stack {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: min(120px, calc(100cqw * 120 / 337));
  width: 100%;
}

.title {
  font-size: min(1.5rem, calc(100cqw * 1.5rem / 337px));
  font-weight: 500;
  line-height: 1.05;
  letter-spacing: -0.016em;
}

.episode {
  display: block;
  color: var(--film-accent);
}

.actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
}

.watch {
  flex: none;
  padding-inline: 24px;
  background: color-mix(in srgb, currentColor 10%, transparent);
  color: inherit;
}

.watch:hover {
  background: color-mix(in srgb, currentColor 16%, transparent);
}

.watch:active {
  background: color-mix(in srgb, currentColor 22%, transparent);
}

.watch:focus-visible {
  outline: 2px solid currentColor;
  outline-offset: 3px;
}
</style>
