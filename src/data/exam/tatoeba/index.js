// AUTO-GENERATED oleh scripts/exam-gen/build-tatoeba.mjs - jangan diedit manual.
// Sumber kalimat: Tatoeba, lisensi CC BY 2.0 FR (atribusi per kalimat: src/data/exam/tatoeba/sentences.js).
// 78 soal susun + cloze.

import { TATOEBA_SUSUN } from './susun.js'
import { TATOEBA_CLOZE } from './cloze.js'
import { TATOEBA_BACAAN } from './bacaan.js'

export const EXAM_BANK_TATOEBA = [...TATOEBA_BACAAN, ...TATOEBA_SUSUN, ...TATOEBA_CLOZE]
