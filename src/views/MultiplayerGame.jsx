import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Card, Button, Badge, ProgressBar } from '../components/ui.jsx'
import { shuffleWithSeed } from '../lib/seedRandom.js'
import {
  HIRAGANA_BASE, HIRAGANA_DAKUTEN,
  KATAKANA_BASE, KATAKANA_DAKUTEN,
} from '../data/kana.js'
import { EXTENDED_KANA, YOON_KANA } from '../data/extended.js'
import { TEXTS } from '../data/texts.js'
import { VOCAB } from '../data/vocab.js'
import { accuracy as calcAccuracy, kanaTextToRomaji } from '../lib/romaji.js'
import { comboMultiplier } from '../lib/progress.js'
import { fireConfetti } from '../lib/confetti.js'
import { playCorrect, playWrong, playCombo, playFinish, playClick } from '../lib/sound.js'
import { sendViaRelay, pollRelay } from '../lib/relay.js'

const CHALLENGE_SECONDS_QUIZ = 10
const CHALLENGE_SECONDS_COMBO = 12
const CHALLENGE_SECONDS_TRANSLATE = 30

const SINGLE_LETTERS = [
  ...EXTENDED_KANA.map((e) => [e.kana, e.romaji, null]),
  ...YOON_KANA.map(([k, r]) => [k, r, null]),
]
const COMBO_LETTERS = SINGLE_LETTERS

function getChallengeSeconds(mode) {
  if (mode === 'combo') return CHALLENGE_SECONDS_COMBO
  if (mode === 'translate') return CHALLENGE_SECONDS_TRANSLATE
  if (mode === 'vocab') return CHALLENGE_SECONDS_QUIZ
  return CHALLENGE_SECONDS_QUIZ
}

export default function MultiplayerGame({ config, progress, onExit, multiplayer }) {
  const roomCode = config?.roomCode ?? config?.settings?.roomCode ?? ''
  const seed = config?.seed ?? config?.settings?.seed ?? 'default-seed'
  const clientIdRef = useRef(Math.random().toString(36).slice(2,9))
  const mode = config?.mode ?? config?.settings?.mode ?? 'quiz'
  const length = config?.length ?? config?.settings?.length ?? 20
  const challenge = config?.challenge ?? config?.settings?.challenge ?? false
  const dakuten = config?.dakuten ?? config?.settings?.dakuten ?? false
  const total = length === 0 ? Infinity : length
  const challengeSeconds = getChallengeSeconds(mode)

  const quizPool = useMemo(() => {
    const base = dakuten
      ? [...HIRAGANA_BASE, ...HIRAGANA_DAKUTEN, ...KATAKANA_BASE, ...KATAKANA_DAKUTEN]
      : [...HIRAGANA_BASE, ...KATAKANA_BASE]
    return shuffleWithSeed(base, seed)
  }, [seed, dakuten])

  const comboPool = useMemo(() => {
    let pool = COMBO_LETTERS
    if(!dakuten){
      const dakutenRe = /[がぎぐげござじずぜぞだぢづでどばびぶべぼぱぴぷぺぽガギグゲゴザジズゼゾダヂヅデドバビブベボパピプペポヴぎゃぎゅぎょじゃじゅじょびゃびゅびょぴゃぴゅぴょギャギュギョジャジュジョビャビュビョピャピュピョ]/
      pool = pool.filter(([k])=> !dakutenRe.test(k))
    }
    return shuffleWithSeed(pool, seed + ':combo')
  }, [seed, dakuten])
  const vocabPool = useMemo(() => shuffleWithSeed(VOCAB, seed + ':vocab'), [seed])

  const translateIndices = useMemo(() => {
    const arr = TEXTS.map((_, i) => i)
    return shuffleWithSeed(arr, seed + ':translate')
  }, [seed])

  const getCurrentEntry = useCallback((idx) => {
    if (mode === 'translate') {
      const tIdx = translateIndices[idx % translateIndices.length]
      return TEXTS[tIdx]
    }
    if (mode === 'vocab') {
      return vocabPool[idx % vocabPool.length]
    }
    if (mode === 'combo') {
      const cycle = Math.floor(idx / comboPool.length)
      const pool = cycle === 0 ? comboPool : shuffleWithSeed(COMBO_LETTERS, seed + ':combo:' + cycle)
      return pool[idx % pool.length]
    }
    return quizPool[idx % quizPool.length]
  }, [mode, quizPool, comboPool, vocabPool, translateIndices, seed])

  const getExpectedRomaji = useCallback((entry) => {
    if (!entry) return ''
    if (mode === 'translate') return kanaTextToRomaji(entry.kana)
    if (mode === 'vocab') return entry.arti ?? ''
    return entry[1] ?? ''
  }, [mode])

  const getKanaDisplay = useCallback((entry) => {
    if (!entry) return ''
    if (mode === 'translate') return entry.kana
    if (mode === 'vocab') return entry.kana
    return entry[0] ?? ''
  }, [mode])

  const getVocabOptions = useCallback((entry, idx) => {
    if (!entry || mode!=='vocab') return []
    const others = VOCAB.filter(v=> v.id!==entry.id)
    const shuffledOthers = shuffleWithSeed(others, seed+':vocab-opt:'+idx)
    const picks = shuffledOthers.slice(0,3).map(v=> v.arti)
    const all = [entry.arti, ...picks]
    return shuffleWithSeed(all, seed+':vocab-shuffle:'+idx)
  }, [mode, seed])

  const [idx, setIdx] = useState(0)
  const [answer, setAnswer] = useState('')
  const [feedback, setFeedback] = useState(null)
  const [answered, setAnswered] = useState(0)
  const answeredRef = useRef(0)
  const [correctCount, setCorrectCount] = useState(0)
  const [combo, setCombo] = useState(0)
  const [bestCombo, setBestCombo] = useState(0)
  const [xpEarned, setXpEarned] = useState(0)
  const [mistakes, setMistakes] = useState([])
  const [hintReveal, setHintReveal] = useState(0)
  const [hintUsed, setHintUsed] = useState(false)
  const [timeLeft, setTimeLeft] = useState(challengeSeconds)
  const [phase, setPhase] = useState('play')
  const [opponent, setOpponent] = useState({ answered: 0, correct: 0, accuracy: 0, connected: true })
  const [disconnected, setDisconnected] = useState(false)
  const seenOppRef = useRef(new Set())
  const [vocabPick, setVocabPick] = useState(null)
  const inputRef = useRef(null)

  const currentEntry = useMemo(() => {
    if (phase !== 'play') return null
    return getCurrentEntry(idx)
  }, [idx, getCurrentEntry, phase])

  const expected = useMemo(() => getExpectedRomaji(currentEntry), [currentEntry, getExpectedRomaji])
  const vocabOptions = useMemo(() => {
    if (mode !== 'vocab' || !currentEntry) return []
    return getVocabOptions(currentEntry, idx)
  }, [mode, currentEntry, idx, getVocabOptions])

  const liveAccuracy = answered > 0 ? Math.round((correctCount / answered) * 100) : 0
  const oppAccuracy = opponent.answered > 0 ? Math.round((opponent.correct / opponent.answered) * 100) : 0

  useEffect(() => {
    setTimeLeft(challengeSeconds)
  }, [challengeSeconds])

  useEffect(() => {
    const id = setTimeout(() => inputRef.current?.focus(), 50)
    return () => clearTimeout(id)
  }, [idx, phase])

  useEffect(() => {
    if (phase !== 'play' || !challenge || feedback || !currentEntry) return
    if (timeLeft <= 0) {
      if (mode === 'vocab') {
        const kanaDisp = getKanaDisplay(currentEntry)
        bumpAnswered()
        setMistakes((m) => [...m, { kana: kanaDisp, romaji: expected, typed: '(waktu habis)' }])
        try { progress.recordAnswer(false) } catch {}
        try { progress.addXp(1) } catch {}
        setCombo(0)
        setVocabPick('__timeout__')
        setFeedback('wrong')
        playWrong()
        sendBoth({ type: 'answer', index: idx, accuracy: 0, correct: false, time: Date.now() })
        setTimeout(() => {
          if (answeredRef.current >= total) finishGame()
          else {
            setVocabPick(null)
            setFeedback(null)
            setHintReveal(0)
            setHintUsed(false)
            setTimeLeft(challengeSeconds)
            setIdx((i) => i + 1)
          }
        }, 900)
        return
      }
      handleSubmit(true)
      return
    }
    const t = setTimeout(() => setTimeLeft((s) => s - 1), 1000)
    return () => clearTimeout(t)
  }, [phase, challenge, timeLeft, feedback, currentEntry, mode, expected, getKanaDisplay, progress, idx, total, finishGame, challengeSeconds])

  const sendBoth = (data) => { const payload={...data, _sender: clientIdRef.current}; try{ multiplayer?.send?.(payload) }catch{}; try{ if(roomCode) sendViaRelay(roomCode, payload) }catch{} }
  useEffect(() => {
    if (!multiplayer && !roomCode) return
    const handleData = (data) => {
      if (!data) return
      if (data._sender && data._sender===clientIdRef.current) return
      if (data.type === 'answer') {
        const idxKey = typeof data.index === 'number' ? `${data._sender||'peer'}:${data.index}` : `${data._sender||'peer'}:${data.correct}-${data.time}`
        if (seenOppRef.current.has(idxKey)) return
        seenOppRef.current.add(idxKey)
        setOpponent((prev) => {
          const answeredNext = typeof data.index === 'number' ? Math.max(prev.answered, data.index + 1) : prev.answered + 1
          const correctNext = prev.correct + (data.correct ? 1 : 0)
          const acc = answeredNext > 0 ? Math.round((correctNext / answeredNext) * 100) : 0
          return { answered: answeredNext, correct: correctNext, accuracy: acc, connected: true }
        })
      }
      if (data.type === 'leave' || data.type === 'disconnect') {
        setDisconnected(true)
        setOpponent((p) => ({ ...p, connected: false }))
      }
    }
    const handleLeave = () => {
      setDisconnected(true)
      setOpponent((p) => ({ ...p, connected: false }))
    }
    let cleanup = () => {}
    if (typeof multiplayer.onData === 'function') {
      multiplayer.onData(handleData)
    } else if (typeof multiplayer.setOnData === 'function') {
      multiplayer.setOnData(handleData)
      multiplayer.setOnPeerLeave?.(handleLeave)
    } else if (multiplayer.getPeer) {
      try {
        const peer = multiplayer.getPeer()
        if (peer) {
          const onConn = (conn) => {
            try { conn.on('data', handleData) } catch {}
            try { conn.on('close', handleLeave) } catch {}
          }
          peer.on('connection', onConn)
          cleanup = () => { try { peer.off('connection', onConn) } catch {} }
          const existingConns = peer.connections ? Object.values(peer.connections).flat() : []
          existingConns.forEach((c) => {
            try { c.on('data', handleData) } catch {}
            try { c.on('close', handleLeave) } catch {}
          })
        }
      } catch {}
      const origSend = multiplayer.send
      if (origSend) {
        const interval = setInterval(() => {
          try {
            const p = multiplayer.getPeer()
            if (!p) return
            const conns = p.connections ? Object.values(p.connections).flat() : []
            conns.forEach((c) => {
              if (c && !c._mpHooked) {
                c._mpHooked = true
                c.on('data', handleData)
                c.on('close', handleLeave)
              }
            })
          } catch {}
        }, 1000)
        const prevCleanup = cleanup
        cleanup = () => { prevCleanup(); clearInterval(interval) }
      }
    }
    if (multiplayer.onPeerClose) {
      const prev = multiplayer.onPeerClose
      multiplayer.onPeerClose = (...args) => { handleLeave(); try { prev(...args) } catch {} }
    }
    let relayStop = null
    if (roomCode) {
      relayStop = pollRelay(roomCode, handleData)
    }
    const prevCleanup = cleanup
    return () => { prevCleanup(); if (relayStop) relayStop() }
  }, [multiplayer, roomCode])

  const finishGame = useCallback(() => {
    const acc = answeredRef.current > 0 ? Math.round((correctCount / answeredRef.current) * 100) : 0
    const labelMap = { quiz: 'Multiplayer Tes Huruf', combo: 'Multiplayer Combo', translate: 'Multiplayer Translate', vocab: 'Multiplayer Kosakata' }
    const label = labelMap[mode] ?? 'Multiplayer'
    const suffix = length === 0 ? 'Endless' : `${length} soal`
    try {
      progress.recordSession({
        mode: mode,
        label: `${label} ${suffix}${challenge ? ' Challenge' : ''}`,
        accuracy: acc,
        count: answeredRef.current,
        bestCombo,
      })
    } catch {}
    playFinish()
    fireConfetti({ count: acc >= 80 ? 160 : 80 })
    setPhase('result')
  }, [answeredRef, correctCount, mode, length, challenge, bestCombo, progress])

  const bumpAnswered = useCallback(() => {
    answeredRef.current += 1
    setAnswered(answeredRef.current)
  }, [])

  const goNext = useCallback((fromSubmit = false) => {
    if (!fromSubmit) bumpAnswered()
    const nextAnswered = fromSubmit ? answeredRef.current : answeredRef.current + (fromSubmit ? 0 : 0)
    void nextAnswered
    if (answeredRef.current >= total) {
      finishGame()
      return
    }
    setAnswer('')
    setFeedback(null)
    setVocabPick(null)
    setHintReveal(0)
    setHintUsed(false)
    setTimeLeft(challengeSeconds)
    setIdx((i) => i + 1)
    setTimeout(() => inputRef.current?.focus(), 30)
  }, [bumpAnswered, total, finishGame, challengeSeconds])

  const handleSubmit = useCallback((timeout = false) => {
    if (feedback || !currentEntry) return
    const acc = timeout ? 0 : calcAccuracy(answer, expected)
    const correct = acc >= 90
    bumpAnswered()
    const currentIdx = idx

    if (correct) {
      const newCombo = combo + 1
      const baseXp = mode === 'combo' ? 14 : mode === 'translate' ? 20 : 10
      const mult = comboMultiplier(newCombo) * (challenge ? 1.5 : 1) * (hintUsed ? 0.5 : 1)
      const xp = Math.max(1, Math.round(baseXp * mult * (mode === 'translate' ? (acc / 100) : 1)))
      setCombo(newCombo)
      setBestCombo((b) => Math.max(b, newCombo))
      setCorrectCount((c) => c + 1)
      setXpEarned((x) => x + xp)
      try { progress.recordAnswer(true) } catch {}
      try { progress.recordAnswer(true, getKanaDisplay(currentEntry)) } catch {}
      try { progress.addXp(xp) } catch {}
      setFeedback('correct')
      if (newCombo % 5 === 0) {
        playCombo(newCombo / 5)
        fireConfetti({ count: 50, originY: 0.4 })
      } else {
        playCorrect()
      }
      sendBoth({ type: 'answer', index: currentIdx, accuracy: acc, correct: true, time: Date.now() })
      setTimeout(() => {
        if (answeredRef.current >= total) finishGame()
        else {
          setAnswer('')
          setFeedback(null)
          setHintReveal(0)
          setHintUsed(false)
          setTimeLeft(challengeSeconds)
          setIdx((i) => i + 1)
          setTimeout(() => inputRef.current?.focus(), 30)
        }
      }, mode === 'translate' ? 600 : 700)
    } else {
      setCombo(0)
      const kanaDisp = getKanaDisplay(currentEntry)
      setMistakes((m) => [...m, { kana: kanaDisp, romaji: expected, typed: timeout ? '(waktu habis)' : answer.trim() }])
      try { progress.recordAnswer(false) } catch {}
      try { progress.addXp(1) } catch {}
      setFeedback('wrong')
      playWrong()
      sendBoth({ type: 'answer', index: currentIdx, accuracy: acc, correct: false, time: Date.now() })
      if (mode === 'translate') {
        setTimeout(() => {
          if (answeredRef.current >= total) finishGame()
        }, 100)
      }
    }
  }, [feedback, currentEntry, answer, expected, bumpAnswered, idx, combo, mode, challenge, hintUsed, progress, getKanaDisplay, total, finishGame, challengeSeconds, multiplayer])

  const handleKey = (e) => {
    if (e.key !== 'Enter') return
    if (feedback === 'wrong') {
      if (answeredRef.current >= total) finishGame()
      else goNext(true)
    } else if (!feedback) handleSubmit(false)
    else if (feedback === 'correct') return
    else if (mode === 'translate' && feedback) goNext(true)
  }

  const showHint = () => {
    if (feedback || hintReveal > 0 || !currentEntry) return
    setHintUsed(true)
    setHintReveal(mode === 'translate' ? 3 : 2)
    setAnswer('')
    setTimeout(() => inputRef.current?.focus(), 20)
  }

  const handleSkip = () => {
    if (feedback || vocabPick) return
    bumpAnswered()
    const kanaDisp = getKanaDisplay(currentEntry)
    setMistakes((m) => [...m, { kana: kanaDisp, romaji: expected, typed: '(dilewati)' }])
    try { progress.recordAnswer(false) } catch {}
    try { progress.addXp(1) } catch {}
    sendBoth({ type: 'answer', index: idx, accuracy: 0, correct: false, time: Date.now() })
    setCombo(0)
    setVocabPick(null)
    if (answeredRef.current >= total) finishGame()
    else {
      setAnswer('')
      setFeedback(null)
      setHintReveal(0)
      setHintUsed(false)
      setTimeLeft(challengeSeconds)
      setIdx((i) => i + 1)
      setTimeout(() => inputRef.current?.focus(), 30)
    }
  }
  const handleVocabPick = (arti) => {
    if (vocabPick || feedback) return
    const correct = arti === expected
    bumpAnswered()
    setVocabPick(arti)
    const xp = correct ? 10 : 1
    if (correct) {
      const newCombo = combo + 1
      setCombo(newCombo)
      setBestCombo((b)=> Math.max(b,newCombo))
      setCorrectCount((c)=> c+1)
      setXpEarned((x)=> x+xp)
      try{ progress.recordAnswer(true) }catch{}
      try{ progress.addXp(xp) }catch{}
      setFeedback('correct')
      playCorrect()
    } else {
      setCombo(0)
      const kanaDisp = getKanaDisplay(currentEntry)
      setMistakes((m)=> [...m, { kana: kanaDisp, romaji: expected, typed: arti }])
      try{ progress.recordAnswer(false) }catch{}
      try{ progress.addXp(1) }catch{}
      setFeedback('wrong')
      playWrong()
    }
    sendBoth({ type: 'answer', index: idx, accuracy: correct?100:0, correct, time: Date.now() })
    setTimeout(()=>{
      if(answeredRef.current >= total) finishGame()
      else {
        setVocabPick(null)
        setFeedback(null)
        setHintReveal(0)
        setHintUsed(false)
        setTimeLeft(challengeSeconds)
        setIdx((i)=> i+1)
      }
    }, 900)
  }

  if (phase === 'result') {
    const acc = answered > 0 ? Math.round((correctCount / answered) * 100) : 0
    const oppAcc = opponent.answered > 0 ? Math.round((opponent.correct / opponent.answered) * 100) : 0
    let resultText = 'Seri'
    let resultTone = 'slate'
    if (correctCount > opponent.correct) { resultText = 'Menang'; resultTone = 'emerald' }
    else if (correctCount < opponent.correct) { resultText = 'Kalah'; resultTone = 'rose' }
    else if (acc > oppAcc) { resultText = 'Menang Tipis'; resultTone = 'emerald' }
    else if (acc < oppAcc) { resultText = 'Kalah Tipis'; resultTone = 'rose' }
    return (
      <div className="mx-auto max-w-3xl space-y-5 text-center">
        <Badge tone={resultTone} className="px-4 py-1.5 text-sm">{resultText}</Badge>
        <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">Hasil Head to Head</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <Card className="p-6 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-left">
            <div className="text-xs font-bold uppercase tracking-wide text-slate-600 dark:text-zinc-400">Kamu</div>
            <div className="mt-2 grid grid-cols-2 gap-3">
              {[
                ['Akurasi', `${acc}%`],
                ['Benar', `${correctCount}/${answered}`],
                ['Combo terbaik', `x${bestCombo}`],
                ['XP didapat', `+${xpEarned}`],
              ].map(([l, v]) => (
                <div key={l} className="rounded-2xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-700/50 p-3">
                  <div className="text-[10px] font-bold uppercase tracking-wide text-slate-600 dark:text-zinc-400">{l}</div>
                  <div className="text-lg font-extrabold text-slate-900 dark:text-white">{v}</div>
                </div>
              ))}
            </div>
          </Card>
          <Card className="p-6 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-left">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wide text-slate-600 dark:text-zinc-400">Lawan</span>
              <Badge tone={opponent.connected && !disconnected ? 'emerald' : 'rose'}>{opponent.connected && !disconnected ? 'Terhubung' : 'Terputus'}</Badge>
            </div>
            <div className="mt-2 grid grid-cols-2 gap-3">
              {[
                ['Akurasi', `${oppAcc}%`],
                ['Benar', `${opponent.correct}/${opponent.answered}`],
                ['Soal dijawab', `${opponent.answered}`],
                ['Status', opponent.connected && !disconnected ? 'Online' : 'Offline'],
              ].map(([l, v]) => (
                <div key={l} className="rounded-2xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-700/50 p-3">
                  <div className="text-[10px] font-bold uppercase tracking-wide text-slate-600 dark:text-zinc-400">{l}</div>
                  <div className="text-lg font-extrabold text-slate-900 dark:text-white">{v}</div>
                </div>
              ))}
            </div>
          </Card>
        </div>
        {mistakes.length > 0 && (
          <Card className="p-6 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-left">
            <div className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-600 dark:text-zinc-400">Perlu diulang ({mistakes.length})</div>
            <div className="flex flex-wrap gap-2">
              {mistakes.map((m, i) => (
                <span key={i} className="rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-700/50 px-2.5 py-1.5 text-sm">
                  <span className="text-lg text-slate-900 dark:text-white">{m.kana}</span>
                  <span className="ml-2 font-mono text-xs text-emerald-700 dark:text-emerald-300">{m.romaji}</span>
                  {m.typed && <span className="ml-1 font-mono text-xs text-red-700 dark:text-red-300 line-through">{m.typed}</span>}
                </span>
              ))}
            </div>
          </Card>
        )}
        <div className="flex justify-center gap-3">
          <Button variant="ghost" onClick={onExit}>Kembali</Button>
          <Button onClick={() => { playClick(); seenOppRef.current.clear(); setIdx(0); answeredRef.current = 0; setAnswered(0); setCorrectCount(0); setCombo(0); setBestCombo(0); setXpEarned(0); setMistakes([]); setAnswer(''); setFeedback(null); setHintReveal(0); setHintUsed(false); setTimeLeft(challengeSeconds); setOpponent({ answered: 0, correct: 0, accuracy: 0, connected: true }); setDisconnected(false); setPhase('play'); setTimeout(() => inputRef.current?.focus(), 50) }}>Main Lagi</Button>
        </div>
      </div>
    )
  }

  if (!currentEntry) return <div className="mx-auto max-w-xl p-8 text-center text-slate-600 dark:text-zinc-400">Memuat soal... Room {roomCode} Mode {mode} Seed {String(seed).slice(0,8)}</div>
  const kanaDisp = getKanaDisplay(currentEntry)
  const isTranslate = mode === 'translate'
  const hintPrefix = hintReveal > 0 ? expected.replace(/ /g, '').slice(0, hintReveal) : null

  return (
    <div className="mx-auto max-w-5xl space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <Button variant="ghost" onClick={onExit} className="px-3 py-2 text-xs">Keluar</Button>
        <Badge tone="slate">Multiplayer {mode}</Badge>
        <Badge tone="slate">Room {roomCode}</Badge>
        {challenge && <Badge tone={timeLeft <= 3 ? 'rose' : 'slate'}>Waktu: {timeLeft}s</Badge>}
        {seed && <Badge tone="slate" className="hidden sm:inline">Seed {String(seed).slice(0, 8)}</Badge>}
        <div className="ml-auto flex items-center gap-3 text-xs text-slate-600 dark:text-zinc-400">
          <span>Akurasi: {liveAccuracy}%</span>
          <span className={combo >= 3 ? 'font-bold text-amber-700 dark:text-amber-300' : ''}>Combo x{combo}</span>
        </div>
      </div>

      {length !== 0 && <ProgressBar value={answered} max={length} />}

      {disconnected && (
        <div className="rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950 px-4 py-3 text-sm text-amber-800 dark:text-amber-200 flex items-center justify-between gap-3">
          <span>Lawan terputus dari room</span>
          <Button variant="ghost" onClick={onExit} className="px-3 py-1.5 text-xs">Kembali</Button>
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-[1fr_300px]">
        <Card className={`relative overflow-hidden p-6 text-center sm:p-8 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 ${feedback === 'wrong' ? 'border-red-300 dark:border-red-700' : ''} ${feedback === 'correct' ? 'border-emerald-300 dark:border-emerald-700' : ''}`}>
          {feedback === 'correct' && (
            <div className="pointer-events-none absolute inset-0 grid place-items-center">
              <span className="text-7xl opacity-10 text-emerald-600 dark:text-emerald-400">Benar</span>
            </div>
          )}

          {isTranslate ? (
            <div className="text-left">
              <p className="text-base leading-loose text-slate-900 dark:text-white sm:text-xl sm:leading-loose">{kanaDisp}</p>
              <p className="mt-2 text-xs text-slate-600 dark:text-zinc-400">Tulis romaji-nya. Spasi boleh atau tidak.</p>
            </div>
          ) : (
            <div key={idx + String(kanaDisp)}>
              <span className={`block select-none font-bold leading-none text-slate-900 dark:text-white ${String(kanaDisp).length > 3 ? 'text-4xl sm:text-5xl' : 'text-6xl sm:text-8xl'}`}>{kanaDisp}</span>
              {mode === 'combo' && currentEntry[2] && (
                <p className="mt-3 text-xs text-slate-600 dark:text-zinc-400">Arti: <span className="font-semibold text-slate-700 dark:text-zinc-300">{currentEntry[2]}</span></p>
              )}
            </div>
          )}

          {mode==='vocab' ? (
            <div className="mt-6 grid gap-2 sm:grid-cols-2">
              {vocabOptions.map(opt=>{
                const isCorrect = opt===expected
                const isPicked = vocabPick===opt
                const show = !!feedback
                return (
                  <button key={opt} onClick={()=> handleVocabPick(opt)} disabled={!!feedback}
                    className={`rounded-2xl border px-4 py-4 text-left font-medium transition ${show && isCorrect ? 'bg-emerald-50 border-emerald-300 text-emerald-800 dark:bg-emerald-950 dark:border-emerald-700 dark:text-emerald-200' : show && isPicked ? 'bg-red-50 border-red-300 text-red-800 dark:bg-red-950 dark:border-red-700 dark:text-red-200' : 'bg-white border-slate-200 hover:bg-slate-50 dark:bg-zinc-800 dark:border-zinc-700 dark:hover:bg-zinc-700 text-slate-900 dark:text-white'}`}>
                    {opt}
                  </button>
                )
              })}
            </div>
          ) : (
            <div className="mx-auto mt-6 max-w-sm">
              <input
                ref={inputRef}
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                onKeyDown={handleKey}
                disabled={feedback === 'correct'}
                placeholder={isTranslate ? 'romaji...' : 'romaji...'}
                autoCapitalize="off"
                autoCorrect="off"
                spellCheck={false}
                className={`w-full rounded-2xl border px-5 py-4 text-center text-lg outline-none transition placeholder:text-slate-400 dark:placeholder:text-slate-500 ${feedback === 'correct' ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300' : feedback === 'wrong' ? 'border-red-400 bg-red-50 dark:bg-red-950 text-slate-900 dark:text-white' : 'border-slate-300 dark:border-zinc-600 bg-white dark:bg-zinc-700 text-slate-900 dark:text-white focus:border-zinc-500 focus:ring-2 focus:ring-zinc-500/20'}`}
              />
            </div>
          )}

          {hintPrefix && feedback === null && mode!=='vocab' && (
            <p className="mt-3 text-sm text-amber-700 dark:text-amber-300">Dimulai dengan: <span className="font-mono text-base font-bold">{hintPrefix}...</span> <span className="text-xs text-slate-600 dark:text-zinc-400">(XP dibagi 2)</span></p>
          )}

          {feedback === 'wrong' && mode!=='vocab' && (
            <div className="mt-4 space-y-1">
              <p className="text-sm text-slate-600 dark:text-zinc-400">Jawaban benar: <span className="font-mono text-lg font-bold text-emerald-700 dark:text-emerald-300">{expected}</span></p>
              <Button onClick={() => { if (answeredRef.current >= total) finishGame(); else { setAnswer(''); setFeedback(null); setVocabPick(null); setHintReveal(0); setHintUsed(false); setTimeLeft(challengeSeconds); setIdx((i) => i + 1); setTimeout(() => inputRef.current?.focus(), 30) } }}>Lanjut</Button>
            </div>
          )}

          {feedback === null && mode!=='vocab' && (
            <div className="mt-4 flex justify-center gap-2">
              <Button variant="ghost" className="px-3 py-1.5 text-xs" onClick={showHint}>Hint</Button>
              <Button variant="ghost" className="px-3 py-1.5 text-xs" onClick={handleSkip}>Lewati</Button>
              <Button onClick={() => handleSubmit(false)} className="px-4 py-1.5 text-xs">Periksa</Button>
            </div>
          )}
          {mode==='vocab' && feedback && (
            <div className="mt-4">
              <p className="text-sm text-slate-600 dark:text-zinc-400">Jawaban benar: <span className="font-bold text-emerald-700 dark:text-emerald-300">{expected}</span></p>
            </div>
          )}

          <p className="mt-4 text-center text-xs text-slate-600 dark:text-slate-500">Soal ke {answered + 1}{length !== 0 && ` dari ${length}`} · {mode==='vocab' ? 'Tap pilihan' : 'Tekan Enter untuk menjawab'}</p>
        </Card>

        <div className="space-y-4">
          <Card className="p-4 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wide text-slate-600 dark:text-zinc-400">Papan Skor Lawan</span>
              <Badge tone={opponent.connected && !disconnected ? 'emerald' : 'rose'}>{opponent.connected && !disconnected ? 'Terhubung' : 'Terputus'}</Badge>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-700/50 p-3">
                <div className="text-[10px] font-bold uppercase tracking-wide text-slate-600 dark:text-zinc-400">Benar</div>
                <div className="text-xl font-extrabold text-slate-900 dark:text-white">{opponent.correct}/{opponent.answered}</div>
              </div>
              <div className="rounded-2xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-700/50 p-3">
                <div className="text-[10px] font-bold uppercase tracking-wide text-slate-600 dark:text-zinc-400">Akurasi</div>
                <div className="text-xl font-extrabold text-slate-900 dark:text-white">{oppAccuracy}%</div>
              </div>
            </div>
            <div className="mt-3">
              <div className="mb-1 flex justify-between text-xs text-slate-600 dark:text-zinc-400"><span>Progress lawan</span><span>{opponent.answered}{length !== 0 ? `/${length}` : ''}</span></div>
              <ProgressBar value={opponent.answered} max={length === 0 ? Math.max(answered, opponent.answered, 1) : length} />
            </div>
            <div className="mt-3">
              <div className="mb-1 flex justify-between text-xs text-slate-600 dark:text-zinc-400"><span>Progress kamu</span><span>{answered}{length !== 0 ? `/${length}` : ''}</span></div>
              <ProgressBar value={answered} max={length === 0 ? Math.max(answered, opponent.answered, 1) : length} barClassName="bg-zinc-900 dark:bg-zinc-100" />
            </div>
            <div className="mt-4 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 p-3 text-xs leading-relaxed text-slate-600 dark:text-zinc-400">
              Soal disinkronisasi via seed. Jawaban dikirim realtime via PeerJS.
            </div>
          </Card>

          <Card className="p-4 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700">
            <div className="text-xs font-bold uppercase tracking-wide text-slate-600 dark:text-zinc-400">Skor Kamu</div>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-700/50 p-3">
                <div className="text-[10px] font-bold uppercase tracking-wide text-slate-600 dark:text-zinc-400">Benar</div>
                <div className="text-lg font-extrabold text-emerald-700 dark:text-emerald-300">{correctCount}/{answered}</div>
              </div>
              <div className="rounded-2xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-700/50 p-3">
                <div className="text-[10px] font-bold uppercase tracking-wide text-slate-600 dark:text-zinc-400">Akurasi</div>
                <div className="text-lg font-extrabold text-slate-900 dark:text-white">{liveAccuracy}%</div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
