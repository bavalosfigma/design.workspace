import { createApp } from "vue"
import App from "./App.vue"
import { listenForClicks } from "./click.js"
import "./styles.css"

listenForClicks()
createApp(App).mount("#app")
