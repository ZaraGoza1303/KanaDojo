// Generator soal susun kata + cloze dari kalimat Tatoeba yang sudah dikurasi.
//
//   node scripts/exam-gen/build-tatoeba.mjs
//
// Output: src/data/exam/tatoeba/susun.js + cloze.js + index.js (AUTO-GENERATED).
//
// ID STABIL: susun 2500-2599, cloze 2600-2799 (formula dari Tatoeba sentence
// id + increment bila tabrakan). Batch lama (2001-2031) didaur ulang di sini.
import { writeFileSync, mkdirSync } from 'node:fs'
import { shuffleWithSeed } from '../../src/lib/seedRandom.js'
import { VOCAB_ALL } from '../../src/data/vocabAll.js'
import { TATOEBA_SENTENCES } from '../../src/data/exam/tatoeba/sentences.js'
import { verbForms } from './lib/verbForms.mjs'

const SEED = 'kana-dojo-exam-tatoeba'
const OUT = new URL('../../src/data/exam/tatoeba/', import.meta.url)
const KANJI = /[\u4E00-\u9FFF\u3400-\u4DBF]/
const LATIN_DIGIT = /[A-Za-z0-9]/
const HEADER = (count, apa) =>
  '// AUTO-GENERATED oleh scripts/exam-gen/build-tatoeba.mjs - jangan diedit manual.\n' +
  '// Sumber kalimat: Tatoeba, lisensi CC BY 2.0 FR (atribusi per kalimat: src/data/exam/tatoeba/sentences.js).\n' +
  `// ${count} soal ${apa}.\n\n`

if (TATOEBA_SENTENCES.some((s) => KANJI.test(s.kana))) throw new Error('kalimat kurasi masih mengandung kanji')
const _ids = TATOEBA_SENTENCES.map((s) => s.id)
if (new Set(_ids).size !== _ids.length) throw new Error('sentence id duplikat di sentences.js')

const verbs = VOCAB_ALL.filter((v) => v.kategori === 'Verba')
// peta terbalik bentuk -> kata kerja kamus (dict/masu/te/stem/nai)
const REVERSE = new Map()
for (const v of verbs) {
  const f = verbForms(v.kana)
  const forms = { dict: v.kana, masu: f.masu, te: f.te, stem: f.stem, nai: f.nai }
  for (const [nama, b] of Object.entries(forms)) {
    if (!REVERSE.has(b)) REVERSE.set(b, { dict: v.kana, nama, arti: v.arti })
  }
}

function alokasi(base, size, sentId, terpakai) {
  for (let k = 0; k < size; k++) {
    const id = base + ((sentId * 7919 + k) % size)
    if (!terpakai.has(id)) return id
  }
  throw new Error(`blok id ${base} penuh untuk kalimat ${sentId}`)
}

const SUSUN = []
const CLOZE = []
const terpakai = new Set()
const terpakaiTeks = new Set()

const chunksOf = (kana) => kana.split(/\s+/).filter(Boolean)
const trailOf = (chunk) => chunk.match(/[。、！？」]+$/)?.[0] ?? ''

// Aturan ketat agar kunci pasti tunggal:
//  - bentuk persis masu/te dilubangi seluruhnya, dengan petunjuk bentuknya;
//  - stem yang menempel sufiks (〜ます/〜たい/〜ない) dilubangi stem-nya saja;
//  - opsi selalu 5 bentuk dari kata kerja yang sama.
const SUFIKS = ['ませんでした', 'ません', 'ました', 'ましょう', 'ます', 'たい', 'たくない', 'たかった', 'ない']
const limaOpsi = (blank, opsi, seed) => {
  const lain = [...new Set(opsi)].filter((x) => x && x !== blank).slice(0, 4)
  if (lain.length < 4) return null
  return shuffleWithSeed([blank, ...lain], seed)
}

function cocok(chunk) {
  const trail = trailOf(chunk)
  const core = chunk.slice(0, chunk.length - trail.length)
  if (!core || LATIN_DIGIT.test(core)) return null
  // 1. bentuk persis masu/te
  const ex = REVERSE.get(core)
  if (ex && (ex.nama === 'masu' || ex.nama === 'te')) {
    const f = verbForms(ex.dict)
    const opsi = [f.stem, f.masu, f.te, f.nai, ex.dict, `${f.stem}ません`]
    return {
      dict: ex.dict, arti: ex.arti, tipe: ex.nama, blank: core, sufiks: '', trail, opsi,
      cue: ex.nama === 'masu' ? `(${ex.dict} / bentuk sopan)` : `(${ex.dict} / bentuk -te)`,
      note: ex.nama === 'masu' ? 'bentuk sopan (〜ます)' : 'bentuk -te',
    }
  }
  // 2. stem + sufiks dikenal (mis. のみ + たい, いか + ない)
  for (const v of verbs) {
    const f = verbForms(v.kana)
    if (!core.startsWith(f.stem)) continue
    const sufiks = core.slice(f.stem.length)
    if (!SUFIKS.includes(sufiks)) continue
    const opsi = [f.stem, f.masu, f.te, f.nai, v.kana, `${f.stem}ません`]
    return { dict: v.kana, arti: v.arti, tipe: 'stem', blank: f.stem, sufiks, trail, opsi, cue: `(${v.kana})`, note: `stem ます +「${sufiks}」` }
  }
  return null
}

for (const s of TATOEBA_SENTENCES) {
  const chunks = chunksOf(s.kana)
  const sid = s.id
  // A. susun: 3-6 potongan kata
  if (chunks.length >= 3 && chunks.length <= 6) {
    let scrambled = shuffleWithSeed(chunks, `${SEED}:${sid}`)
    if (scrambled.join('|') === chunks.join('|')) scrambled = [...chunks.slice(1), chunks[0]]
    const id = alokasi(2500, 90, sid, terpakai)
    terpakai.add(id)
    SUSUN.push({
      id,
      tipe: 'susun',
      topik: 'keseharian',
      teks: 'ただしい ぶんを つくって ください。',
      soal: `${scrambled.join(' / ')} → ?`,
      kata: scrambled,
      jawaban: chunks,
      pembahasan: `Urutan benar: ${s.kana} (${s.ind}) Sumber: Tatoeba #${s.id} (${s.user || 'anonim'}).`,
    })
  }
  // B. cloze bentuk kata kerja
  for (let ci = 0; ci < chunks.length; ci++) {
    const m = cocok(chunks[ci])
    if (!m) continue
    const blanked = `___${m.sufiks}${m.trail}`
    const teks = [...chunks.slice(0, ci), blanked, ...chunks.slice(ci + 1)].join(' ')
    if (terpakaiTeks.has(teks)) continue
    const pilihan = limaOpsi(m.blank, m.opsi, `${SEED}:cloze:${sid}:${ci}`)
    if (!pilihan) continue
    const id = alokasi(2600, 190, sid, terpakai)
    terpakai.add(id)
    terpakaiTeks.add(teks)
    CLOZE.push({
      id,
      tipe: 'cloze',
      topik: 'doushi',
      teks: `${teks} ${m.cue}`,
      soal: 'ただしい かたちを えらんで ください。',
      pilihan,
      jawaban: pilihan.indexOf(m.blank),
      pembahasan: `「${m.dict}」= ${m.arti}. ${m.note}. Sumber: Tatoeba #${sid} (${s.user || 'anonim'}).`,
    })
  }
}

mkdirSync(OUT, { recursive: true })
const dump = (arr) => arr.map((r) => JSON.stringify(r)).join(',\n')
writeFileSync(new URL('susun.js', OUT), `${HEADER(SUSUN.length, 'susun kata')}export const TATOEBA_SUSUN = [\n${dump(SUSUN)},\n]\n`)
writeFileSync(new URL('cloze.js', OUT), `${HEADER(CLOZE.length, 'cloze bentuk kata kerja')}export const TATOEBA_CLOZE = [\n${dump(CLOZE)},\n]\n`)
writeFileSync(
  new URL('index.js', OUT),
  `${HEADER(SUSUN.length + CLOZE.length, 'susun + cloze')}import { TATOEBA_SUSUN } from './susun.js'\nimport { TATOEBA_CLOZE } from './cloze.js'\nimport { TATOEBA_BACAAN } from './bacaan.js'\n\nexport const EXAM_BANK_TATOEBA = [...TATOEBA_BACAAN, ...TATOEBA_SUSUN, ...TATOEBA_CLOZE]\n`,
)

console.log(`susun   : ${SUSUN.length} soal (id 2500-2599)`)
console.log(`cloze   : ${CLOZE.length} soal (id 2600-2789)`)
console.log('plus soal bacaan kurasi di src/data/exam/tatoeba/bacaan.js')
