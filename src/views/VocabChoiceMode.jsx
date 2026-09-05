import { useState, useMemo, useCallback, useEffect } from 'react'
import { VOCAB } from '../data/vocab.js'
import { kanaTextToRomaji, extractKana } from '../lib/romaji.js'
import { Card, Button, Badge } from '../components/ui.jsx'

function shuffle(a){ const b=[...a]; for(let i=b.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[b[i],b[j]]=[b[j],b[i]]} return b }
const VC_KEY='kd-vocab-choice-state'
const loadVC=()=>{try{const j=JSON.parse(localStorage.getItem(VC_KEY)); if(j&&j.queue&&j.queue.length) return j}catch{} return null}

export default function VocabChoiceMode({ progress, onExit }){
  const _vc=loadVC()
  const [queue, setQueue] = useState(()=> _vc?.queue || shuffle(VOCAB).slice(0,30))
  const [pos, setPos] = useState(()=> _vc?.pos || 0)
  const [wrong, setWrong] = useState(()=> _vc?.wrong || [])
  const [picked, setPicked] = useState(()=> _vc?.picked || null)
  const [stats, setStats] = useState(()=> _vc?.stats || { total:0, correct:0, xp:0 })
  const [done, setDone] = useState(()=> !!_vc?.done)
  const [showRomaji, setShowRomaji] = useState(()=>{ try{return localStorage.getItem('kd-show-romaji')!=='0'}catch{return true}})

  const current = queue[pos]
  const options = useMemo(()=>{
    if(!current) return []
    const others = VOCAB.filter(v=>v.id!==current.id)
    const picks = shuffle(others).slice(0,3).map(v=>v.arti)
    return shuffle([current.arti, ...picks])
  },[current])

  const romaji = current ? kanaTextToRomaji(current.kana) : ''

  const pick = useCallback((arti)=>{
    if(picked || !current) return
    const correct = arti===current.arti
    setPicked(arti)
    if(!correct) setWrong(w=> w.some(v=> v.id===current.id) ? w : [...w, current])
    const xp = correct? 10:2
    setStats(s=>({ total:s.total+1, correct:s.correct+(correct?1:0), xp:s.xp+xp }))
    try{ progress?.addXp?.(xp)}catch{}
    try{
      const kanas=extractKana(current.kana)
      if(kanas.length) kanas.forEach(k=>progress?.recordAnswer?.(correct,k))
      else progress?.recordAnswer?.(correct)
    }catch{}
  },[picked, current, progress])

  const next = useCallback(()=>{
    const isLast = pos >= queue.length - 1
    if(isLast){
      if(wrong.length>0){
        setQueue(shuffle(wrong))
        setPos(0)
        setWrong([])
        setPicked(null)
      } else {
        setDone(true)
      }
    } else {
      setPos(p=>p+1)
      setPicked(null)
    }
  },[pos, queue.length, wrong])

  useEffect(()=>{ try{localStorage.setItem(VC_KEY, JSON.stringify({queue,pos,wrong,picked,stats,done}))}catch{} },[queue,pos,wrong,picked,stats,done])
  const handleExit = useCallback(()=>{
    try{localStorage.removeItem(VC_KEY)}catch{}
    if(stats.total>0){
      try{
        const acc=Math.round((stats.correct/stats.total)*100)
        progress?.recordSession?.({ mode:'vocab-choice', label:`Pilihan Ganda ${stats.total} soal`, accuracy:acc, count:stats.total, bestCombo:stats.correct })
      }catch{}
    }
    onExit?.()
  },[stats, progress, onExit])

  if(!VOCAB.length) return <Card className="p-8 text-center">Vocab kosong</Card>
  if(done) return (
    <div className="mx-auto max-w-xl space-y-4 text-center">
      <Card className="p-8 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700">
        <p className="text-xl font-bold text-slate-900 dark:text-white">Selesai — semua benar! 🎉</p>
        <p className="mt-2 text-sm text-slate-600 dark:text-zinc-400">{stats.total} soal · {stats.correct} benar · +{stats.xp} XP</p>
        <div className="mt-4 flex justify-center gap-2">
          <Button onClick={()=>{ setQueue(shuffle(VOCAB).slice(0,30)); setPos(0); setWrong([]); setPicked(null); setStats({total:0,correct:0,xp:0}); setDone(false)}}>Main lagi</Button>
          <Button variant="ghost" onClick={onExit}>Beranda</Button>
        </div>
      </Card>
    </div>
  )
  if(!current) return <Card className="p-8 text-center">Vocab kosong</Card>

  return (
    <div className="mx-auto max-w-xl space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <Button variant="ghost" onClick={handleExit} className="px-3 py-2 text-xs">Beranda</Button>
        <Badge tone="indigo">Pilihan Ganda</Badge>
        <Badge tone="slate">{stats.correct}/{stats.total}</Badge>
        <Badge tone={wrong.length? 'rose':'slate'}>Salah {wrong.length}</Badge>
        <Badge tone="slate">{pos+1}/{queue.length}</Badge>
        <span className="ml-auto text-xs font-semibold text-emerald-700 dark:text-emerald-300">+{stats.xp} XP</span>
        <label className="ml-2 inline-flex items-center gap-1.5 cursor-pointer select-none rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-600 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
          <input type="checkbox" checked={showRomaji} onChange={e=>{ setShowRomaji(e.target.checked); try{localStorage.setItem('kd-show-romaji', e.target.checked?'1':'0')}catch{}}} className="h-3.5 w-3.5 rounded border-slate-300 text-zinc-900 focus:ring-zinc-500" />
          Romaji
        </label>
      </div>
      <Card className="p-6 sm:p-8 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-center">
        <p className="text-4xl font-extrabold text-slate-900 dark:text-white">{current.kana}</p>
        {showRomaji && <p className="mt-1 font-mono text-sm text-slate-500 dark:text-zinc-400">{romaji}</p>}
        {current.contoh_kana && <p className="mt-3 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 px-3 py-2 text-sm text-slate-700 dark:text-zinc-300">{current.contoh_kana}</p>}
      </Card>
      <div className="grid gap-2 sm:grid-cols-2">
        {options.map(opt=>{
          const isCorrect = opt===current.arti
          const isPicked = picked===opt
          const show = !!picked
          const tone = show ? (isCorrect ? 'emerald' : isPicked ? 'rose' : 'slate') : 'slate'
          return (
            <button key={opt} onClick={()=>pick(opt)} disabled={!!picked}
              className={`rounded-2xl border px-4 py-4 text-left font-medium transition ${show && isCorrect ? 'bg-emerald-50 border-emerald-300 text-emerald-800 dark:bg-emerald-950 dark:border-emerald-700 dark:text-emerald-200' : show && isPicked ? 'bg-red-50 border-red-300 text-red-800 dark:bg-red-950 dark:border-red-700 dark:text-red-200' : 'bg-white border-slate-200 hover:bg-slate-50 dark:bg-zinc-800 dark:border-zinc-700 dark:hover:bg-zinc-700 text-slate-900 dark:text-white'}`}>
              {opt}
            </button>
          )
        })}
      </div>
      {picked && (
        <div className="flex flex-col items-center gap-2">
          {pos >= queue.length - 1 && wrong.length>0 && <p className="text-xs text-amber-600 dark:text-amber-400">{wrong.length} soal salah akan diulang lagi</p>}
          <div className="flex justify-center gap-2">
            <Button onClick={next}>{pos >= queue.length -1 ? (wrong.length>0 ? 'Ulangi yang salah →' : 'Selesai →') : 'Lanjut →'}</Button>
            <Button variant="ghost" onClick={handleExit}>Keluar</Button>
          </div>
        </div>
      )}
      {!picked && <p className="text-center text-xs text-slate-500">Pilih arti yang benar · Salah akan diulang sampai benar semua</p>}
    </div>
  )
}
