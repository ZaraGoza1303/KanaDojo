// Pemuat bank soal ujian yang dipisah dari bundel awal (code splitting).
// Ujian hanya memuat bank saat mode dibuka, jadi bundle utama tetap ringan.
let cache = null

export async function loadExamBank() {
  if (cache) return cache
  const [base, generated, tatoeba] = await Promise.all([
    import('../exam.js'),
    import('./generated/index.js'),
    import('./tatoeba/index.js'),
  ])
  cache = [...base.EXAM_BANK, ...generated.EXAM_BANK_GENERATED, ...tatoeba.EXAM_BANK_TATOEBA]
  return cache
}

export const isExamBankLoaded = () => !!cache
