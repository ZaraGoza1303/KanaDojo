// Kosakata frasa: Ungkapan percakapan sehari-hari + ekspresi santai/anime.
// Format sama dengan vocab lain: { id, kana, arti, alt?, contoh_kana, contoh_arti, kategori, level }.
// Varian casual/sopan ditaruh di `alt` supaya mode Essay tetap menerima beberapa jawaban.
export const VOCAB_PHRASES = [
  // ---------- Sapaan (tambahan bentuk sopan / sinonim) ----------
  { id: 409, kana: 'おはようございます', arti: 'selamat pagi (sopan)', alt: ['selamat pagi'], contoh_kana: 'おはようございます せんせい', contoh_arti: 'Selamat pagi guru', kategori: 'Sapaan', level: 1 },
  { id: 410, kana: 'おやすみ', arti: 'selamat tidur (santai)', alt: ['selamat malam', 'selamat tidur'], contoh_kana: 'おやすみ またあした', contoh_arti: 'Selamat tidur sampai besok', kategori: 'Sapaan', level: 1 },
  { id: 411, kana: 'じゃあね', arti: 'sampai nanti (santai)', alt: ['sampai jumpa', 'dah'], contoh_kana: 'じゃあね またね', contoh_arti: 'Sampai nanti ya', kategori: 'Sapaan', level: 1 },
  { id: 412, kana: 'またあした', arti: 'sampai besok', contoh_kana: 'またあした あいましょう', contoh_arti: 'Sampai besok kita bertemu', kategori: 'Sapaan', level: 1 },
  { id: 413, kana: 'またあいましょう', arti: 'sampai ketemu lagi', contoh_kana: 'またあいましょう せんせい', contoh_arti: 'Sampai ketemu lagi guru', kategori: 'Sapaan', level: 2 },
  { id: 414, kana: 'おげんきですか', arti: 'apa kabar', alt: ['apa kabar?'], contoh_kana: 'おげんきですか おかあさん', contoh_arti: 'Apa kabar ibu', kategori: 'Sapaan', level: 1 },
  { id: 415, kana: 'げんきです', arti: 'aku baik-baik saja', alt: ['baik', 'saya baik'], contoh_kana: 'はい げんきです', contoh_arti: 'Ya aku baik', kategori: 'Sapaan', level: 1 },
  { id: 416, kana: 'ひさしぶり', arti: 'lama tidak bertemu', alt: ['lama tak jumpa'], contoh_kana: 'ひさしぶりですね', contoh_arti: 'Lama tidak bertemu ya', kategori: 'Sapaan', level: 2 },
  { id: 417, kana: 'よろしくおねがいします', arti: 'mohon bantuannya (sopan)', alt: ['mohon bantuannya', 'senang berkenalan'], contoh_kana: 'よろしくおねがいします', contoh_arti: 'Mohon bantuannya', kategori: 'Sapaan', level: 1 },
  { id: 418, kana: 'こちらこそ', arti: 'saya juga (membalas)', alt: ['aku juga'], contoh_kana: 'こちらこそ よろしく', contoh_arti: 'Saya juga mohon bantuannya', kategori: 'Sapaan', level: 2 },
  { id: 419, kana: 'どうぞよろしく', arti: 'mohon bantuannya (ringkas)', alt: ['senang berkenalan'], contoh_kana: 'どうぞよろしく', contoh_arti: 'Senang berkenalan', kategori: 'Sapaan', level: 1 },

  // ---------- Ungkapan: terima kasih & maaf ----------
  { id: 420, kana: 'ありがとうございます', arti: 'terima kasih (sopan)', alt: ['terima kasih'], contoh_kana: 'ありがとうございます せんせい', contoh_arti: 'Terima kasih guru', kategori: 'Ungkapan', level: 1 },
  { id: 421, kana: 'どうもありがとうございます', arti: 'terima kasih banyak', contoh_kana: 'どうもありがとうございます', contoh_arti: 'Terima kasih banyak', kategori: 'Ungkapan', level: 2 },
  { id: 422, kana: 'どういたしまして', arti: 'sama-sama', contoh_kana: 'どういたしまして', contoh_arti: 'Sama-sama', kategori: 'Ungkapan', level: 1 },
  { id: 423, kana: 'いいえいいえ', arti: 'tidak usah', alt: ['nggak usah', 'tidak apa-apa'], contoh_kana: 'いいえいいえ どうぞ', contoh_arti: 'Tidak usah silakan', kategori: 'Ungkapan', level: 2 },
  { id: 424, kana: 'ごめん', arti: 'maaf (santai)', alt: ['maaf'], contoh_kana: 'ごめん おくれた', contoh_arti: 'Maaf aku terlambat', kategori: 'Ungkapan', level: 1 },
  { id: 425, kana: 'ごめんなさい', arti: 'maaf', alt: ['minta maaf'], contoh_kana: 'ごめんなさい せんせい', contoh_arti: 'Maaf guru', kategori: 'Ungkapan', level: 1 },
  { id: 426, kana: 'もうしわけありません', arti: 'mohon maaf sebesar-besarnya', alt: ['sangat menyesal'], contoh_kana: 'もうしわけありません', contoh_arti: 'Mohon maaf sebesar-besarnya', kategori: 'Ungkapan', level: 2 },
  { id: 427, kana: 'おせわになりました', arti: 'terima kasih atas bantuannya selama ini', contoh_kana: 'おせわになりました', contoh_arti: 'Terima kasih atas bantuannya selama ini', kategori: 'Ungkapan', level: 2 },
  { id: 428, kana: 'おつかれさま', arti: 'terima kasih atas kerja kerasnya', alt: ['kerja bagus'], contoh_kana: 'おつかれさま おとうさん', contoh_arti: 'Terima kasih atas kerja kerasnya ayah', kategori: 'Ungkapan', level: 1 },
  { id: 429, kana: 'おつかれさまでした', arti: 'terima kasih atas kerja kerasnya (lampau)', alt: ['kerja bagus'], contoh_kana: 'おつかれさまでした', contoh_arti: 'Terima kasih atas kerja kerasnya', kategori: 'Ungkapan', level: 2 },

  // ---------- Ungkapan: toko & restoran ----------
  { id: 430, kana: 'いらっしゃいませ', arti: 'selamat datang (di toko)', alt: ['selamat datang'], contoh_kana: 'いらっしゃいませ', contoh_arti: 'Selamat datang', kategori: 'Ungkapan', level: 1 },
  { id: 431, kana: 'なんめいさまですか', arti: 'untuk berapa orang', contoh_kana: 'なんめいさまですか', contoh_arti: 'Untuk berapa orang', kategori: 'Ungkapan', level: 2 },
  { id: 432, kana: 'おねがいします', arti: 'tolong', alt: ['mohon'], contoh_kana: 'おねがいします', contoh_arti: 'Tolong', kategori: 'Ungkapan', level: 1 },
  { id: 433, kana: 'これください', arti: 'tolong yang ini', alt: ['minta ini'], contoh_kana: 'これください', contoh_arti: 'Tolong yang ini', kategori: 'Ungkapan', level: 1 },
  { id: 434, kana: 'いくらですか', arti: 'berapa harganya', alt: ['berapa harga'], contoh_kana: 'いくらですか', contoh_arti: 'Berapa harganya', kategori: 'Ungkapan', level: 1 },
  { id: 435, kana: 'おかいけいおねがいします', arti: 'tolong bon-nya', alt: ['tolong bill-nya'], contoh_kana: 'おかいけいおねがいします', contoh_arti: 'Tolong bon-nya', kategori: 'Ungkapan', level: 2 },
  { id: 436, kana: 'おじゃまします', arti: 'permisi (masuk)', alt: ['permisi'], contoh_kana: 'おじゃまします', contoh_arti: 'Permisi', kategori: 'Ungkapan', level: 1 },
  { id: 437, kana: 'ありがとうございました', arti: 'terima kasih (lampau)', alt: ['terima kasih'], contoh_kana: 'ありがとうございました', contoh_arti: 'Terima kasih', kategori: 'Ungkapan', level: 1 },
  { id: 438, kana: 'またおこしください', arti: 'silakan datang lagi', contoh_kana: 'またおこしください', contoh_arti: 'Silakan datang lagi', kategori: 'Ungkapan', level: 2 },

  // ---------- Ungkapan: makan & minum ----------
  { id: 439, kana: 'かんぱい', arti: 'bersulang', alt: ['tos'], contoh_kana: 'かんぱい', contoh_arti: 'Bersulang', kategori: 'Ungkapan', level: 1 },
  { id: 440, kana: 'おかわりおねがいします', arti: 'tolong tambah lagi', alt: ['minta tambah'], contoh_kana: 'おかわりおねがいします', contoh_arti: 'Tolong tambah lagi', kategori: 'Ungkapan', level: 2 },
  { id: 441, kana: 'おあがりください', arti: 'silakan dimakan', alt: ['silakan'], contoh_kana: 'おあがりください', contoh_arti: 'Silakan dimakan', kategori: 'Ungkapan', level: 2 },
  { id: 442, kana: 'めしあがれ', arti: 'silakan makan', alt: ['silakan'], contoh_kana: 'めしあがれ', contoh_arti: 'Silakan makan', kategori: 'Ungkapan', level: 2 },

  // ---------- Ungkapan: di rumah ----------
  { id: 443, kana: 'いってらっしゃい', arti: 'hati-hati di jalan', alt: ['selamat jalan'], contoh_kana: 'いってらっしゃい', contoh_arti: 'Hati-hati di jalan', kategori: 'Ungkapan', level: 1 },
  { id: 444, kana: 'どうぞおあがりください', arti: 'silakan masuk', contoh_kana: 'どうぞおあがりください', contoh_arti: 'Silakan masuk', kategori: 'Ungkapan', level: 2 },

  // ---------- Ungkapan: kantor & sekolah ----------
  { id: 445, kana: 'しつれいします', arti: 'permisi (masuk atau keluar)', alt: ['permisi'], contoh_kana: 'しつれいします', contoh_arti: 'Permisi', kategori: 'Ungkapan', level: 1 },
  { id: 446, kana: 'おさきにしつれいします', arti: 'permisi saya pulang duluan', contoh_kana: 'おさきにしつれいします', contoh_arti: 'Permisi saya pulang duluan', kategori: 'Ungkapan', level: 2 },
  { id: 447, kana: 'おつかれさまです', arti: 'sapaan ke rekan kerja', contoh_kana: 'おつかれさまです', contoh_arti: 'Sapaan ke rekan kerja', kategori: 'Ungkapan', level: 1 },
  { id: 448, kana: 'わかりました', arti: 'saya mengerti', alt: ['mengerti', 'paham'], contoh_kana: 'わかりました せんせい', contoh_arti: 'Saya mengerti guru', kategori: 'Ungkapan', level: 1 },
  { id: 449, kana: 'かしこまりました', arti: 'baik, siap', alt: ['siap'], contoh_kana: 'かしこまりました', contoh_arti: 'Baik siap', kategori: 'Ungkapan', level: 2 },
  { id: 450, kana: 'しょうちしました', arti: 'baik, saya setuju', alt: ['setuju'], contoh_kana: 'しょうちしました', contoh_arti: 'Baik saya setuju', kategori: 'Ungkapan', level: 2 },

  // ---------- Ungkapan: meminta & menawarkan ----------
  { id: 451, kana: 'ちょっとまってください', arti: 'tolong tunggu sebentar', alt: ['tunggu sebentar'], contoh_kana: 'ちょっとまってください', contoh_arti: 'Tolong tunggu sebentar', kategori: 'Ungkapan', level: 1 },
  { id: 452, kana: 'てつだってください', arti: 'tolong bantu', alt: ['bantu aku'], contoh_kana: 'てつだってください', contoh_arti: 'Tolong bantu', kategori: 'Ungkapan', level: 1 },
  { id: 453, kana: 'どうぞ', arti: 'silakan', contoh_kana: 'どうぞ はいってください', contoh_arti: 'Silakan masuk', kategori: 'Ungkapan', level: 1 },

  // ---------- Ungkapan: respons sehari-hari ----------
  { id: 454, kana: 'はい', arti: 'ya', alt: ['iya'], contoh_kana: 'はい わかりました', contoh_arti: 'Ya saya mengerti', kategori: 'Ungkapan', level: 1 },
  { id: 455, kana: 'いいえ', arti: 'tidak', alt: ['bukan', 'enggak'], contoh_kana: 'いいえ ちがいます', contoh_arti: 'Tidak bukan', kategori: 'Ungkapan', level: 1 },
  { id: 456, kana: 'そうですね', arti: 'iya ya', alt: ['benar juga'], contoh_kana: 'そうですね', contoh_arti: 'Iya ya', kategori: 'Ungkapan', level: 1 },
  { id: 457, kana: 'そうですか', arti: 'oh begitu', alt: ['ya begitu'], contoh_kana: 'そうですか', contoh_arti: 'Oh begitu', kategori: 'Ungkapan', level: 1 },
  { id: 458, kana: 'なるほど', arti: 'oh begitu, paham', alt: ['paham'], contoh_kana: 'なるほど', contoh_arti: 'Oh begitu', kategori: 'Ungkapan', level: 1 },
  { id: 459, kana: 'ほんとう', arti: 'beneran', alt: ['sungguh', 'benar'], contoh_kana: 'ほんとうですか', contoh_arti: 'Beneran', kategori: 'Ungkapan', level: 1 },
  { id: 460, kana: 'だいじょうぶ', arti: 'tidak apa-apa', alt: ['baik-baik saja', 'aman'], contoh_kana: 'だいじょうぶです', contoh_arti: 'Tidak apa-apa', kategori: 'Ungkapan', level: 1 },
  { id: 461, kana: 'いいですよ', arti: 'boleh', alt: ['tidak usah'], contoh_kana: 'いいですよ', contoh_arti: 'Boleh', kategori: 'Ungkapan', level: 1 },
  { id: 462, kana: 'わからない', arti: 'tidak mengerti', alt: ['tidak paham'], contoh_kana: 'わからない', contoh_arti: 'Tidak mengerti', kategori: 'Ungkapan', level: 1 },
  { id: 463, kana: 'しりません', arti: 'tidak tahu', alt: ['nggak tahu'], contoh_kana: 'しりません', contoh_arti: 'Tidak tahu', kategori: 'Ungkapan', level: 1 },

  // ---------- Ungkapan: perayaan & momen khusus ----------
  { id: 464, kana: 'おめでとう', arti: 'selamat', alt: ['selamat ya'], contoh_kana: 'おめでとう', contoh_arti: 'Selamat', kategori: 'Ungkapan', level: 1 },
  { id: 465, kana: 'おめでとうございます', arti: 'selamat (sopan)', alt: ['selamat'], contoh_kana: 'おめでとうございます', contoh_arti: 'Selamat', kategori: 'Ungkapan', level: 1 },
  { id: 466, kana: 'たんじょうびおめでとう', arti: 'selamat ulang tahun', contoh_kana: 'たんじょうびおめでとう', contoh_arti: 'Selamat ulang tahun', kategori: 'Ungkapan', level: 1 },
  { id: 467, kana: 'おたんじょうびおめでとう', arti: 'selamat ulang tahun (sopan)', alt: ['selamat ulang tahun'], contoh_kana: 'おたんじょうびおめでとう', contoh_arti: 'Selamat ulang tahun', kategori: 'Ungkapan', level: 2 },
  { id: 468, kana: 'おたんじょうびおめでとうございます', arti: 'selamat ulang tahun (sangat sopan)', alt: ['selamat ulang tahun'], contoh_kana: 'おたんじょうびおめでとうございます', contoh_arti: 'Selamat ulang tahun', kategori: 'Ungkapan', level: 2 },
  { id: 469, kana: 'あけましておめでとうございます', arti: 'selamat tahun baru', contoh_kana: 'あけましておめでとうございます', contoh_arti: 'Selamat tahun baru', kategori: 'Ungkapan', level: 2 },
  { id: 470, kana: 'ことしもよろしくおねがいします', arti: 'mohon bantuannya tahun ini juga', contoh_kana: 'ことしもよろしくおねがいします', contoh_arti: 'Mohon bantuannya tahun ini juga', kategori: 'Ungkapan', level: 2 },
  { id: 471, kana: 'がんばって', arti: 'semangat', alt: ['semangat ya'], contoh_kana: 'がんばって', contoh_arti: 'Semangat', kategori: 'Ungkapan', level: 1 },
  { id: 472, kana: 'がんばりましょう', arti: 'ayo kita berjuang', alt: ['ayo semangat'], contoh_kana: 'がんばりましょう', contoh_arti: 'Ayo kita berjuang', kategori: 'Ungkapan', level: 2 },

  // ---------- Ungkapan: frasa harian lain ----------
  { id: 473, kana: 'きをつけて', arti: 'hati-hati', contoh_kana: 'きをつけて かえってください', contoh_arti: 'Hati-hati pulang', kategori: 'Ungkapan', level: 1 },
  { id: 474, kana: 'おだいじに', arti: 'semoga lekas sembuh', alt: ['lekas sembuh'], contoh_kana: 'おだいじに', contoh_arti: 'Semoga lekas sembuh', kategori: 'Ungkapan', level: 2 },
  { id: 475, kana: 'りょうかい', arti: 'siap, paham', alt: ['siap', 'paham'], contoh_kana: 'りょうかい', contoh_arti: 'Siap paham', kategori: 'Ungkapan', level: 2 },
  { id: 476, kana: 'もちろん', arti: 'tentu saja', contoh_kana: 'もちろん いきます', contoh_arti: 'Tentu saja pergi', kategori: 'Ungkapan', level: 1 },
  { id: 477, kana: 'たぶん', arti: 'mungkin', contoh_kana: 'たぶん いきます', contoh_arti: 'Mungkin pergi', kategori: 'Ungkapan', level: 1 },
  { id: 478, kana: 'ぜひ', arti: 'tentu, silakan', contoh_kana: 'ぜひ きてください', contoh_arti: 'Tentu silakan datang', kategori: 'Ungkapan', level: 2 },
  { id: 479, kana: 'おまたせしました', arti: 'maaf menunggu', alt: ['maaf membuat menunggu'], contoh_kana: 'おまたせしました', contoh_arti: 'Maaf menunggu', kategori: 'Ungkapan', level: 2 },
  { id: 480, kana: 'きにしないで', arti: 'jangan khawatir', alt: ['tidak perlu khawatir'], contoh_kana: 'きにしないで', contoh_arti: 'Jangan khawatir', kategori: 'Ungkapan', level: 2 },
  { id: 481, kana: 'まかせて', arti: 'serahkan padaku', alt: ['biar aku'], contoh_kana: 'まかせて', contoh_arti: 'Serahkan padaku', kategori: 'Ungkapan', level: 2 },
  { id: 482, kana: 'だいじょうぶですか', arti: 'kamu baik-baik saja', alt: ['kamu tidak apa-apa'], contoh_kana: 'だいじょうぶですか', contoh_arti: 'Kamu baik-baik saja', kategori: 'Ungkapan', level: 2 },
  { id: 483, kana: 'いそいで', arti: 'cepat', alt: ['buruan'], contoh_kana: 'いそいで', contoh_arti: 'Cepat', kategori: 'Ungkapan', level: 1 },
  { id: 484, kana: 'ゆっくり', arti: 'pelan-pelan', alt: ['santai'], contoh_kana: 'ゆっくり はなしてください', contoh_arti: 'Bicara pelan-pelan', kategori: 'Ungkapan', level: 1 },

  // ---------- Slang & anime ----------
  { id: 485, kana: 'やった', arti: 'berhasil', alt: ['hore'], contoh_kana: 'やった', contoh_arti: 'Berhasil', kategori: 'Slang/Anime', level: 2 },
  { id: 486, kana: 'すごい', arti: 'keren', alt: ['hebat'], contoh_kana: 'すごいですね', contoh_arti: 'Keren ya', kategori: 'Slang/Anime', level: 1 },
  { id: 487, kana: 'かわいい', arti: 'lucu', alt: ['imut'], contoh_kana: 'かわいいですね', contoh_arti: 'Lucu ya', kategori: 'Slang/Anime', level: 1 },
  { id: 488, kana: 'やばい', arti: 'gawat', alt: ['parah', 'keren banget'], contoh_kana: 'やばい', contoh_arti: 'Gawat', kategori: 'Slang/Anime', level: 2 },
  { id: 489, kana: 'もう', arti: 'ih aduh', alt: ['aduh'], contoh_kana: 'もう', contoh_arti: 'Ih aduh', kategori: 'Slang/Anime', level: 2 },
  { id: 490, kana: 'あらあら', arti: 'wah wah', contoh_kana: 'あらあら', contoh_arti: 'Wah wah', kategori: 'Slang/Anime', level: 2 },
  { id: 491, kana: 'えっ', arti: 'hah', alt: ['ha?'], contoh_kana: 'えっ', contoh_arti: 'Hah', kategori: 'Slang/Anime', level: 1 },
  { id: 492, kana: 'ちょっと', arti: 'sebentar', alt: ['tunggu dulu'], contoh_kana: 'ちょっと まって', contoh_arti: 'Sebentar tunggu', kategori: 'Slang/Anime', level: 1 },
  { id: 493, kana: 'うるさい', arti: 'berisik', contoh_kana: 'うるさい', contoh_arti: 'Berisik', kategori: 'Slang/Anime', level: 2 },
  { id: 494, kana: 'ばか', arti: 'bodoh', alt: ['goblok'], contoh_kana: 'ばか', contoh_arti: 'Bodoh', kategori: 'Slang/Anime', level: 1 },
  { id: 495, kana: 'なに', arti: 'apa', contoh_kana: 'なに', contoh_arti: 'Apa', kategori: 'Slang/Anime', level: 1 },
  { id: 496, kana: 'だめ', arti: 'jangan', alt: ['tidak boleh'], contoh_kana: 'だめ', contoh_arti: 'Jangan', kategori: 'Slang/Anime', level: 1 },
  { id: 497, kana: 'まじで', arti: 'serius', alt: ['beneran?'], contoh_kana: 'まじで', contoh_arti: 'Serius', kategori: 'Slang/Anime', level: 2 },
]
