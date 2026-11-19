// Clay glyph renderer. The form is the white shape in glyphclay.mp4.
// Colors and the resting spin come from glyph.js. Drag turns it. A flick
// keeps spinning, then it settles back to that spin.

const BALLS = [
  [0.0285, 0.0, 0.1459],
  [-0.0244, 0.0894, 0.1388],
  [-0.0041, 0.1585, 0.1316],
  [0.2154, 0.1585, 0.1265],
  [0.2846, 0.4187, 0.1204],
  [-0.2154, -0.2927, 0.1202],
  [0.2033, 0.2764, 0.1192],
  [-0.4715, 0.0894, 0.1146],
  [-0.0528, 0.3293, 0.1135],
  [0.4431, 0.1382, 0.1121],
  [0.122, -0.1098, 0.1117],
  [0.1992, 0.2154, 0.1113],
  [0.2764, -0.2398, 0.1111],
  [-0.0976, 0.4146, 0.1055],
  [0.0732, -0.0488, 0.1046],
  [-0.0081, -0.0528, 0.104],
  [0.2602, 0.3577, 0.1036],
  [0.4024, -0.3455, 0.103],
  [-0.4187, 0.1016, 0.0974],
  [0.2439, 0.313, 0.0973],
  [-0.1341, -0.126, 0.0973],
  [-0.1748, -0.2561, 0.0969],
  [-0.2724, 0.2846, 0.0959],
  [-0.2561, 0.065, 0.0949],
  [0.3252, -0.3618, 0.0917],
  [0.0935, 0.0041, 0.0911],
  [-0.374, 0.1057, 0.0883],
  [-0.0854, 0.0772, 0.0883],
  [-0.2195, 0.0854, 0.086],
  [-0.0407, -0.0854, 0.086],
  [-0.2602, -0.4024, 0.086],
  [-0.0813, -0.1016, 0.0816],
  [-0.061, 0.2764, 0.081],
  [0.2683, 0.1341, 0.081],
  [-0.2398, -0.3415, 0.081],
  [-0.2358, 0.3089, 0.0806],
  [0.3333, 0.4431, 0.0802],
  [-0.1463, 0.4146, 0.0802],
  [-0.0366, 0.2073, 0.0802],
  [0.3902, 0.1382, 0.0797],
]

const COUNT = BALLS.length
const THRESHOLD = 0.1
const HALF_H = 1.0

const VERT = `#version 300 es
void main() {
  vec2 c = vec2(gl_VertexID == 1 ? 3.0 : -1.0, gl_VertexID == 2 ? 3.0 : -1.0);
  gl_Position = vec4(c, 0.0, 1.0);
}
`

const FRAG = `#version 300 es
precision highp float;

uniform vec4 uBalls[${COUNT}];
uniform vec3 uBackground;
uniform vec3 uClay;
uniform vec2 uResolution;
uniform vec2 uAngles;
uniform float uThreshold;

out vec4 fragColor;

float gField;
float gBound;
float gStep;

vec3 intoObject(vec3 p) {
  float cy = cos(uAngles.x);
  float sy = sin(uAngles.x);
  float cx = cos(uAngles.y);
  float sx = sin(uAngles.y);
  vec3 pitched = vec3(p.x, cx * p.y + sx * p.z, -sx * p.y + cx * p.z);
  return vec3(cy * pitched.x - sy * pitched.z, pitched.y, sy * pitched.x + cy * pitched.z);
}

void eval(vec3 p, bool full) {
  vec3 q = intoObject(p);
  float f = 0.0;
  float bound = 4.0;
  for (int i = 0; i < ${COUNT}; i++) {
    vec3 d = q - uBalls[i].xyz;
    float r = uBalls[i].w;
    float d2 = dot(d, d);
    bound = min(bound, sqrt(d2) - r);
    float r2 = r * r;
    if (d2 >= r2) continue;
    float t2 = d2 / r2;
    float t4 = t2 * t2;
    float t6 = t4 * t2;
    f += 1.0 - (4.0 / 9.0) * t6 + (17.0 / 9.0) * t4 - (22.0 / 9.0) * t2;
    if (!full && f > uThreshold) break;
  }
  gField = f;
  gBound = bound;
}

vec3 normalAt(vec3 p) {
  float e = 0.0065;
  eval(p + vec3(e, 0.0, 0.0), true);
  float x1 = gField;
  eval(p - vec3(e, 0.0, 0.0), true);
  float x0 = gField;
  eval(p + vec3(0.0, e, 0.0), true);
  float y1 = gField;
  eval(p - vec3(0.0, e, 0.0), true);
  float y0 = gField;
  eval(p + vec3(0.0, 0.0, e), true);
  float z1 = gField;
  eval(p - vec3(0.0, 0.0, e), true);
  float z0 = gField;
  return normalize(vec3(x0 - x1, y0 - y1, z0 - z1));
}

float wrapLight(vec3 n, vec3 l, float wrap) {
  return clamp((dot(n, l) + wrap) / (1.0 + wrap), 0.0, 1.0);
}

void main() {
  vec2 uv = (gl_FragCoord.xy / uResolution) * 2.0 - 1.0;
  uv.x *= uResolution.x / uResolution.y;
  vec3 ro = vec3(uv * ${HALF_H.toFixed(2)}, 1.85);
  vec3 rd = vec3(0.0, 0.0, -1.0);

  float t = 0.0;
  bool hit = false;
  float peak = 0.0;
  gStep = 0.05;

  for (int i = 0; i < 96; i++) {
    eval(ro + rd * t, false);
    peak = max(peak, gField);
    if (gField > uThreshold) {
      float lo = max(t - gStep, 0.0);
      float hi = t;
      for (int k = 0; k < 6; k++) {
        float mid = 0.5 * (lo + hi);
        eval(ro + rd * mid, true);
        if (gField > uThreshold) hi = mid;
        else lo = mid;
      }
      t = hi;
      hit = true;
      break;
    }
    // Outside every ball, jump to the nearest one. Inside, take a short
    // step so a thin neck between balls is not skipped.
    float step = gBound > 0.012 ? gBound : 0.006;
    gStep = step;
    t += step;
    if (t > 3.7) break;
  }

  vec3 bg = pow(uBackground, vec3(2.2));
  vec3 clay = pow(uClay, vec3(2.2));
  vec3 color = bg;

  if (hit) {
    vec3 pos = ro + rd * t;
    vec3 n = normalAt(pos);
    vec3 keyL = normalize(vec3(-0.42, 0.86, 0.52));
    vec3 fillL = normalize(vec3(0.72, 0.08, 0.62));
    float key = wrapLight(n, keyL, 0.62);
    float fill = wrapLight(n, fillL, 0.85);
    color = clay * (0.58 + key * 0.48 + fill * 0.14);

    vec3 halfL = normalize(keyL + vec3(0.0, 0.0, 1.0));
    float spec = pow(clamp(dot(n, halfL), 0.0, 1.0), 28.0);
    color += spec * 0.1;

    eval(pos + n * 0.04, true);
    float openNear = clamp((uThreshold - gField) / uThreshold, 0.0, 1.0);
    eval(pos + n * 0.085, true);
    float openFar = clamp((uThreshold - gField) / uThreshold, 0.0, 1.0);
    float pocket = (1.0 - openNear) * 0.7 + (1.0 - openFar) * 0.3;
    color *= 1.0 - pocket * 0.42;

    float shade = 1.0 - key;
    color = mix(color, bg, shade * 0.12);
    color = mix(bg, color, 0.96);
  } else if (peak > uThreshold - 0.055) {
    float edge = smoothstep(uThreshold - 0.055, uThreshold, peak);
    color = mix(bg, clay, edge);
  }

  fragColor = vec4(pow(color, vec3(1.0 / 2.2)), 1.0);
}
`

function compile(gl, type, source) {
  const shader = gl.createShader(type)
  gl.shaderSource(shader, source)
  gl.compileShader(shader)
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const log = gl.getShaderInfoLog(shader)
    gl.deleteShader(shader)
    throw new Error(log || "shader failed")
  }
  return shader
}

function hexToRgb(hex) {
  const value = hex.replace("#", "")
  const digits = value.length === 3 ? value.split("").map((digit) => digit + digit).join("") : value
  return [0, 2, 4].map((index) => parseInt(digits.slice(index, index + 2), 16) / 255)
}

export function mountGlyph(canvas, glyph = {}) {
  const gl = canvas.getContext("webgl2", {
    alpha: false,
    antialias: false,
    depth: false,
    stencil: false,
    powerPreference: "high-performance",
  })
  if (!gl) return () => {}

  let program
  try {
    const vs = compile(gl, gl.VERTEX_SHADER, VERT)
    const fs = compile(gl, gl.FRAGMENT_SHADER, FRAG)
    program = gl.createProgram()
    gl.attachShader(program, vs)
    gl.attachShader(program, fs)
    gl.linkProgram(program)
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      throw new Error(gl.getProgramInfoLog(program) || "link failed")
    }
    gl.deleteShader(vs)
    gl.deleteShader(fs)
  } catch (error) {
    console.error(error)
    return () => {}
  }

  const balls = new Float32Array(COUNT * 4)
  for (let i = 0; i < COUNT; i++) {
    const [x, y, r] = BALLS[i]
    balls[i * 4] = x
    balls[i * 4 + 1] = y
    balls[i * 4 + 2] = Math.sin(i * 2.399) * 0.01
    balls[i * 4 + 3] = r * 1.08
  }

  const uBalls = gl.getUniformLocation(program, "uBalls")
  const uBackground = gl.getUniformLocation(program, "uBackground")
  const uClay = gl.getUniformLocation(program, "uClay")
  const uResolution = gl.getUniformLocation(program, "uResolution")
  const uAngles = gl.getUniformLocation(program, "uAngles")
  const uThreshold = gl.getUniformLocation(program, "uThreshold")
  const spin = glyph.spin ?? 0.62

  gl.useProgram(program)
  gl.uniform4fv(uBalls, balls)
  gl.uniform3fv(uBackground, hexToRgb(glyph.background || "#ff7237"))
  gl.uniform3fv(uClay, hexToRgb(glyph.color || "#fbf9f6"))
  gl.uniform1f(uThreshold, THRESHOLD)

  const motion = window.matchMedia("(prefers-reduced-motion: reduce)")
  const state = {
    yaw: 0.2,
    pitch: 0,
    vy: motion.matches ? 0 : spin,
    vp: 0,
    dragging: false,
    leveling: false,
    reduced: motion.matches,
    visible: true,
    pointer: 0,
    lastX: 0,
    lastY: 0,
    lastT: 0,
    flickX: 0,
    flickY: 0,
  }

  let frame = 0
  let stopped = false
  let drawn = false
  let last = performance.now()

  function resize() {
    const width = canvas.clientWidth
    const height = canvas.clientHeight
    if (!width || !height) return
    const long = Math.max(width, height)
    const dpr = Math.min(window.devicePixelRatio || 1, 840 / long, 2)
    const w = Math.max(1, Math.round(width * dpr))
    const h = Math.max(1, Math.round(height * dpr))
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w
      canvas.height = h
      drawn = false
    }
  }

  function draw() {
    resize()
    gl.viewport(0, 0, canvas.width, canvas.height)
    gl.useProgram(program)
    gl.uniform2f(uResolution, canvas.width, canvas.height)
    gl.uniform2f(uAngles, state.yaw, state.pitch)
    gl.drawArrays(gl.TRIANGLES, 0, 3)
    drawn = true
  }

  function tick(now) {
    if (stopped) return
    frame = requestAnimationFrame(tick)
    const dt = Math.min(0.05, (now - last) / 1000)
    last = now

    const idle = state.reduced ? 0 : spin
    if (!state.dragging) {
      if (state.leveling) {
        state.pitch += (0 - state.pitch) * (1 - Math.exp(-8 * dt))
        state.vp = 0
        state.vy += (idle - state.vy) * (1 - Math.exp(-4 * dt))
        if (Math.abs(state.pitch) < 0.001) {
          state.pitch = 0
          state.leveling = false
        }
      } else {
        state.vy += (idle - state.vy) * (1 - Math.exp(-1.15 * dt))
        state.vp *= Math.exp(-2.6 * dt)
      }
      state.yaw += state.vy * dt
      state.pitch = Math.min(1.15, Math.max(-1.15, state.pitch + state.vp * dt))
    }

    const resting =
      state.reduced &&
      !state.dragging &&
      !state.leveling &&
      Math.abs(state.vy) < 0.01 &&
      Math.abs(state.vp) < 0.01
    if (!state.visible || (resting && drawn)) return
    draw()
  }

  function onDown(event) {
    if (event.button !== undefined && event.button !== 0) return
    state.dragging = true
    state.leveling = false
    state.vy = 0
    state.vp = 0
    state.pointer = event.pointerId
    state.lastX = event.clientX
    state.lastY = event.clientY
    state.lastT = performance.now()
    state.flickX = 0
    state.flickY = 0
    canvas.setPointerCapture(event.pointerId)
  }

  function onMove(event) {
    if (!state.dragging || event.pointerId !== state.pointer) return
    const now = performance.now()
    const dt = Math.max(8, now - state.lastT)
    const dx = event.clientX - state.lastX
    const dy = event.clientY - state.lastY
    state.lastX = event.clientX
    state.lastY = event.clientY
    state.lastT = now
    state.flickX = dx / dt
    state.flickY = dy / dt
    state.yaw += dx * 0.009
    state.pitch = Math.min(1.15, Math.max(-1.15, state.pitch + dy * 0.009))
  }

  function onUp(event) {
    if (!state.dragging || event.pointerId !== state.pointer) return
    state.dragging = false
    state.vy = Math.min(7, Math.max(-7, state.flickX * 7.5))
    state.vp = Math.min(5, Math.max(-5, state.flickY * 7.5))
    if (canvas.hasPointerCapture(event.pointerId)) canvas.releasePointerCapture(event.pointerId)
  }

  function onDoubleClick() {
    state.leveling = true
    state.vp = 0
  }

  function onMotion(event) {
    state.reduced = event.matches
    drawn = false
  }

  canvas.addEventListener("pointerdown", onDown)
  canvas.addEventListener("pointermove", onMove)
  canvas.addEventListener("pointerup", onUp)
  canvas.addEventListener("pointercancel", onUp)
  canvas.addEventListener("dblclick", onDoubleClick)
  motion.addEventListener("change", onMotion)

  const observed = new ResizeObserver(() => {
    drawn = false
    resize()
  })
  observed.observe(canvas)

  const seen = new IntersectionObserver(([entry]) => {
    state.visible = entry.isIntersecting
    drawn = false
  })
  seen.observe(canvas)

  frame = requestAnimationFrame(tick)

  return () => {
    stopped = true
    cancelAnimationFrame(frame)
    observed.disconnect()
    seen.disconnect()
    canvas.removeEventListener("pointerdown", onDown)
    canvas.removeEventListener("pointermove", onMove)
    canvas.removeEventListener("pointerup", onUp)
    canvas.removeEventListener("pointercancel", onUp)
    canvas.removeEventListener("dblclick", onDoubleClick)
    motion.removeEventListener("change", onMotion)
    gl.deleteProgram(program)
  }
}
