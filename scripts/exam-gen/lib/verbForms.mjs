// Bentuk kata kerja N5-N4 untuk generator soal ujian.
// Daftar kata kerja diambil dari src/data/vocab.js kategori Verba (45 entri).
// Konjugasi dihitung dengan aturan + daftar pengecualian yang dikurasi manual,
// jadi tidak ada tebakan otomatis (mis. かえる = pulang itu godan, bukan ichidan).

const GODAN_STEM = { う: 'い', く: 'き', ぐ: 'ぎ', す: 'し', つ: 'ち', ぬ: 'に', ぶ: 'び', む: 'み', る: 'り' }
const GODAN_TE = { う: 'って', つ: 'って', る: 'って', む: 'んで', ぶ: 'んで', ぬ: 'んで', く: 'いて', ぐ: 'いで', す: 'して' }

// る-berakhir yang ichidan (sisanya godan). Kurasi manual, bukan tebak-tebakan.
const ICHIDAN = new Set(['たべる', 'みる', 'ねる', 'おきる', 'おりる', 'あける', 'しめる', 'おしえる'])

const IRREGULAR = {
  くる: { masu: 'きます', te: 'きて', stem: 'き', nai: 'こ' },
  いく: { masu: 'いきます', te: 'いって', stem: 'いき', nai: 'いか' },
}

const GODAN_NAI = { う: 'わ', く: 'か', ぐ: 'が', す: 'さ', つ: 'た', ぬ: 'な', ぶ: 'ば', む: 'ま', る: 'ら' }

/**
 * @returns {{masu:string, te:string, stem:string, nai:string}}
 * bentuk sopan, bentuk -te, stem ます, dan bentuk未然 (untuk opsi pengecoh)
 */
export function verbForms(kana) {
  if (IRREGULAR[kana]) return IRREGULAR[kana]
  if (kana.endsWith('する')) {
    // べんきょうする / そうじする / しごとをする
    const base = kana.slice(0, -2)
    return { masu: base + 'します', te: base + 'して', stem: base + 'し', nai: base + 'し' }
  }
  if (ICHIDAN.has(kana)) {
    const base = kana.slice(0, -1)
    return { masu: base + 'ます', te: base + 'て', stem: base, nai: base }
  }
  const last = kana.slice(-1)
  if (!GODAN_STEM[last]) throw new Error(`kata kerja belum didukung: ${kana}`)
  const base = kana.slice(0, -1)
  return { masu: base + GODAN_STEM[last] + 'ます', te: base + GODAN_TE[last], stem: base + GODAN_STEM[last], nai: base + GODAN_NAI[last] }
}

// Kata kerja yang butuh objek を (aman untuk template objek)
export const TRANSITIVE = new Set(['たべる', 'のむ', 'よむ', 'かく', 'きく', 'みる', 'かう', 'うる', 'まつ', 'おす', 'ひく', 'おしえる', 'あける', 'しめる', 'そうじする', 'せんたくする', 'りょうりする', 'べんきょうする', 'れんしゅうする'])
// Kata kerja perpindahan: に / へ / から / まで bisa dobel-benar, jadi dihindari di blank partikel
export const MOTION = new Set(['いく', 'くる', 'かえる', 'あるく', 'はしる', 'とぶ', 'およぐ', 'のる', 'おりる'])
// Aktivitas di suatu tempat dengan で (bukan kata kerja perpindahan)
export const PLACE_ACTIVITY = new Set(['たべる', 'のむ', 'よむ', 'かく', 'きく', 'みる', 'かう', 'うる', 'まつ', 'はたらく', 'やすむ', 'ねる', 'すわる', 'そうじする', 'せんたくする', 'りょうりする', 'かいものする', 'うんどうする', 'さんぽする', 'べんきょうする'])

// Kata/frasa yang benar-benar berfungsi sebagai keterangan waktu dan lazim pakai に
export const TIME_WITH_NI = ['げつようび', 'かようび', 'すいようび', 'もくようび', 'きんようび', 'どようび', 'にちようび', 'おととい', 'あさって', 'しゅうまつ', 'へいじつ', 'ゆうがた', 'いちじ', 'にじ', 'さんじ', 'よじ', 'ごじ', 'ろくじ', 'しちじ', 'はちじ', 'くじ', 'じゅうじ', 'じゅういちじ', 'じゅうにじ']

/** Kata bantu penjelas partikel untuk pembahasan. */
export const PARTICLE_MEANING = {
  を: 'menandai objek langsung dari kata kerja',
  に: 'menandai waktu atau tujuan (〜に)',
  で: 'menandai tempat berlangsungnya kegiatan atau alat (〜で)',
  へ: 'menandai arah (〜へ)',
  と: 'menandai teman/pasangan (〜と)',
  から: 'menandai titik awal (〜から)',
  まで: 'menandai batas akhir (〜まで)',
  が: 'menandai subjek',
  は: 'menandai topik kalimat',
}
