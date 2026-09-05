import React from 'react'
import { Card, Button, StatCard, ProgressBar, Badge } from '../components/ui.jsx'
import { TOTAL_BASE_KANA } from '../data/kana.js'
import { TEXTS } from '../data/texts.js'
import { EXTENDED_KANA, LOANWORDS } from '../data/extended.js'

const MODES = [
  { id: 'translate', title: 'Mode Translate', desc: 'Baca teks panjang, tulis romaji-nya. Akurasi, waktu & highlight kesalahan.', tags: ['Cerita & Dialog', `${TEXTS.length} teks`, 'Endless'] },
  { id: 'quiz', title: 'Tes Huruf', desc: 'Kuis cepat 1 huruf: hiragana, katakana, atau campur. Streak & combo.', tags: ['20-30 soal', 'Filter kana', 'Endless & Challenge'] },
  { id: 'combo', title: 'Kombinasi & Extended', desc: `${EXTENDED_KANA.length} kombinasi sulit plus mode Kata Serapan.`, tags: [`${LOANWORDS.length} kata serapan`, 'Yoon', 'Challenge'] },
  { id: 'vocab', title: 'Mode Kosakata', desc: 'Tebak arti kosakata N5-N4 — pilih Anki flip atau Pilihan Ganda', tags: ['300 kata', '2 mode', 'N5-N4'] },
  { id: 'lobby', title: 'Multiplayer Online', desc: 'Tanding realtime 1v1 semua mode via room code', tags: ['Realtime', 'Room Code', 'Semua Mode'] },
]

export default function Home({ progress, onNavigate }) {
  const visibleModes = MODES.filter((m) => m.id !== 'lobby')
  const maxDayXp = Math.max(10, ...progress.last7.map((d) => d.xp))
  return (
    <div className="space-y-8">
      <section className="animate-rise">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
              Selamat datang siap latihan hari ini?
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-600 dark:text-zinc-400 sm:text-base">
              Kuasai membaca hiragana & katakana lewat latihan terstruktur.
            </p>
          </div>
          <Button onClick={() => onNavigate('lobby')} className="shrink-0 rounded-xl bg-zinc-900 px-5 py-3 text-sm font-bold text-white shadow-md hover:bg-black dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100">
            Multiplayer →
          </Button>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {visibleModes.map((m, i) => (
          <button key={m.id} onClick={() => onNavigate(m.id)} style={{ animationDelay: `${i * 70}ms` }} className="animate-rise rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:border-slate-300 hover:shadow-md dark:border-zinc-700 dark:bg-zinc-800 dark:hover:border-zinc-600">
            <h2 className="font-semibold text-slate-900 dark:text-white">{m.title}</h2>
            <p className="mt-1 text-xs leading-relaxed text-slate-600 dark:text-zinc-400">{m.desc}</p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {m.tags.map((t) => <span key={t} className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600 dark:bg-zinc-700 dark:text-zinc-300">{t}</span>)}
            </div>
            <span className="mt-4 inline-block text-xs font-semibold text-slate-900 dark:text-zinc-100">Mulai →</span>
          </button>
        ))}
      </section>

      <section className="space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-widest text-slate-500 dark:text-zinc-400">Progress kamu</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Level" value={`Lv.${progress.level}`} sub={progress.levelTitle} />
          <StatCard label="Streak harian" value={`${progress.streakDays} hari`} accent="text-amber-600 dark:text-amber-400" />
          <StatCard label="Akurasi total" value={`${progress.overallAccuracy}%`} sub={`${progress.totalAnswers} jawaban`} accent="text-emerald-600 dark:text-emerald-400" />
          <StatCard label="Huruf dikuasai" value={`${progress.masteredCount}/${TOTAL_BASE_KANA}`} sub="≥3× benar per huruf" accent="text-sky-600 dark:text-sky-400" />
        </div>

        <div className="grid gap-3 lg:grid-cols-2">
          <Card className="p-5">
            <div className="flex items-baseline justify-between"><h3 className="text-sm font-bold text-slate-900 dark:text-white">XP Level</h3><span className="text-xs text-slate-500">{progress.xp} XP total</span></div>
            <ProgressBar value={progress.levelInto} max={progress.levelNeeded} className="mt-3" />
            <p className="mt-2 text-xs text-slate-500">{progress.levelNeeded - progress.levelInto} XP lagi menuju Lv.{progress.level + 1}</p>
          </Card>
          <Card className="p-5">
            <div className="flex items-baseline justify-between"><h3 className="text-sm font-bold text-slate-900 dark:text-white">Penguasaan Kana</h3><span className="text-xs text-slate-500">{progress.masteredPercent}%</span></div>
            <ProgressBar value={progress.masteredPercent} max={100} className="mt-3" barClassName="bg-emerald-600 dark:bg-emerald-500" />
            <p className="mt-2 text-xs text-slate-500">Setiap huruf yang kamu jawab benar 3× dihitung “dikuasai”.</p>
          </Card>
        </div>

        <Card className="p-5">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Aktivitas 7 hari terakhir</h3>
          <div className="mt-4 flex h-24 items-end justify-between gap-2">
            {progress.last7.map((d) => (
              <div key={d.key} className="flex flex-1 flex-col items-center gap-1.5">
                <div className="flex w-full flex-1 items-end">
                  <div className={`w-full rounded-t-lg transition-all ${d.xp > 0 ? 'bg-zinc-900 dark:bg-zinc-100' : 'bg-slate-200 dark:bg-zinc-700'}`} style={{ height: `${Math.max(4, (d.xp / maxDayXp) * 100)}%` }} title={`${d.xp} XP`} />
                </div>
                <span className="text-[10px] text-slate-500">{d.label}</span>
              </div>
            ))}
          </div>
        </Card>

        {progress.sessions.length > 0 && (
          <Card className="divide-y divide-slate-200 p-2 dark:divide-slate-700">
            {progress.sessions.slice(0, 5).map((s, i) => (
              <div key={i} className="flex items-center gap-3 px-3 py-2.5 text-sm">
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">{s.mode}</span>
                <span className="font-medium text-slate-900 dark:text-white">{s.label}</span>
                <span className="ml-auto text-xs text-slate-500">{new Date(s.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                <Badge tone={s.accuracy >= 80 ? 'emerald' : s.accuracy >= 60 ? 'amber' : 'rose'}>{s.accuracy}%</Badge>
              </div>
            ))}
          </Card>
        )}

        {progress.totalAnswers === 0 && (
          <Card className="p-6 text-center text-sm text-slate-600 dark:text-zinc-400">
            Belum ada data latihan. Mulai dari <button onClick={() => onNavigate('quiz')} className="font-semibold text-slate-900 underline dark:text-zinc-100">Tes Huruf</button> atau <button onClick={() => onNavigate('translate')} className="font-semibold text-slate-900 underline dark:text-zinc-100">Mode Translate</button>.
          </Card>
        )}
      </section>
    </div>
  )
}
