<script setup>
defineProps({
  page: { type: Object, required: true },
})

const emit = defineEmits(["open"])

function openFilm() {
  emit("open", "walkthrough")
}
</script>

<template>
  <article class="catalog">
    <h1 id="page-title" class="title">
      {{ page.title }}
      <span class="lede">{{ page.lede }}</span>
    </h1>
    <ul class="films">
      <li v-for="film in page.films" :key="film.id">
        <span class="rule" aria-hidden="true"></span>
        <button type="button" class="film" @click="openFilm">
          <span class="name">{{ film.title }}</span>
          <span class="guest">w/ {{ film.guest }}</span>
        </button>
      </li>
    </ul>
  </article>
</template>

<style scoped>
.catalog {
  padding: 28px 36px 48px;
  color: #141414;
}

.title {
  margin: 0;
  font-size: 25px;
  font-weight: 500;
  line-height: 32px;
  letter-spacing: -0.5114px;
}

.lede {
  display: block;
  opacity: 0.5;
}

.films {
  margin: 0;
  padding: 22px 0 0;
  list-style: none;
}

.films li {
  margin: 0;
  padding: 0;
}

.rule {
  display: block;
  height: 24px;
  background: #efefef;
}

.film {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 4px;
  width: 100%;
  margin: 0;
  padding: 8px;
  border: 0;
  background: transparent;
  color: inherit;
  font-family: inherit;
  font-variation-settings: "wdth" 100;
  text-align: left;
  cursor: pointer;
}

.name,
.guest {
  display: block;
  width: 100%;
}

.name {
  font-size: 1.5rem;
  font-weight: 500;
  line-height: 1.05;
  letter-spacing: -0.016em;
}

.guest {
  font-size: 14px;
  font-weight: 700;
  line-height: 15.4px;
  letter-spacing: -0.63px;
  opacity: 0.4;
}

.film:hover .name,
.film:focus-visible .name {
  text-decoration: underline;
  text-decoration-thickness: 1.5px;
  text-underline-offset: 0.08em;
}

@media (max-width: 720px) {
  .catalog {
    padding: 24px 20px 40px;
  }
}
</style>
