import { useState, useMemo, useCallback, useEffect } from 'react'
import { VOCAB } from '../data/vocab.js'
import { kanaTextToRomaji, extractKana } from '../lib/romaji.js'
import { Card, Button, Badge } from '../components/ui.jsx'

function shuffle(a){ const b=[...a]; for(let i=b.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [b[i],b[j]]=[b[j],b[i]] } return b }
const ES_KEY='kd-vocab-essay-state'
const loadES=()=>{ try{ const j=JSON.parse(localStorage.getItem(ES_KEY)); if(j&&j.queue) return j }catch{} return null }
function norm(s){ return s.trim().toLowerCase().replace(/\s+/g,' ') }

export default function VocabEssayMode({ progress, onExit }){
  const _s=loadES()
  const [queue,setQueue]=useState(()=> _s?.queue || shuffle(VOCAB).slice(0,30))
  const [pos,setPos]=useState(()=> _s?.pos || 0)
  const [wrong,setWrong]=useState(()=> _s?.wrong || [])
  const [input,setInput]=useState(()=> _s?.input || '')
  const [feedback,setFeedback]=useState(()=> _s?.feedback || null)
  const [stats,setStats]=useState(()=> _s?.stats || {total:0, correct:0, xp:0})
  const [done,setDone]=useState(()=> !!_s?.done)
  const [showRomaji,setShowRomaji]=useState(()=>{ try{return localStorage.getItem('kd-show-romaji-essay')!=='0'}catch{return true}})

  const current = queue[pos]
  const romaji = current ? kanaTextToRomaji(current.kana) : ''

  useEffect(()=>{ try{localStorage.setItem(ES_KEY, JSON.stringify({queue,pos,wrong,input,feedback,stats,done}))}catch{} },[queue,pos,wrong,input,feedback,stats,done])

  const submit = useCallback(()=>{
    if(!current || !input.trim() || feedback) return
    const ok = norm(input) === norm(current.arti)
    setFeedback(ok ? 'correct' : 'wrong')
    if(!ok) setWrong(w=> w.some(v=> v.id===current.id) ? w : [...w, current])
    const xp = ok ? 12 : 2
    setStats(s=> ({total:s.total+1, correct:s.correct+(ok?1:0), xp:s.xp+xp}))
    try{ progress?.addXp?.(xp)}catch{}
    try{
      const ks=extractKana(current.kana)
      if(ks.length) ks.forEach(k=> progress?.recordAnswer?.(ok,k))
      else progress?.recordAnswer?.(ok)
    }catch{}
  },[current,input,feedback,progress])

  const next = useCallback(()=>{
    const isLast = pos >= queue.length -1
    if(isLast){
      if(wrong.length>0){
        setQueue(shuffle(wrong))
        setPos(0)
        setWrong([])
        setInput('')
        setFeedback(null)
      } else {
        setDone(true)
        try{localStorage.removeItem(ES_KEY)}catch{}
      }
    } else {
      setPos(p=>p+1)
      setInput('')
      setFeedback(null)
    }
  },[pos,queue.length,wrong])

  const handleExit = useCallback(()=>{
    try{localStorage.removeItem(ES_KEY)}catch{}
    if(stats.total>0){
      try{
        const acc=Math.round((stats.correct/stats.total)*100)
        progress?.recordSession?.({mode:'vocab-essay', label:`Essay ${stats.total} soal`, accuracy:acc, count:stats.total, bestCombo:stats.correct})
      }catch{}
    }
    onExit?.()
  },[stats,progress,onExit])

  if(!VOCAB.length) return <Card className="p-8 text-center">Vocab kosong</Card>
  if(done) return (
    <div className="mx-auto max-w-xl space-y-4 text-center">
      <Card className="p-8 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700">
        <p className="text-xl font-bold text-slate-900 dark:text-white">Selesai — semua benar! 🎉</p>
        <p className="mt-2 text-sm text-slate-600 dark:text-zinc-400">{stats.total} soal · {stats.correct} benar · +{stats.xp} XP</p>
        <div className="mt-4 flex justify-center gap-2">
          <Button onClick={()=>{ setQueue(shuffle(VOCAB).slice(0,30)); setPos(0); setWrong([]); setInput(''); setFeedback(null); setStats({total:0,correct:0,xp:0}); setDone(false)}}>Main lagi</Button>
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
        <Badge tone="indigo">Essay</Badge>
        <Badge tone="slate">{stats.correct}/{stats.total}</Badge>
        <Badge tone={wrong.length?'rose':'slate'}>Salah {wrong.length}</Badge>
        <Badge tone="slate">{pos+1}/{queue.length}</Badge>
        <span className="ml-auto text-xs font-semibold text-emerald-700 dark:text-emerald-300">+{stats.xp} XP</span>
        <label className="ml-2 inline-flex items-center gap-1.5 cursor-pointer select-none rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-600 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
          <input type="checkbox" checked={showRomaji} onChange={e=>{ setShowRomaji(e.target.checked); try{localStorage.setItem('kd-show-romaji-essay', e.target.checked?'1':'0')}catch{}}} className="h-3.5 w-3.5 rounded border-slate-300 text-zinc-900 focus:ring-zinc-500" />
          Romaji
        </label>
      </div>

      <Card className="p-6 sm:p-8 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-center">
        <p className="text-4xl font-extrabold text-slate-900 dark:text-white">{current.kana}</p>
        {showRomaji && <p className="mt-1 font-mono text-sm text-slate-500 dark:text-zinc-400">{romaji}</p>}
        {current.contoh_kana && <p className="mt-3 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 px-3 py-2 text-sm text-slate-700 dark:text-zinc-300">{current.contoh_kana}</p>}
      </Card>

      <Card className="p-4 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700">
        <input value={input} onChange={e=> setInput(e.target.value)} onKeyDown={e=>{ if(e.key==='Enter'){ if(feedback) next(); else submit() } }} disabled={!!feedback} placeholder="ketik arti Indonesia..." className={`w-full rounded-2xl border px-5 py-4 text-center text-lg outline-none ${feedback==='correct' ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : feedback==='wrong' ? 'border-red-400 bg-red-50' : 'border-slate-300 bg-white dark:bg-zinc-700 text-slate-900 dark:text-white'}`} autoCapitalize="off" autoCorrect="off" spellCheck={false} />
        {!feedback ? (
          <div className="mt-3 flex justify-center gap-2">
            <Button onClick={submit} disabled={!input.trim()}>Periksa</Button>
            <Button variant="ghost" onClick={handleExit}>Keluar</Button>
          </div>
        ) : (
          <div className="mt-3 text-center space-y-2">
            <p className={`text-sm font-bold ${feedback==='correct' ? 'text-emerald-700' : 'text-red-600'}`}>{feedback==='correct' ? 'Benar! 🎉' : `Salah — jawaban: ${current.arti}`}</p>
            <div className="flex justify-center gap-2">
              <Button onClick={next}>{pos>=queue.length-1 && wrong.length>0 ? 'Ulangi yang salah →' : pos>=queue.length-1 ? 'Selesai →' : 'Lanjut →'}</Button>
            </div>
          </div>
        )}
        {!feedback && <p className="mt-2 text-center text-xs text-slate-500">Ketik arti persis (tanpa huruf besar/kecil ngaruh) · Salah akan diulang</p>}
      </Card>
    </div>
  )
}
