<script setup>
const emit = defineEmits(["open"])

function learnMore() {
  emit("open", "about")
}
</script>

<template>
  <article class="about">
    <div class="about-sheet">
      <p class="about-kicker">About</p>
      <p class="about-copy">
        Welcome to the Figma Design department. This is our space that is design as work in progress.
      </p>
      <button type="button" class="button" @click="learnMore">Learn more</button>
    </div>
  </article>
</template>

<style scoped>
.about {
  position: absolute;
  inset: 0;
  background: #fafd5d;
  border-radius: inherit;
  color: #000;
  font-family: "Figma Sans VF", "Figma Sans", sans-serif;
  font-variation-settings: "wdth" 100;
}

.about-sheet {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  margin: 0;
  padding: 1.5rem 12%;
  text-align: center;
}

.about-kicker {
  position: absolute;
  top: 20px;
  right: 16px;
  left: 16px;
  margin: 0;
  font-size: 0.875rem;
  font-weight: 700;
  line-height: 1.1;
  letter-spacing: -0.045em;
  text-box: trim-both cap alphabetic;
  color: var(--muted);
}

.about-copy {
  max-width: 440px;
  margin: 0 0 1.5rem;
  font-size: 1.5rem;
  font-weight: 500;
  line-height: 1.05;
  letter-spacing: -0.016em;
}
</style>
