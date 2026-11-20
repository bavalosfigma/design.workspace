<script setup>
defineProps({
  page: { type: Object, required: true },
})
</script>

<template>
  <div class="player-anchor">
    <article class="player">
      <div v-if="page.src" class="frame">
        <video
          class="video"
          :src="page.src"
          :aria-label="`${page.title} with ${page.guest}`"
          controls
          autoplay
          playsinline
        ></video>
      </div>
      <h2 id="page-title" class="name">
        <span v-if="page.episode" class="episode">{{ page.episode }}</span>
        {{ page.title }}<br />
        w/{{ page.guest }}
      </h2>
    </article>
  </div>
</template>

<style scoped>
.player-anchor {
  position: fixed;
  z-index: 1;
  inset: 0;
  display: grid;
  place-items: center;
  padding: 88px 24px 32px;
  pointer-events: none;
}

.player {
  width: min(880px, 100%);
  max-height: 100%;
  overflow: auto;
  pointer-events: auto;
  background: #c4baff;
  color: #000;
  box-shadow: 0 18px 50px rgba(0, 0, 0, 0.28);
  font-family: "Figma Sans VF", "Figma Sans", sans-serif;
  font-variation-settings: "wdth" 100;
}

.frame {
  position: relative;
  width: 100%;
  aspect-ratio: 1920 / 1100;
  background: #c4baff;
}

.video {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  border: 0;
  object-fit: contain;
  background: #c4baff;
}

.name {
  margin: 0;
  padding: 22px 28px 28px;
  font-size: 1.5rem;
  font-weight: 500;
  line-height: 1.05;
  letter-spacing: -0.016em;
  text-box: trim-both cap alphabetic;
}

.episode {
  display: block;
  color: #874fff;
}

@media (max-width: 720px) {
  .name {
    padding: 18px 20px 22px;
  }
}
</style>
