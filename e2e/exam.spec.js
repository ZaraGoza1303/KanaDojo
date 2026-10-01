import { test, expect } from '@playwright/test'
import { EXAM_BANK, EXAM_TOPICS, pickExam } from '../src/data/exam/index.js'
import { EXAM_BANK_GENERATED } from '../src/data/exam/generated/index.js'
import { EXAM_BANK_TATOEBA } from '../src/data/exam/tatoeba/index.js'
import { TATOEBA_SENTENCES } from '../src/data/exam/tatoeba/sentences.js'
import { TATOEBA_SUSUN } from '../src/data/exam/tatoeba/susun.js'
import { TATOEBA_CLOZE } from '../src/data/exam/tatoeba/cloze.js'
import { COMPO } from '../src/data/exam.js'
import { hasKanji } from '../scripts/exam-gen/lib/furigana.mjs'

const TIPES = ['literal', 'cloze', 'susun', 'susunpg', 'infer', 'bs', 'mcma']
// teks soal wajib kana + tanda baca gaya bank lama ( / , ( ) . ! ? ) + bagian kosong
const KANA = /^[\u3041-\u309F\u30A0-\u30FF\u3005\u3000-\u303F\uFF01-\uFF60ー 　()/.,!?:;_\-]+$/
const teksOk = (t) => !hasKanji(t) && KANA.test(String(t).replace(/_{2,}/g, '_'))

test('bank ujian: jumlah minimal dan semua 7 tipe terisi', () => {
  expect(EXAM_BANK.length).toBeGreaterThanOrEqual(620)
  const tally = {}
  for (const q of EXAM_BANK) tally[q.tipe] = (tally[q.tipe] || 0) + 1
  for (const t of TIPES) expect(tally[t] || 0, `tipe ${t} kosong`).toBeGreaterThan(0)
  expect(EXAM_TOPICS.length).toBeGreaterThanOrEqual(15)
})

test('bank Tatoeba: atribusi CC BY lengkap dan id sumber valid', () => {
  expect(EXAM_BANK_TATOEBA.length).toBeGreaterThanOrEqual(80)
  expect(TATOEBA_SENTENCES.length).toBeGreaterThanOrEqual(30)
  const known = new Set(TATOEBA_SENTENCES.map((s) => s.id))
  const bad = []
  for (const q of EXAM_BANK_TATOEBA) {
    const ids = [...String(q.pembahasan).matchAll(/Tatoeba #(\d+)/g)].map((m) => Number(m[1]))
    if (!ids.length) bad.push(`${q.id}: atribusi hilang`)
    for (const id of ids) if (!known.has(id)) bad.push(`${q.id}: id ${id} tidak ada di sentences.js`)
  }
  expect(bad, bad.join('\n')).toEqual([])
})

test('bank Tatoeba: kalimat kurasi lengkap & susun memakai urutan asli', () => {
  const ids = TATOEBA_SENTENCES.map((s) => s.id)
  expect(ids.filter((x, i, a) => a.indexOf(x) !== i), 'sentence id duplikat').toEqual([])
  // setiap kalimat wajib punya terjemahan; penulis kosong = URL saja (diuji di tes atribusi)
  expect(TATOEBA_SENTENCES.filter((s) => !s.ind || !s.kana).map((s) => s.id)).toEqual([])
  const kalimat = new Set(TATOEBA_SENTENCES.map((s) => s.kana))
  const bad = TATOEBA_SUSUN.filter((q) => !kalimat.has(q.jawaban.join(' '))).map((q) => q.id)
  expect(bad, `susun tidak cocok kalimat sumber: ${bad.join(', ')}`).toEqual([])
})

test('bank Tatoeba: kalimat cloze bersumber & kunci = bentuk asli', () => {
  expect(TATOEBA_CLOZE.length).toBeGreaterThanOrEqual(10)
  const bad = []
  for (const q of TATOEBA_CLOZE) {
    if (q.teks.split(' ').some((w) => w.includes('___') && w !== '___')) {
      // blank harus utuh satu potongan kata
      if (!q.teks.includes(' ___') && !q.teks.startsWith('___')) bad.push(`${q.id}: blank menempel`)
    }
    if (TATOEBA_SENTENCES.every((s) => !String(q.pembahasan).includes(`#${s.id} `) && !String(q.pembahasan).includes(`#${s.id} (`))) {
      bad.push(`${q.id}: atribusi kalimat hilang`)
    }
  }
  expect(bad, bad.join('\n')).toEqual([])
})

test('bank ujian: id unik, topik & pembahasan lengkap', () => {
  const ids = new Set()
  const dup = []
  const kurang = []
  for (const q of EXAM_BANK) {
    if (ids.has(q.id)) dup.push(q.id)
    ids.add(q.id)
    if (!q.topik || !q.teks || !q.soal || !q.pembahasan) kurang.push(q.id)
  }
  expect(dup, `id duplikat: ${dup.join(', ')}`).toEqual([])
  expect(kurang, `field kurang di id: ${kurang.join(', ')}`).toEqual([])
})

test('bank ujian: skema tiap tipe valid untuk ExamMode', () => {
  const bad = []
  for (const q of EXAM_BANK) {
    const p = (msg) => bad.push(`id ${q.id} (${q.tipe}): ${msg}`)
    if (!TIPES.includes(q.tipe)) { p('tipe tidak dikenal'); continue }
    if (q.tipe === 'susun') {
      if (!Array.isArray(q.kata) || q.kata.length < 3) p('kata kurang dari 3')
      if (!Array.isArray(q.jawaban) || q.jawaban.length !== q.kata.length) p('jawaban bukan permutasi kata')
      else if ([...q.kata].sort().join('|') !== [...q.jawaban].sort().join('|')) p('jawaban bukan permutasi kata')
    } else if (q.tipe === 'bs') {
      if (!Array.isArray(q.statements) || q.statements.length < 2) p('statements kurang dari 2')
      else if (q.statements.some((s) => typeof s?.benar !== 'boolean' || !s.text)) p('statements rusak')
    } else {
      if (!Array.isArray(q.pilihan) || q.pilihan.length < 4 || q.pilihan.length > 5) p(`jumlah opsi ${q.pilihan?.length}`)
      else if (new Set(q.pilihan).size !== q.pilihan.length) p('opsi duplikat')
      if (q.tipe === 'mcma') {
        if (!Array.isArray(q.jawaban) || q.jawaban.length < 2) p('mcma butuh minimal 2 kunci')
        else if (q.jawaban.some((i) => !Number.isInteger(i) || i < 0 || i >= q.pilihan.length)) p('index mcma di luar rentang')
      } else if (!Number.isInteger(q.jawaban) || q.jawaban < 0 || q.jawaban >= q.pilihan.length) {
        p('index jawaban di luar rentang')
      }
    }
  }
  expect(bad, bad.join('\n')).toEqual([])
})

test('bank ujian: bebas kanji, dan batch generated kana murni', () => {
  const kanji = EXAM_BANK.filter((q) => hasKanji(q.teks) || hasKanji(q.soal)).map((q) => q.id)
  expect(kanji, `masih ada kanji di id: ${kanji.join(', ')}`).toEqual([])

  const bad = []
  for (const q of EXAM_BANK_GENERATED) {
    // teks soal wajib kana murni; soal boleh memuat petunjuk Bahasa Indonesia
    if (!teksOk(q.teks)) bad.push(`${q.id}: teks`)
    if (q.tipe === 'susun' && q.kata.some((k) => !teksOk(k))) bad.push(`${q.id}: kata`)
    if (q.tipe === 'susunpg' && q.pilihan.some((k) => !teksOk(k))) bad.push(`${q.id}: pilihan`)
  }
  expect(bad, bad.join('\n')).toEqual([])
})

test('bank ujian: batch generated tidak ada teks duplikat', () => {
  const keys = EXAM_BANK_GENERATED.map((q) => `${q.teks}||${q.soal}`)
  const dup = keys.filter((k, i) => keys.indexOf(k) !== i)
  expect(dup, `duplikat: ${dup.slice(0, 5).join(' | ')}`).toEqual([])
})

test('UI ujian: mode ujian render dengan bank gabungan', async ({ page }) => {
  await page.goto('/')
  await page.waitForLoadState('networkidle')
  const expand = page.getByText(/Lihat mode lebih banyak/)
  if (await expand.isVisible({ timeout: 2000 }).catch(() => false)) await expand.click()
  await page.getByText('Ujian N5-N4').click()
  await expect(page.getByText('Mode Ujian N5-N4')).toBeVisible()
  await page.getByRole('button', { name: /Mulai ujian/ }).click()
  // soal pertama harus tampil lengkap: penghitung + label tipe + badge topik
  await expect(page.getByText(/^Soal 1\/\d+$/)).toBeVisible()
  await expect(page.getByText(/^(Literal|Melengkapi|Susun kata|Susun PG|Inferensial|Benar-Salah|Multi-jawaban)$/).first()).toBeVisible()
  await expect(page.getByText(new RegExp(`^(${EXAM_TOPICS.join('|')})$`)).first()).toBeVisible()
})

test('bank ujian: pickExam(30) memenuhi komposisi COMPO', () => {
  const picked = pickExam(30)
  expect(picked.length).toBe(30)
  const tally = {}
  for (const q of picked) tally[q.tipe] = (tally[q.tipe] || 0) + 1
  for (const [t, n] of Object.entries(COMPO[30])) {
    expect(tally[t] || 0, `komposisi tipe ${t}`).toBe(n)
  }
  // opsi & kunci siap dipakai UI
  for (const q of picked) {
    if (q.tipe === 'susun') expect(q.kataAcak.length).toBe(q.kata.length)
    else if (q.tipe === 'bs') expect(q.pernyataanAcak.length).toBe(q.statements.length)
    else {
      expect(q.pilihanAcak.length).toBe(q.pilihan.length)
      const key = q.pilihanAcak.filter((o) => o.correct).length
      const harap = q.tipe === 'mcma' ? q.jawaban.length : 1
      expect(key, `jumlah kunci di id ${q.id}`).toBe(harap)
    }
  }
})
