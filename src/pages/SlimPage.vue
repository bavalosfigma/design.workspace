<script setup>
defineProps({
  page: { type: Object, required: true },
})
</script>

<template>
  <article class="slim">
    <h1 id="page-title" class="slim-title">{{ page.title }}</h1>
    <section v-for="section in page.sections" :key="section.heading">
      <h2>{{ section.heading }}</h2>
      <p>{{ section.body }}</p>
    </section>
  </article>
</template>

<style scoped>
.slim {
  padding: 28px 36px 48px;
}

.slim-title {
  width: 100%;
  margin: 0;
  font-size: 25px;
  font-weight: 500;
  line-height: 1.2;
  letter-spacing: -0.5114px;
  text-wrap: wrap;
}

.slim h2 {
  margin: 0;
  font-size: 14px;
  font-weight: 700;
  line-height: 15.4px;
  letter-spacing: -0.63px;
}

.slim section {
  margin-top: 22px;
  padding-top: 18px;
  border-top: 1px solid rgba(28, 27, 25, 0.12);
}

.slim section p {
  margin: 10px 0 0;
  font-size: 14px;
  font-weight: 700;
  line-height: 15.4px;
  letter-spacing: -0.63px;
  color: var(--muted);
}

@media (max-width: 720px) {
  .slim {
    padding: 24px 20px 40px;
  }
}
</style>
