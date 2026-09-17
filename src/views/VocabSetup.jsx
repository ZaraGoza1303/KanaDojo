import { useMemo, useState } from 'react'
import { VOCAB_ALL, VOCAB_CATEGORIES, VOCAB_COUNT, getVocabByCategories } from '../data/vocabAll.js'
import { Card, Button, Badge } from '../components/ui.jsx'

const PRESETS = [10, 20, 30, 50]
const SETUP_KEY = (mode) => `kd-vocab-setup-${mode}`

function loadSetup(mode, fallbackCount = 20) {
  try {
    const j = JSON.parse(localStorage.getItem(SETUP_KEY(mode)))
    if (j && Array.isArray(j.categories) && j.categories.length) {
      const valid = j.categories.filter((c) => VOCAB_CATEGORIES.some((x) => x.name === c))
      if (valid.length) return { categories: valid, total: j.total ?? fallbackCount }
    }
  } catch {}
  return { categories: VOCAB_CATEGORIES.map((c) => c.name), total: fallbackCount }
}

const MODE_META = {
  choice: { title: 'Pilihan Ganda', badge: 'Pilihan Ganda', desc: 'Lihat kosakata, pilih arti yang benar dari 4 opsi.' },
  essay: { title: 'Essay', badge: 'Essay', desc: 'Lihat kana, ketik arti Indonesia sendiri.' },
  anki: { title: 'Mode Anki', badge: 'Anki', desc: 'Flip card + SRS. Due diprioritaskan, jumlah = batas kartu per sesi.' },
}

export default function VocabSetup({ mode = 'choice', onStart, onBack, savedInfo = null, onResume = null }) {
  const meta = MODE_META[mode] || MODE_META.choice
  const initial = useMemo(() => loadSetup(mode), [mode])
  const [selected, setSelected] = useState(initial.categories)
  const [totalSel, setTotalSel] = useState(initial.total) // number | 'all'
  const [custom, setCustom] = useState('')

  const allNames = useMemo(() => VOCAB_CATEGORIES.map((c) => c.name), [])
  const allChecked = selected.length === allNames.length

  const pool = useMemo(() => getVocabByCategories(selected), [selected])
  const poolSize = pool.length

  const effectiveTotal = totalSel === 'all' ? poolSize : Math.min(Number(totalSel) || 0, poolSize)
  const clamped = totalSel !== 'all' && Number(totalSel) > poolSize

  const toggle = (name) => {
    setSelected((s) => (s.includes(name) ? s.filter((x) => x !== name) : [...s, name]))
  }
  const toggleAll = () => {
    setSelected(allChecked ? [] : [...allNames])
  }

  const applyCustom = () => {
    const n = parseInt(custom, 10)
    if (!Number.isFinite(n) || n < 1) return
    setTotalSel(Math.min(n, VOCAB_COUNT))
    setCustom('')
  }

  const handleStart = () => {
    if (!selected.length || effectiveTotal < 1) return
    const total = totalSel === 'all' ? poolSize : Math.min(Number(totalSel), poolSize)
    try {
      localStorage.setItem(SETUP_KEY(mode), JSON.stringify({ categories: selected, total: totalSel }))
    } catch {}
    onStart?.({ categories: [...selected], total, poolSize })
  }

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <div className="flex flex-wrap items-center gap-2">
        <Button variant="ghost" onClick={onBack} className="px-3 py-2 text-xs">← Mode</Button>
        <Badge tone="indigo">{meta.badge}</Badge>
        <Badge tone="slate">{VOCAB_COUNT} kata</Badge>
        <span className="ml-auto text-xs text-slate-500 dark:text-zinc-400">{poolSize} kata tersedia</span>
      </div>

      <div className="text-center">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Atur sesi {meta.title}</h2>
        <p className="mt-1 text-sm text-slate-600 dark:text-zinc-400">{meta.desc}</p>
      </div>

      {savedInfo && onResume && (
        <Card className="flex flex-wrap items-center gap-3 border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-950">
          <div className="text-left text-sm">
            <p className="font-bold text-amber-800 dark:text-amber-200">Ada sesi tersimpan</p>
            <p className="text-xs text-amber-700 dark:text-amber-300">{savedInfo}</p>
          </div>
          <Button onClick={onResume} className="ml-auto px-4 py-2 text-xs">Lanjutkan sesi →</Button>
        </Card>
      )}

      <Card className="space-y-3 p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Kategori kosakata ({selected.length}/{allNames.length})</h3>
          <div className="flex gap-2">
            <button onClick={toggleAll} className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-zinc-600 dark:bg-zinc-700 dark:text-zinc-200">
              {allChecked ? 'Hapus semua' : 'Pilih Semua'}
            </button>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {VOCAB_CATEGORIES.map((c) => {
            const on = selected.includes(c.name)
            return (
              <button
                key={c.name}
                onClick={() => toggle(c.name)}
                className={`flex items-center justify-between gap-2 rounded-xl border px-3 py-2.5 text-left text-sm font-medium transition active:scale-[0.98] ${on ? 'border-slate-900 bg-slate-900 text-white dark:border-white dark:bg-white dark:text-zinc-900' : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-200'}`}
              >
                <span className="flex items-center gap-2">
                  <span className={`grid h-4 w-4 place-items-center rounded border text-[10px] ${on ? 'border-white bg-white text-slate-900 dark:border-zinc-900 dark:bg-zinc-900 dark:text-white' : 'border-slate-300 text-transparent dark:border-zinc-500'}`}>✓</span>
                  {c.name}
                </span>
                <span className={`text-xs ${on ? 'opacity-80' : 'text-slate-400'}`}>{c.count}</span>
              </button>
            )
          })}
        </div>
        {!selected.length && <p className="text-center text-xs font-semibold text-red-600">Pilih minimal 1 kategori dulu.</p>}
      </Card>

      <Card className="space-y-3 p-4 sm:p-5">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
          {mode === 'anki' ? 'Batas kartu per sesi' : 'Jumlah soal'}
        </h3>
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((n) => (
            <button
              key={n}
              onClick={() => setTotalSel(n)}
              className={`rounded-xl border px-4 py-2 text-sm font-bold transition ${totalSel === n ? 'border-slate-900 bg-slate-900 text-white dark:border-white dark:bg-white dark:text-zinc-900' : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-200'}`}
            >
              {n}
            </button>
          ))}
          <button
            onClick={() => setTotalSel('all')}
            className={`rounded-xl border px-4 py-2 text-sm font-bold transition ${totalSel === 'all' ? 'border-slate-900 bg-slate-900 text-white dark:border-white dark:bg-white dark:text-zinc-900' : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-200'}`}
          >
            Semua{poolSize > 0 ? ` (${poolSize})` : ''}
          </button>
        </div>
        <div className="flex gap-2">
          <input
            value={custom}
            onChange={(e) => setCustom(e.target.value.replace(/[^0-9]/g, '').slice(0, 4))}
            onKeyDown={(e) => { if (e.key === 'Enter') applyCustom() }}
            placeholder={`Custom 1–${Math.max(poolSize, 1)}…`}
            inputMode="numeric"
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none focus:border-slate-400 dark:border-zinc-600 dark:bg-zinc-700 dark:text-white"
          />
          <Button onClick={applyCustom} variant="ghost" className="shrink-0 px-4 py-2 text-xs">Pakai</Button>
        </div>
        {totalSel !== 'all' && (
          <p className="text-xs text-slate-500 dark:text-zinc-400">
            Dipilih: <b>{totalSel}</b> → jalan <b>{effectiveTotal}</b> soal dari {poolSize} kata tersedia.
            {clamped && <span className="font-semibold text-amber-600"> Dibatasi karena pool lebih kecil.</span>}
          </p>
        )}
        {mode === 'anki' && (
          <p className="text-xs text-slate-500 dark:text-zinc-400">Kartu Due diprioritaskan, sisanya kartu Baru. Progres SRS tetap tersimpan.</p>
        )}
        {mode !== 'anki' && (
          <p className="text-xs text-slate-500 dark:text-zinc-400">Soal salah akan diulang sampai benar semua.</p>
        )}
      </Card>

      <div className="flex justify-center gap-2 pb-2">
        <Button variant="ghost" onClick={onBack}>Kembali</Button>
        <Button onClick={handleStart} disabled={!selected.length || effectiveTotal < 1}>
          Mulai {effectiveTotal > 0 ? `(${effectiveTotal} soal) →` : '→'}
        </Button>
      </div>

      {/* cegah unused import warning bila bundler strict */}
      <span className="hidden">{VOCAB_ALL.length}</span>
    </div>
  )
}
