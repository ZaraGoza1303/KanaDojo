// Kombinasi / extended sounds fokus Mode 3
// group dipakai untuk label & filter ringan di UI.

export const EXTENDED_KANA = [
  // フ series
  { kana: 'ファ', romaji: 'fa', group: 'Fa (ファ)' },
  { kana: 'フィ', romaji: 'fi', group: 'Fa (ファ)' },
  { kana: 'フェ', romaji: 'fe', group: 'Fa (ファ)' },
  { kana: 'フォ', romaji: 'fo', group: 'Fa (ファ)' },
  { kana: 'フュ', romaji: 'fyu', group: 'Fa (ファ)' },
  // ティ / ディ / トゥ / ドゥ
  { kana: 'ティ', romaji: 'ti', group: 'Ti & Di (ティ・ディ)' },
  { kana: 'テュ', romaji: 'tyu', group: 'Ti & Di (ティ・ディ)' },
  { kana: 'ディ', romaji: 'di', group: 'Ti & Di (ティ・ディ)' },
  { kana: 'デュ', romaji: 'dyu', group: 'Ti & Di (ティ・ディ)' },
  { kana: 'トゥ', romaji: 'tu', group: 'Tu & Du (トゥ・ドゥ)' },
  { kana: 'ドゥ', romaji: 'du', group: 'Tu & Du (トゥ・ドゥ)' },
  // W series
  { kana: 'ウィ', romaji: 'wi', group: 'W (ウィ・ウェ・ウォ)' },
  { kana: 'ウェ', romaji: 'we', group: 'W (ウィ・ウェ・ウォ)' },
  { kana: 'ウォ', romaji: 'wo', group: 'W (ウィ・ウェ・ウォ)' },
  // V series
  { kana: 'ヴァ', romaji: 'va', group: 'V (ヴ)' },
  { kana: 'ヴィ', romaji: 'vi', group: 'V (ヴ)' },
  { kana: 'ヴ', romaji: 'vu', group: 'V (ヴ)' },
  { kana: 'ヴェ', romaji: 've', group: 'V (ヴ)' },
  { kana: 'ヴォ', romaji: 'vo', group: 'V (ヴ)' },
  // シェ ジェ チェ
  { kana: 'シェ', romaji: 'she', group: 'She・Je・Che' },
  { kana: 'ジェ', romaji: 'je', group: 'She・Je・Che' },
  { kana: 'チェ', romaji: 'che', group: 'She・Je・Che' },
  // Lainnya yang umum
  { kana: 'イェ', romaji: 'ye', group: 'Lainnya' },
  { kana: 'ニェ', romaji: 'nye', group: 'Lainnya' },
  { kana: 'リェ', romaji: 'rye', group: 'Lainnya' },
  { kana: 'ツァ', romaji: 'tsa', group: 'ツ series' },
  { kana: 'ツィ', romaji: 'tsi', group: 'ツ series' },
  { kana: 'ツェ', romaji: 'tse', group: 'ツ series' },
  { kana: 'ツォ', romaji: 'tso', group: 'ツ series' },
]

// Yōon umum (きゃ、しゅ、ちょ dst) dimunculkan di mode "Campur"
export const YOON_KANA = [
  ['きゃ', 'kya'], ['きゅ', 'kyu'], ['きょ', 'kyo'],
  ['しゃ', 'sha'], ['しゅ', 'shu'], ['しょ', 'sho'],
  ['ちゃ', 'cha'], ['ちゅ', 'chu'], ['ちょ', 'cho'],
  ['にゃ', 'nya'], ['にゅ', 'nyu'], ['にょ', 'nyo'],
  ['ひゃ', 'hya'], ['ひゅ', 'hyu'], ['ひょ', 'hyo'],
  ['みゃ', 'mya'], ['みゅ', 'myu'], ['みょ', 'myo'],
  ['りゃ', 'rya'], ['りゅ', 'ryu'], ['りょ', 'ryo'],
  ['ぎゃ', 'gya'], ['ぎゅ', 'gyu'], ['ぎょ', 'gyo'],
  ['じゃ', 'ja'], ['じゅ', 'ju'], ['じょ', 'jo'],
  ['びゃ', 'bya'], ['びゅ', 'byu'], ['びょ', 'byo'],
  ['ぴゃ', 'pya'], ['ぴゅ', 'pyu'], ['ぴょ', 'pyo'],
]

// Kata serapan / kata lengkap yang memuat kombinasi sulit + yōon
export const LOANWORDS = [
  { kana: 'ファイル', romaji: 'fairu', arti: 'file', combo: 'ファ' },
  { kana: 'フィルム', romaji: 'firumu', arti: 'film', combo: 'フィ' },
  { kana: 'カフェ', romaji: 'kafe', arti: 'kafe', combo: 'フェ' },
  { kana: 'フォーク', romaji: 'fooku', arti: 'garpu', combo: 'フォ' },
  { kana: 'フューチャー', romaji: 'fyuuchaa', arti: 'future', combo: 'フュ' },
  { kana: 'パーティー', romaji: 'paatii', arti: 'pesta', combo: 'ティ' },
  { kana: 'ティーシャツ', romaji: 'tiishatsu', arti: 'kaos', combo: 'ティ' },
  { kana: 'ディズニー', romaji: 'dizunii', arti: 'Disney', combo: 'ディ' },
  { kana: 'ディスプレイ', romaji: 'disupurei', arti: 'layar', combo: 'ディ' },
  { kana: 'トゥデイ', romaji: 'tudei', arti: 'today', combo: 'トゥ' },
  { kana: 'デュエット', romaji: 'dyuetto', arti: 'duet', combo: 'デュ' },
  { kana: 'アンドゥ', romaji: 'andu', arti: 'undo', combo: 'ドゥ' },
  { kana: 'ウィルス', romaji: 'wirusu', arti: 'virus', combo: 'ウィ' },
  { kana: 'ウェブサイト', romaji: 'webusaito', arti: 'website', combo: 'ウェ' },
  { kana: 'ウォーキング', romaji: 'waakingu', arti: 'jalan santai', combo: 'ウォ' },
  { kana: 'ヴァイオリン', romaji: 'vaiorin', arti: 'biola', combo: 'ヴァ' },
  { kana: 'ヴィーナス', romaji: 'viinasu', arti: 'Venus', combo: 'ヴィ' },
  { kana: 'ヴェネツィア', romaji: 'venetsia', arti: 'Venesia', combo: 'ヴェ' },
  { kana: 'ヴォーカル', romaji: 'vookaru', arti: 'vokal', combo: 'ヴォ' },
  { kana: 'シェア', romaji: 'shea', arti: 'share', combo: 'シェ' },
  { kana: 'シェフ', romaji: 'shefu', arti: 'chef', combo: 'シェ' },
  { kana: 'ジェットコースター', romaji: 'jettokoosutaa', arti: 'roller coaster', combo: 'ジェ' },
  { kana: 'ジェームス', romaji: 'jeemusu', arti: 'James', combo: 'ジェ' },
  { kana: 'チェック', romaji: 'chekku', arti: 'cek', combo: 'チェ' },
  { kana: 'チェス', romaji: 'chesu', arti: 'catur', combo: 'チェ' },
  { kana: 'イェール', romaji: 'ieeru', arti: 'Yale', combo: 'イェ' },
  { kana: 'ツアー', romaji: 'tsuaa', arti: 'tur', combo: 'ツァ' },
  { kana: 'モーツァルト', romaji: 'mootsuaruto', arti: 'Mozart', combo: 'ツァ' },
  { kana: 'ツェルニー', romaji: 'tserunii', arti: 'Czerny', combo: 'ツェ' },
  // Yōon dalam kata sehari-hari
  { kana: 'きょう', romaji: 'kyou', arti: 'hari ini', combo: 'きょ' },
  { kana: 'しゅくだい', romaji: 'shukudai', arti: 'PR', combo: 'しゅ' },
  { kana: 'でんしゃ', romaji: 'densha', arti: 'kereta', combo: 'しゃ' },
  { kana: 'おちゃ', romaji: 'ocha', arti: 'teh', combo: 'ちゃ' },
  { kana: 'りょうり', romaji: 'ryouri', arti: 'masakan', combo: 'りょ' },
  { kana: 'ジュース', romaji: 'juusu', arti: 'jus', combo: 'ジュ' },
  { kana: 'チョコレート', romaji: 'chokoreeto', arti: 'cokelat', combo: 'チョ' },
  { kana: 'スケジュール', romaji: 'sukejuuru', arti: 'jadwal', combo: 'ジュ' },
  { kana: 'ショッピング', romaji: 'shoppingu', arti: 'belanja', combo: 'ショ' },
  { kana: 'ジャズ', romaji: 'jazu', arti: 'jazz', combo: 'ジャ' },
  { kana: 'びょういん', romaji: 'byouin', arti: 'rumah sakit', combo: 'びょ' },
  { kana: 'キャンプ', romaji: 'kyanpu', arti: 'kemah', combo: 'キャ' },
]
