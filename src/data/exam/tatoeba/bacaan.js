// Soal bacaan ujian yang dikurasi manual dari kalimat Tatoeba (CC BY 2.0 FR).
// Semua kalimat sumber tercatat di sentences.js; kolom `sumber` menyertakan
// sentence id + username untuk atribusi.
//
//   id 2101-2199 untuk batch kurasi pertama
import { TATOEBA_SENTENCES, tatoebaById } from './sentences.js'

const teksOf = (ids) => (typeof ids === 'string' ? ids : ids.map((x) => tatoebaById(x).kana).join(''))
const indOf = (ids) => (Array.isArray(ids) ? ids.map((x) => tatoebaById(x).ind).join(' ') : '')
const sourcesOf = (ids) =>
  (Array.isArray(ids) ? ids : []).map((x) => {
    const s = tatoebaById(x)
    return s ? `#${s.id} (${s.user})` : `#${x}`
  }).join(' + ')
const SUMBER = (ids) => (Array.isArray(ids) ? `Sumber: Tatoeba ${sourcesOf(ids)}.` : '')

const L = (id, topik, ids, soal, pilihan, jawaban, catatan) => ({
  id,
  tipe: 'literal',
  topik,
  teks: teksOf(ids),
  soal,
  pilihan,
  jawaban,
  pembahasan: `${catatan}${indOf(ids) ? ` Arti: ${indOf(ids)}` : ''}${SUMBER(ids) ? ` ${SUMBER(ids)}` : ''}`,
})
const I = (id, topik, ids, teks, soal, pilihan, jawaban, catatan) => ({
  id,
  tipe: 'infer',
  topik,
  teks: teks || teksOf(ids),
  soal,
  pilihan,
  jawaban,
  pembahasan: `${catatan}${SUMBER(ids) ? ` ${SUMBER(ids)}` : ''}`,
})
const B = (id, topik, ids, statements, catatan) => ({
  id,
  tipe: 'bs',
  topik,
  teks: teksOf(ids),
  soal: 'ただしい か ただしくない か えらんで ください。(Pilih Benar atau Salah.)',
  statements,
  pembahasan: `${catatan}${SUMBER(ids) ? ` ${SUMBER(ids)}` : ''}`,
})
const M = (id, topik, ids, soal, pilihan, jawaban, catatan) => ({
  id,
  tipe: 'mcma',
  topik,
  teks: teksOf(ids),
  soal: soal || 'ぶんしょうに ある ものを すべて えらんで ください。(Pilih semua yang benar.)',
  pilihan,
  jawaban,
  pembahasan: `${catatan}${SUMBER(ids) ? ` ${SUMBER(ids)}` : ''}`,
})

const BACAAN_LITERAL = [
  L(2101, 'shigoto', [162840], 'ちちの しごとは なんですか。', ['ぎんこういん', 'せんせい', 'いしゃ', 'かいしゃいん', 'コック'], 0, '「ぎんこういん」= pegawai bank.'),
  L(2102, 'kaimono', [84431], 'ちちが かった ものは なんですか。', ['くるま', 'じてんしゃ', 'ぼうし', 'かばん', 'コンピューター'], 0, '「くるまを かいました」= membeli mobil.'),
  L(2103, 'kaimono', [202147], 'どこで ぼうしを かいましたか。', ['デパート', 'スーパー', 'えき', 'ぎんこう', 'びょういん'], 0, '「デパートで」= di pusat perbelanjaan.'),
  L(2104, 'uchi', [80443], 'あした どこに いますか。', ['いえ', 'がっこう', 'こうえん', 'えき', 'としょかん'], 0, '「いえに います」= ada di rumah.'),
  L(2105, 'keseharian', [152700], 'いつ はしりますか。', ['まいにち', 'まいしゅう', 'ときどき', 'にちようびだけ', 'まだ'], 0, '「まいにち」= setiap hari.'),
  L(2106, 'kazoku', [125430], 'せが たかいのは だれですか。', ['おとうと', 'わたし', 'ちち', 'はは', 'あね'], 0, '「おとうとは わたしより せが たかい」= adik lebih tinggi.'),
  L(2107, 'youbi', [169953], 'きのうは なんようびでしたか。', ['にちようび', 'どようび', 'げつようび', 'きんようび', 'かようび'], 0, '「きのうは 〜でした」= kemarin hari apa.'),
  L(2108, 'keseharian', [429432], 'いつ あさごはんを たべますか。', ['まいあさ', 'まいばん', 'ひる', 'よる', 'ときどき'], 0, '「まいあさ」= setiap pagi.'),
  L(2109, 'jikan', [155489], 'いつ かぜを ひきましたか。', ['せんげつ', 'こんげつ', 'らいげつ', 'きょねん', 'きのう'], 0, '「せんげつ」= bulan lalu.'),
  L(2110, 'uchi', [163969], 'いえは どこに ありますか。', ['えきの ちかく', 'がっこうの ちかく', 'うみの ちかく', 'やまの ちかく', 'こうえんの ちかく'], 0, '「えきに ちかくて」= dekat stasiun.'),
  L(2111, 'ryokou', [85707], 'なにが きらいですか。', ['ひこうきで りょこうする こと', 'でんしゃで いく こと', 'うみで およぐ こと', 'ほんを よむ こと', 'りょうりする こと'], 0, '「〜のは きらいです」= tidak suka melakukan〜.'),
  L(2112, 'keseharian', [152892], 'べんきょうする まえに なにを しますか。', ['テレビを みます', 'おんがくを ききます', 'さんぽします', 'ねます', 'ごはんを たべます'], 0, '「〜する まえに」= sebelum melakukan〜.'),
  L(2113, 'tenki', [171745], 'きょうの てんきは どうですか。', ['とても よい', 'あまり よくない', 'あめです', 'ゆきです', 'とても さむい'], 0, '「よい てんき」= cuaca bagus.'),
  L(2114, 'uchi', [164011], 'いえの ちかくに なにが ありますか。', ['こうえん', 'ぎんこう', 'ゆうびんきょく', 'スーパー', 'びょういん'], 0, '「ちかくに 〜が あります」= ada〜 di dekat.'),
  L(2115, 'kazoku', [83000], 'ははは いま なにを して いますか。', ['てがみを かいて います', 'ほんを よんで います', 'りょうりして います', 'せんたくして います', 'テレビを みて います'], 0, '「〜て います」= sedang melakukan〜.'),
  L(2116, 'aisatsu', [124623], 'なにを きいて いますか。', ['でんわばんごう', 'なまえ', 'じゅうしょ', 'たんじょうび', 'しごと'], 0, '「なんばんですか」= menanyakan nomor.'),
  L(2117, 'tabemono', [159489], 'なにが すきですか。', ['チョコレート', 'コーヒー', 'ケーキ', 'アイス', 'バナナ'], 0, '「チョコレートが すきです」= suka cokelat.'),
  L(2118, 'kazoku', [221555], 'この じてんしゃは だれの ものですか。', ['おとうと', 'わたし', 'ちち', 'あに', 'ともだち'], 0, '「〜の ものです」= milik〜.'),
  L(2119, 'keseharian', [156728], 'きのう なにを しましたか。', ['ちちを てつだいました', 'へやを そうじしました', 'しゅくだいを しました', 'ともだちと あそびました', 'かいものを しました'], 0, '「てつだいました」= membantu.'),
  L(2120, 'kazoku', [163546], 'あねは なにが だいすきですか。', ['こども', 'どうぶつ', 'りょうり', 'おんがく', 'スポーツ'], 0, '「だいすき」= sangat suka.'),
  L(2121, 'uchi', [162753], 'この へやに ない ものは なんですか。', ['テレビ', 'つくえ', 'ベッド', 'まど', 'でんき'], 0, '「〜が ありません」= tidak ada〜.'),
  L(2122, 'uchi', [163983], 'いえは ここから どうですか。', ['とおい', 'ちかい', 'おおきい', 'あたらしい', 'しずか'], 0, '「とおい」= jauh.'),
  L(2123, 'keseharian', [169947], 'きのうは なんの ひでしたか。', ['たんじょうび', 'しけん', 'うんどうかい', 'やすみの ひ', 'パーティー'], 0, '「たんじょうびでした」= (kemarin) hari ulang tahun.'),
  L(2124, 'shigoto', [153093], 'どこで はたらいて いますか。', ['びょういん', 'がっこう', 'ぎんこう', 'デパート', 'レストラン'], 0, '「びょういんで はたらく」= bekerja di rumah sakit.'),
  L(2125, 'gakkou', [106294], 'かれは だれですか。', ['がっこうの せんせい', 'ぎんこういん', 'いしゃ', 'ともだち', 'ちち'], 0, '「がっこうの せんせい」= guru sekolah.'),
  L(2126, 'kaimono', [218827], 'あれは なんですか。', ['ぎんこう', 'ゆうびんきょく', 'びょういん', 'えき', 'スーパー'], 0, '「これが〜で、あれが〜」= ini〜 dan itu〜.'),
  L(2127, 'jikan', [152726], 'なんじに おきますか。', ['ろくじ', 'しちじ', 'ごじ', 'はちじ', 'くじ'], 0, '「ろくじに おきます」= bangun jam enam.'),
  L(2128, 'tsuki', [163096], 'たんじょうびは なんがつですか。', ['じゅういちがつ', 'じゅうがつ', 'じゅうにがつ', 'いちがつ', 'くがつ'], 0, '「じゅういちがつ」= November.'),
  L(2129, 'tenki', [171621], 'きのうと きょうは どちらが あたたかいですか。', ['きょう', 'きのう', 'おなじ', 'どちらも さむい', 'わかりません'], 0, '「きのうより あたたかい」= lebih hangat dari kemarin.'),
  L(2130, 'keseharian', [237463], 'なにを きいて いますか。', ['たんじょうび', 'なまえ', 'しごと', 'でんわばんごう', 'じゅうしょ'], 0, '「いつですか」= kapan.'),
  L(2131, 'youbi', [171638], 'きょうは なんようびですか。', ['げつようび', 'かようび', 'すいようび', 'にちようび', 'どようび'], 0, '「げつようび」= hari Senin.'),
  L(2132, 'kazoku', [232196], 'なにを きいて いますか。', ['きょうだいの かず', 'しごと', 'たんじょうび', 'でんわばんごう', 'すきな たべもの'], 0, '「なんにん きょうだいが いますか」= berapa saudara.'),
]

const BACAAN_INFER = [
  I(2141, 'uchi', [163969, 164011], null, 'この いえについて ただしいのは どれですか。', ['えきと こうえんが ちかい', 'えきから とおい', 'こうえんが ない', 'やまの うえに ある', 'しごとに ふべん'], 0, '「えきに ちかくて」+「ちかくに こうえんが あります」= dua-duanya dekat.'),
  I(2142, 'keseharian', [155489], 'わたしは せんげつ かぜを ひきました。いまは げんきです。', 'いまの ようすは どうですか。', ['げんきです', 'まだ びょうきです', 'ねつが あります', 'びょういんに います', 'あまり よくないです'], 0, '「いまは げんきです」= sekarang sudah sehat.'),
  I(2143, 'ryokou', [85707], 'ひこうきで りょこうするのは きらいです。だから いつも でんしゃで いきます。', 'この ひとは りょこうに なにを つかいますか。', ['でんしゃ', 'ひこうき', 'バス', 'くるま', 'じてんしゃ'], 0, '「だから」= jadi, konsekuensinya naik kereta.'),
  I(2144, 'kazoku', [83000], 'ははは いま てがみを かいて います。あした ゆうびんきょくへ いきます。', 'ははは あした なにを しますか。', ['ゆうびんきょくへ いきます', 'てがみを かきます', 'びょういんへ いきます', 'かいものを します', 'いえに います'], 0, '「あした ゆうびんきょくへ いきます」= besok ke kantor pos.'),
  I(2145, 'kazoku', [163546], 'わたしの あねは こどもが だいすきです。こどもと あそぶのが じょうずです。', 'あねは どんな ひとですか。', ['こどもが すきな ひと', 'こどもが きらいな ひと', 'しずかな ひと', 'スポーツが とくいな ひと', 'びょうきの ひと'], 0, '「こどもが だいすき」+「あそぶのが じょうず」= suka anak-anak.'),
  I(2146, 'keseharian', [152892], 'わたしは べんきょうする まえに テレビを みます。そのあと べんきょうします。', 'この ひとは いつ テレビを みますか。', ['べんきょうする まえ', 'べんきょうした あと', 'あさ おきた とき', 'よる ねる まえ', 'ひるごはんの あと'], 0, '「〜する まえに テレビを みます」= TV dulu, baru belajar.'),
]

const BACAAN_BS = [
  B(2151, 'shigoto', [162840, 153093], [
    { text: 'Ayah penulis bekerja di bank.', benar: true },
    { text: 'Ibu penulis bekerja di rumah sakit.', benar: false },
    { text: 'Penulis bekerja di rumah sakit.', benar: true },
  ], '「ちちは ぎんこういん」+「わたしは びょういんで はたらいて います」.'),
  B(2152, 'keseharian', [152700, 152726], [
    { text: 'Penulis berlari setiap hari.', benar: true },
    { text: 'Penulis bangun jam tujuh setiap hari.', benar: false },
    { text: 'Penulis bangun jam enam setiap hari.', benar: true },
  ], '「まいにち はしります」+「ろくじに おきます」.'),
  B(2153, 'youbi', [169953, 171638], [
    { text: 'Kemarin hari Minggu.', benar: true },
    { text: 'Hari ini hari Minggu.', benar: false },
    { text: 'Hari ini hari Senin.', benar: true },
  ], '「きのうは にちようびでした」+「きょうは げつようびです」.'),
  B(2154, 'uchi', [80443, 163983], [
    { text: 'Besok penulis ada di rumah.', benar: true },
    { text: 'Rumah penulis dekat dari sini.', benar: false },
    { text: 'Rumah penulis jauh dari sini.', benar: true },
  ], '「あしたは いえに います」+「ここから とおいです」.'),
  B(2155, 'shumi', [159489, 85707], [
    { text: 'Penulis suka cokelat.', benar: true },
    { text: 'Penulis suka berwisata naik pesawat.', benar: false },
    { text: 'Penulis tidak suka naik pesawat.', benar: true },
  ], '「チョコレートが すきです」+「ひこうきで りょこうするのは きらいです」.'),
  B(2156, 'tsuki', [163096, 237463], [
    { text: 'Ulang tahun penulis bulan November.', benar: true },
    { text: 'Ulang tahun penulis bulan Oktober.', benar: false },
    { text: 'Penulis menanyakan ulang tahun lawan bicara.', benar: true },
  ], '「じゅういちがつです」+「あなたの たんじょうびは いつですか」.'),
  B(2157, 'kaimono', [202147], [
    { text: 'Penulis membeli topi baru.', benar: true },
    { text: 'Penulis membeli topi di stasiun.', benar: false },
    { text: 'Topi yang dibeli baru.', benar: true },
  ], '「あたらしい ぼうしを かいました」.'),
]

const BACAAN_MCMA = [
  M(2161, 'shigoto', [162840, 153093], null, ['ぎんこういん', 'びょういん', 'がっこう', 'デパート', 'せんせい'], [0, 1], '「ぎんこういん」dan「びょういん」disebut di teks.'),
  M(2162, 'keseharian', [155489, 171745], null, ['かぜを ひいた', 'よい てんき', 'ゆきが ふる', 'あめが ふる', 'ひが つよい'], [0, 1], '「かぜを ひきました」dan「よい てんき」ada di teks.'),
  M(2163, 'keseharian', [152700, 152726], null, ['はしる', 'ろくじに おきる', 'しちじに おきる', 'およぐ', 'じてんしゃに のる'], [0, 1], '「はしります」dan「ろくじに おきます」ada di teks.'),
  M(2164, 'uchi', [164011, 163969], null, ['こうえん', 'えき', 'がっこう', 'びょういん', 'うみ'], [0, 1], '「こうえん」dan「えき」disebut di teks.'),
  M(2165, 'kaimono', [202147, 218827], null, ['デパート', 'ゆうびんきょく', 'ぎんこう', 'えき', 'レストラン'], [0, 1, 2], '「デパート」「ゆうびんきょく」「ぎんこう」semua disebut.'),
  M(2166, 'kazoku', [159489, 83000], null, ['チョコレート', 'てがみ', 'コーヒー', 'ほん', 'ケーキ'], [0, 1], '「チョコレート」dan「てがみ」ada di teks.'),
]

export const TATOEBA_TOTAL_SENTENCES = TATOEBA_SENTENCES.length
// export gabungan TATOEBA_BACAAN ada di akhir file (setelah semua batch terdefinisi)

// ---------- Batch 2.2: lampirkan sumber terstruktur (validasi mesin) ----------
const S = (q, src) => ({ ...q, src })

const BACAAN_LITERAL_2 = [
  S(L(2201, 'kazoku', [164550], 'おとうとは なんにん いますか。', ['ひとり', 'ふたり', 'さんにん', 'よにん', 'ひとりも いない'], 0, '「おとうとが ひとり」= satu adik laki-laki.'), [164550]),
  S(L(2202, 'kazoku', [84830], 'かぞくは なんにんですか。', ['さんにん', 'よにん', 'ふたり', 'ごにん', 'ひとり'], 0, '「ちちと ははと いもうと」= 3 orang.'), [84830]),
  S(L(2203, 'youbi', [124461], 'どようびの つぎは なんようびですか。', ['にちようび', 'どようび', 'げつようび', 'かようび', 'もくようび'], 0, '「どようびの つぎは にちようび」= setelah Sabtu adalah Minggu.'), [124461]),
  S(L(2204, 'tenki', [171630], 'きょうは きのうと くらべて どうですか。', ['おなじ くらい あつい', 'きょうの ほうが すずしい', 'きのうの ほうが さむい', 'きょうも ゆきです', 'きのうは あめです'], 0, '「きのうと おなじ くらい あつい」= sepanas kemarin.'), [171630]),
  S(L(2205, 'youbi', [175592], 'にちようびの つぎは なんようびですか。', ['げつようび', 'にちようび', 'かようび', 'すいようび', 'どようび'], 0, '「にちようびの つぎ」= setelah Minggu.'), [175592]),
  S(L(2206, 'aisatsu', [214182], 'はなして いる ひとが たのんで いる ことは なんですか。', ['もう いちど', 'おかね', 'たべもの', 'みず', 'じかん'], 0, '「もう いちど」= sekali lagi.'), [214182]),
  S(L(2207, 'keseharian', [219590], 'この ほんは どうですか。', ['あたらしい', 'ふるい', 'おおきい', 'ちいさい', 'たかい'], 0, '「あたらしい」= baru.'), [219590]),
  S(L(2208, 'jikan', [127344], 'たんじょうびに なにを あげますか。', ['あたらしい じてんしゃ', 'ふるい ほん', 'おかね', 'はな', 'ケーキ'], 0, '「じてんしゃを あげましょう」= ayo berikan sepeda.'), [127344]),
  S(L(2209, 'gakkou', [165152], 'なんの ために がっこうへ いきますか。', ['べんきょうする ため', 'あそぶ ため', 'ねる ため', 'たべる ため', 'はたらく ため'], 0, '「べんきょうする ために」= untuk belajar.'), [165152]),
  S(L(2210, 'jikan', [78676], 'らいげつ なにを しますか。', ['きゅうかを とります', 'しけんが あります', 'りょこうに いきます', 'しごとを やめます', 'いえを かいます'], 0, '「きゅうかを とります」= mengambil cuti.'), [78676]),
  S(L(2211, 'tenki', [80338], 'あしたは どうして いえに いますか。', ['あめだから', 'びょうきだから', 'さむいから', 'いそがしいから', 'つかれたから'], 0, '「あめなら、いえに います」= kalau hujan, di rumah.'), [80338]),
  S(L(2212, 'shumi', [81615], 'なにが おもしろいですか。', ['ほんを よむ こと', 'テレビを みる こと', 'ねる こと', 'はしる こと', 'およぐ こと'], 0, '「ほんを よむ こと」= membaca buku.'), [81615]),
  S(L(2213, 'keseharian', [232377], 'いまは なにを する じかんですか。', ['おきる', 'ねる', 'たべる', 'べんきょうする', 'はたらく'], 0, '「おきる じかんです」= waktunya bangun.'), [232377]),
  S(L(2214, 'keseharian', [152613], 'あした なにを しますか。', ['てがみを かきます', 'ほんを よみます', 'えいがを みます', 'かいものを します', 'ともだちに あいます'], 0, '「てがみを かく つもりです」= berencana menulis surat.'), [152613]),
  S(L(2215, 'keseharian', [154683], 'にちようびに どこへ いきますか。', ['きょうかい', 'がっこう', 'びょういん', 'デパート', 'としょかん'], 0, '「きょうかいに いきます」= pergi ke gereja.'), [154683]),
  S(L(2216, 'ryokou', [155480], 'せんしゅうの どようび どこへ いきましたか。', ['こうえん', 'うみ', 'やま', 'デパート', 'としょかん'], 0, '「こうえんへ いきました」= pergi ke taman.'), [155480]),
  S(L(2217, 'keseharian', [99829], 'かれは まいあさ なにを よみますか。', ['しんぶん', 'ほん', 'てがみ', 'ざっし', 'まんが'], 0, '「しんぶんを よみます」= membaca koran.'), [99829]),
  S(L(2218, 'keseharian', [232214], 'あなたは いつ いそがしいですか。', ['きょう', 'きのう', 'あした', 'まいにち', 'にちようび'], 0, '「きょう いそがしい」= sibuk hari ini.'), [232214]),
  S(L(2219, 'keseharian', [233241], 'どちらの じてんしゃが いいですか。', ['あなたの', 'わたしの', 'ちちの', 'ともだちの', 'せんせいの'], 0, '「あなたの じてんしゃは わたしの より いい」= sepedamu lebih bagus.'), [233241]),
]

const BACAAN_INFER_2 = [
  S(I(2231, 'keseharian', [84830], 'ちちと ははと いもうとが います。いもうとは まだ ちいさいです。', 'いもうとについて ただしいのは どれですか。', ['ちいさい', 'おおきい', 'がくせいです', 'はたらいて います', 'ひとりで すんで います'], 0, '「まだ ちいさいです」= masih kecil.'), [84830]),
  S(I(2232, 'keseharian', [78676], 'らいげつ きゅうかを とります。そのとき りょこうに いきます。', 'らいげつ なにを しますか。', ['りょこうに いきます', 'しごとに いきます', 'いえに います', 'べんきょうします', 'びょういんに いきます'], 0, '「きゅうかを とります」+「りょこうに いきます」= cuti lalu jalan-jalan.'), [78676]),
  S(I(2233, 'uchi', [164011], 'わたしの いえの ちかくに こうえんが あります。だから まいにち こうえんに いきます。', 'この ひとは まいにち どこへ いきますか。', ['こうえん', 'がっこう', 'びょういん', 'デパート', 'としょかん'], 0, '「ちかくに こうえんが あります」+「まいにち こうえんに いきます」.'), [164011]),
  S(I(2234, 'keseharian', [154683], 'わたしは にちようびに きょうかいに いきます。きょうかいでは うたを うたいます。', 'きょうかいでは なにを しますか。', ['うたを うたいます', 'ほんを よみます', 'ごはんを たべます', 'ねます', 'はしります'], 0, '「きょうかいでは うたを うたいます」= di gereja bernyanyi.'), [154683]),
  S(I(2235, 'keseharian', [232377], 'あなたは もう おきる じかんです。はやく おきて ください。', 'はなして いる ひとは なにを して ほしいですか。', ['おきて ほしい', 'ねて ほしい', 'はたらいて ほしい', 'べんきょうして ほしい', 'たべて ほしい'], 0, '「おきる じかんです」+「はやく おきて ください」= minta segera bangun.'), [232377]),
  S(I(2236, 'uchi', [152613], 'わたしは あした てがみを かく つもりです。てがみは ともだちに おくります。', 'てがみは だれに おくりますか。', ['ともだち', 'はは', 'ちち', 'せんせい', 'あに'], 0, '「てがみは ともだちに おくります」= suratnya untuk teman.'), [152613]),
]

const BACAAN_BS_2 = [
  S(B(2241, 'kazoku', [164550, 84830], [
    { text: 'Penulis punya satu adik laki-laki.', benar: true },
    { text: 'Keluarga penulis terdiri dari ayah, ibu, dan kakak perempuan.', benar: false },
    { text: 'Keluarga penulis punya adik perempuan.', benar: true },
  ], '「おとうとが ひとり」+「ちちと ははと いもうと」.'), [164550, 84830]),
  S(B(2242, 'youbi', [124461, 175592], [
    { text: 'Setelah Sabtu datang Minggu.', benar: true },
    { text: 'Setelah Minggu datang Sabtu.', benar: false },
    { text: 'Setelah Minggu datang Senin.', benar: true },
  ], '「どようびの つぎは にちようび」+「にちようびの つぎは げつようび」.'), [124461, 175592]),
  S(B(2243, 'tenki', [171630, 171486], [
    { text: 'Hari ini sepanas kemarin.', benar: true },
    { text: 'Hari ini dingin.', benar: false },
    { text: 'Hari ini sejuk.', benar: true },
  ], '「きのうと おなじ くらい あつい」+「きょうは すずしいです」.'), [171630, 171486]),
  S(B(2244, 'keseharian', [152613, 154683], [
    { text: 'Besok penulis menulis surat.', benar: true },
    { text: 'Hari Minggu penulis pergi ke pusat perbelanjaan.', benar: false },
    { text: 'Hari Minggu penulis pergi ke gereja.', benar: true },
  ], '「あした てがみを かく つもりです」+「にちようびに きょうかいに いきます」.'), [152613, 154683]),
  S(B(2245, 'jikan', [78676, 80338], [
    { text: 'Bulan depan penulis mengambil cuti.', benar: true },
    { text: 'Besok hujan, jadi penulis akan pergi.', benar: false },
    { text: 'Kalau besok hujan, penulis di rumah.', benar: true },
  ], '「らいげつ きゅうかを とります」+「あした あめなら、いえに います」.'), [78676, 80338]),
  S(B(2246, 'uchi', [164011, 163969], [
    { text: 'Di dekat rumah penulis ada taman.', benar: true },
    { text: 'Rumah penulis jauh dari stasiun.', benar: false },
    { text: 'Rumah penulis dekat stasiun.', benar: true },
  ], '「ちかくに こうえんが あります」+「えきに ちかくて べんりです」.'), [164011, 163969]),
  S(B(2247, 'keseharian', [155480, 99829], [
    { text: 'Sabtu lalu penulis pergi ke taman.', benar: true },
    { text: 'Dia membaca koran setiap malam.', benar: false },
    { text: 'Dia membaca koran setiap pagi.', benar: true },
  ], '「こうえんへ いきました」+「まいあさ、しんぶんを よみます」.'), [155480, 99829]),
]

const BACAAN_MCMA_2 = [
  S(M(2251, 'kazoku', [164550, 84830], null, ['おとうと', 'いもうと', 'ちち', 'はは', 'あね'], [0, 1, 2, 3], '4 anggota keluarga disebut: adik laki-laki, adik perempuan, ayah, ibu.'), [164550, 84830]),
  S(M(2252, 'youbi', [124461, 175592], null, ['どようび', 'にちようび', 'げつようび', 'かようび', 'もくようび'], [0, 1, 2], '「どようび」「にちようび」「げつようび」disebut.'), [124461, 175592]),
  S(M(2253, 'tenki', [171630, 171486, 80338], null, ['あつい', 'すずしい', 'あめ', 'ゆき', 'かぜ'], [0, 1, 2], '「あつい」「すずしい」「あめ」disebut.'), [171630, 171486, 80338]),
  S(M(2254, 'uchi', [164011, 163969], null, ['こうえん', 'えき', 'いえ', 'がっこう', 'うみ'], [0, 1, 2], '「こうえん」「えき」「いえ」disebut.'), [164011, 163969]),
  S(M(2255, 'jikan', [78676, 127344], null, ['きゅうか', 'じてんしゃ', 'しけん', 'りょこう', 'しごと'], [0, 1], '「きゅうか」dan「じてんしゃ」disebut.'), [78676, 127344]),
  S(M(2256, 'keseharian', [152613, 154683, 80338], null, ['てがみ', 'きょうかい', 'いえ', 'がっこう', 'うみ'], [0, 1, 2], '「てがみ」「きょうかい」「いえ」disebut.'), [152613, 154683, 80338]),
]

const BACAAN_LITERAL_3 = [
  S(L(2301, 'keseharian', [122157], 'にちようびに なにを しなくて いいですか。', ['しごと', 'べんきょう', 'そうじ', 'せんたく', 'かいもの'], 0, '「しごとを する ひつようは ありません」= tidak perlu bekerja.'), [122157]),
  S(L(2302, 'keseharian', [152400], 'らいしゅうは どうですか。', ['いそがしいでしょう', 'ひまです', 'やすみです', 'げんきです', 'つかれました'], 0, '「いそがしいでしょう」= mungkin sibuk.'), [152400]),
  S(L(2303, 'keseharian', [152741], 'まいあさ どこで ちかてつに のりますか。', ['ぎんざ', 'しんじゅく', 'しぶや', 'いけぶくろ', 'うえの'], 0, '「ぎんざで ちかてつに のります」= naik kereta di Ginza.'), [152741]),
  S(L(2304, 'kazoku', [162594], 'いもうとは まいあさ なにを あらいますか。', ['かみ', 'て', 'かお', 'あし', 'からだ'], 0, '「かみを あらいます」= mencuci rambut.'), [162594]),
  S(L(2305, 'kazoku', [162833], 'ちちは いま なにを して いませんか。', ['ほんを よんで いません', 'てがみを かいて いません', 'テレビを みて いません', 'ごはんを たべて いません', 'ねて いません'], 0, '「ほんを よんで いません」= tidak sedang membaca buku.'), [162833]),
  S(L(2306, 'youbi', [175594], 'いちばん いそがしい ひは なんようびですか。', ['げつようび', 'にちようび', 'かようび', 'どようび', 'きんようび'], 0, '「げつようびは いちばん いそがしい」= Senin tersibuk.'), [175594]),
  S(L(2307, 'jikan', [235507], 'なんがつ なんにちの ことを いって いますか。', ['にがつ にじゅうはちにち', 'さんがつ いつか', 'いちがつ とおか', 'しがつ みっか', 'ごがつ よっか'], 0, '「にがつ にじゅうはちにち」= 28 Februari.'), [235507]),
  S(L(2308, 'jikan', [169970], 'きのうは なんさいの たんじょうびでしたか。', ['じゅうななさい', 'じゅうろくさい', 'はたち', 'じゅうはっさい', 'じゅうごさい'], 0, '「じゅうななさいの たんじょうび」= ulang tahun ke-17.'), [169970]),
  S(L(2309, 'keseharian', [151272], 'まいばん なにを みますか。', ['テレビ', 'えいが', 'アニメ', 'ニュース', 'ドラマ'], 0, '「まいばん テレビを みます」= nonton TV setiap malam.'), [151272]),
  S(L(2310, 'keseharian', [152893], 'なにが ありませんか。', ['べんきょうする ひま', 'おかね', 'じかん', 'ともだち', 'しごと'], 0, '「べんきょうする ひまが ありません」= tidak ada waktu belajar.'), [152893]),
  S(L(2311, 'shumi', [154794], 'どんな ほんが ほしいですか。', ['よむ ほん', 'かく ほん', 'うる ほん', 'かりる ほん', 'すてる ほん'], 0, '「よむ ほんが ほしい」= ingin buku untuk dibaca.'), [154794]),
  S(L(2312, 'keseharian', [155372], 'どうして おそいのですか。', ['おきる のが おそいから', 'ねる のが おそいから', 'たべる のが おそいから', 'はたらく のが おそいから', 'べんきょうする のが おそいから'], 0, '「おきる のが おそい」= bangunnya kesiangan.'), [155372]),
  S(L(2313, 'keseharian', [156595], 'どこで でんしゃに のりますか。', ['はつえき', 'しんじゅく', 'しぶや', 'うえの', 'いけぶくろ'], 0, '「はつえきで でんしゃに のります」= naik di stasiun awal.'), [156595]),
  S(L(2314, 'kaimono', [169865], 'きのう なにを かいましたか。', ['あたらしい パソコン', 'あたらしい くるま', 'あたらしい ほん', 'あたらしい かばん', 'あたらしい とけい'], 0, '「パソコンを かいました」= membeli komputer.'), [169865]),
  S(L(2315, 'keseharian', [176530], 'なにが ほしいですか。', ['けいたい でんわ', 'パソコン', 'くるま', 'ほん', 'かばん'], 0, '「けいたい でんわが ほしい」= ingin ponsel.'), [176530]),
  S(L(2316, 'keseharian', [158435], 'きのう どこに いましたか。', ['いえ', 'がっこう', 'こうえん', 'えき', 'としょかん'], 0, '「いちにちじゅう いえに いました」= di rumah seharian.'), [158435]),
  S(L(2317, 'shigoto', [158511], 'はなして いる ひとの しごとは なんですか。', ['いしゃ', 'せんせい', 'ぎんこういん', 'かいしゃいん', 'コック'], 0, '「いしゃです」= dokter.'), [158511]),
  S(L(2318, 'kazoku', [162694], 'ははは いつも どうですか。', ['いそがしい', 'ひま', 'げんき', 'つかれた', 'ねむい'], 0, '「いつも いそがしい」= selalu sibuk.'), [162694]),
  S(L(2319, 'shigoto', [162856], 'ちちの しごとは なんですか。', ['いしゃ', 'せんせい', 'ぎんこういん', 'かいしゃいん', 'コック'], 0, '「いしゃです」= dokter.'), [162856]),
  S(L(2320, 'keseharian', [163876], 'かれの つくえは どうですか。', ['あたらしい', 'ふるい', 'おおきい', 'ちいさい', 'たかい'], 0, '「かれの は あたらしい」= mejanya baru.'), [163876]),
  S(L(2321, 'kazoku', [164628], 'はなして いる ひとには だれが いますか。', ['かぞく', 'ともだち', 'せんせい', 'いぬ', 'ねこ'], 0, '「かぞくが います」= punya keluarga.'), [164628]),
  S(L(2322, 'keseharian', [167230], 'いまは なにを する じかんですか。', ['ねる', 'おきる', 'たべる', 'べんきょうする', 'はたらく'], 0, '「ねる じかんです」= waktunya tidur.'), [167230]),
  S(L(2323, 'kazoku', [168560], 'こどもは いま なにを する じかんですか。', ['ねる', 'おきる', 'たべる', 'あそぶ', 'べんきょうする'], 0, '「ねる じかんです」= waktunya tidur.'), [168560]),
  S(L(2324, 'tenki', [171546], 'きょうの てんきは どうですか。', ['あたたかい', 'さむい', 'あつい', 'すずしい', 'つめたい'], 0, '「あたたかいですね」= hangat, ya.'), [171546]),
  S(L(2325, 'kaimono', [184172], 'はなして いる ひとは なにを ねがって いますか。', ['たのしい きゅうか', 'たのしい しごと', 'たのしい りょこう', 'たのしい パーティー', 'たのしい うんどうかい'], 0, '「たのしい きゅうかを ねがいます」= berharap liburan menyenangkan.'), [184172]),
  S(L(2326, 'kazoku', [186927], 'かぞくは どうですか。', ['げんき', 'びょうき', 'つかれた', 'ねむい', 'いそがしい'], 0, '「かぞく いちどう げんきです」= seluruh keluarga sehat.'), [186927]),
  S(L(2327, 'ryokou', [196182], 'なにを きいて いますか。', ['ホテルが くうこうに ちかいか', 'ホテルが えきに ちかいか', 'くうこうが どこか', 'ホテルの ねだん', 'ホテルの へや'], 0, '「ホテルは くうこうに ちかいですか」= apakah hotel dekat bandara.'), [196182]),
  S(L(2328, 'keseharian', [199272], 'なにを きいて いますか。', ['まいにち べんきょうする りゆう', 'まいにち べんきょうする じかん', 'まいにち べんきょうする ばしょ', 'べんきょうの ほうほう', 'べんきょうの せいせき'], 0, '「なぜ まいにち べんきょうするのですか」= kenapa belajar tiap hari.'), [199272]),
  S(L(2329, 'tabemono', [219212], 'この たまごは どうですか。', ['あたらしい', 'ふるい', 'おおきい', 'ちいさい', 'からい'], 0, '「あたらしいですよ」= segar, lho.'), [219212]),
  S(L(2330, 'shumi', [219559], 'この ほんは どうですか。', ['よんで たのしい', 'よんで つまらない', 'よんで むずかしい', 'かいて たのしい', 'うって たのしい'], 0, '「よんで たのしい」= seru dibaca.'), [219559]),
  S(L(2331, 'aisatsu', [228016], 'はなして いる ひとは なにを しますか。', ['でんわばんごうを おしえます', 'なまえを おしえます', 'じゅうしょを おしえます', 'おかねを あげます', 'ほんを あげます'], 0, '「でんわばんごう おしえますね」= akan beritahu nomor telepon.'), [228016]),
  S(L(2332, 'keseharian', [228667], 'なにを きいて いますか。', ['けっこんする ひ', 'けっこんする ばしょ', 'けっこんする あいて', 'けっこんする りゆう', 'けっこんしない りゆう'], 0, '「いつ けっこんするのですか」= kapan menikah.'), [228667]),
  S(L(2333, 'tenki', [80338], 'どうして いえに いますか。', ['あめだから', 'ゆきだから', 'かぜだから', 'さむいから', 'あついから'], 0, '「あめなら、いえに います」= kalau hujan, di rumah.'), [80338]),
  S(L(2334, 'tenki', [80338], 'いえに いる りゆうは なんですか。', ['あめだから', 'さむいから', 'つかれたから', 'びょうきだから', 'いそがしいから'], 0, '「あめなら、いえに います」= kalau hujan, di rumah.'), [80338]),
]

const BACAAN_INFER_3 = [
  S(I(2341, 'keseharian', [122157], 'にちようびに しごとを する ひつようは ありません。だから いえで ゆっくり やすみます。', 'にちようび なにを しますか。', ['ゆっくり やすみます', 'しごとに いきます', 'べんきょうします', 'かいものを します', 'そうじします'], 0, '「しごとを する ひつようは ありません」+「ゆっくり やすみます」.'), [122157]),
  S(I(2342, 'keseharian', [152400], 'わたしは らいしゅうは いそがしいでしょう。だから あさっての パーティーに いきません。', 'らいしゅうの よていは どうですか。', ['いそがしいから パーティーに いきません', 'ひまだから パーティーに いきます', 'パーティーを ひらきます', 'パーティーを やめます', 'パーティーに いきます'], 0, '「いそがしいでしょう」+「パーティーに いきません」.'), [152400]),
  S(I(2343, 'keseharian', [154794], 'わたしは よむ ほんが ほしいです。あした ほんやへ いきます。', 'あした なにを しますか。', ['ほんやへ いきます', 'としょかんへ いきます', 'がっこうへ いきます', 'びょういんへ いきます', 'えきへ いきます'], 0, '「よむ ほんが ほしい」+「ほんやへ いきます」.'), [154794]),
  S(I(2344, 'keseharian', [155372], 'わたしは おきる のが おそいです。だから まいにち あさごはんを たべません。', 'あさごはんを たべない りゆうは なんですか。', ['おきる のが おそいから', 'ねる のが おそいから', 'いそがしいから', 'びょうきだから', 'おなかが すいて いないから'], 0, '「おきる のが おそい」+「あさごはんを たべません」.'), [155372]),
  S(I(2345, 'keseharian', [228667], 'いつ けっこんするのですか。らいねんの はるに けっこんします。', 'いつ けっこんしますか。', ['らいねんの はる', 'ことしの はる', 'らいねんの あき', 'ことしの なつ', 'らいげつ'], 0, '「らいねんの はるに けっこんします」.'), [228667]),
]

const BACAAN_BS_3 = [
  S(B(2351, 'keseharian', [122157, 152400], [
    { text: 'Hari Minggu tidak perlu bekerja.', benar: true },
    { text: 'Minggu depan penulis mungkin sibuk.', benar: true },
    { text: 'Hari Minggu harus bekerja.', benar: false },
  ], '「しごとを する ひつようは ありません」+「いそがしいでしょう」.'), [122157, 152400]),
  S(B(2352, 'kazoku', [162594, 162694], [
    { text: 'Adik perempuan mencuci rambut setiap pagi.', benar: true },
    { text: 'Ibu selalu sibuk.', benar: true },
    { text: 'Adik perempuan mencuci muka setiap pagi.', benar: false },
  ], '「かみを あらいます」+「いつも いそがしい」.'), [162594, 162694]),
  S(B(2353, 'shigoto', [162856, 158511], [
    { text: 'Ayah penulis dokter.', benar: true },
    { text: 'Penulis dokter.', benar: true },
    { text: 'Ayah penulis guru.', benar: false },
  ], '「ちちは いしゃです」+「わたしは いしゃです」.'), [162856, 158511]),
  S(B(2354, 'keseharian', [156595, 152741], [
    { text: 'Penulis naik kereta di stasiun awal.', benar: true },
    { text: 'Setiap pagi penulis naik kereta di Ginza.', benar: true },
    { text: 'Penulis naik kereta di Kyoto.', benar: false },
  ], '「はつえきで でんしゃに のります」+「ぎんざで ちかてつに のります」.'), [156595, 152741]),
  S(B(2355, 'keseharian', [169865, 176530], [
    { text: 'Kemarin penulis membeli komputer baru.', benar: true },
    { text: 'Penulis ingin ponsel.', benar: true },
    { text: 'Kemarin penulis membeli mobil baru.', benar: false },
  ], '「パソコンを かいました」+「けいたい でんわが ほしい」.'), [169865, 176530]),
  S(B(2356, 'keseharian', [158435, 158511], [
    { text: 'Penulis di rumah seharian.', benar: true },
    { text: 'Penulis dokter.', benar: true },
    { text: 'Penulis di sekolah seharian.', benar: false },
  ], '「いちにちじゅう いえに いました」+「いしゃです」.'), [158435, 158511]),
  S(B(2357, 'keseharian', [167230, 168560], [
    { text: 'Sudah waktunya kita tidur.', benar: true },
    { text: 'Anak-anak sudah waktunya tidur.', benar: true },
    { text: 'Sudah waktunya kita bangun.', benar: false },
  ], '「ねる じかんです」dua kalimat.'), [167230, 168560]),
  S(B(2358, 'tabemono', [219212, 219559], [
    { text: 'Telur itu segar.', benar: true },
    { text: 'Buku itu seru dibaca.', benar: true },
    { text: 'Telur itu lama.', benar: false },
  ], '「あたらしいですよ」+「よんで たのしいです」.'), [219212, 219559]),
]

const BACAAN_MCMA_3 = [
  S(M(2361, 'keseharian', [122157, 152400], null, ['しごと', 'いそがしい', 'ひま', 'げんき', 'つかれた'], [0, 1], '「しごと」dan「いそがしい」disebut.'), [122157, 152400]),
  S(M(2362, 'kazoku', [162594, 162694], null, ['いもうと', 'はは', 'ちち', 'あに', 'おとうと'], [0, 1], '「いもうと」dan「はは」disebut.'), [162594, 162694]),
  S({ id: 2363, tipe: 'mcma', topik: 'shigoto', teks: `${teksOf([162856, 158511])}ははは びょういんで はたらいて います。`, soal: 'ぶんしょうに ある ものを すべて えらんで ください。(Pilih semua yang benar.)', pilihan: ['いしゃ', 'びょういん', 'せんせい', 'ぎんこういん', 'がっこう'], jawaban: [0, 1], pembahasan: '「いしゃ」dan「びょういん」disebut. Sumber: Tatoeba #162856, #158511.' }, [162856, 158511]),
  S(M(2364, 'keseharian', [156595, 152741], null, ['はつえき', 'ぎんざ', 'きょうと', 'しぶや', 'うえの'], [0, 1], '「はつえき」dan「ぎんざ」disebut.'), [156595, 152741]),
  S(M(2365, 'kaimono', [169865, 176530], null, ['パソコン', 'けいたい でんわ', 'くるま', 'ほん', 'かばん'], [0, 1], '「パソコン」dan「けいたい でんわ」disebut.'), [169865, 176530]),
  S(M(2366, 'keseharian', [158435, 168560], null, ['いえ', 'ねる じかん', 'がっこう', 'こうえん', 'うみ'], [0, 1], '「いえ」dan「ねる じかん」disebut.'), [158435, 168560]),
  S(M(2367, 'kazoku', [162694, 186927], null, ['はは', 'かぞく', 'ともだち', 'せんせい', 'いぬ'], [0, 1], '「はは」dan「かぞく」disebut.'), [162694, 186927]),
  S({ id: 2368, tipe: 'mcma', topik: 'keseharian', teks: `${teksOf([167230, 168560])}つぎは おきる じかんです。`, soal: 'ぶんしょうに ある ものを すべて えらんで ください。(Pilih semua yang benar.)', pilihan: ['ねる じかん', 'おきる じかん', 'たべる じかん', 'はたらく じかん', 'あそぶ じかん'], jawaban: [0, 1], pembahasan: '「ねる じかん」dan「おきる じかん」disebut. Sumber: Tatoeba #167230, #168560.' }, [167230, 168560]),
]

export const TATOEBA_BACAAN = [...BACAAN_LITERAL, ...BACAAN_INFER, ...BACAAN_BS, ...BACAAN_MCMA, ...BACAAN_LITERAL_2, ...BACAAN_INFER_2, ...BACAAN_BS_2, ...BACAAN_MCMA_2, ...BACAAN_LITERAL_3, ...BACAAN_INFER_3, ...BACAAN_BS_3, ...BACAAN_MCMA_3]
export const TATOEBA_BACAAN_COUNT = TATOEBA_BACAAN.length

