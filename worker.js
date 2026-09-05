const MEM = globalThis.__RELAY_MEM || (globalThis.__RELAY_MEM = new Map())
export default {
  async fetch(request, env) {
    const url = new URL(request.url)
    const m = url.pathname.match(/^\/relay\/([A-Z0-9]{4,8})$/)
    if (!m) return new Response('Not found', { status: 404, headers: cors() })
    const room = m[1].toUpperCase()
    const key = `room:${room}`

    if (request.method === 'OPTIONS') return new Response(null, { headers: cors() })

    const useKV = env && env.RELAY_KV
    if (request.method === 'POST') {
      let data
      try { data = await request.json() } catch { return new Response('Bad JSON', { status: 400, headers: cors() }) }
      const entry = { data, ts: Date.now() }
      if (useKV) {
        let list = []
        try { const raw = await env.RELAY_KV.get(key, 'json'); if (Array.isArray(raw)) list = raw } catch {}
        list.push(entry)
        if (list.length > 50) list = list.slice(-50)
        await env.RELAY_KV.put(key, JSON.stringify(list), { expirationTtl: 300 })
      } else {
        let list = MEM.get(key) || []
        list.push(entry)
        if (list.length > 50) list = list.slice(-50)
        MEM.set(key, list)
        setTimeout(()=>{ const l=MEM.get(key); if(l) { const f=l.filter(e=> Date.now()-e.ts < 300000); if(f.length) MEM.set(key,f); else MEM.delete(key)} }, 300000)
      }
      return new Response(JSON.stringify({ ok: true }), { headers: { ...cors(), 'Content-Type': 'application/json' } })
    }

    if (request.method === 'GET') {
      const since = parseInt(url.searchParams.get('since') || '0', 10)
      let list = []
      if (useKV) {
        try { const raw = await env.RELAY_KV.get(key, 'json'); if (Array.isArray(raw)) list = raw } catch {}
      } else {
        list = MEM.get(key) || []
      }
      const filtered = list.filter(e => e.ts > since)
      return new Response(JSON.stringify(filtered), { headers: { ...cors(), 'Content-Type': 'application/json' } })
    }

    return new Response('Method not allowed', { status: 405, headers: cors() })
  }
}
function cors() { return { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET,POST,OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type' } }
