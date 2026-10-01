// Generator soal susun kata dari kalimat Tatoeba yang sudah dikurasi.
//
//   node scripts/exam-gen/build-tatoeba.mjs
//
// Output: src/data/exam/tatoeba/susun.js + index.js (AUTO-GENERATED).
import { writeFileSync, mkdirSync } from 'node:fs'
import { shuffleWithSeed } from '../../src/lib/seedRandom.js'
import { TATOEBA_SENTENCES } from '../../src/data/exam/tatoeba/sentences.js'

const SEED = 'kana-dojo-exam-tatoeba'
const OUT = new URL('../../src/data/exam/tatoeba/', import.meta.url)
const ID_START = 2001
const TOPIK = {
  'Hari ini': 'youbi', 'Terima kasih': 'aisatsu', 'Saya ibu': 'shigoto',
}

const rows = []
for (const s of TATOEBA_SENTENCES) {
  const chunks = s.kana.split(/\s+/).filter(Boolean)
  if (chunks.length < 3 || chunks.length > 6) continue
  let scrambled = shuffleWithSeed(chunks, `${SEED}:${s.id}`)
  if (scrambled.join('|') === chunks.join('|')) scrambled = [...chunks.slice(1), chunks[0]]
  rows.push({
    id: ID_START + rows.length,
    tipe: 'susun',
    topik: 'keseharian',
    teks: 'ただしい ぶんを つくって ください。',
    soal: `${scrambled.join(' / ')} → ?`,
    kata: scrambled,
    jawaban: chunks,
    pembahasan: `Urutan benar: ${s.kana} (${s.ind}) Sumber: Tatoeba #${s.id} (${s.user}).`,
  })
}

const HEADER =
  '// AUTO-GENERATED oleh scripts/exam-gen/build-tatoeba.mjs - jangan diedit manual.\n' +
  '// Sumber kalimat: Tatoeba, lisensi CC BY 2.0 FR (atribusi per kalimat: src/data/exam/tatoeba/sentences.js).\n' +
  `// ${rows.length} soal susun.\n\n`

mkdirSync(OUT, { recursive: true })
writeFileSync(new URL('susun.js', OUT), `${HEADER}export const TATOEBA_SUSUN = [\n${rows.map((r) => JSON.stringify(r)).join(',\n')},\n]\n`)
writeFileSync(
  new URL('index.js', OUT),
  `${HEADER}import { TATOEBA_SUSUN } from './susun.js'\nimport { TATOEBA_BACAAN } from './bacaan.js'\n\nexport const EXAM_BANK_TATOEBA = [...TATOEBA_BACAAN, ...TATOEBA_SUSUN]\n`,
)

console.log(`susun   : ${rows.length} soal (${ID_START}-${ID_START + rows.length - 1})`)
console.log('plus soal bacaan kurasi di src/data/exam/tatoeba/bacaan.js')
