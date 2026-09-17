import { useState, useEffect, useCallback } from 'react'
import { VOCAB_COUNT } from '../data/vocabAll.js'
import { Card, Button, Badge } from '../components/ui.jsx'
import AnkiMode from './AnkiMode.jsx'
import VocabChoiceMode from './VocabChoiceMode.jsx'
import VocabEssayMode from './VocabEssayMode.jsx'
import VocabSetup from './VocabSetup.jsx'
const HUB_KEY='kd-vocab-hub-mode'
const STATE_KEYS={ choice:'kd-vocab-choice-state', essay:'kd-vocab-essay-state', anki:'kd-anki-session' }

function getSavedInfo(mode){
  try{
    const raw=localStorage.getItem(STATE_KEYS[mode])
    if(!raw) return null
    const j=JSON.parse(raw)
    if(mode==='anki'){
      if(j?.stats?.reviewed>0) return `${j.stats.reviewed} kartu sudah direview (+${j.stats.xp||0} XP)`
      return 'Sesi Anki tersimpan'
    }
    const total=j?.stats?.total||0
    if(total>0){
      const n=(j.ids||[]).length || (j.queue||[]).length || '?'
      return `${total} soal terjawab · posisi ${Math.min((j.pos||0)+1, n)}/${n}`
    }
    return 'Sesi tersimpan'
  }catch{} return null
}

export default function VocabHub({ progress, onExit }){
  const [mode, setMode] = useState(()=>{ try{const v=localStorage.getItem(HUB_KEY); if(['anki','choice','essay'].includes(v)) return v}catch{} return 'menu'})
  const [config, setConfig] = useState(null) // null = tampilkan setup dulu; {categories,total} atau {resume:true}
  const [runId, setRunId] = useState(0)
  useEffect(()=>{ try{ if(mode==='menu') localStorage.removeItem(HUB_KEY); else localStorage.setItem(HUB_KEY, mode)}catch{} },[mode])
  const pickMode = useCallback((m)=>{ setConfig(null); setMode(m) },[])
  const backToMenu = useCallback(()=>{ setConfig(null); setMode('menu') },[])
  const backToSetup = useCallback(()=>{ setConfig(null) },[])

  const startNew = useCallback((m, cfg)=>{
    try{localStorage.removeItem(STATE_KEYS[m])}catch{}
    setConfig({ ...cfg, resume:false })
    setRunId((n)=>n+1)
  },[])
  const resume = useCallback(()=>{ setConfig({ resume:true }); setRunId((n)=>n+1) },[])

  if(mode==='anki' || mode==='choice' || mode==='essay'){
    if(!config){
      return <VocabSetup mode={mode} onBack={backToMenu} onStart={(cfg)=>startNew(mode,cfg)} savedInfo={getSavedInfo(mode)} onResume={getSavedInfo(mode)?resume:null} />
    }
    const setupProps = config.resume ? { resumeSession:true } : { categories:config.categories, total:config.total }
    if(mode==='anki') return <AnkiMode key={`anki-${runId}`} progress={progress} onExit={backToMenu} onSetup={backToSetup} {...setupProps} />
    if(mode==='choice') return <VocabChoiceMode key={`choice-${runId}`} progress={progress} onExit={backToMenu} onSetup={backToSetup} {...setupProps} />
    if(mode==='essay') return <VocabEssayMode key={`essay-${runId}`} progress={progress} onExit={backToMenu} onSetup={backToSetup} {...setupProps} />
  }
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" onClick={onExit} className="px-3 py-2 text-xs">Beranda</Button>
        <Badge tone="indigo">Mode Kosakata</Badge>
        <Badge tone="slate">{VOCAB_COUNT} kata N5-N4</Badge>
      </div>
      <div className="text-center">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Pilih mode belajar</h2>
        <p className="mt-1 text-sm text-slate-600 dark:text-zinc-400">Kosakata hiragana/katakana + arti Indonesia</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <button onClick={()=>pickMode('anki')} className="rounded-2xl border border-slate-200 bg-white p-6 text-left shadow-sm transition hover:shadow-md dark:border-zinc-700 dark:bg-zinc-800">
          <h3 className="font-semibold text-slate-900 dark:text-white">Mode Anki</h3>
          <p className="mt-1 text-xs text-slate-600 dark:text-zinc-400">Flip card + SRS (Again/Hard/Good/Easy). Hafalan jangka panjang.</p>
          <div className="mt-3 flex gap-1.5"><span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-medium text-emerald-700">SRS</span><span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] text-slate-600">Flip</span></div>
          <span className="mt-4 inline-block text-xs font-semibold text-slate-900 dark:text-white">Atur →</span>
        </button>
        <button onClick={()=>pickMode('choice')} className="rounded-2xl border border-slate-200 bg-white p-6 text-left shadow-sm transition hover:shadow-md dark:border-zinc-700 dark:bg-zinc-800">
          <h3 className="font-semibold text-slate-900 dark:text-white">Pilihan Ganda</h3>
          <p className="mt-1 text-xs text-slate-600 dark:text-zinc-400">Lihat kosakata, pilih arti yang benar dari 4 opsi.</p>
          <div className="mt-3 flex gap-1.5"><span className="rounded-full bg-sky-100 px-2 py-0.5 text-[10px] font-medium text-sky-700">4 opsi</span><span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] text-slate-600">Cepat</span></div>
          <span className="mt-4 inline-block text-xs font-semibold text-slate-900 dark:text-white">Atur →</span>
        </button>
        <button onClick={()=>pickMode('essay')} className="rounded-2xl border border-slate-200 bg-white p-6 text-left shadow-sm transition hover:shadow-md dark:border-zinc-700 dark:bg-zinc-800">
          <h3 className="font-semibold text-slate-900 dark:text-white">Essay</h3>
          <p className="mt-1 text-xs text-slate-600 dark:text-zinc-400">Lihat kana, ketik arti Indonesia sendiri.</p>
          <div className="mt-3 flex gap-1.5"><span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-medium text-amber-700">Ketik</span><span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] text-slate-600">Hafalan</span></div>
          <span className="mt-4 inline-block text-xs font-semibold text-slate-900 dark:text-white">Atur →</span>
        </button>
      </div>
      <Card className="p-4 text-center text-xs text-slate-500 dark:text-zinc-400">{VOCAB_COUNT} kata N5-N4 • Hari/Angka/Bulan/Tanggal • progreso & XP tetap tercatat</Card>
    </div>
  )
}
