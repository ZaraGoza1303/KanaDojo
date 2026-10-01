import { test, expect } from '@playwright/test'
import { furiganaToKana, cleanCandidate, hasKanji, hasBracket, isKanaOnly } from '../scripts/exam-gen/lib/furigana.mjs'
import { verbForms, TRANSITIVE, PLACE_ACTIVITY, TIME_WITH_NI } from '../scripts/exam-gen/lib/verbForms.mjs'
import { segment } from '../scripts/exam-gen/lib/segment.mjs'
import { VOCAB } from '../src/data/vocab.js'
import { TATOEBA_SENTENCES } from '../src/data/exam/tatoeba/sentences.js'

test('furigana: bacaan tunggal & multi-kolom digabung jadi kana', () => {
  expect(furiganaToKana('ギター[弾|ひ]けるようになりたい。')).toBe('ギターひけるようになりたい。')
  expect(furiganaToKana('ヨーロッパで[行|い]ってみたい[場所|ば|しょ]とかある？')).toBe('ヨーロッパでいってみたいばしょとかある？')
  expect(furiganaToKana('ごめん、ぼーっとしてた。')).toBe('ごめん、ぼーっとしてた。')
  expect(furiganaToKana('[俺|おれ]がトムを[殺|ころ]したって[言|い]うのか？')).toBe('おれがトムをころしたっていうのか？')
  expect(furiganaToKana('')).toBe('')
  expect(furiganaToKana(null)).toBe('')
})

test('furigana: penjaga invariant kanji/bracket', () => {
  expect(hasKanji('おれがトムをころした')).toBe(false)
  expect(hasKanji('私は眠る')).toBe(true)
  expect(hasBracket('ばしょ]とか')).toBe(true)
  expect(hasBracket('ばしょ とか')).toBe(false)
  expect(isKanaOnly('きょうは いい てんきですね。')).toBe(true)
  expect(isKanaOnly('きょうは hanashi です')).toBe(false)
})

test('furigana: saringan kandidat soal bacaan', () => {
  expect(cleanCandidate('ギター[弾|ひ]けるようになりたい。')).toBe('ギターひけるようになりたい。')
  expect(cleanCandidate('私は眠らなければなりません。')).toBeNull() // masih kanji (transkripsi kurang)
  expect(cleanCandidate('ばしょ]とかある？')).toBeNull() // bracket rusak
  expect(cleanCandidate('はい。')).toBeNull() // terlalu pendek
  expect(cleanCandidate(`${'あ'.repeat(40)}。`)).toBeNull() // terlalu panjang
  expect(cleanCandidate('きょうはいいてんきですね')).toBeNull() // tanpa tanda akhir kalimat
})

test('verba: bentuk sopan/-te/stem/未然 untuk semua 45 kata kerja', () => {
  const verbs = VOCAB.filter((v) => v.kategori === 'Verba').map((v) => v.kana)
  expect(verbs.length).toBe(45)
  for (const k of verbs) {
    const f = verbForms(k)
    expect(f.masu.endsWith('ます'), `${k} masu`).toBe(true)
    expect(f.te.length, `${k} te`).toBeGreaterThan(0)
    expect(f.stem.length, `${k} stem`).toBeGreaterThan(0)
  }
})

test('verba: konjugasi tidak lazim tetap benar', () => {
  expect(verbForms('いく')).toEqual({ masu: 'いきます', te: 'いって', stem: 'いき', nai: 'いか' })
  expect(verbForms('くる')).toEqual({ masu: 'きます', te: 'きて', stem: 'き', nai: 'こ' })
  expect(verbForms('かう')).toEqual({ masu: 'かいます', te: 'かって', stem: 'かい', nai: 'かわ' })
  expect(verbForms('およぐ')).toEqual({ masu: 'およぎます', te: 'およいで', stem: 'およぎ', nai: 'およが' })
  expect(verbForms('おす')).toEqual({ masu: 'おします', te: 'おして', stem: 'おし', nai: 'おさ' })
  expect(verbForms('たつ')).toEqual({ masu: 'たちます', te: 'たって', stem: 'たち', nai: 'たた' })
  expect(verbForms('たべる')).toEqual({ masu: 'たべます', te: 'たべて', stem: 'たべ', nai: 'たべ' })
  expect(verbForms('かえる')).toEqual({ masu: 'かえります', te: 'かえって', stem: 'かえり', nai: 'かえら' }) // godan, bukan ichidan
  expect(verbForms('べんきょうする')).toEqual({ masu: 'べんきょうします', te: 'べんきょうして', stem: 'べんきょうし', nai: 'べんきょうし' })
  expect(verbForms('しごとをする').masu).toBe('しごとをします')
})

test('segmentasi: memberi spasi tanpa mengubah kalimat', () => {
  expect(segment('きょうはすいようびです。')).toBe('きょう は すいようび です。')
  expect(segment('がっこうでともだちとべんきょうします。')).toBe('がっこう で ともだち と べんきょうします。')
  expect(segment('わたしはびょういんではたらいています。')).toBe('わたし は びょういん で はたらいて います。')
  expect(segment('わたしは、バスでがっこうにいく。')).toBe('わたし は、 バス で がっこう に いく。')
  expect(segment('')).toBe('')
})

test('segmentasi: isi kalimat Tatoeba tidak pernah berubah', () => {
  const bad = []
  for (const s of TATOEBA_SENTENCES) {
    if (segment(s.kana).replace(/ /g, '') !== s.kana.replace(/ /g, '')) bad.push(`${s.id}: ${segment(s.kana)}`)
  }
  expect(bad, bad.join('\n')).toEqual([])
})

test('verba: daftar kategori tidak ada duplikat', () => {
  const dup = (s) => [...s].filter((x, i, a) => a.indexOf(x) !== i)
  expect(dup(TRANSITIVE)).toEqual([])
  expect(dup(PLACE_ACTIVITY)).toEqual([])
  expect(dup(TIME_WITH_NI)).toEqual([])
})
