import { createElement } from "react"
import { createRoot } from "react-dom/client"
import { Agentation } from "agentation"

let root = null
let shell = null
let open = false

function launcher() {
  return document
    .querySelector("agentation-toolbar")
    ?.shadowRoot?.querySelector('button[aria-label="Start feedback mode"], button[aria-label="Exit"]')
}

async function waitForLauncher() {
  for (let attempt = 0; attempt < 20; attempt += 1) {
    const button = launcher()
    if (button) return button
    await new Promise((resolve) => requestAnimationFrame(resolve))
  }
  return null
}

function closeAgentation() {
  root?.unmount()
  shell?.remove()
  root = null
  shell = null
  open = false
}

export async function toggleAgentation() {
  if (!import.meta.env.DEV) return
  if (open) {
    closeAgentation()
    return
  }

  shell = document.createElement("div")
  shell.hidden = true
  document.body.appendChild(shell)
  root = createRoot(shell)
  root.render(createElement(Agentation))

  const button = await waitForLauncher()
  if (!button) {
    closeAgentation()
    return
  }

  shell.hidden = false
  if (button.getAttribute("aria-label") === "Start feedback mode") button.click()
  open = true
}
