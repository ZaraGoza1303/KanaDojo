// Progress store disimpan di localStorage.
// Berisi XP, level, streak harian, mastery per kana, dan riwayat sesi.

import { useCallback, useEffect, useState } from 'react'
import { setMuted } from './sound.js'
import { TOTAL_BASE_KANA } from '../data/kana.js'

const KEY = 'kanadojo:v1'
const MASTER_THRESHOLD = 3 // jumlah jawaban benar agar kana dianggap "dikuasai"

const DEFAULT_STATE = {
  xp: 0,
  totalCorrect: 0,
  totalWrong: 0,
  streakDays: 0,
  lastActiveDate: null,
  mastered: {},
  dailyXp: {},
  sessions: [],
  sound: true,
  theme: null,
}

function load() {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return { ...DEFAULT_STATE }
    const parsed = JSON.parse(raw)
    return { ...DEFAULT_STATE, ...parsed }
  } catch {
    return { ...DEFAULT_STATE }
  }
}

function save(state) {
  try {
    localStorage.setItem(KEY, JSON.stringify(state))
  } catch { /* kuota penuh dsb abaikan */ }
}

function todayStr() {
  const d = new Date()
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

function yesterdayStr() {
  const d = new Date(Date.now() - 86400000)
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

// ---------- Level & XP ----------
export const LEVELS = [
  'Pemula', 'Kana Rookie', 'Pembaca Kecil', 'Penjelajah Kana',
  'Pembaca Lincah', 'Sensei Muda', 'Master Kana', 'Legenda Kanji',
]

export function levelInfo(xp) {
  const level = Math.floor(xp / 300) + 1
  const into = xp % 300
  const title = LEVELS[Math.min(level - 1, LEVELS.length - 1)]
  return { level, into, needed: 300, title }
}

// ---------- Combo multiplier ----------
export function comboMultiplier(combo) {
  if (combo >= 12) return 3
  if (combo >= 8) return 2.5
  if (combo >= 5) return 2
  if (combo >= 3) return 1.5
  return 1
}

export function useProgress() {
  const [state, setState] = useState(load)

  useEffect(() => {
    save(state)
    setMuted(!state.sound)
    const t = state.theme || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
    document.documentElement.classList.toggle('dark', t === 'dark')
  }, [state])

  // sinkronkan streak saat app dibuka
  useEffect(() => {
    setState((s) => {
      const today = todayStr()
      if (s.lastActiveDate === today) return s
      // belum pernah aktif / bolong → streak tetap dihitung saat ada jawaban pertama
      return s
    })
  }, [])

  /** Catat satu jawaban. kana: karakter/kombinasi yang sedang dilatih (opsional). */
  const recordAnswer = useCallback((correct, kana = null) => {
    setState((s) => {
      const today = todayStr()
      const next = {
        ...s,
        totalCorrect: s.totalCorrect + (correct ? 1 : 0),
        totalWrong: s.totalWrong + (correct ? 0 : 1),
        dailyXp: { ...s.dailyXp },
        mastered: { ...s.mastered },
      }
      // streak harian
      if (s.lastActiveDate !== today) {
        next.streakDays = s.lastActiveDate === yesterdayStr() ? s.streakDays + 1 : 1
        next.lastActiveDate = today
      }
      if (correct && kana) {
        next.mastered[kana] = (s.mastered[kana] || 0) + 1
      }
      return next
    })
  }, [])

  /** Tambah XP (mis. setelah menjawab atau akhir sesi) + catat sesi. */
  const addXp = useCallback((amount) => {
    setState((s) => {
      const today = todayStr()
      return {
        ...s,
        xp: s.xp + Math.max(0, Math.round(amount)),
        dailyXp: { ...s.dailyXp, [today]: (s.dailyXp[today] || 0) + Math.max(0, Math.round(amount)) },
      }
    })
  }, [])

  const recordSession = useCallback((session) => {
    setState((s) => ({
      ...s,
      sessions: [{ ...session, date: new Date().toISOString() }, ...s.sessions].slice(0, 20),
    }))
  }, [])

  const toggleSound = useCallback(() => {
    setState((s) => ({ ...s, sound: !s.sound }))
  }, [])

  const toggleTheme = useCallback(() => {
    setState((s) => {
      const cur = s.theme || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
      return { ...s, theme: cur === 'dark' ? 'light' : 'dark' }
    })
  }, [])

  const theme = state.theme || (typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')

  const resetAll = useCallback(() => {
    setState({ ...DEFAULT_STATE })
  }, [])

  // Derived
  const { level, into, needed, title } = levelInfo(state.xp)
  const totalAnswers = state.totalCorrect + state.totalWrong
  const overallAccuracy = totalAnswers > 0 ? Math.round((state.totalCorrect / totalAnswers) * 100) : 0
  const masteredCount = Object.entries(state.mastered).filter(([, c]) => c >= MASTER_THRESHOLD).length
  const masteredPercent = Math.round((masteredCount / TOTAL_BASE_KANA) * 100)

  // aktivitas 7 hari terakhir
  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(Date.now() - (6 - i) * 86400000)
    const pad = (n) => String(n).padStart(2, '0')
    const key = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
    return { key, label: ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'][d.getDay()], xp: state.dailyXp[key] || 0 }
  })

  return {
    ...state,
    theme,
    level, levelInto: into, levelNeeded: needed, levelTitle: title,
    totalAnswers, overallAccuracy, masteredCount, masteredPercent,
    last7,
    recordAnswer, addXp, recordSession, toggleSound, toggleTheme, resetAll,
  }
}
