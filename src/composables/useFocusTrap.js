import { onBeforeUnmount, watch } from "vue"

const FOCUSABLE = "button, [href], input, select, textarea, [tabindex]:not([tabindex='-1'])"

export function useFocusTrap(getRoot, isActive) {
  function focusable(root) {
    return [...root.querySelectorAll(FOCUSABLE)].filter(
      (el) => !el.hasAttribute("disabled") && el.getAttribute("aria-hidden") !== "true",
    )
  }

  function onKey(event) {
    if (event.key !== "Tab") return
    const root = getRoot()
    if (!root) return
    const nodes = focusable(root)
    if (!nodes.length) return
    const first = nodes[0]
    const last = nodes[nodes.length - 1]
    const active = document.activeElement
    if (!root.contains(active)) {
      event.preventDefault()
      ;(event.shiftKey ? last : first).focus()
      return
    }
    if (event.shiftKey && active === first) {
      event.preventDefault()
      last.focus()
    } else if (!event.shiftKey && active === last) {
      event.preventDefault()
      first.focus()
    }
  }

  watch(isActive, (active) => {
    window.removeEventListener("keydown", onKey)
    if (active) window.addEventListener("keydown", onKey)
  })

  onBeforeUnmount(() => {
    window.removeEventListener("keydown", onKey)
  })
}
