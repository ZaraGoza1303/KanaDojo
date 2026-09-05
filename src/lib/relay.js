const RELAY_URL = import.meta.env.VITE_RELAY_URL || ''
const base = RELAY_URL ? `${RELAY_URL.replace(/\/$/, '')}/relay` : '/api/relay'
const memFallback = new Map()
export async function sendViaRelay(room, data) {
  const r = room.toUpperCase()
  try{
    const res = await fetch(`${base}?room=${r}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if(!res.ok) throw new Error('relay post fail')
  }catch{
    const k=`relay:${r}`; const list=memFallback.get(k)||[]; list.push({data, ts:Date.now()}); if(list.length>50) list.shift(); memFallback.set(k,list)
  }
}

export function pollRelay(room, onData, opts={}) {
  const r = room.toUpperCase()
  let since = opts.since ?? Date.now()
  let stopped = false
  let timer = null
  async function tick() {
    if (stopped) return
    try {
      const res = await fetch(`${base}?room=${r}&since=${since}`)
      if (res.ok) {
        const list = await res.json()
        for (const e of list) {
          if (e.ts > since) since = e.ts
          onData?.(e.data)
        }
        if (!stopped) timer = setTimeout(tick, 1000)
        return
      }
      throw new Error('not ok')
    } catch {
      const list = memFallback.get(`relay:${r}`) || []
      const filtered = list.filter(e=> e.ts > since)
      for(const e of filtered){ if(e.ts>since) since=e.ts; onData?.(e.data) }
    }
    if (!stopped) timer = setTimeout(tick, 1000)
  }
  tick()
  return () => { stopped = true; if (timer) clearTimeout(timer) }
}
