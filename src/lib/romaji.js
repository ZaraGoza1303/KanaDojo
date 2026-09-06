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

/** Tokenisasi teks kana per kata, dipertahankan kana-nya untuk highlight. */
export function kanaTextToWordSegments(text) {
  return text
    .replace(/[、。！？「」…・,.!?]/g, ' ')
    .split(/\s+/)
    .filter(Boolean)
    .map((token) => ({ kana: token, romaji: convertToken(token) }))
}

/**
 * Versi kanaTokenToRomaji yang mencatat indeks kana pemilik setiap huruf
 * output, dipakai untuk highlight kana per huruf.
 */
function traceKanaToken(token) {
  const out = []
  const owners = []
  const push = (s, owner) => {
    for (const ch of s) {
      out.push(ch)
      owners.push(owner)
    }
  }
  let i = 0
  while (i < token.length) {
    const ch = token[i]
    if (ch === 'っ' || ch === 'ッ') {
      const next = token[i + 1]
      const nextR = next ? BASE_MAP.get(next) : null
      if (nextR) push(nextR.startsWith('ch') ? 't' : nextR[0], i)
      i += 1
      continue
    }
    if (ch === 'ー' || ch === '〜') {
      const lastVowel = [...out].reverse().find((c) => VOWELS.includes(c))
      if (lastVowel) push(lastVowel, i)
      i += 1
      continue
    }
    const two = token.slice(i, i + 2)
    if (COMBO_MAP.has(two)) {
      push(COMBO_MAP.get(two), i)
      i += 2
      continue
    }
    if (SMALL_Y[ch]) {
      const yfull = SMALL_Y[ch]
      const base = BASE_MAP.get(token[i - 1])
      if (base && base.length > 1) {
        const stem = base.slice(0, -1)
        const needsVowel = stem === 'sh' || stem === 'ch' || stem === 'j'
        out.splice(out.length - base.length, base.length)
        owners.splice(owners.length - base.length, base.length)
        push(needsVowel ? stem + yfull[1] : stem + yfull, i)
      } else {
        push(yfull, i)
      }
      i += 1
      continue
    }
    const r = BASE_MAP.get(ch)
    if (r) push(r, i)
    i += 1
  }
  return { romaji: out.join(''), owners }
}

/**
 * Diff jawaban user terhadap jawaban yang dipecah per-kata kana.
 * Perbandingan karakter tetap memakai romaji utuh ternormalisasi (sama dengan
 * yang dipakai penilaian), lalu setiap karakter dipetakan ke kata kana-nya
 * lewat penyelarasan LCS antara gabungan per-kata vs romaji utuh, karena
 * normalisasi bisa menyatukan vokal antar kata (…no + ongaku… → …no…).
 * Mengembalikan { wordStatus, charDiff, kanaCharStatus }:
 * - wordStatus[wi]     : 'ok' | 'wrong' untuk tiap kata
 * - charDiff[]         : { char, type, word } untuk highlight romaji
 * - kanaCharStatus[wi] : ('ok'|'wrong')[] per huruf kana dalam kata wi
 */
export function diffAnswerWords(userAnswer, wordSegments) {
  const un = normalizeAnswer(userAnswer)
  const full = normalizeAnswer(wordSegments.map((w) => w.romaji).join(' '))
  const parts = wordSegments.map((w) => normalizeAnswer(w.romaji))
  const concat = parts.join('')
  const wordStatus = parts.map(() => 'ok')
  const lastWord = Math.max(0, parts.length - 1)

  // Peta posisi concat → indeks kata
  const bounds = []
  let acc = 0
  for (const p of parts) {
    bounds.push([acc, acc + p.length])
    acc += p.length
  }
  let wi = 0
  const wordOfConcat = (pos) => {
    while (wi < bounds.length - 1 && pos >= bounds[wi][1]) wi++
    return wi
  }

  // Selaraskan concat dengan full (hanya expected, statis per teks):
  // karakter concat yang hilang karena normalisasi antar-kata dilewati.
  const m = concat.length
  const n = full.length
  const wordForFull = new Array(n).fill(lastWord)
  if (n > 0) {
    const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0))
    for (let a = m - 1; a >= 0; a--) {
      for (let b = n - 1; b >= 0; b--) {
        dp[a][b] = concat[a] === full[b] ? dp[a + 1][b + 1] + 1 : Math.max(dp[a + 1][b], dp[a][b + 1])
      }
    }
    let a = 0
    let b = 0
    while (a < m && b < n) {
      if (concat[a] === full[b]) {
        wordForFull[b] = wordOfConcat(a)
        a++
        b++
      } else if (dp[a + 1][b] >= dp[a][b + 1]) {
        a++
      } else {
        wordForFull[b] = wordOfConcat(a)
        b++
      }
    }
    while (b < n) {
      wordForFull[b] = wordOfConcat(m)
      b++
    }
  }

  // Diff user vs full, atribusikan tiap karakter ke kata kana-nya
  const charDiff = []
  if (n === 0) {
    for (let x = 0; x < un.length; x++) charDiff.push({ char: un[x], type: 'extra', word: 0 })
    if (wordStatus.length > 0 && un.length > 0) wordStatus[0] = 'wrong'
    return { wordStatus, charDiff }
  }

  const dp = Array.from({ length: un.length + 1 }, () => new Array(n + 1).fill(0))
  for (let x = un.length - 1; x >= 0; x--) {
    for (let y = n - 1; y >= 0; y--) {
      dp[x][y] = un[x] === full[y] ? dp[x + 1][y + 1] + 1 : Math.max(dp[x + 1][y], dp[x][y + 1])
    }
  }
  let x = 0
  let y = 0
  while (x < un.length && y < n) {
    if (un[x] === full[y]) {
      charDiff.push({ char: full[y], type: 'ok', word: wordForFull[y] })
      x++
      y++
    } else if (dp[x + 1][y] >= dp[x][y + 1]) {
      const w = wordForFull[Math.min(y, n - 1)]
      charDiff.push({ char: un[x], type: 'extra', word: w })
      if (wordStatus[w] != null) wordStatus[w] = 'wrong'
      x++
    } else {
      charDiff.push({ char: full[y], type: 'wrong', word: wordForFull[y] })
      wordStatus[wordForFull[y]] = 'wrong'
      y++
    }
  }
  while (x < un.length) {
    charDiff.push({ char: un[x], type: 'extra', word: lastWord })
    if (wordStatus[lastWord] != null) wordStatus[lastWord] = 'wrong'
    x++
  }
  while (y < n) {
    charDiff.push({ char: full[y], type: 'wrong', word: wordForFull[y] })
    wordStatus[wordForFull[y]] = 'wrong'
    y++
  }

  // Status per huruf kana: selaraskan romaji mentah tiap kata (dengan jejak
  // pemiliknya) ke romaji ternormalisasi kata tersebut.
  const kanaCharStatus = wordSegments.map((seg, wi) => [...seg.kana].map(() => 'ok'))
  for (let wi = 0; wi < wordSegments.length; wi++) {
    try {
      const seg = wordSegments[wi]
      const { romaji: R, owners } = traceKanaToken(seg.kana)
      const We = parts[wi]
      const n2 = We.length
      const m2 = R.length
      const ownerForWe = new Array(n2).fill(-1)
      const coverage = new Array(seg.kana.length).fill(0)
      if (n2 > 0 && m2 > 0) {
        const dp2 = Array.from({ length: m2 + 1 }, () => new Array(n2 + 1).fill(0))
        for (let a = m2 - 1; a >= 0; a--) {
          for (let b = n2 - 1; b >= 0; b--) {
            dp2[a][b] = R[a] === We[b] ? dp2[a + 1][b + 1] + 1 : Math.max(dp2[a + 1][b], dp2[a][b + 1])
          }
        }
        let a = 0
        let b = 0
        while (a < m2 && b < n2) {
          if (R[a] === We[b]) {
            ownerForWe[b] = owners[a]
            coverage[owners[a]] += 1
            a++
            b++
          } else if (dp2[a + 1][b] >= dp2[a][b + 1]) {
            a++
          } else {
            b++
          }
        }
        // huruf We yang tak ketemu pasangannya (substitusi penuh, mis. fu→hu)
        // mewarisi pemilik dari tetangga terdekat
        for (let b = 0; b < n2; b++) {
          if (ownerForWe[b] === -1) {
            ownerForWe[b] = ownerForWe[b - 1] ?? ownerForWe.slice(b).find((v) => v !== -1) ?? 0
          }
        }
      }
      // Tandai dari diff: 'wrong' dan 'extra' menyalahkan kana pemiliknya
      let j = 0
      for (const e of charDiff) {
        if (e.word !== wi) continue
        if (e.type === 'extra') {
          const idx = ownerForWe[Math.min(j, n2 - 1)]
          if (idx >= 0) kanaCharStatus[wi][idx] = 'wrong'
        } else {
          if (e.type === 'wrong' && ownerForWe[j] >= 0) kanaCharStatus[wi][ownerForWe[j]] = 'wrong'
          j++
        }
      }
      // Kana tanpa kontribusi romaji (ー tanpa vokal, dsb.) ikut tetangganya
      for (let k = 1; k < kanaCharStatus[wi].length; k++) {
        if (coverage[k] === 0) kanaCharStatus[wi][k] = kanaCharStatus[wi][k - 1]
      }
      for (let k = kanaCharStatus[wi].length - 2; k >= 0; k--) {
        if (coverage[k] === 0) kanaCharStatus[wi][k] = kanaCharStatus[wi][k + 1]
      }
    } catch {
      kanaCharStatus[wi] = [...wordSegments[wi].kana].map(() => wordStatus[wi])
    }
  }
  return { wordStatus, charDiff, kanaCharStatus }
}

/** Kumpulkan semua kana unik yang muncul dalam sebuah teks (untuk mastery). */
export function extractKana(text) {
  const found = []
  for (const ch of text.replace(/\s/g, '')) {
    if (BASE_MAP.has(ch) && !found.includes(ch)) found.push(ch)
  }
  return found
}
