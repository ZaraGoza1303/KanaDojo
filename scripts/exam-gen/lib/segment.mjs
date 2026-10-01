// Segmentasi kalimat kana (tanpa kanji) jadi kata berspasi, gaya teks app.
// Tatoeba menulis "わたしはしゅふです。" -> app menulis "わたしは しゅふです。"
import { VOCAB_ALL } from '../../../src/data/vocabAll.js'
import { verbForms } from './verbForms.mjs'

// Kata bantu & kata umum N5 yang tidak ada di wordlist kosakata app
const FUNGSI = [
  'ませんでした', 'ください', 'でしょう', 'ましょう', 'ました', 'ません', 'でした', 'ですか',
  'ですね', 'ますか', 'ています', 'ていません', 'てください', 'たいです',
  'そして', 'それから', 'しかし', 'でも', 'だから', 'とても', 'いつも', 'ときどき', 'すぐに',
  'ゆっくり', 'ちょっと', 'たくさん', 'みんな', 'ひとり', 'ふたり', 'これから',
  'ちかく', 'ばんごう', 'ばしょ', 'ところ', 'ほう', 'もの', 'こと', 'とき', 'ため', 'あと', 'まえ',
  'うえ', 'した', 'うしろ', 'となり', 'よこ', 'むこう', 'あいだ', 'そば',
  'ます', 'です', 'ある', 'いる', 'あります', 'います', 'ない', 'ましょうか',
  'なんばん', 'なんにん', 'なんようび', 'なんがつ', 'なんにち', 'なに', 'なん', 'いつ',
  'どこ', 'だれ', 'どれ', 'いくら', 'いくつ', 'どう', 'なぜ', 'どうして', 'どの', 'どんな',
  'は', 'が', 'を', 'に', 'へ', 'で', 'と', 'も', 'の', 'や', 'か', 'ね', 'よ', 'な',
  'から', 'まで', 'より', 'だけ', 'しか', 'ので', 'けど', 'けれど',
]
const KANA = /[\u3041-\u309F\u30A0-\u30FF\u3005ー]/
const KATAKANA = /[\u30A0-\u30FFー]/
const PUNCT = /[。、！？「」（）]/

const dict = [...new Set([
  ...VOCAB_ALL.map((v) => v.kana),
  // bentuk konjugasi semua kata kerja app, biar "べんきょうします" tidak terpotong asal
  ...VOCAB_ALL.filter((v) => v.kategori === 'Verba').flatMap((v) => {
    const f = verbForms(v.kana)
    return [f.masu, f.te, f.nai, f.stem, `${f.stem}たい`, `${f.stem}ません`, `${f.stem}ました`, `${f.te}ください`, f.te.replace(/て$/, 'た').replace(/で$/, 'だ')]
  }),
  ...FUNGSI,
])]
  .filter((w) => w && KANA.test(w))
  .sort((a, b) => b.length - a.length)

/**
 * Beri spasi antar kata tanpa mengubah isi kalimat.
 * Pemrograman dinamis: minimalkan karakter tak dikenal (bobot besar) + jumlah token.
 */
export function segment(kana) {
  const s = String(kana ?? '').trim()
  const n = s.length
  if (!n) return ''
  const UNK = 100
  const dp = new Array(n + 1).fill(null)
  dp[n] = { cost: 0, toks: [] }

  for (let i = n - 1; i >= 0; i--) {
    const opsi = []
    // tanda baca: gratis, nanti menempel ke kata sebelumnya
    if (PUNCT.test(s[i])) opsi.push({ len: 1, cost: dp[i + 1].cost, tok: s[i], unk: false })
    // deret katakana = satu kata (kata serapan)
    if (KATAKANA.test(s[i])) {
      let j = i
      while (j < n && KATAKANA.test(s[j])) j += 1
      opsi.push({ len: j - i, cost: dp[j].cost + 1, tok: s.slice(i, j), unk: false })
    }
    // kata dari kamus (termasuk konjugasi kata kerja)
    for (const w of dict) {
      if (!s.startsWith(w, i)) continue
      opsi.push({ len: w.length, cost: dp[i + w.length].cost + 1, tok: w, unk: false })
    }
    // lewati satu karakter
    opsi.push({ len: 1, cost: dp[i + 1].cost + UNK + 1, tok: s[i], unk: true })

    let best = opsi[0]
    for (const o of opsi) {
      if (o.cost < best.cost || (o.cost === best.cost && o.len > best.len)) best = o
    }
    dp[i] = { cost: best.cost, toks: [{ text: best.tok, unk: best.unk }, ...dp[i + best.len].toks] }
  }

  const out = []
  for (const t of dp[0].toks) {
    const prev = out[out.length - 1]
    if (PUNCT.test(t.text)) { if (prev) prev.text += t.text; else out.push({ ...t }); continue }
    if (t.unk && prev && prev.unk) { prev.text += t.text; continue } // gabung run tak dikenal
    out.push({ ...t })
  }
  return out.map((t) => t.text).join(' ')
}

export const SEGMENT_WORDS = dict.length
