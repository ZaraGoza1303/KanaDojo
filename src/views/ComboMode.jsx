import React, { useCallback, useEffect, useRef, useState } from 'react'
import { Card, Button, Badge, Segmented, ProgressBar } from '../components/ui.jsx'
import { EXTENDED_KANA, YOON_KANA, LOANWORDS } from '../data/extended.js'
import { accuracy as calcAccuracy } from '../lib/romaji.js'
import { fireConfetti } from '../lib/confetti.js'
import { playCorrect, playWrong, playCombo, playFinish, playClick } from '../lib/sound.js'
import { comboMultiplier } from '../lib/progress.js'

const CHALLENGE_SECONDS = 12
const COMBO_KEY='kd-combo-state'
const loadCombo=()=>{try{const j=JSON.parse(localStorage.getItem(COMBO_KEY)); if(j&&j.phase==='play') return j}catch{} return null}

const SINGLE_LETTERS = [
  ...EXTENDED_KANA.map((e) => [e.kana, e.romaji, null]),
  ...YOON_KANA.map(([k, r]) => [k, r, null]),
]
const WORDS = LOANWORDS.map((w) => [w.kana, w.romaji, w.arti, w.combo])
const LETTERS = SINGLE_LETTERS

export default function ComboMode({ progress, onExit }) {
  const _c=loadCombo()
  const [phase, setPhase] = useState(_c?.phase || 'config')
  const [subMode, setSubMode] = useState(_c?.subMode || 'letters')
  const usedRef = useRef(new Set())
  const [length, setLength] = useState(_c?.length ?? 30)
  const [challenge, setChallenge] = useState(_c?.challenge || false)

  const [dakuten, setDakuten] = useState(_c?.dakuten || false)
  const [current, setCurrent] = useState(_c?.current || null)
  const [answer, setAnswer] = useState('')
  const [feedback, setFeedback] = useState(null)
  const [answered, setAnswered] = useState(_c?.answered || 0)
  const answeredRef = useRef(_c?.answered || 0)
  const [correctCount, setCorrectCount] = useState(_c?.correctCount || 0)
  const [combo, setCombo] = useState(_c?.combo || 0)
  const [bestCombo, setBestCombo] = useState(_c?.bestCombo || 0)
  const [mistakes, setMistakes] = useState(_c?.mistakes || [])
  const [pendingWrong, setPendingWrong] = useState(_c?.pendingWrong || [])
  const [queue, setQueue] = useState(_c?.queue || null)
  const [queuePos, setQueuePos] = useState(_c?.queuePos || 0)
  const [xpEarned, setXpEarned] = useState(_c?.xpEarned || 0)
  const [hintReveal, setHintReveal] = useState(0)
  const [hintUsed, setHintUsed] = useState(false)
  const [showArti, setShowArti] = useState(false)
  const [timeLeft, setTimeLeft] = useState(CHALLENGE_SECONDS)
  const inputRef = useRef(null)

  const pool = useCallback(() => {
    let list
    if (subMode === 'letters') list = LETTERS
    else if (subMode === 'words') list = WORDS
    else list = [...LETTERS, ...WORDS]
    if(!dakuten){
      const re=/[がぎぐげござじずぜぞだぢづでどばびぶべぼぱぴぷぺぽガギグゲゴザジズゼゾダヂヅデドバビブベボパピプペポヴぎゃぎゅぎょじゃじゅじょびゃびゅびょぴゃぴゅぴょギャギュギョジャジュジョビャビュビョピャピュピョ]/
      list = list.filter(([k])=> !re.test(k))
    }
    return list
  }, [subMode, dakuten])

  const pickNext = useCallback(
    (prevKana) => {
      const list = pool()
      // Jangan ulang yang sudah dijawab sesi ini; kalau habis, mulai putaran baru
      const fresh = list.filter((item) => !usedRef.current.has(item[0]))
      const source = fresh.length > 0 ? fresh : (usedRef.current.clear(), list)
      let pick
      do {
        pick = source[Math.floor(Math.random() * source.length)]
      } while (source.length > 1 && prevKana && pick[0] === prevKana)
      return pick
    },
    [pool],
  )

  const buildQueue = useCallback((total) => {
    const list = pool()
    const q=[]
    let prev=null
    for(let i=0;i<total;i++){
      let pick
      do{ pick=list[Math.floor(Math.random()*list.length)] } while(list.length>1 && prev && pick[0]===prev)
      q.push(pick)
      prev=pick[0]
    }
    for(let i=q.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[q[i],q[j]]=[q[j],q[i]]}
    return q
  },[pool])
  const start = () => {
    playClick()
    usedRef.current = new Set()
    const t = pool().length ? (length === 0 ? Infinity : length === 'all' ? pool().length : length) : length
    let q=null
    if(Number.isFinite(t)){
      q=buildQueue(t)
      setQueue(q)
      setQueuePos(0)
      setCurrent(q[0])
    } else {
      setQueue(null)
      setCurrent(pickNext(null))
    }
    setPhase('play')
    setAnswer('')
    setFeedback(null)
    answeredRef.current = 0
    setAnswered(0)
    setCorrectCount(0)
    setCombo(0)
    setBestCombo(0)
    setMistakes([])
    setPendingWrong([])
    setXpEarned(0)
    setHintReveal(0)
    setHintUsed(false)
    setShowArti(false)
    setTimeLeft(CHALLENGE_SECONDS)
    setTimeout(() => inputRef.current?.focus(), 50)
  }

  const total = length === 0 ? Infinity : length === 'all' ? pool().length : length

  const finish = () => {
    try{localStorage.removeItem(COMBO_KEY)}catch{}
    const accuracy = answeredRef.current > 0 ? Math.round((correctCount / answeredRef.current) * 100) : 0
      const labelMap = { letters: 'Huruf Kombinasi', words: 'Kata Serapan' }
    progress.recordSession({
      mode: 'combo',
      label: `${labelMap[subMode]} ${length === 0 ? 'Endless' : `${total} soal`}${challenge ? ' Challenge' : ''}`,
      accuracy,
      count: answeredRef.current,
      bestCombo,
    })
    playFinish()
    fireConfetti({ count: accuracy >= 80 ? 160 : 80 })
    setPhase('result')
  }

  const bumpAnswered = () => {
    answeredRef.current += 1
    setAnswered(answeredRef.current)
  }

  useEffect(() => {
    if (phase !== 'play' || !challenge || feedback || current === null) return
    if (timeLeft <= 0) {
      submit(true)
      return
    }
    const t = setTimeout(() => setTimeLeft((s) => s - 1), 1000)
    return () => clearTimeout(t)
  }, [phase, challenge, timeLeft, feedback])
  useEffect(()=>{ if(phase==='play'){ try{localStorage.setItem(COMBO_KEY, JSON.stringify({phase, subMode, length, challenge, dakuten, current, answered, correctCount, combo, bestCombo, mistakes, pendingWrong, queue, queuePos, xpEarned}))}catch{} } else { try{localStorage.removeItem(COMBO_KEY)}catch{} } },[phase, subMode, length, challenge, dakuten, current, answered, correctCount, combo, bestCombo, mistakes, pendingWrong, queue, queuePos, xpEarned])

  const next = (fromSubmit = false) => {
    if (!fromSubmit) {
      bumpAnswered()
      if (feedback === null && current !== null) usedRef.current.add(current[0])
    }
    if (queue) {
      const nextPos = queuePos + 1
      if (nextPos >= queue.length) {
        if (pendingWrong.length > 0) {
          const retry=[...pendingWrong]
          for(let i=retry.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[retry[i],retry[j]]=[retry[j],retry[i]]}
          setQueue(retry)
          setQueuePos(0)
          setPendingWrong([])
          setCurrent(retry[0])
          setAnswer('')
          setFeedback(null)
          setHintReveal(0)
          setHintUsed(false)
          setShowArti(false)
          setTimeLeft(CHALLENGE_SECONDS)
          setTimeout(()=>inputRef.current?.focus(),30)
          return
        }
        finish()
        return
      }
      setQueuePos(nextPos)
      setCurrent(queue[nextPos])
      setAnswer('')
      setFeedback(null)
      setHintReveal(0)
      setHintUsed(false)
      setShowArti(false)
      setTimeLeft(CHALLENGE_SECONDS)
      setTimeout(() => inputRef.current?.focus(), 30)
      return
    }
    if (answeredRef.current >= total) {
      finish()
      return
    }
    setAnswer('')
    setFeedback(null)
    setHintReveal(0)
    setHintUsed(false)
    setShowArti(false)
    setTimeLeft(CHALLENGE_SECONDS)
    setCurrent((cur) => pickNext(cur ? cur[0] : null))
    setTimeout(() => inputRef.current?.focus(), 30)
  }

  const submit = (timeout = false) => {
    if (feedback || current === null) return
    const [kana, romaji] = current
    const acc = timeout ? 0 : calcAccuracy(answer, romaji)
    const correct = acc >= 90
    usedRef.current.add(kana)
    bumpAnswered()

    if (correct) {
      const newCombo = combo + 1
      const mult = comboMultiplier(newCombo) * (challenge ? 1.5 : 1) * (hintUsed ? 0.5 : 1)
      const baseXp = subMode === 'words' ? 14 : 10
      const xp = Math.max(1, Math.round(baseXp * mult))
      setCombo(newCombo)
      setBestCombo((b) => Math.max(b, newCombo))
      setCorrectCount((c) => c + 1)
      setXpEarned((x) => x + xp)
      progress.recordAnswer(true)
      progress.recordAnswer(true, kana)
      progress.addXp(xp)
      setFeedback('correct')
      if (newCombo % 5 === 0) {
        playCombo(newCombo / 5)
        fireConfetti({ count: 50, originY: 0.4 })
      } else {
        playCorrect()
      }
      setTimeout(() => next(true), 750)
    } else {
      setCombo(0)
      setMistakes((m) => [...m, { kana, romaji, typed: timeout ? '(waktu habis!)' : answer.trim() }])
      if(queue){
        setPendingWrong((p)=>{
          if(p.some(([k])=> k===kana)) return p
          return [...p, [kana, romaji, current[2], current[3]]]
        })
      }
      progress.recordAnswer(false)
      progress.addXp(1)
      setFeedback('wrong')
      playWrong()
    }
  }

  const handleKey = (e) => {
    if (e.key !== 'Enter') return
    if (feedback === 'wrong') next()
    else if (!feedback) submit()
  }

  const showHint = () => {
    if (feedback || hintReveal > 0 || current === null) return
    setHintUsed(true)
    setHintReveal(2)
    setAnswer('')
    setTimeout(() => inputRef.current?.focus(), 20)
  }

  if (phase === 'config') {
    return (
      <div className="mx-auto max-w-xl space-y-5">
        <div className="flex items-center gap-3">
          <Button variant="ghost" onClick={onExit} className="px-3 py-2 text-xs">Beranda</Button>
          <Badge tone="indigo">Kombinasi &amp; Extended</Badge>
        </div>
        <Card className="space-y-6 p-6 sm:p-8 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">Mode Kombinasi</h2>
            <p className="mt-1 text-sm text-slate-600 dark:text-zinc-400">
              Latih kombinasi yang paling sering bikin salah baca: ファ・フィ・フェ・フォ, ティ・ディ・トゥ・ドゥ, ウィ・ウェ・ウォ, ヴ series, シェ・ジェ・チェ, dan yoon.
            </p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {['ファ', 'ティ', 'ドゥ', 'ウィ', 'ヴェ', 'シェ', 'ジェ', 'チェ', 'きょ', 'じゅ'].map((k) => (
                <span key={k} className="rounded-lg border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-700 px-2 py-1 text-sm text-slate-700 dark:text-zinc-300">{k}</span>
              ))}
              <span className="rounded-lg px-2 py-1 text-xs text-slate-600 dark:text-zinc-400">dan 20+ lainnya</span>
            </div>
          </div>

          <div>
            <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-600 dark:text-zinc-400">Materi</label>
            <Segmented
              value={subMode}
              onChange={setSubMode}
              options={[
                { value: 'letters', label: 'Huruf kombinasi' },
                { value: 'words', label: 'Kata Serapan' },
              ]}
            />
            <p className="mt-2 text-xs text-slate-600 dark:text-zinc-400">
              {subMode === 'letters' && 'Satu kombinasi muncul ketik romaji-nya. Semua multi-huruf: ファ・ティ・きゃ, termasuk varian dakuten (ジェ, ぎゅ, ヴァ...).'}
              {subMode === 'words' && 'Kata lengkap berisi kombinasi sulit muncul ketik romaji utuhnya.'}
            </p>
          </div>

          <div>
            <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-600 dark:text-zinc-400">Jumlah soal</label>
            <Segmented
              value={length}
              onChange={setLength}
              options={[
                { value: 30, label: '30 soal' },
                { value: 'all', label: 'Semua' },
                { value: 0, label: 'Endless' },
              ]}
            />
          </div>

          <label className="flex cursor-pointer items-center gap-3 text-sm text-slate-900 dark:text-zinc-200">
            <input type="checkbox" checked={dakuten} onChange={(e) => setDakuten(e.target.checked)} className="h-4 w-4 accent-zinc-900" />
            <span>Sertakan dakuten/handakuten <span className="text-slate-600 dark:text-zinc-400">(が, ぱ, ぎゃ...)</span></span>
          </label>
          <label className="flex cursor-pointer items-center gap-3 text-sm text-slate-900 dark:text-zinc-200">
            <input type="checkbox" checked={challenge} onChange={(e) => setChallenge(e.target.checked)} className="h-4 w-4 accent-zinc-900" />
            <span>Challenge Mode <span className="text-slate-600 dark:text-zinc-400"> {CHALLENGE_SECONDS} detik per soal, XP x1,5</span></span>
          </label>

          <Button onClick={start} className="w-full py-4 text-base">Mulai</Button>
        </Card>
      </div>
    )
  }

  if (phase === 'result') {
    const accuracy = answered > 0 ? Math.round((correctCount / answered) * 100) : 0
    const resultLabel = accuracy >= 90 ? 'Lulus' : accuracy >= 70 ? 'Cukup' : accuracy >= 50 ? 'Perlu latihan' : 'Perlu banyak latihan'
    const resultTone = accuracy >= 90 ? 'emerald' : accuracy >= 70 ? 'indigo' : accuracy >= 50 ? 'amber' : 'rose'
    return (
      <div className="mx-auto max-w-xl space-y-5 text-center">
        <Badge tone={resultTone} className="px-4 py-1.5 text-sm">{resultLabel} {accuracy}%</Badge>
        <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">
          {accuracy >= 90 ? 'Master kombinasi!' : accuracy >= 70 ? 'Kerja bagus!' : accuracy >= 50 ? 'Terus berlatih!' : 'Pelajari lagi pelan-pelan!'}
        </h2>
        <Card className="p-6 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700">
          <div className="grid grid-cols-2 gap-4 text-left sm:grid-cols-4">
            {[
              ['Akurasi', `${accuracy}%`, 'text-emerald-700 dark:text-emerald-300'],
              ['Benar', `${correctCount}/${answered}`, 'text-slate-900 dark:text-zinc-100'],
              ['Combo terbaik', `x${bestCombo}`, 'text-amber-700 dark:text-amber-300'],
              ['XP didapat', `+${xpEarned}`, 'text-slate-700 dark:text-zinc-300'],
            ].map(([l, v, c]) => (
              <div key={l} className="rounded-2xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-700/50 p-3">
                <div className="text-[10px] font-bold uppercase tracking-wide text-slate-600 dark:text-zinc-400">{l}</div>
                <div className={`text-xl font-extrabold ${c}`}>{v}</div>
              </div>
            ))}
          </div>

          {mistakes.length > 0 && (
            <div className="mt-5 text-left">
              <div className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-600 dark:text-zinc-400">
                Perlu diulang ({mistakes.length})
              </div>
              <div className="flex flex-wrap gap-2">
                {mistakes.map((m, i) => (
                  <span key={i} className="rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-700/50 px-2.5 py-1.5 text-sm">
                    <span className="text-lg text-slate-900 dark:text-white">{m.kana}</span>
                    <span className="ml-2 font-mono text-xs text-emerald-700 dark:text-emerald-300">{m.romaji}</span>
                    {m.typed && <span className="ml-1 font-mono text-xs text-red-700 dark:text-red-300 line-through">{m.typed}</span>}
                  </span>
                ))}
              </div>
            </div>
          )}
        </Card>
        <div className="flex justify-center gap-3">
          <Button variant="ghost" onClick={onExit}>Beranda</Button>
          <Button onClick={start}>Main Lagi</Button>
        </div>
      </div>
    )
  }

  if (current === null) return null
  const [kana, romaji, arti] = current
  const isWord = arti !== undefined && arti !== null
  const liveAccuracy = answered > 0 ? Math.round((correctCount / answered) * 100) : 100

  return (
    <div className="mx-auto max-w-xl space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <Button variant="ghost" onClick={finish} className="px-3 py-2 text-xs">
          {length === 0 ? 'Akhiri Sesi' : 'Keluar'}
        </Button>
        <Badge tone={isWord ? 'cyan' : 'indigo'}>{isWord ? 'Kata Serapan' : 'Huruf Kombinasi'}</Badge>
        {challenge && <Badge tone={timeLeft <= 3 ? 'rose' : 'slate'}>Waktu: {timeLeft}s</Badge>}
        {queue && pendingWrong.length>0 && <Badge tone="rose">Salah {pendingWrong.length} akan diulang</Badge>}
        <div className="ml-auto flex items-center gap-3 text-xs text-slate-600 dark:text-zinc-400">
          <span>Akurasi: {liveAccuracy}%</span>
          <span className={combo >= 3 ? 'font-bold text-amber-700 dark:text-amber-300' : ''}>
            Combo x{combo} {comboMultiplier(combo) > 1 && <span className="text-emerald-700 dark:text-emerald-300">(XP x{comboMultiplier(combo)})</span>}
          </span>
        </div>
      </div>

      {length !== 0 && <ProgressBar value={queue ? queuePos : answered} max={queue ? queue.length : total} />}

      <Card
        className={`relative overflow-hidden p-8 text-center sm:p-12 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 ${
          feedback === 'wrong' ? 'border-red-300 dark:border-red-700' : ''
        } ${feedback === 'correct' ? 'border-emerald-300 dark:border-emerald-700' : ''}`}
      >
        {feedback === 'correct' && (
          <div className="pointer-events-none absolute inset-0 grid place-items-center">
            <span className="text-8xl opacity-10 text-emerald-600 dark:text-emerald-400">Benar</span>
          </div>
        )}
        <div key={answered + String(kana)}>
          <span className={`block select-none font-bold leading-none text-slate-900 dark:text-white ${isWord ? 'text-4xl sm:text-5xl' : 'text-6xl sm:text-8xl'}`}>
            {kana}
          </span>
        </div>

        {isWord && (
          <div className="mt-4">
            {showArti ? (
              <p className="text-sm text-slate-600 dark:text-zinc-400">
                Arti: <span className="font-semibold text-cyan-700 dark:text-cyan-300">{arti}</span>
              </p>
            ) : (
              <button onClick={() => setShowArti(true)} className="text-xs text-slate-600 dark:text-zinc-400 underline underline-offset-2 hover:text-slate-900 dark:hover:text-slate-200">
                arti kata? (klik untuk melihat)
              </button>
            )}
          </div>
        )}

        <div className="mx-auto mt-8 max-w-sm">
          <input
            ref={inputRef}
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            onKeyDown={handleKey}
            disabled={feedback === 'correct'}
            placeholder={isWord ? 'romaji kata lengkap...' : 'romaji...'}
            autoCapitalize="off"
            autoCorrect="off"
            spellCheck={false}
            className={`w-full rounded-2xl border px-5 py-4 text-center text-xl outline-none transition placeholder:text-slate-400 dark:placeholder:text-slate-500 ${
              feedback === 'correct'
                ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                : feedback === 'wrong'
                  ? 'border-red-400 bg-red-50 dark:bg-red-950 text-slate-900 dark:text-white'
                  : 'border-slate-300 dark:border-zinc-600 bg-white dark:bg-zinc-700 text-slate-900 dark:text-white focus:border-zinc-500 focus:ring-2 focus:ring-zinc-500/20'
            }`}
          />
        </div>

        {hintReveal > 0 && feedback === null && (
          <p className="mt-3 text-sm text-amber-700 dark:text-amber-300">
            Dimulai dengan: <span className="font-mono text-base font-bold">{romaji.slice(0, hintReveal)}...</span>{' '}
            <span className="text-xs text-slate-600 dark:text-zinc-400">(XP dibagi 2)</span>
          </p>
        )}

        {feedback === 'wrong' && (
          <div className="mt-4 space-y-1">
            <p className="text-sm text-slate-600 dark:text-zinc-400">
              Jawaban benar: <span className="font-mono text-lg font-bold text-emerald-700 dark:text-emerald-300">{romaji}</span>
              {isWord && <span className="ml-2 text-xs text-slate-600 dark:text-zinc-400">({arti})</span>}
            </p>
            <Button onClick={next}>Lanjut</Button>
          </div>
        )}

        {feedback === null && (
          <div className="mt-4 flex justify-center gap-2">
            <Button variant="ghost" className="px-3 py-1.5 text-xs" onClick={showHint}>Hint</Button>
            <Button variant="ghost" className="px-3 py-1.5 text-xs" onClick={next}>Lewati</Button>
          </div>
        )}
      </Card>

      <p className="text-center text-xs text-slate-600 dark:text-slate-500">
        Soal ke-{queue ? queuePos + 1 : answered + 1}{length !== 0 && ` dari ${queue ? queue.length : total}`} {queue && queue.length !== total && total!==Infinity ? `(awal ${total} soal)` : ''} · Tekan Enter untuk menjawab
      </p>
    </div>
  )
}
