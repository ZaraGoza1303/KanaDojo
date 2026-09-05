import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Card, Button, Badge } from '../components/ui.jsx'
import { TEXTS } from '../data/texts.js'
import { kanaTextToRomaji, kanaTextToWordSegments, diffAnswerWords, accuracy as calcAccuracy, extractKana } from '../lib/romaji.js'
import { fireConfetti } from '../lib/confetti.js'
import { playCorrect, playWrong, playFinish } from '../lib/sound.js'
import { comboMultiplier } from '../lib/progress.js'

function makeBag() {
  const arr = TEXTS.map((_, i) => i)
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

function formatTime(sec) {
  const m = Math.floor(sec / 60)
  const s = sec % 60
  return m > 0 ? `${m}m ${s}s` : `${s}s`
}

export default function TranslateMode({ progress, onExit }) {
  const [bag, setBag] = useState(makeBag)
  const [textIndex, setTextIndex] = useState(() => bag[0])
  const [answer, setAnswer] = useState('')
  const [submitted, setSubmitted] = useState(null)
  const [hint, setHint] = useState(false)
  const [hintReveal, setHintReveal] = useState(0)
  const [startedAt, setStartedAt] = useState(() => Date.now())
  const [elapsed, setElapsed] = useState(0)
  const [session, setSession] = useState({ count: 0, correct: 0, sumAccuracy: 0, bestCombo: 0, combo: 0, xp: 0 })
  const inputRef = useRef(null)

  const text = TEXTS[textIndex]
  const expected = useMemo(() => kanaTextToRomaji(text.kana), [text])
  const wordSegments = useMemo(() => kanaTextToWordSegments(text.kana), [text])
  // Pecah teks kana asli jadi potongan kata & tanda baca, urutannya cocok
  // dengan wordSegments supaya bisa diwarnai per kata
  const kanaChunks = useMemo(() => {
    let wi = 0
    return text.kana
      .split(/([、。！？「」…・,.!?\s]+)/)
      .filter(Boolean)
      .map((chunk) =>
        /^[、。！？「」…・,.!?\s]+$/.test(chunk)
          ? { chunk, wordIndex: null }
          : { chunk, wordIndex: wi++ },
      )
  }, [text])
  const wordResult = useMemo(() => {
    if (!submitted || typeof submitted.answer !== 'string') return null
    try {
      return diffAnswerWords(submitted.answer, wordSegments)
    } catch {
      return null
    }
  }, [submitted, wordSegments])

  useEffect(() => {
    if (submitted) return
    const t = setInterval(() => setElapsed(Math.floor((Date.now() - startedAt) / 1000)), 500)
    return () => clearInterval(t)
  }, [submitted, startedAt])

  useEffect(() => {
    inputRef.current?.focus()
  }, [textIndex])

  const nextText = () => {
    let rest = bag.slice(1)
    if (rest.length === 0) rest = makeBag()
    setBag(rest)
    setTextIndex(rest[0])
    setAnswer('')
    setSubmitted(null)
    setHint(false)
    setHintReveal(0)
    setStartedAt(Date.now())
    setElapsed(0)
    inputRef.current?.focus()
  }

  const submit = () => {
    if (submitted || answer.trim() === '') return
    const timeSec = Math.floor((Date.now() - startedAt) / 1000)
    const acc = calcAccuracy(answer, expected)
    const correct = acc >= 90
    const hintUsed = hintReveal > 0
    const mult = comboMultiplier(session.combo + (correct ? 1 : 0))
    const xpGain = Math.round((acc / 100) * 20 * mult * (hintUsed ? 0.5 : 1))

    setSubmitted({ answer: answer.trim(), accuracy: acc, time: timeSec, hintUsed, xpGain })
    progress.recordAnswer(correct)
    if (correct) {
      for (const k of extractKana(text.kana)) progress.recordAnswer(true, k)
    }
    progress.addXp(xpGain)
    setSession((s) => {
      const combo = correct ? s.combo + 1 : 0
      return {
        count: s.count + 1,
        correct: s.correct + (correct ? 1 : 0),
        sumAccuracy: s.sumAccuracy + acc,
        bestCombo: Math.max(s.bestCombo, combo),
        combo,
        xp: s.xp + xpGain,
      }
    })
    if (correct) {
      playCorrect()
      if (acc === 100) fireConfetti({ count: 60, originY: 0.5 })
    } else {
      playWrong()
    }
  }

  const finishSession = () => {
    if (session.count > 0) {
      const label = session.count === 1 ? 'Translate 1 teks' : `Translate ${session.count} teks`
      progress.recordSession({
        mode: 'translate',
        label,
        accuracy: Math.round(session.sumAccuracy / session.count),
        count: session.count,
        bestCombo: session.bestCombo,
      })
      playFinish()
      fireConfetti({ count: 140 })
    }
    onExit()
  }

  const showHint = () => {
    setHint(true)
    setHintReveal(Math.min(3, hintReveal + 2))
  }

  const hintPrefix = hintReveal > 0 ? expected.replace(/ /g, '').slice(0, hintReveal) : null

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-2">
        <Button variant="ghost" onClick={finishSession} className="px-3 py-2 text-xs">Beranda</Button>
        <Badge tone="indigo">Mode Translate</Badge>
        <Badge tone="slate">{text.category}</Badge>
        <Badge tone={text.difficulty === 3 ? 'rose' : text.difficulty === 2 ? 'amber' : 'emerald'}>
          Tingkat {text.difficulty}
        </Badge>
        <div className="ml-auto flex items-center gap-2 text-xs text-slate-600 dark:text-zinc-400">
          <span>Waktu: {formatTime(elapsed)}</span>
          <span>·</span>
          <span>{session.count} teks</span>
          {session.combo >= 2 && <Badge tone="amber">Combo x{session.combo}</Badge>}
        </div>
      </div>

      <Card className={`p-5 sm:p-8 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 ${submitted && submitted.accuracy < 90 ? 'animate-shake' : ''}`}>
        <p className="text-base leading-loose text-slate-900 dark:text-white sm:text-2xl sm:leading-loose">{text.kana}</p>
        <p className="mt-3 text-xs text-slate-600 dark:text-zinc-400">
          Tulis romaji-nya di bawah tanda spasi boleh ditulis atau tidak (contoh: <span className="text-slate-700 dark:text-zinc-300">watashi wa</span> atau <span className="text-slate-700 dark:text-zinc-300">watashiwa</span>).
        </p>
      </Card>

      <Card className="p-5 sm:p-6 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700">
        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            ref={inputRef}
            value={answer}
            disabled={!!submitted}
            onChange={(e) => setAnswer(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') submitted ? nextText() : submit()
            }}
            placeholder="tulis romaji di sini..."
            autoCapitalize="off"
            autoCorrect="off"
            spellCheck={false}
            className="w-full flex-1 rounded-2xl border border-slate-300 dark:border-zinc-600 bg-white dark:bg-zinc-700 px-5 py-4 text-base text-slate-900 dark:text-white outline-none transition placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-zinc-500 focus:ring-2 focus:ring-zinc-500/20 sm:text-lg"
          />
          {!submitted ? (
            <div className="flex flex-wrap gap-2 sm:flex-nowrap">
              <Button variant="ghost" onClick={showHint} title="Tampilkan 2 huruf pertama" className="flex-1 sm:flex-none">Hint</Button>
              <Button variant="ghost" onClick={nextText} title="Lewati teks ini" className="flex-1 sm:flex-none">Lewati</Button>
              <Button onClick={submit} className="w-full sm:w-auto">Periksa</Button>
            </div>
          ) : (
            <Button variant="success" onClick={nextText} className="w-full sm:w-auto">Lanjut</Button>
          )}
        </div>

        {hintPrefix && !submitted && (
          <p className="mt-3 text-sm text-amber-700 dark:text-amber-300">
            Romaji dimulai dengan: <span className="font-mono text-base font-bold">{hintPrefix}...</span>
          </p>
        )}
      </Card>

      {submitted && (
        <Card className="p-6 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700">
          <div className="flex flex-wrap items-center gap-3">
            <Badge tone={submitted.accuracy >= 90 ? 'emerald' : submitted.accuracy >= 60 ? 'amber' : 'rose'} className="px-3 py-1 text-sm">
              {submitted.accuracy >= 90 ? 'Lulus' : submitted.accuracy >= 60 ? 'Cukup' : 'Perlu latihan'}
            </Badge>
            <div>
              <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
                {submitted.accuracy}% <span className="text-sm font-medium text-slate-600 dark:text-zinc-400">akurasi</span>
              </div>
              <div className="text-xs text-slate-600 dark:text-zinc-400">
                Waktu: {formatTime(submitted.time)} · +{submitted.xpGain} XP
                {submitted.hintUsed && ' · hint dipakai (XP dibagi 2)'}
              </div>
            </div>
          </div>

          <div className="mt-5 space-y-3">
            <div>
              <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-zinc-400">Jawaban kamu</div>
              <p className="break-all rounded-2xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-900 px-4 py-3 font-mono text-sm text-slate-700 dark:text-zinc-300">
                {answer.trim() || <span className="text-slate-500 dark:text-slate-500">(kosong)</span>}
              </p>
            </div>
            <div>
              <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-zinc-400">
                Teks kana <span className="normal-case text-slate-500 dark:text-slate-500">(hijau = kata benar, merah = kata salah)</span>
              </div>
              <p className="break-words rounded-2xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-900 px-4 py-3 text-base leading-loose">
                {kanaChunks.map((c, i) => {
                  if (c.wordIndex === null) return <span key={i}>{c.chunk}</span>
                  const charStatus = wordResult?.kanaCharStatus?.[c.wordIndex]
                  return (
                    <span key={i}>
                      {[...c.chunk].map((ch, k) => {
                        const status = charStatus?.[k] ?? wordResult?.wordStatus?.[c.wordIndex] ?? 'ok'
                        return (
                          <span
                            key={k}
                            className={
                              status === 'wrong'
                                ? 'rounded bg-red-50 dark:bg-red-950 px-0.5 font-bold text-red-700 dark:text-red-300'
                                : 'text-emerald-700 dark:text-emerald-300'
                            }
                          >
                            {ch}
                          </span>
                        )
                      })}
                    </span>
                  )
                })}
              </p>
            </div>
            <div>
              <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-zinc-400">
                Romaji yang benar <span className="normal-case text-slate-500 dark:text-slate-500">(hijau = benar, merah = salah)</span>
              </div>
              <p className="break-all rounded-2xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-900 px-4 py-3 font-mono text-sm leading-relaxed">
                {wordSegments.map((w, wi) => {
                  const status = wordResult?.wordStatus?.[wi] ?? 'ok'
                  return (
                    <span
                      key={wi}
                      className={
                        status === 'wrong'
                          ? 'rounded bg-red-50 dark:bg-red-950 px-0.5 font-bold text-red-700 dark:text-red-300'
                          : 'text-emerald-700 dark:text-emerald-300'
                      }
                    >
                      {w.romaji}
                      {wi < wordSegments.length - 1 && ' '}
                    </span>
                  )
                })}
              </p>
            </div>
          </div>
        </Card>
      )}

      {session.count >= 3 && !submitted && (
        <div className="text-center text-xs text-slate-600 dark:text-zinc-400">
          Sesi ini: {session.correct}/{session.count} bagus · rata-rata akurasi{' '}
          <span className="font-bold text-emerald-700 dark:text-emerald-300">{Math.round(session.sumAccuracy / session.count)}%</span> · +{session.xp} XP 
          <button onClick={finishSession} className="ml-1 font-semibold text-slate-900 dark:text-zinc-100 underline underline-offset-2">
            akhiri sesi dan simpan
          </button>
        </div>
      )}
    </div>
  )
}
