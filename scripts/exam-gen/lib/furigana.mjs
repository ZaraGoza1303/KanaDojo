// Konversi furigana Tatoeba -> kana murni, plus penjaga invariant "tanpa kanji".
//
// Format transkripsi Tatoeba (kolom ke-5, tipe "Hrkt"):
//   ギター[弾|ひ]けるようになりたい。      -> ギターひけるようになりたい。
//   ヨーロッパで[行|い]ってみたい[場所|ば|しょ] -> ヨーロッパでいってみたいばしょ
// Bacaan multi-kolom ([場所|ば|しょ]) digabung, bukan dipilih satu.

const BRACKET = /\[[^|\]]*\|([^\]]+)\]/g

/** Buang ruby/furigana: ambil bagian bacaan, gabungkan bila multi-kolom. */
export function furiganaToKana(text) {
  return String(text ?? '')
    .replace(BRACKET, (_, reading) => reading.replace(/\|/g, ''))
    .replace(/\|/g, '')
    .trim()
}

/** Sisa kanji = konversi gagal (transkripsi rusak / tidak lengkap). */
export function hasKanji(text) {
  return /[\u4E00-\u9FFF\u3400-\u4DBF]/.test(String(text ?? ''))
}

export function hasBracket(text) {
  return /[[\]]/.test(String(text ?? ''))
}

export function hasLatinOrDigit(text) {
  return /[A-Za-z0-9]/.test(String(text ?? ''))
}

/** Kana murni: hiragana, katakana, panjang ー, spasi, dan tanda baca Jepang. */
export function isKanaOnly(text) {
  return /^[\u3041-\u309F\u30A0-\u30FF\u3005\u3000-\u303F\uFF01-\uFF60ー ]+$/.test(String(text ?? ''))
}

/**
 * Saring kandidat untuk soal bacaan.
 * @param {string} raw teks transkripsi mentah
 * @param {{min?:number,max?:number}} [opts] batas panjang karakter
 * @returns {string|null} kana bersih, atau null bila tidak layak
 */
export function cleanCandidate(raw, opts = {}) {
  const min = opts.min ?? 8
  const max = opts.max ?? 30
  const kana = furiganaToKana(raw)
  if (!kana) return null
  if (hasKanji(kana) || hasBracket(kana) || hasLatinOrDigit(kana)) return null
  if (!isKanaOnly(kana)) return null
  if (kana.length < min || kana.length > max) return null
  if (!/[。？！」]$/.test(kana)) return null // harus kalimat utuh
  return kana
}
