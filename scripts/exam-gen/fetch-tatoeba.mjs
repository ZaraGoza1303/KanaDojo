// Ambil kandidat soal bacaan dari Tatoeba (lisensi CC BY 2.0 FR).
//
//   node scripts/exam-gen/fetch-tatoeba.mjs            # tulis cache + ringkasan
//   node scripts/exam-gen/fetch-tatoeba.mjs --top 60   # tampilkan 60 kandidat teratas
//   node scripts/exam-gen/fetch-tatoeba.mjs --id 4573111 --id 4593710
//
// Yang diunduh (butuh `curl` dan `bzip2` di PATH):
//   - jpn_transcriptions.tsv.bz2   : kalimat Jepang + furigana -> jadi kana murni
//   - jpn_tags.tsv.bz2             : tag mutu (OK, ambiguous, @needs native check, ...)
//   - jpn-ind_links + ind_sentences: terjemahan Indonesia (bahan cek, bukan disalin apa adanya)
//
// Hasil: scripts/exam-gen/.cache/candidates.tsv + review.txt (di-gitignore).
// Kalimat yang benar-benar dipakai wajib mencatat sentence id + username (atribusi CC BY).
import { execSync } from 'node:child_process'
import { mkdirSync, writeFileSync } from 'node:fs'
import { VOCAB_ALL } from '../../src/data/vocabAll.js'
import { cleanCandidate, hasLatinOrDigit } from './lib/furigana.mjs'
import { segment } from './lib/segment.mjs'

const BASE = 'https://downloads.tatoeba.org/exports/per_language'
const CACHE = new URL('.cache/', import.meta.url)

// Tag yang bikin kalimat tidak layak jadi soal ujian
const TAG_BLOCK = new Set([
  'ambiguous', '@needs native check', '@check translation', '@change', '@delete',
  'not a sentence', '@possible copyright infringement', 'Classical Japanese (Bungo)',
  'old-fashioned', 'proverb', 'quote', 'idiom', 'colloquial', 'い抜き言葉',
  'not for WWWJDIC', 'by Kishida Kunio', 'derogatory', 'vulgar', 'slang',
])
// Kata yang bikin soal terlalu khusus / konten tidak netral
const KATA_BLOCK = ['トム', 'メアリー', 'ジョン', 'ボストン', 'カナダ', 'オーストラリア']

const argv = process.argv.slice(2)
const argOf = (flag) => (argv.includes(flag) ? argv[argv.indexOf(flag) + 1] : null)
const topN = Number(argOf('--top') || 0)
const onlyIds = argv.reduce((acc, a, i) => (a === '--id' ? [...acc, argv[i + 1]] : acc), [])

const fetchTsv = (url) =>
  execSync(`curl -s ${url} | bzip2 -dc`, { maxBuffer: 512 * 1024 * 1024, encoding: 'utf8' })

// ---------- 1. tag mutu ----------
const tags = new Map()
for (const line of fetchTsv(`${BASE}/jpn/jpn_tags.tsv.bz2`).split('\n')) {
  if (!line) continue
  const [id, tag] = line.split('\t')
  if (!id || !tag) continue
  if (!tags.has(id)) tags.set(id, new Set())
  tags.get(id).add(tag)
}

// ---------- 2. transkripsi furigana -> kana ----------
const raw = new Map() // id -> { user, kana[] }
for (const line of fetchTsv(`${BASE}/jpn/jpn_transcriptions.tsv.bz2`).split('\n')) {
  if (!line) continue
  const [id, , , user, text] = line.split('\t')
  if (!id || !text) continue
  const kana = cleanCandidate(text, { min: 10, max: 26 })
  if (!kana) continue
  if (raw.has(id)) raw.get(id).kana.push(kana)
  else raw.set(id, { user, kana: [kana] })
}

// ---------- 3. terjemahan Indonesia (bahan cek) ----------
const indPairs = new Map() // jpn id -> ind text
try {
  const ind = new Map()
  for (const line of fetchTsv(`${BASE}/ind/ind_sentences.tsv.bz2`).split('\n')) {
    if (!line) continue
    const [id, , text] = line.split('\t')
    if (id && text) ind.set(id, text)
  }
  for (const line of fetchTsv(`${BASE}/jpn/jpn-ind_links.tsv.bz2`).split('\n')) {
    if (!line) continue
    const [jpn, iid] = line.split('\t')
    if (jpn && ind.has(iid)) indPairs.set(jpn, ind.get(iid))
  }
} catch {
  console.warn('peringatan: data terjemahan Indonesia dilewati')
}

// ---------- 4. skor kelayakan ----------
// Kosakata app dipakai untuk menilai apakah kalimat masih level N5-N4
const KANJI = /[\u4E00-\u9FFF]/
const vocab = VOCAB_ALL.map((v) => v.kana).filter((k) => k.length >= 2).sort((a, b) => b.length - a.length)
const coverage = (kana) => {
  const s = kana.replace(/[^\u3041-\u309F\u30A0-\u30FF]/g, '')
  let hit = 0
  for (let i = 0; i < s.length; ) {
    const w = vocab.find((v) => s.startsWith(v, i))
    if (w) { hit += w.length; i += w.length } else i += 1
  }
  return s.length ? hit / s.length : 0
}

const rows = []
for (const [id, { user, kana: list }] of raw) {
  const t = tags.get(id)
  if (t && [...t].some((x) => TAG_BLOCK.has(x))) continue
  for (const kana of list) {
    if (hasLatinOrDigit(kana) || KANJI.test(kana)) continue
    if (KATA_BLOCK.some((w) => kana.includes(w))) continue
    const cov = coverage(kana)
    if (cov < 0.55) continue
    const ok = t?.has('OK') ? 2 : 0
    const tanaka = t?.has('Tanaka Corpus') ? 1 : 0
    const hasInd = indPairs.has(id) ? 1 : 0
    rows.push({ id, user: user || '-', kana, spasi: segment(kana), cov, score: ok + tanaka + hasInd + cov, ind: indPairs.get(id) || '' })
  }
}

// satu kalimat satu kandidat (pakai skor terbaik), urut deterministik
const best = new Map()
for (const r of rows) if (!best.has(r.id) || best.get(r.id).score < r.score) best.set(r.id, r)
const list = [...best.values()].sort((a, b) => b.score - a.score || Number(a.id) - Number(b.id))

mkdirSync(CACHE, { recursive: true })
writeFileSync(
  new URL('candidates.tsv', CACHE),
  `id\tuser\tskor\tcakupan\tkana\tspasi\tind\n${list.map((r) => [r.id, r.user, r.score.toFixed(2), r.cov.toFixed(2), r.kana, r.spasi, r.ind].join('\t')).join('\n')}\n`,
)
writeFileSync(
  new URL('review.txt', CACHE),
  list.map((r, i) => `${String(i + 1).padStart(4)}. [${r.id}] (${r.score.toFixed(2)}) ${r.spasi}${r.ind ? `  -> ${r.ind}` : ''}`).join('\n') + '\n',
)

console.log(`kandidat mentah      : ${raw.size} kalimat berfurigana`)
console.log(`lolos saringan tags  : ${rows.length}`)
console.log(`kandidat unik        : ${list.length}`)
console.log(`punya terjemahan ind : ${list.filter((r) => r.ind).length}`)
console.log(`cakupan kosakata app : rata-rata ${(list.reduce((s, r) => s + r.cov, 0) / Math.max(1, list.length)).toFixed(2)}`)
console.log('cache: scripts/exam-gen/.cache/candidates.tsv + review.txt')

if (onlyIds.length) {
  console.log('\n-- kalimat terpilih --')
  for (const id of onlyIds) {
    const r = list.find((x) => x.id === id) || best.get(id)
    console.log(r ? `[${r.id}] ${r.kana}${r.ind ? `  -> ${r.ind}` : ''} (skor ${r.score.toFixed(2)})` : `[${id}] tidak ada / kena saringan`)
  }
}
if (topN) {
  console.log(`\n-- ${topN} kandidat teratas --`)
  for (const r of list.slice(0, topN)) console.log(`[${r.id}] ${r.kana}${r.ind ? `  -> ${r.ind}` : ''}`)
}

