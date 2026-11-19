<script setup>
const articles = [
  {
    title: "How to move fast toward the right thing",
    author: "Jake Albuah",
    href: "https://www.figma.com/blog/how-to-move-fast-toward-the-right-thing/",
  },
  {
    title: "GPT-5.6 is now available in Figma Make",
    author: "Gui Seiz",
    href: "https://www.figma.com/blog/gpt-5-6-is-now-available-in-figma-make/",
  },
  {
    title: "Behind the build: Generative plugins and shaders at Figma",
    author: "Rogie King",
    href: "https://www.figma.com/blog/how-we-built-generative-plugins-and-shaders/",
  },
]
</script>

<template>
  <article class="articles">
    <h2 class="label">Articles</h2>
    <ul class="list">
      <li v-for="article in articles" :key="article.href" class="item">
        <a class="article" :href="article.href" target="_blank" rel="noopener noreferrer">
          <span class="rule" aria-hidden="true"></span>
          <span class="copy">
            <span class="title">{{ article.title }}</span>
            <span class="byline">by {{ article.author }}</span>
          </span>
          <span class="visually-hidden">Opens in a new window.</span>
        </a>
      </li>
    </ul>
  </article>
</template>

<style scoped>
.articles {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 37px;
  padding: 20px 14px;
  background: #ffc9c1;
  border-radius: inherit;
  color: #000;
  font-family: "Figma Sans VF", "Figma Sans", sans-serif;
  font-variation-settings: "wdth" 100;
}

.label {
  margin: 0;
  font-size: 14px;
  font-weight: 700;
  line-height: 15.4px;
  letter-spacing: -0.63px;
}

.list {
  display: flex;
  flex-direction: column;
  gap: 6px;
  width: 100%;
  margin: 0;
  padding: 0;
  list-style: none;
}

.item {
  margin: 0;
  padding: 0;
}

.article {
  display: flex;
  flex-direction: column;
  gap: 6px;
  color: inherit;
  text-decoration: none;
}

.article:focus-visible {
  outline: 2px solid #000;
  outline-offset: 2px;
}

.article:hover .title,
.article:focus-visible .title {
  text-decoration: underline;
  text-decoration-thickness: 1.5px;
  text-underline-offset: 0.08em;
}

.rule {
  display: block;
  height: 11px;
  background: rgba(0, 0, 0, 0.1);
}

.copy {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.title,
.byline {
  display: block;
}

.title {
  font-size: 1.5rem;
  font-weight: 500;
  line-height: 1.05;
  letter-spacing: -0.016em;
}

.byline {
  font-size: 14px;
  font-weight: 700;
  line-height: 15.4px;
  letter-spacing: -0.63px;
  opacity: 0.4;
}
</style>
