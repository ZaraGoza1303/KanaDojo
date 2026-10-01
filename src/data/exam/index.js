// Bank soal ujian gabungan: 150 soal lama (../exam.js) + batch generated.
// Mode ujian selalu membaca dari sini supaya bank lama dan baru selalu sinkron.
import { EXAM_BANK as EXAM_BANK_BASE, COMPO, COMPO_LABEL, pickExamFrom } from '../exam.js'
import { EXAM_BANK_GENERATED } from './generated/index.js'
import { EXAM_BANK_TATOEBA } from './tatoeba/index.js'

export const EXAM_BANK = [...EXAM_BANK_BASE, ...EXAM_BANK_GENERATED, ...EXAM_BANK_TATOEBA]
export const EXAM_COUNT = EXAM_BANK.length
export const EXAM_TOPICS = [...new Set(EXAM_BANK.map((q) => q.topik))].sort()

export const pickExam = (count = 30) => pickExamFrom(count, EXAM_BANK)
export { COMPO, COMPO_LABEL }
