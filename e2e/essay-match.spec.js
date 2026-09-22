import { test, expect } from '@playwright/test'
import { VOCAB_ALL } from '../src/data/vocabAll.js'
import { isAnswerCorrect, segments } from '../src/lib/answerMatch.js'

const TANGGAL = VOCAB_ALL.filter((v) => v.kategori === 'Tanggal')

test('essay: semua arti lengkap kategori Tanggal tetap benar', () => {
  expect(TANGGAL.length).toBeGreaterThan(0)
  const gagal = TANGGAL.filter((v) => !isAnswerCorrect(v.arti, v.arti, v.alt))
  expect(gagal, `gagal: ${gagal.map((v) => `${v.kana}->${v.arti}`).join(', ')}`).toEqual([])
})

test('essay: jawaban generik "tanggal" harus salah untuk SEMUA entri Tanggal', () => {
  // regresi: dulu "tanggal" benar hanya karena substring dari "tanggal dua puluh dua"
  const lolos = TANGGAL.filter((v) => isAnswerCorrect('tanggal', v.arti, v.alt))
  expect(lolos, `masih lolos: ${lolos.map((v) => `${v.kana}->${v.arti}`).join(', ')}`).toEqual([])
})

test('essay: potongan kata inti tidak boleh dianggap benar', () => {
  const kasus = [
    ['puluh', 'tanggal dua puluh lima', false],
    ['dua puluh lima', 'tanggal dua puluh lima', false], // "tanggal"-nya wajib ikut
    ['tanggal dua puluh lima', 'tanggal dua puluh lima', true],
    ['tanggal dua puluh', 'tanggal dua puluh lima', false],
    ['hari', 'hari kerja', false],
    ['kerja hari', 'hari kerja', true],
    ['kakak', 'kakak laki-laki', false],
    ['kakak laki laki', 'kakak laki-laki', true],
    ['pegawai', 'pegawai bank', false],
    ['pegawai bank', 'pegawai bank', true],
    ['bangun', 'bangun tidur', false],
  ]
  for (const [input, arti, harap] of kasus) {
    expect(isAnswerCorrect(input, arti), `"${input}" vs "${arti}"`).toBe(harap)
  }
})

test('essay: arti bermakna ganda (pemisah /) boleh dijawab salah satu bagian', () => {
  const kasus = [
    ['jam', 'waktu / jam'],
    ['waktu', 'waktu / jam'],
    ['pagi hari', 'pagi hari / AM'],
    ['AM', 'pagi hari / AM'],
    ['sore', 'siang/sore / PM'],
    ['mahal', 'mahal / tinggi'],
    ['mahal tinggi', 'mahal / tinggi'],
  ]
  for (const [input, arti] of kasus) {
    expect(isAnswerCorrect(input, arti), `"${input}" vs "${arti}"`).toBe(true)
  }
  // tiap segmen yang dihasilkan helper memang segmen penuh (dinormalkan ke huruf kecil)
  expect(segments('pagi hari / AM')).toEqual(['pagi hari', 'am'])
})

test('essay: typo 1 huruf diterima, typo 2 huruf ditolak', () => {
  expect(isAnswerCorrect('penyany', 'penyanyi')).toBe(true)
  expect(isAnswerCorrect('penynyo', 'penyanyi')).toBe(false)
  expect(isAnswerCorrect('kaka laki-laki', 'kakak laki-laki')).toBe(true)
})

test('essay: kata tambahan & stopword tidak membatalkan jawaban', () => {
  expect(isAnswerCorrect('selamat kembali dari mana', 'selamat kembali')).toBe(true)
  expect(isAnswerCorrect('kembali', 'selamat kembali')).toBe(false)
})

test('essay: sinonim di field alt diterima', () => {
  const pria = VOCAB_ALL.find((v) => v.kana === 'おとこ')
  expect(pria).toBeTruthy()
  expect(isAnswerCorrect('pria', pria.arti, pria.alt)).toBe(true)
  expect(isAnswerCorrect('laki-laki', pria.arti, pria.alt)).toBe(true)
  expect(isAnswerCorrect('cowok', pria.arti, pria.alt)).toBe(true)
})

test('UI essay: kategori Tanggal menolak "tanggal" lalu menerima arti lengkap', async ({ page }) => {
  await page.goto('/')
  await page.waitForLoadState('networkidle')
  const expand = page.getByText(/Lihat mode lebih banyak/)
  if (await expand.isVisible({ timeout: 2000 }).catch(() => false)) await expand.click()
  await page.getByText('Mode Kosakata').click()
  await expect(page.getByText('Pilih mode belajar')).toBeVisible()
  await page.getByRole('button', { name: /Essay/ }).click()

  await expect(page.getByText('Atur sesi Essay')).toBeVisible()
  const hapus = page.getByRole('button', { name: /Hapus semua/ })
  if (await hapus.isVisible({ timeout: 1000 }).catch(() => false)) await hapus.click()
  await page.getByRole('button', { name: /Tanggal/ }).click()
  await page.getByRole('button', { name: /^Mulai/ }).click()

  const input = page.getByPlaceholder('ketik arti Indonesia...')
  await expect(input).toBeVisible()

  // jawaban generik harus salah
  await input.fill('tanggal')
  await page.getByRole('button', { name: 'Periksa' }).click()
  await expect(page.getByText(/^Salah, jawaban: /)).toBeVisible()

  // lanjut ke soal berikutnya, jawab pakai arti lengkap -> benar
  await page.getByRole('button', { name: /Lanjut|Selesai|Ulangi/ }).click()
  const kana = (await page.locator('p.text-4xl').first().innerText()).trim()
  const item = VOCAB_ALL.find((v) => v.kana === kana)
  expect(item, `soal "${kana}" tidak ada di wordlist`).toBeTruthy()
  await input.fill(item.arti)
  await page.getByRole('button', { name: 'Periksa' }).click()
  await expect(page.getByText('Benar! 🎉')).toBeVisible()
})
