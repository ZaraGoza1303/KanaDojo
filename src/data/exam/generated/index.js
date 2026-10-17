// AUTO-GENERATED oleh scripts/exam-gen/build-bank.mjs - jangan diedit manual.
// Sumber: data internal app (src/data/vocab.js, vocab_extra.js, vocab_phrases.js, texts.js). Regenerate dengan:
//   node scripts/exam-gen/build-bank.mjs
// 310 soal.

import { CLOZE_PARTIKEL } from './cloze-partikel.js'
import { CLOZE_VERBA } from './cloze-verba.js'
import { LITERAL_ARTI } from './literal-arti.js'
import { SUSUN_KATA } from './susun.js'
import { SUSUN_PG } from './susun-pg.js'
import { BENAR_SALAH } from './benar-salah.js'
import { MULTI_JAWABAN } from './multi-jawaban.js'

export const EXAM_BANK_GENERATED = [
  ...CLOZE_PARTIKEL,
  ...CLOZE_VERBA,
  ...LITERAL_ARTI,
  ...SUSUN_KATA,
  ...SUSUN_PG,
  ...BENAR_SALAH,
  ...MULTI_JAWABAN,
]
