<script setup>
import { pages } from "../pages/pages.js"

const emit = defineEmits(["open"])

const film = pages.walkthrough

function play() {
  emit("open", film.id)
}

function viewAll() {
  emit("open", "walkthroughs")
}
</script>

<template>
  <article class="walk">
    <p class="label">File walkthrough</p>
    <div class="stack">
      <p class="title">
        <span class="episode">{{ film.episode }}</span>
        {{ film.title }}<br />
        w/{{ film.guest }}
      </p>
      <div class="actions">
        <button
          type="button"
          class="button watch"
          :aria-label="`Watch ${film.title} with ${film.guest}`"
          @click="play"
        >
          Watch
        </button>
        <button type="button" class="button all" aria-label="View all file walkthroughs" @click="viewAll">View all</button>
      </div>
    </div>
  </article>
</template>

<style scoped>
.walk {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 24px;
  padding: 25px 22px;
  background: #c4baff;
  border-radius: inherit;
  color: #000;
  font-family: "Figma Sans VF", "Figma Sans", sans-serif;
  font-variation-settings: "wdth" 100;
}

.label,
.title {
  width: 100%;
  margin: 0;
}

.label {
  font-size: 14px;
  font-weight: 700;
  line-height: 15.4px;
  letter-spacing: -0.63px;
}

.stack {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 120px;
  width: 100%;
}

.title {
  font-size: 1.5rem;
  font-weight: 500;
  line-height: 1.05;
  letter-spacing: -0.016em;
}

.episode {
  display: block;
  color: #874fff;
}

.actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
}

.all,
.watch {
  flex: none;
  padding-inline: 24px;
}
</style>
