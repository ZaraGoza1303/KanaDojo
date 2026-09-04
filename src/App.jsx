import React, { useState } from 'react'
import { useProgress } from './lib/progress.js'
import { ProgressBar, Toggle } from './components/ui.jsx'
import Home from './views/Home.jsx'
import TranslateMode from './views/TranslateMode.jsx'
import QuizMode from './views/QuizMode.jsx'
import ComboMode from './views/ComboMode.jsx'

export default function App() {
  const [view, setView] = useState('home')
  const progress = useProgress()
  const goHome = () => setView('home')

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-4xl flex-col px-4 pb-10 sm:px-6">
      <header className="sticky top-0 z-40 -mx-4 flex flex-wrap items-center gap-3 border-b border-slate-200 bg-white/90 px-4 py-3 backdrop-blur dark:border-zinc-700 dark:bg-zinc-900/90 sm:-mx-6 sm:px-6">
        <button onClick={goHome} className="flex items-center gap-2.5 text-left">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-zinc-900 text-sm font-bold text-white">KD</span>
          <span>
            <span className="block text-base font-bold leading-none tracking-tight text-slate-900 dark:text-white">KanaDojo</span>
            <span className="block text-[11px] leading-tight text-slate-500 dark:text-zinc-400">Hiragana & Katakana Trainer</span>
          </span>
        </button>

        <div className="ml-auto flex items-center gap-2 sm:gap-3">
          <button onClick={goHome} className="hidden min-w-[7.5rem] rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-left transition hover:bg-slate-100 dark:border-zinc-600 dark:bg-zinc-800 dark:hover:bg-slate-700 sm:block" title="Ke dashboard">
            <div className="flex items-baseline justify-between gap-2 text-[10px] uppercase tracking-wide text-slate-500 dark:text-zinc-400">
              <span>Lv.{progress.level} {progress.levelTitle}</span>
              <span>{progress.levelInto}/{progress.levelNeeded} XP</span>
            </div>
            <ProgressBar value={progress.levelInto} max={progress.levelNeeded} className="mt-1 h-1.5" />
          </button>
          <div className="rounded-xl border border-slate-200 bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-700 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-200">
            {progress.streakDays} hari
          </div>
          <Toggle checked={progress.theme === 'dark'} onChange={progress.toggleTheme} />
        </div>
      </header>

      <main className="flex-1 pt-6">
        {view === 'home' && <Home progress={progress} onNavigate={setView} />}
        {view === 'translate' && <TranslateMode progress={progress} onExit={goHome} />}
        {view === 'quiz' && <QuizMode progress={progress} onExit={goHome} />}
        {view === 'combo' && <ComboMode progress={progress} onExit={goHome} />}
      </main>

      <footer className="pt-8 text-center text-xs text-slate-500 dark:text-zinc-400">
        <p>Tips: pastikan keyboard dalam mode Latin (EN/ID) jangan aktifkan IME Jepang saat mengetik.</p>
        <p className="mt-1">Romaji mengikuti Hepburn standar · progres disimpan di perangkatmu</p>
      </footer>
    </div>
  )
}
