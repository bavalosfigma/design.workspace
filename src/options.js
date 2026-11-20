import { inject, provide, readonly, shallowRef } from "vue"

const key = Symbol("card-options")

// Press O to reveal the tuning links on cards that have them.
export function provideCardOptions() {
  const shown = shallowRef(false)

  function toggle() {
    shown.value = !shown.value
  }

  const options = {
    shown: readonly(shown),
    toggle,
  }
  provide(key, options)
  return options
}

export function useCardOptions() {
  const options = inject(key, null)
  if (!options) throw new Error("useCardOptions requires provideCardOptions")
  return options
}
