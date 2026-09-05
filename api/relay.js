import { kv } from '@vercel/kv'
let MEM = globalThis.__RELAY_MEM || (globalThis.__RELAY_MEM = new Map())

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.status(200).end()
  const { room } = req.query
  if (!room || !/^[A-Z0-9]{4,8}$/.test(room)) return res.status(400).json({ error: 'invalid room' })
  const key = `relay:${room}`

  if (req.method === 'POST') {
    const data = req.body
    if (!data) return res.status(400).json({ error: 'no data' })
    const entry = { data, ts: Date.now() }
    if (kv) {
      try {
        let list = []
        const raw = await kv.get(key)
        if (Array.isArray(raw)) list = raw
        else if (typeof raw === 'string') { try { list = JSON.parse(raw) } catch {} }
        list.push(entry)
        if (list.length > 50) list = list.slice(-50)
        await kv.set(key, JSON.stringify(list), { ex: 300 })
        return res.json({ ok: true })
      } catch (e) { console.error('kv post fail', e) }
    }
    let list = MEM.get(key) || []
    list.push(entry)
    if (list.length > 50) list = list.slice(-50)
    MEM.set(key, list)
    return res.json({ ok: true })
  }

  if (req.method === 'GET') {
    const since = parseInt(req.query.since || '0', 10)
    if (kv) {
      try {
        const raw = await kv.get(key)
        let list = []
        if (Array.isArray(raw)) list = raw
        else if (typeof raw === 'string') { try { list = JSON.parse(raw) } catch {} }
        const filtered = (Array.isArray(list) ? list : []).filter(e => e.ts > since)
        return res.json(filtered)
      } catch {}
    }
    const list = MEM.get(key) || []
    const filtered = list.filter(e => e.ts > since)
    return res.json(filtered)
  }

  return res.status(405).json({ error: 'method not allowed' })
}
