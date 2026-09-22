// Generator bank soal ujian KanaDojo — Batch 1: soal dari data internal app.
//
//   node scripts/exam-gen/build-bank.mjs
//
// Output: src/data/exam/generated/*.js (AUTO-GENERATED, jangan diedit manual).
// Semua soal dibangkitkan deterministik dari seed di bawah, lalu divalidasi:
// tanpa kanji, id unik, 5 opsi, kunci jawaban valid.
import { writeFileSync, mkdirSync } from 'node:fs'
import { VOCAB_ALL } from '../../src/data/vocabAll.js'
import { TEXTS } from '../../src/data/texts.js'
import { shuffleWithSeed } from '../../src/lib/seedRandom.js'
import { keyWords } from '../../src/lib/answerMatch.js'
import { verbForms, TRANSITIVE, PLACE_ACTIVITY, TIME_WITH_NI, PARTICLE_MEANING } from './lib/verbForms.mjs'

const SEED = 'kana-dojo-exam-batch1'
const KANJI = /[\u4E00-\u9FFF\u3400-\u4DBF]/
const TOPIK_BY_KATEGORI = {
  Nomina: 'meishi', Verba: 'doushi', Adjektiva: 'keiyoushi', Angka: 'suuji', Warna: 'iro',
  Sapaan: 'aisatsu', Hari: 'youbi', Bulan: 'tsuki', Tanggal: 'hizuke', Waktu: 'jikan',
}

const shuffled = (arr, key) => shuffleWithSeed(arr, `${SEED}:${key}`)
const takeN = (arr, n, key) => shuffled(arr, key).slice(0, n)
const oneLine = (s) => String(s).replace(/\s+/g, ' ').trim()
const byKana = new Map(VOCAB_ALL.map((v) => [v.kana, v]))

/** Opsi = kunci + pengecoh, posisi kunci ditentukan seed. */
function buildOptions(correct, distractors, key) {
  const uniq = [...new Set(distractors.filter((d) => d && d !== correct))]
  const opts = shuffled([correct, ...uniq.slice(0, 4)], `opt:${key}`)
  if (opts.length !== 5) throw new Error(`opsi tidak 5 untuk ${key}: ${opts.join(' / ')}`)
  return { pilihan: opts, jawaban: opts.indexOf(correct) }
}

/** Pasangan {objek+partikel, verba} dari contoh_kana entri verba. */
function verbPairs(particle) {
  const out = []
  for (const v of VOCAB_ALL) {
    if (v.kategori !== 'Verba') continue
    const m = v.contoh_kana.match(/^(\S+)([をで]) (\S+)$/)
    if (!m) continue
    if (m[3] !== v.kana || m[2] !== particle) continue
    out.push({ kana: v.kana, arti: v.arti, phrase: m[1], verb: m[3] })
  }
  return out
}

// ---------- 1. CLOZE PARTIKEL ----------
function clozeParticles(limit) {
  const rows = []
  const P_OBJ = ['を', 'に', 'で', 'と', 'が']
  const P_PLACE = ['で', 'を', 'に', 'へ', 'と']
  const P_TIME = ['に', 'を', 'で', 'と', 'が']
  const P_FRIEND = ['と', 'に', 'を', 'で', 'へ']
  const PREF = ['わたしは まいにち', 'あには よく', 'あねは いつも', 'ちちは まいにち', 'ははは よく', 'おとうとは いつも', 'かぞくは よく']
  const SOAL_JOSHI = 'ただしい じょしを えらんで ください。'
  const mk = (teks, correct, pool, pembahasan, topik, key) => {
    const o = buildOptions(correct, pool.filter((p) => p !== correct), key)
    rows.push({ tipe: 'cloze', topik, teks: oneLine(teks), soal: SOAL_JOSHI, pilihan: o.pilihan, jawaban: o.jawaban, pembahasan })
  }

  // A. objek を (kata kerja transitif) - 3 variasi keterangan
  verbPairs('を').filter((p) => TRANSITIVE.has(p.kana)).forEach((p, i) => {
    const f = verbForms(p.kana)
    for (const off of [0, 2, 4]) {
      const pref = PREF[(i + off) % PREF.length]
      mk(`${pref} ${p.phrase}___ ${f.masu}。`, 'を', P_OBJ, `「${p.phrase}を ${p.kana}」= ${p.arti}. 「を」 ${PARTICLE_MEANING['を']}.`, TOPIK_BY_KATEGORI.Verba, `obj:${p.kana}:${off}`)
    }
  })

  // B. tempat で (aktivitas, bukan kata kerja perpindahan)
  verbPairs('で').filter((p) => PLACE_ACTIVITY.has(p.kana)).forEach((p, i) => {
    const f = verbForms(p.kana)
    for (const off of [0, 3]) {
      const pref = PREF[(i + off) % PREF.length]
      mk(`${pref} ${p.phrase}___ ${f.masu}。`, 'で', P_PLACE, `「${p.phrase}で ${p.kana}」= ${p.arti}. 「で」 ${PARTICLE_MEANING['で']}.`, TOPIK_BY_KATEGORI.Verba, `place:${p.kana}:${off}`)
    }
  })

  // C. waktu に ("{hari}に {objek}を {verba}")
  const objPairs = verbPairs('を').filter((p) => TRANSITIVE.has(p.kana))
  let ci = 0
  for (const time of TIME_WITH_NI) {
    for (let k = 0; k < 5; k++) {
      const p = objPairs[(ci * 3 + k) % objPairs.length]
      const f = verbForms(p.kana)
      mk(`${time}___ ${p.phrase}を ${f.masu}。`, 'に', P_TIME, `「${time}」= keterangan waktu. 「に」 ${PARTICLE_MEANING['に']}.`, TOPIK_BY_KATEGORI.Waktu, `time:${time}:${p.kana}:${k}`)
    }
    ci++
  }

  // D. teman と いっしょに
  const persons = ['ともだち', 'かぞく', 'ちち', 'はは', 'あに', 'あね', 'おとうと', 'いもうと', 'せんせい', 'かれ', 'かのじょ'].filter((k) => byKana.has(k))
  const places = ['こうえん', 'えき', 'デパート', 'スーパー', 'としょかん', 'うみ', 'やま', 'がっこう', 'ぎんこう', 'レストラン'].filter((k) => byKana.has(k))
  persons.forEach((person, pi) => {
    for (const off of [0, 4]) {
      const place = places[(pi + off) % places.length]
      mk(`${person}___ いっしょに ${place}へ いきます。`, 'と', P_FRIEND, `「${person}と いっしょに」= bersama ${byKana.get(person).arti}. 「と」 ${PARTICLE_MEANING['と']}.`, TOPIK_BY_KATEGORI.Sapaan, `friend:${person}:${off}`)
    }
  })

  return shuffleWithSeed(rows, `${SEED}:order:particle`).slice(0, limit)
}

// ---------- 2. CLOZE BENTUK KATA KERJA ----------
function clozeVerbForms(limit) {
  const rows = []
  const SOAL = 'ただしい かたちを えらんで ください。'
  const PREF = ['わたしは まいにち', 'あには よく', 'かぞくは いつも', 'ともだちは まいにち', 'ちちは いつも']
  const frames = [
    { id: 'tai', tail: 'たいです', note: '〜たいです = ingin (stem ます + たい)', pick: (f) => f.stem },
    { id: 'te', tail: 'ください', note: '〜てください = minta tolong (bentuk -te)', pick: (f) => f.te },
    { id: 'masu', tail: '', note: 'bentuk sopan (〜ます)', pick: (f) => f.masu, hint: 'bentuk sopan' },
  ]
  const verbs = VOCAB_ALL.filter((v) => v.kategori === 'Verba')
  let i = 0
  for (const v of verbs) {
    // "keterangan + partikel" di depan kata kerja, mis. "ごはんを たべる" -> "ごはんを"
    if (!v.contoh_kana.endsWith(v.kana)) continue
    const objek = v.contoh_kana.slice(0, -v.kana.length).trim()
    if (!objek || !/(を|に|で|へ|と|から|まで)$/.test(objek)) continue
    const f = verbForms(v.kana)
    const pool = [v.kana, f.te, f.masu, f.stem, f.nai, f.stem + 'ません']
    for (const fr of frames) {
      const answer = fr.pick(f)
      const pref = PREF[i % PREF.length]
      const teks = oneLine(`${pref} ${objek} ___${fr.tail}。(${v.kana})`)
      const o = buildOptions(answer, pool, `vform:${fr.id}:${v.kana}`)
      rows.push({
        tipe: 'cloze', topik: TOPIK_BY_KATEGORI.Verba, teks,
        soal: fr.hint ? `${SOAL}(${fr.hint})` : SOAL,
        pilihan: o.pilihan, jawaban: o.jawaban,
        pembahasan: `「${objek} ${v.kana}」= ${v.arti}. ${fr.note}.`,
      })
      i++
    }
  }
  return shuffleWithSeed(rows, `${SEED}:order:vform`).slice(0, limit)
}

// ---------- 3. LITERAL: ARTI KOSAKATA ----------
function meaningLiteral(limit) {
  const rows = []
  const SOAL = 'この ことばの いみは なんですか。'
  for (const v of VOCAB_ALL) {
    const correct = v.arti
    const alts = v.alt || []
    const blocked = new Set([correct, ...alts].flatMap((x) => [x, ...keyWords(x)]))
    const sameCat = shuffled(VOCAB_ALL.filter((x) => x.kategori === v.kategori && x.id !== v.id), `mc:${v.kana}`)
    const others = shuffled(VOCAB_ALL.filter((x) => x.kategori !== v.kategori), `mo:${v.kana}`)
    const distractors = []
    for (const c of [...sameCat, ...others]) {
      const t = c.arti
      if (blocked.has(t)) continue
      // pengecoh tidak boleh berbagi kata inti dengan kunci (mis. "hari" vs "setiap hari")
      if (keyWords(t).some((w) => blocked.has(w))) continue
      if (distractors.some((d) => d === t)) continue
      distractors.push(t)
      if (distractors.length === 4) break
    }
    if (distractors.length < 4) continue
    const o = buildOptions(correct, distractors, `mean:${v.kana}`)
    rows.push({
      tipe: 'literal', topik: TOPIK_BY_KATEGORI[v.kategori] || 'meishi', teks: v.kana, soal: SOAL,
      pilihan: o.pilihan, jawaban: o.jawaban,
      pembahasan: `「${v.kana}」= ${correct}${alts.length ? ` (juga: ${alts.join(' / ')})` : ''}. Kategori ${v.kategori}, level ${v.level}.`,
    })
  }
  return shuffleWithSeed(rows, `${SEED}:order:meaning`).slice(0, limit)
}

// ---------- 4. SUSUN KATA (urutan dari teks asli) ----------
const TEXTS_TOPIC = {
  Keseharian: 'keseharian', Makanan: 'tabemono', Belajar: 'benkyou', Percakapan: 'kaiwa',
  'Musim & Cuaca': 'tenki', 'Acara & Ulang tahun': 'gyouji', 'Rencana & Liburan': 'ryokou',
  Pekerjaan: 'shigoto', 'Olahraga & Kesehatan': 'supootsu', Impian: 'yume', 'Belanja & Masak': 'kaimono',
  'Cerita pendek': 'monogatari', 'Sekolah & Acara': 'gakkou', Hobi: 'shumi', 'Belanja Online': 'kaimono',
  Teknologi: 'gijutsu', 'Anime & Manga': 'anime', 'Traveling Modern': 'ryokou', Kuliner: 'tabemono',
  'Kantor & Bisnis': 'shigoto', 'Hobi Digital': 'shumi', 'Musik & Streaming': 'ongaku', Olahraga: 'supootsu',
}

function textSentences() {
  const out = []
  for (const t of TEXTS) {
    if (KANJI.test(t.kana)) continue
    for (const raw of t.kana.split('。')) {
      const s = raw.trim()
      if (!s || /[「」？]/.test(s)) continue // dialog/pertanyaan dilewati
      const chunks = s.split(/\s+/).filter(Boolean)
      if (chunks.length < 4 || chunks.length > 5) continue
      if (chunks.some((c) => /[A-Za-z0-9]/.test(c))) continue // jaga invariant kana murni (mis. "SNS")
      out.push({ sentence: `${s}。`, chunks, topic: TEXTS_TOPIC[t.category] || 'bunpou', category: t.category })
    }
  }
  return out
}

function susunRows(limit) {
  const rows = []
  for (const s of textSentences()) {
    let scrambled = shuffled(s.chunks, `susun:${s.sentence}`)
    if (scrambled.join('|') === s.chunks.join('|')) scrambled = [...s.chunks.slice(1), s.chunks[0]] // jangan sama
    rows.push({
      tipe: 'susun', topik: s.topic,
      teks: 'ただしい ぶんを つくって ください。',
      soal: `${scrambled.join(' / ')} → ?`,
      kata: scrambled,
      jawaban: s.chunks,
      pembahasan: `Urutan yang benar: ${s.sentence} (${s.category}).`,
    })
  }
  return shuffleWithSeed(rows, `${SEED}:order:susun`).slice(0, limit)
}

// ---------- 5. SUSUN PG (variasi partikel, hanya satu yang benar) ----------
function susunpgRows(limit) {
  const rows = []
  const SOAL = 'ただしい ぶんを えらんで ください。'
  const persons = ['わたしは', 'あには', 'あねは', 'ちちは', 'ははは', 'ともだちは']
  const places = ['がっこう', 'としょかん', 'こうえん', 'きょうしつ', 'へや', 'えき', 'スーパー', 'デパート', 'レストラン', 'うみ', 'やま', 'みせ'].filter((k) => byKana.has(k))
  // objek を diambil dari contoh_kana kata kerja transitif (mis. よむ -> ほん)
  const aktivitas = verbPairs('を').filter((p) => TRANSITIVE.has(p.kana))
  aktivitas.forEach((obj, i) => {
    for (const off of [0, 3]) {
      const person = persons[(i + off) % persons.length]
      const place = places[(i + off) % places.length]
      const f = verbForms(obj.kana)
      const correct = [person, `${place}で`, `${obj.phrase}を`, `${f.masu}。`]
      const wrongs = [
        [person, `${place}に`, `${obj.phrase}を`, `${f.masu}。`],
        [person, `${place}で`, `${obj.phrase}が`, `${f.masu}。`],
        [person, `${obj.phrase}で`, `${place}を`, `${f.masu}。`],
        [`${f.masu}。`, person, `${place}で`, `${obj.phrase}を`],
      ].map((c) => c.join(' '))
      const correctText = correct.join(' ')
      if (new Set([correctText, ...wrongs]).size !== 5) continue
      const scrambled = shuffled(correct, `sp:${obj.kana}:${place}:${person}`)
      const opts = shuffled([correctText, ...wrongs], `spopt:${obj.kana}:${place}:${person}`)
      rows.push({
        tipe: 'susunpg', topik: 'bunpou',
        teks: scrambled.join(' / '), soal: SOAL,
        pilihan: opts, jawaban: opts.indexOf(correctText),
        pembahasan: `${correctText} 「${place}で」= tempat kegiatan, 「${obj.phrase}を」= objek dari 「${obj.kana}」(${obj.arti}).`,
      })
    }
  })
  return shuffleWithSeed(rows, `${SEED}:order:susunpg`).slice(0, limit)
}

// ---------- 6. BENAR - SALAH (pernyataan Bahasa Indonesia) ----------
const BS_SUBJ = [
  { kana: 'わたし', arti: 'Saya' },
  { kana: 'あに', arti: 'Kakak laki-laki' },
  { kana: 'あね', arti: 'Kakak perempuan' },
  { kana: 'はは', arti: 'Ibu' },
]
const BS_TIME = [
  { kana: 'まいにち', arti: 'setiap hari', ni: false },
  { kana: 'あさ', arti: 'pagi hari', ni: false },
  { kana: 'よる', arti: 'malam hari', ni: false },
  { kana: 'まいばん', arti: 'setiap malam', ni: false },
  { kana: 'にちようび', arti: 'hari Minggu', ni: true },
]

function bsRows(limit) {
  const rows = []
  const SOAL = 'つぎの ぶんしょうを よんで、ただしい か ただしくない か えらんで ください。(Pilih Benar atau Salah.)'
  // hanya pasangan yang objeknya punya arti Indonesia di wordlist, biar pernyataannya jelas
  const pairs = verbPairs('を').filter((p) => TRANSITIVE.has(p.kana) && byKana.has(p.phrase))
  const clause = (p, si, ti) => {
    const s = BS_SUBJ[si % BS_SUBJ.length]
    const t = BS_TIME[ti % BS_TIME.length]
    return {
      kana: `${s.kana}は ${t.kana}${t.ni ? 'に' : ''} ${p.phrase}を ${verbForms(p.kana).masu}。`,
      indo: `${s.arti} ${p.arti} ${byKana.get(p.phrase).arti} ${t.arti}.`,
      time: t,
    }
  }
  for (const off of [0, 2]) {
    for (let i = 0; i < pairs.length; i++) {
      const j = (i + off) % pairs.length
      const c1 = clause(pairs[j], i + off, i)
      const c2 = clause(pairs[(j + 5) % pairs.length], i + off + 1, i + 1)
      const c3 = clause(pairs[(j + 9) % pairs.length], i + off + 2, i + 2)
      const salah = clause(pairs[(j + 5) % pairs.length], i + off + 1, i + 4) // waktu diganti -> salah
      const indoC2 = c2.indo.replace(c2.time.arti, salah.time.arti)
      rows.push({
        tipe: 'bs', topik: TOPIK_BY_KATEGORI.Verba, teks: oneLine([c1.kana, c2.kana, c3.kana].join('')), soal: SOAL,
        statements: [
          { text: c1.indo, benar: true },
          { text: indoC2, benar: false },
          { text: c3.indo, benar: true },
        ],
        pembahasan: `Kalimat kedua memakai 「${c2.time.kana}」 (${c2.time.arti}), bukan 「${salah.time.kana}」 (${salah.time.arti}).`,
      })
    }
  }
  return shuffleWithSeed(rows, `${SEED}:order:bs`).slice(0, limit)
}

// ---------- 7. MULTI JAWABAN (pasangan kata - arti) ----------
function mcmaRows(limit) {
  const rows = []
  const SOAL = '「ことば = いみ」が ただしい ものを すべて えらんで ください。(Pilih semua yang benar.)'
  const pool = shuffled(VOCAB_ALL, 'mcma:pool')
  for (let i = 0; i + 4 < pool.length; i += 5) {
    const group = pool.slice(i, i + 5)
    // kunci arti semua kata di grup: pengecoh tidak boleh kebetulan punya arti yang sama
    const blocked = new Set(group.flatMap((v) => [v.arti, ...(v.alt || [])]))
    const pattern = shuffled([true, true, true, false, false], `mcma:pattern:${i}`)
    const texts = []
    let ok = true
    for (let j = 0; j < 5; j++) {
      const v = group[j]
      if (pattern[j]) { texts.push(`「${v.kana}」= ${v.arti}`); continue }
      // mulai dari titik berbeda tiap soal supaya pengecoh tidak berulang
      let salah = null
      for (let k = 0; k < pool.length; k++) {
        const x = pool[(i * 7 + j * 11 + k) % pool.length]
        if (group.includes(x)) continue
        if (blocked.has(x.arti)) continue
        salah = x
        break
      }
      if (!salah) { ok = false; break }
      blocked.add(salah.arti)
      texts.push(`「${v.kana}」= ${salah.arti}`)
    }
    if (!ok || new Set(texts).size !== 5) continue
    const pilihan = shuffled(texts, `mcma:opts:${i}`)
    const jawaban = pilihan.map((t, idx) => (pattern[texts.indexOf(t)] ? idx : -1)).filter((x) => x >= 0)
    // topik = kategori yang paling banyak muncul di grup
    const tally = {}
    for (const v of group) tally[v.kategori] = (tally[v.kategori] || 0) + 1
    const top = Object.entries(tally).sort((a, b) => b[1] - a[1])[0][0]
    rows.push({
      tipe: 'mcma', topik: TOPIK_BY_KATEGORI[top] || 'meishi',
      teks: group.map((v) => v.kana).join(' / '), soal: SOAL,
      pilihan, jawaban,
      pembahasan: `Benar: ${group.filter((_, j) => pattern[j]).map((v) => `${v.kana} = ${v.arti}`).join(', ')}.`,
    })
  }
  return shuffleWithSeed(rows, `${SEED}:order:mcma`).slice(0, limit)
}

// ---------- 8. TULIS + VALIDASI ----------
const OUT_DIR = new URL('../../src/data/exam/generated/', import.meta.url)
const TIPES = new Set(['literal', 'cloze', 'susun', 'susunpg', 'infer', 'bs', 'mcma'])
const HEADER = (count) =>
  `// AUTO-GENERATED oleh scripts/exam-gen/build-bank.mjs - jangan diedit manual.\n` +
  `// Sumber: data internal app (src/data/vocab.js, vocab_extra.js, texts.js). Regenerate dengan:\n` +
  `//   node scripts/exam-gen/build-bank.mjs\n` +
  `// ${count} soal.\n\n`

function validate(rows) {
  for (const q of rows) {
    const bad = (msg) => { throw new Error(`soal id ${q.id}: ${msg}`) }
    if (!TIPES.has(q.tipe)) bad(`tipe tidak dikenal ${q.tipe}`)
    if (KANJI.test(q.teks) || KANJI.test(q.soal)) bad('masih ada kanji')
    if (!q.pembahasan) bad('pembahasan kosong')
    if (q.tipe === 'susun') {
      if (q.kata.length < 3) bad('kata terlalu sedikit')
      if ([...q.kata].sort().join('|') !== [...q.jawaban].sort().join('|')) bad('jawaban bukan permutasi kata')
      if (q.kata.join('|') === q.jawaban.join('|')) bad('susun tidak diacak')
    } else if (q.tipe === 'bs') {
      if (!Array.isArray(q.statements) || q.statements.length < 3) bad('statements kurang')
      if (q.statements.some((s) => typeof s.benar !== 'boolean' || !s.text)) bad('statements rusak')
    } else {
      if (q.pilihan.length !== 5) bad(`opsi ${q.pilihan.length}, harus 5`)
      if (new Set(q.pilihan).size !== 5) bad('ada opsi duplikat')
      if (q.pilihan.some((p) => !p || KANJI.test(p))) bad('opsi kosong/kanji')
      if (q.tipe === 'mcma') {
        if (!Array.isArray(q.jawaban) || q.jawaban.length < 2) bad('mcma butuh minimal 2 kunci')
        if (q.jawaban.length >= 5) bad('mcma semua opsi benar')
        if (q.jawaban.some((i) => !Number.isInteger(i) || i < 0 || i >= 5)) bad('index mcma di luar rentang')
      } else if (!Number.isInteger(q.jawaban) || q.jawaban < 0 || q.jawaban >= 5) {
        bad('index jawaban di luar rentang')
      }
    }
  }
}

function writeModule(file, constName, rows) {
  const body = rows.map((r) => JSON.stringify(r)).join(',\n')
  writeFileSync(new URL(file, OUT_DIR), `${HEADER(rows.length)}export const ${constName} = [\n${body},\n]\n`)
}

const GROUPS = [
  ['cloze-partikel.js', 'CLOZE_PARTIKEL', () => clozeParticles(90), 1001],
  ['cloze-verba.js', 'CLOZE_VERBA', () => clozeVerbForms(40), 1201],
  ['literal-arti.js', 'LITERAL_ARTI', () => meaningLiteral(80), 1401],
  ['susun.js', 'SUSUN_KATA', () => susunRows(35), 1601],
  ['susun-pg.js', 'SUSUN_PG', () => susunpgRows(25), 1701],
  ['benar-salah.js', 'BENAR_SALAH', () => bsRows(20), 1801],
  ['multi-jawaban.js', 'MULTI_JAWABAN', () => mcmaRows(20), 1901],
]

mkdirSync(OUT_DIR, { recursive: true })
const seenTeks = new Set()
const files = []
const perTipe = {}
let total = 0
for (const [file, constName, build, idStart] of GROUPS) {
  const kept = []
  for (const r of build()) {
    const key = `${r.teks}||${r.soal}`
    if (seenTeks.has(key)) continue
    seenTeks.add(key)
    kept.push({ id: idStart + kept.length, ...r })
  }
  validate(kept)
  writeModule(file, constName, kept)
  files.push([file, constName])
  total += kept.length
  for (const q of kept) perTipe[q.tipe] = (perTipe[q.tipe] || 0) + 1
  console.log(`${file.padEnd(20)} ${String(kept.length).padStart(3)} soal`)
}

writeFileSync(
  new URL('index.js', OUT_DIR),
  `${HEADER(total)}${files.map(([f, c]) => `import { ${c} } from './${f}'`).join('\n')}\n\n` +
  `export const EXAM_BANK_GENERATED = [\n${files.map(([, c]) => `  ...${c},`).join('\n')}\n]\n`,
)

console.log(`\nTOTAL generated: ${total} soal`)
console.log('per tipe:', JSON.stringify(perTipe))




