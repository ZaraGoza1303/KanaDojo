import { useState, useEffect } from 'react'
import { Card, Button, Badge } from '../components/ui.jsx'
import AnkiMode from './AnkiMode.jsx'
import VocabChoiceMode from './VocabChoiceMode.jsx'
import VocabEssayMode from './VocabEssayMode.jsx'
const HUB_KEY='kd-vocab-hub-mode'

export default function VocabHub({ progress, onExit }){
  const [mode, setMode] = useState(()=>{ try{const v=localStorage.getItem(HUB_KEY); if(['anki','choice','essay'].includes(v)) return v}catch{} return 'menu'})
  useEffect(()=>{ try{ if(mode==='menu') localStorage.removeItem(HUB_KEY); else localStorage.setItem(HUB_KEY, mode)}catch{} },[mode])
  if(mode==='anki') return <AnkiMode progress={progress} onExit={()=>setMode('menu')} />
  if(mode==='choice') return <VocabChoiceMode progress={progress} onExit={()=>setMode('menu')} />
  if(mode==='essay') return <VocabEssayMode progress={progress} onExit={()=>setMode('menu')} />
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" onClick={onExit} className="px-3 py-2 text-xs">Beranda</Button>
        <Badge tone="indigo">Mode Kosakata</Badge>
        <Badge tone="slate">300 kata N5-N4</Badge>
      </div>
      <div className="text-center">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Pilih mode belajar</h2>
        <p className="mt-1 text-sm text-slate-600 dark:text-zinc-400">Kosakata hiragana/katakana + arti Indonesia</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <button onClick={()=>setMode('anki')} className="rounded-2xl border border-slate-200 bg-white p-6 text-left shadow-sm transition hover:shadow-md dark:border-zinc-700 dark:bg-zinc-800">
          <h3 className="font-semibold text-slate-900 dark:text-white">Mode Anki</h3>
          <p className="mt-1 text-xs text-slate-600 dark:text-zinc-400">Flip card + SRS (Again/Hard/Good/Easy). Hafalan jangka panjang.</p>
          <div className="mt-3 flex gap-1.5"><span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-medium text-emerald-700">SRS</span><span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] text-slate-600">Flip</span></div>
          <span className="mt-4 inline-block text-xs font-semibold text-slate-900 dark:text-white">Mulai →</span>
        </button>
        <button onClick={()=>setMode('choice')} className="rounded-2xl border border-slate-200 bg-white p-6 text-left shadow-sm transition hover:shadow-md dark:border-zinc-700 dark:bg-zinc-800">
          <h3 className="font-semibold text-slate-900 dark:text-white">Pilihan Ganda</h3>
          <p className="mt-1 text-xs text-slate-600 dark:text-zinc-400">Lihat kosakata, pilih arti yang benar dari 4 opsi.</p>
          <div className="mt-3 flex gap-1.5"><span className="rounded-full bg-sky-100 px-2 py-0.5 text-[10px] font-medium text-sky-700">4 opsi</span><span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] text-slate-600">Cepat</span></div>
          <span className="mt-4 inline-block text-xs font-semibold text-slate-900 dark:text-white">Mulai →</span>
        </button>
        <button onClick={()=>setMode('essay')} className="rounded-2xl border border-slate-200 bg-white p-6 text-left shadow-sm transition hover:shadow-md dark:border-zinc-700 dark:bg-zinc-800">
          <h3 className="font-semibold text-slate-900 dark:text-white">Essay</h3>
          <p className="mt-1 text-xs text-slate-600 dark:text-zinc-400">Lihat kana, ketik arti Indonesia sendiri.</p>
          <div className="mt-3 flex gap-1.5"><span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-medium text-amber-700">Ketik</span><span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] text-slate-600">Hafalan</span></div>
          <span className="mt-4 inline-block text-xs font-semibold text-slate-900 dark:text-white">Mulai →</span>
        </button>
      </div>
      <Card className="p-4 text-center text-xs text-slate-500 dark:text-zinc-400">300 kata N5-N4 • progresso & XP tetap tercatat</Card>
    </div>
  )
}
