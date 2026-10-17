// Pemilihan pengecoh (distractor) untuk soal pilihan ganda kosakata.
//
// Masalah yang dihindari: dua entri bisa punya makna yang mirip ("terima kasih"
// vs "terima kasih (sopan)"). Kalau keduanya muncul bareng sebagai pilihan,
// soalnya jadi ambigu (bisa saja dua-duanya benar secara arti).
//
// Aturan: pengecoh tidak boleh berbagi kata inti (keyWords) dengan kunci
// maupun dengan pengecoh lain yang sudah terpilih. Ini pola yang sama dipakai
// generator bank ujian (scripts/exam-gen/build-bank.mjs).
import { keyWords } from './answerMatch.js'

/**
 * Ambil sampai `n` arti pengecoh yang tidak ambigu untuk entri `current`.
 * Urutan hasil mengikuti urutan `pool` (acak-kan `pool` dulu bila perlu).
 * @param {{id:number, arti:string, alt?:string[]}} current entri kunci
 * @param {Array<{id:number, arti:string, alt?:string[]}>} pool kandidat pengecoh
 * @param {number} n jumlah pengecoh yang diinginkan
 * @returns {string[]} daftar arti pengecoh (bisa kurang dari n bila kandidat minim)
 */
export function pickDistractorArti(current, pool, n = 3) {
  const blocked = new Set()
  const mark = (s) => { for (const w of keyWords(s)) blocked.add(w) }
  mark(current.arti)
  for (const a of current.alt || []) mark(a)

  const chosen = []
  const used = new Set([current.arti])

  // Pass 1: hanya kandidat yang aman. Pass 2 (cadangan): isi sisanya agar
  // pilihan tetap cukup, tapi cegah arti duplikat.
  const pass = (safeOnly) => {
    for (const v of pool) {
      if (v.id === current.id || used.has(v.arti)) continue
      const kws = keyWords(v.arti)
      if (!kws.length) continue
      if (safeOnly && kws.some((w) => blocked.has(w))) continue
      used.add(v.arti)
      for (const w of kws) blocked.add(w)
      chosen.push(v.arti)
      if (chosen.length >= n) return
    }
  }

  pass(true)
  if (chosen.length < n) pass(false)
  return chosen.slice(0, n)
}
