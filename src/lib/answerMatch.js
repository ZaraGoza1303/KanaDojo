// Penilaian jawaban essay kosakata (Bahasa Indonesia, jawaban bebas).
//
// Aturan yang dipakai:
//  1. sama persis (abaikan besar/kecil huruf & spasi berlebih)
//  2. kata sama walau urutannya berbeda ("kerja hari" == "hari kerja")
//  3. typo ringan 1 huruf untuk kata >= 4 huruf ("penyany" == "penyanyi",
//     tapi "penynyo" != "penyanyi")
//  4. data memakai "/" untuk makna ganda, satu bagian saja sudah benar
//     ("jam" untuk "waktu / jam", "AM" untuk "pagi hari / AM")
//  5. jawaban lebih panjang dengan kata tambahan/stopword tetap benar
//     ("selamat kembali dari mana" untuk "selamat kembali")
//
// Yang TIDAK diterima: jawaban yang hanya sebagian dari kunci, mis.
// "tanggal" untuk "tanggal dua puluh dua" atau "hari" untuk "hari kerja".
import { levenshtein } from './romaji.js'

export const norm = (s) => String(s ?? '').trim().toLowerCase().replace(/\s+/g, ' ')

// Pemisah kata: tanda hubung & apostrof (kaki-laki -> kaki laki), plus
// pemisah makna ganda/penjelas di data ("pagi hari / AM", "siang/sore / PM").
export const words = (s) =>
  norm(s)
    .replace(/[-'\u2019]/g, ' ')
    .replace(/[\/|,;()]+/g, ' ')
    .split(/\s+/)
    .filter(Boolean)

// Kunci urutan-bebas: "pulang selamat datang" == "selamat datang pulang"
export const tokenKey = (s) => words(s).sort().join(' ')

// Kata yang boleh hilang/berlebih tanpa mengubah arti inti
const STOP = new Set(['dari','ke','di','yang','untuk','dengan','pada','dalam','itu','ini','juga','sekali','banget','sangat','akan','sudah','belum','oleh','atau','dan','adalah','merupakan','bisa','dapat'])

export const keyWords = (s) => words(s).filter((w) => !STOP.has(w))

// Kata dianggap sama bila identik atau typo 1 huruf saja (biar penynyo != penyanyi)
export const wordEq = (a, b) => {
  if (a === b) return true
  const L = Math.max(a.length, b.length)
  return L >= 4 ? levenshtein(a, b) <= 1 : false
}

// Dua himpunan kata inti sama persis (urutan & typo ringan tidak peduli)
const sameWordSet = (a, b) => a.length === b.length && a.every((w) => b.some((x) => wordEq(w, x)))

// Pecah kunci makna ganda: "pagi hari / AM" -> ['pagi hari', 'AM']
export const segments = (s) => norm(s).split(/[\/|;]+/).map((x) => x.trim()).filter(Boolean)

/**
 * Apakah `input` sah sebagai arti `arti` (atau salah satu `alt`)?
 * @param {string} input jawaban pengguna
 * @param {string} arti kunci utama
 * @param {string[]} [alt] sinonim yang juga diterima
 */
export function isAnswerCorrect(input, arti, alt = []) {
  const n = norm(input)
  if (!n) return false
  const t = tokenKey(input)
  const inWords = keyWords(input)
  for (const c of [arti, ...(alt || [])].map(norm)) {
    if (!c) continue
    // 1 & 2: sama persis atau beda urutan kata
    if (c === n || tokenKey(c) === t) return true
    // 4: kunci makna ganda, satu bagian penuh sudah cukup
    for (const seg of segments(c)) {
      if (seg === n || tokenKey(seg) === t) return true
      const sWords = keyWords(seg)
      if (inWords.length && sWords.length && sameWordSet(inWords, sWords)) return true
    }
    // 5: jawaban menutup SEMUA kata inti kunci, sisanya kata tambahan
    const cWords = keyWords(c)
    if (inWords.length && cWords.length && cWords.every((w) => inWords.some((x) => wordEq(w, x)))) return true
  }
  return false
}
