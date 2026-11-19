import clickUrl from "./assets/click.wav"

const click = new Audio(clickUrl)
click.preload = "auto"
click.volume = 0.5

function playClick() {
  click.currentTime = 0
  const played = click.play()
  if (played) played.catch(() => {})
}

function controlFrom(event) {
  const node = event.target instanceof Element ? event.target : event.target?.parentElement
  if (!node) return null
  return node.closest("a[href], button, .scrim")
}

// One click for links, buttons, and the backdrop that closes a modal. The connect-the-dots card is silent.
export function listenForClicks() {
  document.addEventListener("click", (event) => {
    const control = controlFrom(event)
    if (!control || control.closest(".dots")) return
    if (control.matches(":disabled") || control.getAttribute("aria-disabled") === "true") return
    playClick()
  })
}
