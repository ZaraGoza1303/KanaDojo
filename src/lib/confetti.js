// Confetti ringan berbasis canvas tanpa dependensi.
let canvas = null
let active = false

const COLORS = ['#34d399', '#818cf8', '#f472b6', '#fbbf24', '#22d3ee', '#f87171']

export function fireConfetti({ count = 90, originX = 0.5, originY = 0.35 } = {}) {
  if (typeof document === 'undefined') return
  if (!canvas) {
    canvas = document.createElement('canvas')
    canvas.style.cssText =
      'position:fixed;inset:0;width:100vw;height:100vh;pointer-events:none;z-index:9999;'
    document.body.appendChild(canvas)
  }
  const dpr = Math.min(window.devicePixelRatio || 1, 2)
  canvas.width = window.innerWidth * dpr
  canvas.height = window.innerHeight * dpr
  const ctx = canvas.getContext('2d')
  ctx.scale(dpr, dpr)

  const W = window.innerWidth
  const H = window.innerHeight
  const parts = Array.from({ length: count }, () => ({
    x: W * originX,
    y: H * originY,
    vx: (Math.random() - 0.5) * 11,
    vy: Math.random() * -9 - 3,
    size: 5 + Math.random() * 6,
    rot: Math.random() * Math.PI * 2,
    vr: (Math.random() - 0.5) * 0.3,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    life: 1,
  }))

  if (active) return
  active = true

  const tick = () => {
    ctx.clearRect(0, 0, W, H)
    let alive = 0
    for (const p of parts) {
      if (p.life <= 0) continue
      alive++
      p.vy += 0.32
      p.x += p.vx
      p.y += p.vy
      p.rot += p.vr
      p.life -= 0.012
      ctx.save()
      ctx.globalAlpha = Math.max(0, p.life)
      ctx.translate(p.x, p.y)
      ctx.rotate(p.rot)
      ctx.fillStyle = p.color
      ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.62)
      ctx.restore()
    }
    if (alive > 0) {
      requestAnimationFrame(tick)
    } else {
      ctx.clearRect(0, 0, W, H)
      active = false
    }
  }
  requestAnimationFrame(tick)
}
