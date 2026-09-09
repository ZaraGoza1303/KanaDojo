import { useState, useCallback, useEffect, useMemo } from 'react'
import { Card, Button, Badge, ProgressBar } from '../components/ui.jsx'
import { EXAM_BANK, pickExam30 } from '../data/exam.js'
import { fireConfetti } from '../lib/confetti.js'
import { playCorrect, playWrong, playFinish, playClick } from '../lib/sound.js'

const EX_KEY = 'kd-exam-state'
const byId = (id) => EXAM_BANK.find((q) => q.id === id)
const loadEX = () => {
  try {
    const j = JSON.parse(localStorage.getItem(EX_KEY))
    if (!j || !Array.isArray(j.ids) || !j.ids.length) return null
    const queue = j.ids.map(byId).filter(Boolean)
    if (!queue.length) return null
    return { ids: j.ids, pos: j.pos || 0, picked: j.picked ?? null, susunAns: j.susunAns || [], stats: j.stats || { correct: 0, xp: 0 }, perTipe: j.perTipe || {}, done: !!j.done, results: j.results || [] }
  } catch { return null }
}

const TIPE_LABEL = { literal: 'Literal', cloze: 'Melengkapi', susun: 'Susun kata', infer: 'Inferensial' }
const TIPE_TONE = { literal: 'cyan', cloze: 'indigo', susun: 'amber', infer: 'emerald' }

export default function ExamMode({ progress, onExit }) {
  const _s = loadEX()
  const [phase, setPhase] = useState(_s ? 'play' : 'config')
  const [queue, setQueue] = useState(() => {
    if (!_s) return []
    return _s.ids.map((id, i) => {
      const base = byId(id)
      const saved = _s.results?.[i]
      if (base.tipe === 'susun') return { ...base, kataAcak: saved?.kataAcak || [...base.kata].sort(() => Math.random() - 0.5) }
      return { ...base, pilihanAcak: saved?.pilihanAcak || base.pilihan.map((p, pi) => ({ text: p, correct: pi === base.jawaban })).sort(() => Math.random() - 0.5) }
    })
  })
  const [pos, setPos] = useState(() => _s?.pos || 0)
  const [picked, setPicked] = useState(() => _s?.picked ?? null)
  const [susunAns, setSusunAns] = useState(() => _s?.susunAns || [])
  const [stats, setStats] = useState(() => _s?.stats || { correct: 0, xp: 0 })
  const [perTipe, setPerTipe] = useState(() => _s?.perTipe || {})
  const [results, setResults] = useState(() => _s?.results || [])
  const [done, setDone] = useState(() => !!_s?.done)

  useEffect(() => {
    if (phase !== 'play') { try { localStorage.removeItem(EX_KEY) } catch {} return }
    try {
      localStorage.setItem(EX_KEY, JSON.stringify({
        ids: queue.map((q) => q.id), pos, picked, susunAns, stats, perTipe, done,
        results: queue.map((q, i) => ({ ...(results[i] || {}), kataAcak: q.kataAcak, pilihanAcak: q.pilihanAcak })),
      }))
    } catch {}
  }, [phase, queue, pos, picked, susunAns, stats, perTipe, done, results])

  const start = useCallback(() => {
    playClick()
    const q = pickExam30()
    setQueue(q); setPos(0); setPicked(null); setSusunAns([])
    setStats({ correct: 0, xp: 0 }); setPerTipe({}); setResults([]); setDone(false)
    setPhase('play')
  }, [])

  const current = queue[pos]
  const total = queue.length || 30

  const finish = useCallback((finalStats, finalPerTipe, finalResults) => {
    try { localStorage.removeItem(EX_KEY) } catch {}
    const score = Math.round((finalStats.correct / total) * 100)
    const xp = Math.max(10, Math.round((score / 100) * 60))
    try {
      progress?.addXp?.(xp)
      progress?.recordSession?.({ mode: 'exam', label: `Ujian 30 soal`, accuracy: score, count: total, bestCombo: 0 })
    } catch {}
    setStats({ ...finalStats, xp, score })
    setDone(true); setPhase('result')
    playFinish()
    if (score >= 70) fireConfetti({ count: 160 })
  }, [progress, total])

  const answerPG = (idx) => {
    if (picked !== null || !current) return
    const opt = current.pilihanAcak[idx]
    const correct = !!opt.correct
    setPicked(idx)
    const ns = { correct: stats.correct + (correct ? 1 : 0), xp: stats.xp }
    const pt = { ...perTipe, [current.tipe]: { c: (perTipe[current.tipe]?.c || 0) + (correct ? 1 : 0), t: (perTipe[current.tipe]?.t || 0) + 1 } }
    setStats(ns); setPerTipe(pt)
    setResults((r) => [...r, { id: current.id, correct, pickedText: opt.text }])
    try { progress?.recordAnswer?.(correct) } catch {}
    try { progress?.addXp?.(correct ? 3 : 1) } catch {}
    if (correct) playCorrect(); else playWrong()
  }

  const tapKata = (w, i) => {
    if (picked !== null) return
    if (susunAns.includes(i)) return
    setSusunAns((a) => [...a, i])
  }
  const untap = (orderIdx) => {
    if (picked !== null) return
    setSusunAns((a) => a.filter((_, i) => i !== orderIdx))
  }
  const submitSusun = () => {
    if (picked !== null || !current || susunAns.length !== current.kata.length) return
    const ordered = susunAns.map((i) => current.kataAcak[i])
    const correct = ordered.join('|') === current.jawaban.join('|')
    setPicked(correct ? 'ok' : 'no')
    const ns = { correct: stats.correct + (correct ? 1 : 0), xp: stats.xp }
    const pt = { ...perTipe, susun: { c: (perTipe.susun?.c || 0) + (correct ? 1 : 0), t: (perTipe.susun?.t || 0) + 1 } }
    setStats(ns); setPerTipe(pt)
    setResults((r) => [...r, { id: current.id, correct, pickedText: ordered.join(' ・ ') }])
    try { progress?.recordAnswer?.(correct) } catch {}
    try { progress?.addXp?.(correct ? 3 : 1) } catch {}
    if (correct) playCorrect(); else playWrong()
  }

  const next = () => {
    if (pos >= queue.length - 1) { finish(stats, perTipe, results); return }
    setPos((p) => p + 1); setPicked(null); setSusunAns([])
  }

  const scorePreview = useMemo(() => (done ? stats.score ?? 0 : null), [done, stats])

  if (phase === 'config') {
    return (
      <div className="mx-auto max-w-xl space-y-5">
        <div className="flex items-center gap-3">
          <Button variant="ghost" onClick={onExit} className="px-3 py-2 text-xs">Beranda</Button>
          <Badge tone="emerald">Ujian</Badge>
          <Badge tone="slate">30 soal acak</Badge>
        </div>
        <Card className="space-y-4 p-6 sm:p-8 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700">
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">Mode Ujian N5-N4</h2>
          <p className="text-sm text-slate-600 dark:text-zinc-400">30 soal acak setiap putaran: pilihan ganda, melengkapi teks, susun kata, dan pemahaman bacaan. Santai, tanpa timer.</p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            {[['Literal (tersurat)', '10 soal'], ['Melengkapi teks', '8 soal'], ['Susun kata SOP', '6 soal'], ['Inferensial + negasi/lampau', '6 soal']].map(([a, b]) => (
              <div key={a} className="rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-700/50 p-3">
                <div className="font-bold text-slate-900 dark:text-white">{a}</div>
                <div className="text-slate-600 dark:text-zinc-400">{b}</div>
              </div>
            ))}
          </div>
          <p className="text-xs text-slate-500 dark:text-zinc-400">Topik: aisatsu • jikoshoukai • jikan • kazoku • dekirukoto • gakkou • uchi • mainichi • shumi • himana. Lulus ≥ 70 + pembahasan tiap soal.</p>
          <Button onClick={start} className="w-full py-4 text-base">Mulai ujian (30 soal)</Button>
        </Card>
      </div>
    )
  }

  if (phase === 'result') {
    const score = stats.score ?? 0
    const lulus = score >= 70
    return (
      <div className="mx-auto max-w-2xl space-y-5 text-center">
        <Badge tone={lulus ? 'emerald' : 'rose'} className="px-4 py-1.5 text-sm">{lulus ? 'Lulus' : 'Belum lulus'} {score}%</Badge>
        <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">{lulus ? 'Otsukare! Kerja bagus!' : 'Jangan menyerah, coba lagi!'}</h2>
        <Card className="p-6 text-left bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[['Skor', `${score}%`], ['Benar', `${stats.correct}/${total}`], ['XP', `+${stats.xp}`], ['Soal', `${total}`]].map(([l, v]) => (
              <div key={l} className="rounded-2xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-700/50 p-3">
                <div className="text-[10px] font-bold uppercase tracking-wide text-slate-600 dark:text-zinc-400">{l}</div>
                <div className="text-xl font-extrabold text-slate-900 dark:text-white">{v}</div>
              </div>
            ))}
          </div>
          <div className="mt-3 flex flex-wrap gap-2 text-xs">
            {Object.entries(perTipe).map(([k, v]) => (
              <span key={k} className="rounded-full bg-slate-100 dark:bg-zinc-700 px-2.5 py-1">{TIPE_LABEL[k] || k}: {v.c}/{v.t}</span>
            ))}
          </div>
          <div className="mt-5 space-y-3">
            {queue.map((q, i) => {
              const r = results[i]
              return (
                <div key={q.id} className={`rounded-xl border p-3 text-sm ${r?.correct ? 'border-emerald-200 bg-emerald-50/50 dark:border-emerald-800' : 'border-red-200 bg-red-50/50 dark:border-red-800'}`}>
                  <div className="flex gap-2 items-center text-xs text-slate-500"><span>#{i + 1}</span><Badge tone={TIPE_TONE[q.tipe]}>{TIPE_LABEL[q.tipe]}</Badge><span>{q.topik}</span><span className="ml-auto">{r?.correct ? 'Benar' : 'Salah'}</span></div>
                  <div className="mt-1 font-medium text-slate-900 dark:text-white">{q.soal}</div>
                  <div className="text-xs text-slate-600 dark:text-zinc-400">{q.teks}</div>
                  <div className="mt-1 text-xs">Jawab: <b>{q.tipe === 'susun' ? q.jawaban.join(' ・ ') : q.pilihan[q.jawaban]}</b> {r && !r.correct && <span className="text-red-600">(kamu: {r.pickedText})</span>}</div>
                  <div className="text-xs text-slate-500">Penjelasan: {q.pembahasan}</div>
                </div>
              )
            })}
          </div>
        </Card>
        <div className="flex justify-center gap-3">
          <Button variant="ghost" onClick={onExit}>Beranda</Button>
          <Button onClick={start}>Ujian lagi (acak baru)</Button>
        </div>
      </div>
    )
  }

  if (!current) return null
  const answered = picked !== null
  const qNum = pos + 1
  return (
    <div className="mx-auto max-w-xl space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <Button variant="ghost" onClick={onExit} className="px-3 py-2 text-xs">Keluar</Button>
        <Badge tone={TIPE_TONE[current.tipe]}>{TIPE_LABEL[current.tipe]}</Badge>
        <Badge tone="slate">{current.topik}</Badge>
        <span className="ml-auto text-xs text-slate-600 dark:text-zinc-400">Soal {qNum}/{total} • Benar {stats.correct}</span>
      </div>
      <ProgressBar value={pos} max={total} />
      <Card className="p-6 sm:p-8 space-y-4 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700">
        <p className="rounded-xl bg-slate-50 dark:bg-zinc-700/50 p-3 text-sm text-slate-700 dark:text-zinc-200">{current.teks}</p>
        <h3 className="text-base font-bold text-slate-900 dark:text-white">{current.soal}</h3>
        {current.tipe === 'susun' ? (
          <div className="space-y-3">
            <div className="min-h-[3rem] rounded-xl border border-dashed border-slate-300 dark:border-zinc-600 p-2 flex flex-wrap gap-2">
              {susunAns.map((wi, oi) => (
                <button key={oi} onClick={() => untap(oi)} className="rounded-lg bg-slate-900 text-white dark:bg-white dark:text-zinc-900 px-3 py-1.5 text-sm font-semibold">{current.kataAcak[wi]}</button>
              ))}
              {susunAns.length === 0 && <span className="text-xs text-slate-400 p-1">Ketuk kata di bawah urut-urut…</span>}
            </div>
            <div className="flex flex-wrap gap-2">
              {current.kataAcak.map((w, i) => (
                <button key={i} disabled={susunAns.includes(i) || answered} onClick={() => tapKata(w, i)} className={`rounded-xl border px-3 py-2 text-sm font-semibold ${susunAns.includes(i) ? 'opacity-30' : 'bg-white dark:bg-zinc-700 border-slate-200 dark:border-zinc-600'}`}>{w}</button>
              ))}
            </div>
            {!answered && <Button onClick={submitSusun} disabled={susunAns.length !== current.kata.length} className="w-full">Jawab</Button>}
          </div>
        ) : (
          <div className="grid gap-2">
            {current.pilihanAcak.map((o, i) => {
              const isPicked = picked === i
              const showCorrect = answered && o.correct
              return (
                <button key={i} onClick={() => answerPG(i)} disabled={answered} className={`rounded-xl border px-4 py-3 text-left text-sm font-medium transition ${showCorrect ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950' : isPicked ? 'border-red-400 bg-red-50 dark:bg-red-950' : 'border-slate-200 dark:border-zinc-600 bg-white dark:bg-zinc-700 hover:border-slate-400'}`}>
                  {o.text}
                </button>
              )
            })}
          </div>
        )}
        {answered && (
          <div className="rounded-xl bg-slate-50 dark:bg-zinc-700/50 p-3 text-sm">
            <span className={`font-bold ${results[pos]?.correct ? 'text-emerald-700' : 'text-red-600'}`}>{results[pos]?.correct ? 'Benar! ' : 'Kurang tepat. '}</span>
            <span className="text-slate-600 dark:text-zinc-300">{current.pembahasan}</span>
            <div className="mt-2 text-xs">Kunci: <b>{current.tipe === 'susun' ? current.jawaban.join(' ・ ') : current.pilihan[current.jawaban]}</b></div>
            <Button onClick={next} className="mt-3 w-full">{pos >= queue.length - 1 ? 'Lihat hasil' : 'Lanjut'}</Button>
          </div>
        )}
      </Card>
      <p className="text-center text-xs text-slate-500">Soal dan opsi diacak setiap putaran.</p>
      <div className="hidden">{scorePreview}</div>
    </div>
  )
}
