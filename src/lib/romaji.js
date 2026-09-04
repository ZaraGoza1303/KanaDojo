// Konversi kana → romaji (Hepburn gaya ketik / waapuro: shi, chi, tsu, fu, ji)
// dan pemeriksaan jawaban yang toleran terhadap gaya ketik yang berbeda
// (ou vs oo vs ō, wo vs o, si vs shi, dst).

import { EXTENDED_KANA, YOON_KANA } from '../data/extended.js'

// ---------- Tabel dasar ----------
const buildMap = (pairs) => {
  const m = new Map()
  for (const [k, r] of pairs) m.set(k, r)
  return m
}

export const BASE_MAP = buildMap([
  ['あ','a'],['い','i'],['う','u'],['え','e'],['お','o'],
  ['か','ka'],['き','ki'],['く','ku'],['け','ke'],['こ','ko'],
  ['さ','sa'],['し','shi'],['す','su'],['せ','se'],['そ','so'],
  ['た','ta'],['ち','chi'],['つ','tsu'],['て','te'],['と','to'],
  ['な','na'],['に','ni'],['ぬ','nu'],['ね','ne'],['の','no'],
  ['は','ha'],['ひ','hi'],['ふ','fu'],['へ','he'],['ほ','ho'],
  ['ま','ma'],['み','mi'],['む','mu'],['め','me'],['も','mo'],
  ['や','ya'],['ゆ','yu'],['よ','yo'],
  ['ら','ra'],['り','ri'],['る','ru'],['れ','re'],['ろ','ro'],
  ['わ','wa'],['を','o'],['ん','n'],
  ['が','ga'],['ぎ','gi'],['ぐ','gu'],['げ','ge'],['ご','go'],
  ['ざ','za'],['じ','ji'],['ず','zu'],['ぜ','ze'],['ぞ','zo'],
  ['だ','da'],['ぢ','ji'],['づ','zu'],['で','de'],['ど','do'],
  ['ば','ba'],['び','bi'],['ぶ','bu'],['べ','be'],['ぼ','bo'],
  ['ぱ','pa'],['ぴ','pi'],['ぷ','pu'],['ぺ','pe'],['ぽ','po'],
  ['ア','a'],['イ','i'],['ウ','u'],['エ','e'],['オ','o'],
  ['カ','ka'],['キ','ki'],['ク','ku'],['ケ','ke'],['コ','ko'],
  ['サ','sa'],['シ','shi'],['ス','su'],['セ','se'],['ソ','so'],
  ['タ','ta'],['チ','chi'],['ツ','tsu'],['テ','te'],['ト','to'],
  ['ナ','na'],['ニ','ni'],['ヌ','nu'],['ネ','ne'],['ノ','no'],
  ['ハ','ha'],['ヒ','hi'],['フ','fu'],['ヘ','he'],['ホ','ho'],
  ['マ','ma'],['ミ','mi'],['ム','mu'],['メ','me'],['モ','mo'],
  ['ヤ','ya'],['ユ','yu'],['ヨ','yo'],
  ['ラ','ra'],['リ','ri'],['ル','ru'],['レ','re'],['ロ','ro'],
  ['ワ','wa'],['ヲ','o'],['ン','n'],
  ['ガ','ga'],['ギ','gi'],['グ','gu'],['ゲ','ge'],['ゴ','go'],
  ['ザ','za'],['ジ','ji'],['ズ','zu'],['ゼ','ze'],['ゾ','zo'],
  ['ダ','da'],['ヂ','ji'],['ヅ','zu'],['デ','de'],['ド','do'],
  ['バ','ba'],['ビ','bi'],['ブ','bu'],['ベ','be'],['ボ','bo'],
  ['パ','pa'],['ピ','pi'],['プ','pu'],['ペ','pe'],['ポ','po'],
  ['ヴ','vu'],
])

// Kombinasi 2 huruf & yōon
const COMBO_MAP = buildMap([
  ...EXTENDED_KANA.map((e) => [e.kana, e.romaji]),
  ...YOON_KANA,
])

// Gabungan kecil (きゃ dst) untuk base + dakuten hiragana & katakana
const SMALL_Y = { 'ゃ': 'ya', 'ゅ': 'yu', 'ょ': 'yo', 'ャ': 'ya', 'ュ': 'yu', 'ョ': 'yo' }

// Ibaran kata: particle は/へ dibaca wa/e
const WORD_OVERRIDES = new Map([
  ['こんにちは', 'konnichiwa'],
  ['こんばんは', 'konbanwa'],
  ['はじめまして', 'hajimemashite'],
  ['おはよう', 'ohayou'],
  ['おはようございます', 'ohayougozaimasu'],
])

const VOWELS = 'aiueo'

/**
 * Konversi satu token (kata kana, tanpa spasi) menjadi romaji.
 * Penanganan particle は/へ/を dilakukan di convertToken (berbasis akhiran token),
 * karena は/へ di tengah kata biasanya konsonan biasa (はたらく, くじはん, たいへん).
 */
export function kanaTokenToRomaji(token) {
  const override = WORD_OVERRIDES.get(token)
  if (override) return override
  if (token === 'は') return 'wa'
  if (token === 'へ') return 'e'
  if (token === 'を') return 'o'

  let out = ''
  let i = 0
  while (i < token.length) {
    const ch = token[i]

    // Sokuon っ/ッ → geminate
    if (ch === 'っ' || ch === 'ッ') {
      const next = token[i + 1]
      const nextR = next ? romajiOfSingle(next, token, i + 1) : null
      if (nextR) {
        const first = nextR.startsWith('ch') ? 't' : nextR[0]
        out += first
      }
      i += 1
      continue
    }

    // Chōonpu ー → ulangi vokal terakhir
    if (ch === 'ー' || ch === '〜') {
      const lastVowel = [...out].reverse().find((c) => VOWELS.includes(c))
      if (lastVowel) out += lastVowel
      i += 1
      continue
    }

    // Kombinasi 2 huruf (ファ, ティ, シェ, ...)
    const two = token.slice(i, i + 2)
    if (COMBO_MAP.has(two)) {
      out += COMBO_MAP.get(two)
      i += 2
      continue
    }

    // Yōon: base + ゃ/ゅ/ょ
    if (SMALL_Y[ch]) {
      const yfull = SMALL_Y[ch] // 'ya' | 'yu' | 'yo'
      const base = BASE_MAP.get(token[i - 1])
      if (base && base.length > 1) {
        const stem = base.slice(0, -1) // 'k', 'sh', 'ch', 'j', …
        // し/ち/じ → sha/cha/ja (vokal), lainnya → kya/nyu/ryo (ya utuh)
        const needsVowel = stem === 'sh' || stem === 'ch' || stem === 'j'
        out = out.slice(0, -base.length) + (needsVowel ? stem + yfull[1] : stem + yfull)
      } else {
        out += yfull
      }
      i += 1
      continue
    }

    out += romajiOfSingle(ch, token, i)
    i += 1
  }
  return out
}

function romajiOfSingle(ch, token, idx) {
  const r = BASE_MAP.get(ch)
  if (r) return r
  // karakter non-kana (angka, tanda baca) → buang
  return ''
}

/** Konversi token + particle akhiran (は/へ/を) → romaji. */
function convertToken(token) {
  if (token.length === 0) return ''
  const override = WORD_OVERRIDES.get(token)
  if (override) return override
  // partikel ganda "…へは"
  if (token.endsWith('へは')) return convertToken(token.slice(0, -2)) + ' e wa'
  if (token.endsWith('は')) return (token.length > 1 ? convertToken(token.slice(0, -1)) + ' ' : '') + 'wa'
  if (token.endsWith('へ')) return (token.length > 1 ? convertToken(token.slice(0, -1)) + ' ' : '') + 'e'
  if (token.endsWith('を')) return (token.length > 1 ? convertToken(token.slice(0, -1)) + ' ' : '') + 'o'
  // を di tengah token (tanpa spasi) → potong di situ
  const wIdx = token.indexOf('を', 1)
  if (wIdx > 0) return convertToken(token.slice(0, wIdx)) + ' o ' + convertToken(token.slice(wIdx + 1))
  return kanaTokenToRomaji(token)
}

/**
 * Konversi teks kana (dengan spasi antar kata) menjadi romaji per-kata.
 * Tanda baca di mana pun diganti spasi. Mengembalikan array token romaji.
 */
export function kanaTextToRomajiTokens(text) {
  return text
    .replace(/[、。！？「」…・,.!?]/g, ' ')
    .split(/\s+/)
    .filter(Boolean)
    .map(convertToken)
    .filter((t) => t.trim().length > 0)
}

/** Romaji "cantik" untuk ditampilkan: kata dipisah spasi, lowercase. */
export function kanaTextToRomaji(text) {
  return kanaTextToRomajiTokens(text).join(' ')
}

// ---------- Normalisasi & penilaian ----------

/** Normalisasi ringan: huruf kecil, hanya a-z, toleransi macron & apostrof. */
function lightNormalize(s) {
  return String(s ?? '')
    .toLowerCase()
    .replace(/[āàáâã]/g, 'a')
    .replace(/[ēèéê]/g, 'e')
    .replace(/[īìíî]/g, 'i')
    .replace(/[ōòóôõ]/g, 'o')
    .replace(/[ūùúû]/g, 'u')
    .replace(/['\u2019-]/g, '')
    .replace(/[^a-z]/g, '')
}

/**
 * Normalisasi ketat untuk penilaian: mengeraskan perbedaan gaya ketik
 * agar "shi" == "si", "chi" == "ti", "tsu" == "tu", "fu" == "hu",
 * "ou" == "oo" == "o", "wo" == "o", dst.
 */
export function normalizeAnswer(s) {
  let t = lightNormalize(s)
  // vokal panjang: ulangi sampai stabil (tou → to, kyou → kyo, gakkou → gakko → gakko?)
  for (;;) {
    const before = t
    t = t.replace(/ou|oo/g, 'o').replace(/uu/g, 'u').replace(/ei|ee/g, 'e').replace(/aa/g, 'a').replace(/ii/g, 'i')
    if (t === before) break
  }
  // gaya konsonan: shi↔si, chi↔ti, tsu↔tu, fu↔hu
  t = t.replace(/sh/g, 's').replace(/ch/g, 't').replace(/ts/g, 't').replace(/fu/g, 'hu')
  // を: wo ↔ o
  t = t.replace(/wo/g, 'o')
  // ぢ/ヂ: di ↔ ji, づ/ヅ: du ↔ zu
  t = t.replace(/di/g, 'ji').replace(/du/g, 'zu')
  return t
}

/** Jarak Levenshtein sederhana. */
export function levenshtein(a, b) {
  const m = a.length
  const n = b.length
  if (m === 0) return n
  if (n === 0) return m
  let prev = Array.from({ length: n + 1 }, (_, i) => i)
  for (let i = 1; i <= m; i++) {
    const curr = [i]
    for (let j = 1; j <= n; j++) {
      curr[j] = Math.min(
        prev[j] + 1,
        curr[j - 1] + 1,
        prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1),
      )
    }
    prev = curr
  }
  return prev[n]
}

/** Akurasi 0–100 berdasarkan jarak edit. */
export function accuracy(userAnswer, expected) {
  const u = normalizeAnswer(userAnswer)
  const e = normalizeAnswer(expected)
  if (e.length === 0) return u.length === 0 ? 100 : 0
  const dist = levenshtein(u, e)
  const score = Math.round((1 - dist / Math.max(u.length, e.length)) * 100)
  return Math.max(0, Math.min(100, score))
}

/**
 * Diff per karakter (LCS) untuk highlight kesalahan.
 * Berjalan pada string ternormalisasi; mengembalikan array
 * { char, type } dengan type: 'ok' | 'wrong' | 'extra'
 * - 'ok'    : karakter cocok
 * - 'wrong' : karakter expected yang tidak cocok (merah)
 * - 'extra' : karakter milik user yang berlebih (merah, sisipan)
 */
export function diffChars(userAnswer, expected) {
  const u = normalizeAnswer(userAnswer)
  const e = normalizeAnswer(expected)
  const m = u.length
  const n = e.length

  // LCS DP
  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0))
  for (let i = m - 1; i >= 0; i--) {
    for (let j = n - 1; j >= 0; j--) {
      dp[i][j] = u[i] === e[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1])
    }
  }

  const result = []
  let i = 0
  let j = 0
  while (i < m && j < n) {
    if (u[i] === e[j]) {
      result.push({ char: e[j], type: 'ok' })
      i++
      j++
    } else if (dp[i + 1][j] >= dp[i][j + 1]) {
      result.push({ char: u[i], type: 'extra' })
      i++
    } else {
      result.push({ char: e[j], type: 'wrong' })
      j++
    }
  }
  while (i < m) result.push({ char: u[i++], type: 'extra' })
  while (j < n) result.push({ char: e[j++], type: 'wrong' })
  return result
}

/** Kumpulkan semua kana unik yang muncul dalam sebuah teks (untuk mastery). */
export function extractKana(text) {
  const found = []
  for (const ch of text.replace(/\s/g, '')) {
    if (BASE_MAP.has(ch) && !found.includes(ch)) found.push(ch)
  }
  return found
}
