<script setup>
import { computed, onUnmounted, shallowRef, useTemplateRef, watch } from "vue"

const asset = (file) => `${import.meta.env.BASE_URL}player/${file}`

const powered = shallowRef(true)
const playing = shallowRef(false)
const forward = shallowRef(true)

const playLabel = computed(() => (playing.value ? "pause" : "play"))
const powerLabel = computed(() => (powered.value ? "on" : "off"))
const status = computed(() => {
  if (!powered.value) return "Off"
  if (!playing.value) return "Paused"
  return forward.value ? "Playing" : "Playing in reverse"
})

function togglePower() {
  powered.value = !powered.value
  if (!powered.value) playing.value = false
}

function togglePlay() {
  if (!powered.value) return
  playing.value = !playing.value
}

function skip(nextForward) {
  if (!powered.value) return
  forward.value = nextForward
  playing.value = true
}

const rotor = useTemplateRef("rotor")
const track = useTemplateRef("track")

// Pause leaves currentTime where it is, so play picks up the same spot.
function syncTrack() {
  const audio = track.value
  if (!audio) return
  audio.volume = 0.15
  const shouldPlay = powered.value && playing.value && forward.value
  if (!shouldPlay) {
    audio.pause()
    return
  }
  if (audio.ended) audio.currentTime = 0
  const played = audio.play()
  if (played) played.catch(() => {})
}

function onEnded() {
  playing.value = false
}

watch([powered, playing, forward], syncTrack)
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches
// One turn every 4.8s. Spin-up and spin-down still ease into the target,
// but they leave rest and cruise right away instead of crawling.
const TOP = 360 / 4.8
const UP_MS = 1200
const DOWN_MS = 1500
const FLIP_MS = 5200

let angle = 0
let speed = 0
let frame = 0
let last = 0
let ramp = null
let smears = null

function easeOut(t) {
  return 1 - (1 - t) ** 3
}

function smoothstep(t) {
  return t * t * t * (t * (t * 6 - 15) + 10)
}

function targetRate() {
  if (reduceMotion || !powered.value || !playing.value) return 0
  return forward.value ? TOP : -TOP
}

function spinTo(to) {
  const from = speed
  if (Math.abs(to - from) < 1) {
    speed = to
    ramp = null
    return
  }
  const reversing = from !== 0 && to !== 0 && Math.sign(from) !== Math.sign(to)
  const speeding = Math.abs(to) > Math.abs(from)
  const base = reversing ? FLIP_MS : speeding ? UP_MS : DOWN_MS
  const span = Math.min(1, Math.abs(to - from) / TOP)
  ramp = {
    from,
    to,
    start: performance.now(),
    duration: base * Math.max(0.45, span),
    ease: reversing ? smoothstep : easeOut,
  }
  if (frame) return
  last = 0
  frame = requestAnimationFrame(tick)
}

function tick(now) {
  const dt = last ? Math.min(34, now - last) : 16
  last = now
  if (ramp) {
    const t = Math.min(1, (now - ramp.start) / ramp.duration)
    speed = ramp.from + (ramp.to - ramp.from) * ramp.ease(t)
    if (t >= 1) {
      speed = ramp.to
      ramp = null
    }
  }
  const step = (speed * dt) / 1000
  if (step) angle = (((angle + step) % 360) + 360) % 360
  const el = rotor.value
  if (el) {
    el.style.transform = `rotate(${angle}deg)`
    if (!smears) smears = el.querySelectorAll(".smear")
    const hot = Math.min(1, Math.max(0, Math.abs(step) - 8) / 28)
    smears.forEach((smear, index) => {
      const behind = ((index + 1) / smears.length) * step
      smear.style.transform = `rotate(${-behind}deg)`
      smear.style.opacity = hot ? String(0.18 * hot) : "0"
    })
  }
  if (ramp || speed) frame = requestAnimationFrame(tick)
  else frame = 0
}

watch([powered, playing, forward], () => spinTo(targetRate()))

onUnmounted(() => {
  cancelAnimationFrame(frame)
  track.value?.pause()
})
</script>

<template>
  <article class="cd-player">
    <div class="stage">
      <img class="mark" :src="asset('mark.svg')" alt="" draggable="false" />

      <button
        type="button"
        class="switch"
        role="switch"
        :aria-checked="powered"
        :aria-label="powered ? 'On' : 'Off'"
        @click="togglePower"
      >
        <span class="power-label">{{ powerLabel }}</span>
        <span class="track"></span>
        <span class="knob" :class="{ 'is-on': powered }"></span>
      </button>

      <div class="slot">
        <img class="well" :src="asset('well.svg')" alt="" draggable="false" />
        <div class="disc-lift">
          <div ref="rotor" class="rotor">
            <img class="disc smear" :src="asset('cd.png')" alt="" draggable="false" />
            <img class="disc smear" :src="asset('cd.png')" alt="" draggable="false" />
            <img class="disc smear" :src="asset('cd.png')" alt="" draggable="false" />
            <img class="disc" :src="asset('cd.png')" alt="" draggable="false" />
          </div>
        </div>
      </div>

      <div class="transport">
        <div class="cell">
          <button type="button" class="key" :aria-disabled="!powered" @click="skip(false)">
            <img class="key-face" :src="asset('button.svg')" alt="" draggable="false" />
            <span class="key-label">prev</span>
          </button>
        </div>
        <div class="cell">
          <button type="button" class="key" :aria-disabled="!powered" :aria-pressed="playing" @click="togglePlay">
            <img class="key-face" :src="asset('button.svg')" alt="" draggable="false" />
            <span class="key-label">{{ playLabel }}</span>
          </button>
        </div>
        <div class="cell">
          <button type="button" class="key" :aria-disabled="!powered" @click="skip(true)">
            <img class="key-face" :src="asset('button.svg')" alt="" draggable="false" />
            <span class="key-label">next</span>
          </button>
        </div>
      </div>
    </div>
    <p class="visually-hidden" aria-live="polite">{{ status }}</p>
    <audio ref="track" :src="asset('figma02song.mp3')" preload="auto" @ended="onEnded"></audio>
  </article>
</template>

<style scoped>
.cd-player {
  position: absolute;
  inset: 0;
  overflow: hidden;
  border-radius: inherit;
  background: #6d6e6d;
  color: #fff;
  font-family: "Figma Sans VF", "Figma Sans", sans-serif;
  font-variation-settings: "wdth" 100;
  font-weight: 700;
  font-size: 14px;
  line-height: 15.4px;
  letter-spacing: -0.63px;
  user-select: none;
  container-type: size;
}

.stage {
  position: absolute;
  top: 0;
  left: 0;
  width: 536px;
  height: 670px;
  transform: scale(calc(100cqw / 536px));
  transform-origin: top left;
}

.mark {
  position: absolute;
  top: 22px;
  left: 12px;
}

.switch {
  position: absolute;
  top: 22px;
  left: 400px;
  width: 112px;
  height: 30px;
  margin: 0;
  padding: 0;
  border: 0;
  background: transparent;
  color: inherit;
  font: inherit;
  letter-spacing: inherit;
  cursor: pointer;
}

.power-label {
  position: absolute;
  top: 8px;
  right: 63px;
}

.track {
  position: absolute;
  top: 3px;
  left: 59px;
  width: 53px;
  height: 27px;
  border-radius: 50px;
  background: #6d6e6d;
  box-shadow: inset 0 4px 24px rgba(0, 0, 0, 0.25);
  pointer-events: none;
}

.knob {
  position: absolute;
  top: 4px;
  left: 61px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #d4d4d4;
  transition:
    left 200ms cubic-bezier(0.2, 0, 0, 1),
    background-color 200ms cubic-bezier(0.2, 0, 0, 1);
}

.knob.is-on {
  left: 86px;
  background: #fafd5d;
}

.slot {
  position: absolute;
  top: 111px;
  left: 109px;
  z-index: 0;
  width: 318px;
  height: 318px;
  border-radius: 50%;
  background: #000;
}

.disc-lift {
  position: absolute;
  inset: 0;
  filter: drop-shadow(0 20px 42px rgba(0, 0, 0, 0.18));
  pointer-events: none;
}

.well {
  position: absolute;
  top: 0;
  left: 0;
}

.rotor {
  position: absolute;
  top: -4px;
  left: -4px;
  width: 326px;
  height: 326px;
  transform-origin: center center;
  will-change: transform;
}

.disc {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transform-origin: center center;
}

.smear {
  opacity: 0;
}

.transport {
  position: absolute;
  top: 493px;
  left: 0;
  z-index: 1;
  display: flex;
  width: 536px;
  height: 177px;
  border-top: 1px solid rgba(0, 0, 0, 0.2);
}

.cell {
  display: flex;
  flex: 1;
  align-items: center;
  justify-content: center;
  height: 177px;
  border-right: 1px solid rgba(0, 0, 0, 0.2);
}

.cell:last-child {
  border-right: 0;
}

.key {
  position: relative;
  width: 153px;
  height: 153px;
  margin: 0;
  padding: 0;
  border: 0;
  background: transparent;
  color: inherit;
  font: inherit;
  letter-spacing: inherit;
  text-box: normal;
  pointer-events: auto;
  cursor: pointer;
}

.key-face {
  position: absolute;
  inset: 0;
  display: block;
  width: 100%;
  height: 100%;
}

.key-label {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
}

@media (prefers-reduced-motion: reduce) {
  .knob {
    transition: none;
  }
}
</style>
