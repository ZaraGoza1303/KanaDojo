// Jadwal komposisi & pemilih soal ujian. Dipisah dari bank soal supaya bank
// (yang besar) bisa dimuat malas lewat src/data/exam/loader.js.
export const COMPO = {
  30: { literal: 8, cloze: 7, susun: 3, susunpg: 4, infer: 4, bs: 2, mcma: 2 },
  15: { literal: 4, cloze: 3, susun: 2, susunpg: 2, infer: 2, bs: 1, mcma: 1 },
}
export const COMPO_LABEL = [
  ['Literal', 'literal'], ['Melengkapi teks', 'cloze'], ['Susun kata', 'susun'],
  ['Susun PG', 'susunpg'], ['Inferensial', 'infer'], ['Benar-Salah', 'bs'], ['Multi-jawaban', 'mcma'],
]

const shuffle = (a) => {
  const b = [...a]
  for (let i = b.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[b[i], b[j]] = [b[j], b[i]]
  }
  return b
}

export function pickExamFrom(count = 30, bank = []) {
  const comp = COMPO[count] || COMPO[30]
  const by = (t) => bank.filter((q) => q.tipe === t)
  const take = (t) => shuffle(by(t)).slice(0, comp[t] || 0)
  const all = shuffle([...take('literal'), ...take('cloze'), ...take('susun'), ...take('susunpg'), ...take('infer'), ...take('bs'), ...take('mcma')])
  return all.map((q) => {
    if (q.tipe === 'susun') return { ...q, kataAcak: shuffle(q.kata) }
    if (q.tipe === 'bs') return { ...q, pernyataanAcak: shuffle(q.statements.map((s) => ({ ...s }))) }
    return { ...q, pilihanAcak: shuffle(q.pilihan.map((p, i) => ({ text: p, correct: Array.isArray(q.jawaban) ? q.jawaban.includes(i) : i === q.jawaban }))) }
  })
}
