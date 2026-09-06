import { useState, useMemo, useEffect, useCallback } from 'react'
import { VOCAB } from '../data/vocab.js'
import { loadSRS, saveSRS, schedule, getQueue } from '../lib/srs.js'
import { kanaTextToRomaji, extractKana } from '../lib/romaji.js'
import { Card, Button, Badge } from '../components/ui.jsx'

const GRADE = [
  { v: 1, label: 'Again', sub: '1m', tone: 'rose', xp: 2 },
  { v: 2, label: 'Hard', sub: '10m', tone: 'amber', xp: 3 },
  { v: 3, label: 'Good', sub: '1d', tone: 'emerald', xp: 5 },
  { v: 4, label: 'Easy', sub: '4d', tone: 'cyan', xp: 8 },
]

const ANKI_SESS_KEY='kd-anki-session'
const loadAnkiSess=()=>{try{const j=JSON.parse(localStorage.getItem(ANKI_SESS_KEY)); if(j) return j}catch{} return null}
export default function AnkiMode({ progress, onExit }) {
  const _as=loadAnkiSess()
  const [srsMap, setSrsMap] = useState(() => loadSRS())
  const [flipped, setFlipped] = useState(_as?.flipped || false)
  const [history, setHistory] = useState(_as?.history || [])
  const [stats, setStats] = useState(_as?.stats || { reviewed: 0, correct: 0, xp: 0 })
  const [reviewAhead, setReviewAhead] = useState(_as?.reviewAhead || false)
  const [newOrder, setNewOrder] = useState(() => {
    const a = [...VOCAB]
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[a[i], a[j]] = [a[j], a[i]]
    }
    const m = new Map()
    a.forEach((v, i) => m.set(v.id, i))
    return m
  })
  const regenOrder = () => {
    const a=[...VOCAB]; for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}
    const m=new Map(); a.forEach((v,i)=>m.set(v.id,i)); setNewOrder(m)
  }

  const queue = useMemo(() => {
    const q = getQueue(VOCAB, srsMap)
    q.newCards.sort((a, b) => (newOrder.get(a.id) ?? 0) - (newOrder.get(b.id) ?? 0))
    const LIMIT=30
    if(q.due.length + q.newCards.length > LIMIT){
      if(q.due.length >= LIMIT){
        q.due = q.due.slice(0, LIMIT)
        q.newCards = []
      } else {
        q.newCards = q.newCards.slice(0, LIMIT - q.due.length)
      }
    }
    return q
  }, [srsMap, newOrder])
  const current = queue.due[0] || queue.newCards[0] || (reviewAhead ? queue.upcoming[0] : null) || null
  const isNew = current ? !srsMap.has(current.id) : false

  const doGrade = useCallback((grade) => {
    if (!current || !flipped) return
    const prev = srsMap.get(current.id) || null
    const next = schedule(prev, grade)
    const nextMap = new Map(srsMap)
    nextMap.set(current.id, next)
    saveSRS(nextMap)
    setSrsMap(nextMap)
    const kanas = extractKana(current.kana)
    setHistory((h) => [...h, { id: current.id, prev, grade, kanas }])
    setFlipped(false)
    const xpGain = GRADE.find((g) => g.v === grade)?.xp ?? 3
    const correct = grade >= 3
    setStats((s) => ({ reviewed: s.reviewed + 1, correct: s.correct + (correct ? 1 : 0), xp: s.xp + xpGain }))
    try { progress?.addXp?.(xpGain) } catch {}
    try {
      if (kanas.length) kanas.forEach((k) => progress?.recordAnswer?.(correct, k))
      else progress?.recordAnswer?.(correct)
    } catch {}
  }, [current, flipped, srsMap, progress])

  const doUndo = useCallback(() => {
    if (history.length === 0) return
    const last = history[history.length - 1]
    const nextMap = new Map(srsMap)
    if (last.prev == null) nextMap.delete(last.id)
    else nextMap.set(last.id, last.prev)
    saveSRS(nextMap)
    setSrsMap(nextMap)
    setHistory((h) => h.slice(0, -1))
    const xpGain = GRADE.find((g) => g.v === last.grade)?.xp ?? 0
    const correct = last.grade >= 3
    setStats((s) => ({ reviewed: Math.max(0, s.reviewed - 1), correct: Math.max(0, s.correct - (correct ? 1 : 0)), xp: Math.max(0, s.xp - xpGain) }))
    try { progress?.addXp?.(-xpGain) } catch {}
    try {
      const kanas = last.kanas || []
      if (kanas.length) kanas.forEach((k) => { if (progress?.revertAnswer) progress.revertAnswer(correct, k); else progress?.recordAnswer?.(!correct, k) })
      else { if (progress?.revertAnswer) progress.revertAnswer(correct); else progress?.recordAnswer?.(!correct) }
    } catch {}
    setFlipped(false)
  }, [history, srsMap, progress])

  const doReset = useCallback(() => {
    if (!window.confirm('Reset semua progres Anki?')) return
    const m = new Map()
    saveSRS(m)
    setSrsMap(m)
    setHistory([])
    setStats({ reviewed: 0, correct: 0, xp: 0 })
    setFlipped(false)
    setReviewAhead(false)
    regenOrder()
  }, [])

  useEffect(()=>{ try{localStorage.setItem(ANKI_SESS_KEY, JSON.stringify({flipped,history,stats,reviewAhead}))}catch{} },[flipped,history,stats,reviewAhead])
  const handleExit = useCallback(() => {
    try{localStorage.removeItem(ANKI_SESS_KEY)}catch{}
    if (stats.reviewed > 0) {
      try {
        const accuracy = stats.reviewed ? Math.round((stats.correct / stats.reviewed) * 100) : 0
        progress?.recordSession?.({
          mode: 'anki',
          label: `Anki ${stats.reviewed} kartu`,
          accuracy,
          count: stats.reviewed,
          bestCombo: stats.correct,
        })
      } catch {}
    }
    onExit?.()
  }, [stats, progress, onExit])

  useEffect(() => {
    const onKey = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return
      if (e.code === 'Space' || e.key === ' ') {
        if (!flipped && current) { e.preventDefault(); setFlipped(true) }
        return
      }
      if (!flipped) return
      if (e.key >= '1' && e.key <= '4') {
        e.preventDefault()
        doGrade(Number(e.key))
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [flipped, current, doGrade])

  if (!VOCAB || VOCAB.length === 0) {
    return (
      <div className="mx-auto max-w-xl space-y-4">
        <Button variant="ghost" onClick={onExit} className="px-3 py-2 text-xs">Beranda</Button>
        <Card className="p-8 text-center text-sm text-slate-600 dark:text-zinc-400">Vocab kosong.</Card>
      </div>
    )
  }

  const total = 30
  const romaji = current ? kanaTextToRomaji(current.kana) : ''
  const contohRomaji = current?.contoh_kana ? kanaTextToRomaji(current.contoh_kana) : ''
  const upcomingDueMs = queue.upcoming.length ? Math.min(...queue.upcoming.map((c) => c._s.due)) - Date.now() : 0
  const upcomingMin = Math.max(1, Math.ceil(upcomingDueMs / 60000))

  useEffect(() => {
    if (queue.due.length > 0 || queue.newCards.length > 0) setReviewAhead(false)
  }, [queue.due.length, queue.newCards.length])

  if (!current) {
    return (
      <div className="mx-auto max-w-xl space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="ghost" onClick={handleExit} className="px-3 py-2 text-xs">Beranda</Button>
          <Badge tone="emerald">Selesai</Badge>
        </div>
        <Card className="p-8 text-center bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700">
          <p className="text-lg font-bold text-slate-900 dark:text-white">Selesai, semua kartu sudah dijadwalkan</p>
          {queue.upcoming.length > 0 ? (
            <p className="mt-2 text-sm text-slate-600 dark:text-zinc-400">{queue.upcoming.length} kartu due dalam {upcomingMin} menit</p>
          ) : (
            <p className="mt-2 text-sm text-slate-600 dark:text-zinc-400">Due: {queue.due.length} · Baru: {queue.newCards.length} · Upcoming: {queue.upcoming.length}</p>
          )}
          <div className="mt-4 flex justify-center gap-2">
            {queue.upcoming.length > 0 && <Button onClick={() => setReviewAhead(true)}>Review ahead</Button>}
            <Button variant="ghost" onClick={doReset}>Reset deck</Button>
            <Button onClick={handleExit}>Beranda</Button>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-xl space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <Button variant="ghost" onClick={handleExit} className="px-3 py-2 text-xs">Beranda</Button>
        <Badge tone="indigo">Anki</Badge>
        <Badge tone="rose">Due {queue.due.length}</Badge>
        <Badge tone="cyan">Baru {queue.newCards.length}</Badge>
        <Badge tone="slate">{stats.reviewed}/{total}</Badge>
        <div className="ml-auto flex items-center gap-2 text-xs text-slate-600 dark:text-zinc-400">
          <span>{stats.reviewed} kartu</span>
          <span className="font-semibold text-emerald-700 dark:text-emerald-300">+{stats.xp} XP</span>
          {progress && <span>Lv.{progress.level} {progress.levelTitle}</span>}
        </div>
      </div>

      <Card className="overflow-hidden bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-zinc-700 px-4 py-2 text-xs text-slate-600 dark:text-zinc-400">
          <span>{isNew ? 'Kartu baru' : `Due · ${current.kategori}` } · Lv.{current.level}</span>
          <span>{queue.due.length + queue.newCards.length} tersisa</span>
        </div>

        <button
          onClick={() => setFlipped((f) => !f)}
          className="flex min-h-[280px] w-full flex-col items-center justify-center gap-3 p-8 text-center sm:min-h-[320px] sm:p-10"
        >
          <span className="select-none text-5xl font-extrabold leading-none text-slate-900 dark:text-white sm:text-6xl">{current.kana}</span>
          {!flipped ? (
            <>
              <span className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white dark:bg-white dark:text-zinc-900">Lihat Arti, tap / Space</span>
              <span className="text-xs text-slate-500 dark:text-zinc-400">Tekan Space untuk flip · 1-4 untuk grade setelah flip</span>
            </>
          ) : (
            <span className="animate-rise w-full space-y-2">
              <span className="block text-2xl font-bold text-slate-900 dark:text-white">{current.arti}</span>
              <span className="block font-mono text-sm text-slate-600 dark:text-zinc-300">{romaji}</span>
              {current.contoh_kana && (
                <span className="block rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 px-3 py-2 text-left">
                  <span className="block text-sm text-slate-900 dark:text-zinc-100">{current.contoh_kana}</span>
                  <span className="block font-mono text-xs text-slate-500 dark:text-zinc-400">{contohRomaji}</span>
                  <span className="block text-xs text-slate-600 dark:text-zinc-400">{current.contoh_arti}</span>
                </span>
              )}
              <span className="block text-xs text-slate-500 dark:text-zinc-400">Tap kartu untuk tutup</span>
            </span>
          )}
        </button>

        {flipped ? (
          <div className="grid grid-cols-2 gap-2 border-t border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-900 p-3 sm:grid-cols-4">
            {GRADE.map((g) => (
              <button
                key={g.v}
                onClick={() => doGrade(g.v)}
                className={`rounded-xl border px-2 py-3 text-center font-semibold transition active:scale-[0.98] ${
                  g.v === 1 ? 'bg-red-50 border-red-200 text-red-700 hover:bg-red-100 dark:bg-red-950 dark:border-red-800 dark:text-red-300' :
                  g.v === 2 ? 'bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100 dark:bg-amber-950 dark:border-amber-800 dark:text-amber-300' :
                  g.v === 3 ? 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950 dark:border-emerald-800 dark:text-emerald-300' :
                  'bg-sky-50 border-sky-200 text-sky-700 hover:bg-sky-100 dark:bg-sky-950 dark:border-sky-800 dark:text-sky-300'
                }`}
              >
                <span className="block text-sm">{g.label}</span>
                <span className="block text-xs opacity-70">{g.sub} · {g.v}</span>
                <span className="block text-[10px] opacity-60">+{g.xp} XP</span>
              </button>
            ))}
          </div>
        ) : (
          <div className="border-t border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-900 p-3 text-center text-xs text-slate-500 dark:text-zinc-400">
            Flip kartu untuk melihat tombol grade (atau tekan 1-4 setelah flip)
          </div>
        )}
      </Card>

      <div className="flex flex-wrap justify-center gap-2">
        <Button variant="ghost" onClick={doUndo} disabled={history.length === 0} className="px-3 py-2 text-xs">Undo</Button>
        <Button variant="ghost" onClick={doReset} className="px-3 py-2 text-xs">Reset deck</Button>
        <Button variant="ghost" onClick={handleExit} className="px-3 py-2 text-xs">Beranda</Button>
      </div>

      <p className="text-center text-xs text-slate-500 dark:text-zinc-500">Due {queue.due.length} · Baru {queue.newCards.length} · Upcoming {queue.upcoming.length} · Tap kartu / Space flip · 1-4 grade</p>
    </div>
  )
}
