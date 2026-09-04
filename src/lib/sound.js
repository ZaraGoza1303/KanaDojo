// Sound effect ringan via WebAudio (tanpa file audio).
let ctx = null
let muted = false

export function setMuted(v) {
  muted = v
}

function getCtx() {
  if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)()
  if (ctx.state === 'suspended') ctx.resume()
  return ctx
}

function tone(freq, start, dur, type = 'sine', gain = 0.08) {
  const c = getCtx()
  const osc = c.createOscillator()
  const g = c.createGain()
  osc.type = type
  osc.frequency.value = freq
  g.gain.setValueAtTime(0, c.currentTime + start)
  g.gain.linearRampToValueAtTime(gain, c.currentTime + start + 0.012)
  g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + start + dur)
  osc.connect(g)
  g.connect(c.destination)
  osc.start(c.currentTime + start)
  osc.stop(c.currentTime + start + dur + 0.05)
}

export function playCorrect() {
  if (muted) return
  try {
    tone(660, 0, 0.12, 'sine', 0.07)
    tone(880, 0.08, 0.16, 'sine', 0.07)
  } catch { /* noop */ }
}

export function playWrong() {
  if (muted) return
  try {
    tone(180, 0, 0.18, 'sawtooth', 0.05)
    tone(140, 0.1, 0.2, 'sawtooth', 0.05)
  } catch { /* noop */ }
}

export function playCombo(level = 1) {
  if (muted) return
  try {
    const base = 520 + level * 60
    tone(base, 0, 0.1, 'triangle', 0.06)
    tone(base * 1.25, 0.06, 0.1, 'triangle', 0.06)
    tone(base * 1.5, 0.12, 0.14, 'triangle', 0.06)
  } catch { /* noop */ }
}

export function playFinish() {
  if (muted) return
  try {
    const notes = [523, 659, 784, 1047]
    notes.forEach((n, i) => tone(n, i * 0.11, 0.22, 'triangle', 0.07))
  } catch { /* noop */ }
}

export function playClick() {
  if (muted) return
  try {
    tone(880, 0, 0.05, 'sine', 0.03)
  } catch { /* noop */ }
}
