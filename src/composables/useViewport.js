import { onMounted, onUnmounted, shallowRef } from "vue"

export function useViewport(isPaused = () => false) {
  const width = shallowRef(1440)
  const ready = shallowRef(false)
  let frame = 0

  function measure() {
    if (isPaused()) return
    cancelAnimationFrame(frame)
    frame = requestAnimationFrame(() => {
      if (isPaused()) return
      width.value = window.innerWidth
    })
  }

  onMounted(() => {
    width.value = window.innerWidth
    window.addEventListener("resize", measure)
    requestAnimationFrame(() => {
      ready.value = true
    })
  })

  onUnmounted(() => {
    cancelAnimationFrame(frame)
    window.removeEventListener("resize", measure)
  })

  return { width, ready, measure }
}
