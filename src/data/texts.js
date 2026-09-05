// Teks latihan Mode Translate hiragana/katakana murni (tanpa kanji),
// spasi antar-kata agar mudah dibaca dan romaji bisa digenerate akurat.
// romaji digenerate otomatis via lib/romaji.js (tidak perlu ditulis manual).
// difficulty: 1 (mudah) | 2 (menengah) | 3 (menantang)

export const TEXTS = [
  // ---------- LEVEL 1 : kehidupan sehari-hari ----------
  {
    id: 1, category: 'Keseharian', difficulty: 1,
    kana: 'わたしは まいあさ ろくじに おきます。それから、シャワーを あびます。しちじに パンと たまごを たべます。がっこうへは ちかてつで いきます。',
  },
  {
    id: 2, category: 'Keseharian', difficulty: 1,
    kana: 'きょうは とても てんきが いいです。こうえんへ おさんぽに いきました。いぬと いっしょに ゆっくり あるきました。とても たのしかったです。',
  },
  {
    id: 3, category: 'Makanan', difficulty: 1,
    kana: 'わたしの すきな たべものは ラーメンです。しゅうまつに ともだちと ラーメンてんへ いきます。しおラーメンが いちばん すきです。スープも のみます。',
  },
  {
    id: 4, category: 'Belajar', difficulty: 1,
    kana: 'やまださんは がくせいです。まいにち としょかんで べんきょうします。にほんごと えいごを べんきょうしています。しょうらいは つうやくに なりたいです。',
  },
  {
    id: 5, category: 'Percakapan', difficulty: 1,
    kana: '「ひろしさん、しゅうまつは なにを しましたか。」「ともだちと うみへ いきました。」「いいですね。てんきは どうでしたか。」「とても よかったです。でも、すこし あつかったです。」',
  },
  {
    id: 6, category: 'Keseharian', difficulty: 1,
    kana: 'わたしは まいばん じゅういちじに ねます。でも、きのうは おもしろい えいがを みていました。だから、きょうは すこし ねむいです。コーヒーを のみました。',
  },
  {
    id: 7, category: 'Musim & Cuaca', difficulty: 1,
    kana: 'わたしの まちには きれいな こうえんが あります。はるに さくらが さきます。たくさんの ひとが はなみに きます。みんな おべんとうを もって いきます。',
  },
  {
    id: 8, category: 'Percakapan', difficulty: 1,
    kana: '「すみません、この セーターは いくらですか。」「それは ごせんえんです。」「ちょっと たかいですね。もっと やすいのは ありますか。」「はい、こちらは さんぜんえんです。」',
  },
  {
    id: 9, category: 'Acara & Ulang tahun', difficulty: 1,
    kana: 'たなかさんの たんじょうびは ごがつ じゅうごにちです。パーティーで ケーキを つくります。プレゼントは ブックカバーに します。たのしみですね。',
  },
  {
    id: 10, category: 'Makanan', difficulty: 1,
    kana: 'わたしは まいあさ じぶんで ごはんを つくります。たまごやきと みそしるが とくいです。ひるは がっこうで たべます。よるは サラダも たべます。けんこうに きをつけています。',
  },

  // ---------- LEVEL 2 : rencana, pekerjaan, cerita sehari-hari ----------
  {
    id: 11, category: 'Rencana & Liburan', difficulty: 2,
    kana: 'らいしゅう、きょうとへ りょこうに いきます。しんかんせんの キップは もう かいました。ホテルは えきの ちかくで、とても べんりです。じんじゃも みたいです。たのしみです。',
  },
  {
    id: 12, category: 'Pekerjaan', difficulty: 2,
    kana: 'すずきさんは コンピューターの かいしゃで はたらいています。まいにち たいへんですが、しごとは おもしろいです。しゅうまつは ゲームを したり、スポーツを したり します。',
  },
  {
    id: 13, category: 'Olahraga & Kesehatan', difficulty: 2,
    kana: 'わたしは うんどうが きらいでした。でも、らいげつから プールに かようことに しました。まいにち さんじゅっぷん およぐと、からだが かるくなると おもいます。がんばります。',
  },
  {
    id: 14, category: 'Percakapan', difficulty: 2,
    kana: '「ごちゅうもんは おきまりですか。」「ハンバーガーセットを ふたつ おねがいします。」「おのみものは？」「アイスティーを ひとつと、コーラを ひとつ ください。」「はいかしこまりました。」',
  },
  {
    id: 15, category: 'Musim & Cuaca', difficulty: 2,
    kana: 'にほんの ふゆは たいへん さむいです。ゆきが ふると、こどもたちは ゆきだるまを つくります。わたしの こどもの ころを おもいだします。あったかい おちゃが のみたくなりますね。',
  },
  {
    id: 16, category: 'Impian', difficulty: 2,
    kana: 'わたしの ゆめは せかいを りょこうすることです。まずは アジアの いろいろな くにを まわってみたいです。かねを ためています。あまり つかわないように しています。',
  },
  {
    id: 17, category: 'Belanja & Masak', difficulty: 2,
    kana: 'きょうは スーパーで やすい やさいを かいました。キャベツと にんじんと たまねぎです。よるは カレーライスを つくろうと おもいます。じかんが かかりますが、おいしいと おもいます。',
  },
  {
    id: 18, category: 'Cerita pendek', difficulty: 2,
    kana: 'まちなかで ふしぎな みせを みつけました。ドアに 「ようこそ」と かいてあります。はいってみると、ふるい ほんが たくさん ありました。てんいんさんは しんせつで、コーヒーも だしてくれました。',
  },
  {
    id: 19, category: 'Percakapan', difficulty: 2,
    kana: '「あした、ひまですか。」「ごめんなさい、よていが あります。」「なんの よていですか。」「かぞくと どうぶつえんへ いくんです。いもうとの たんじょうびなんです。」「そうですか。たのしんで ください。」',
  },
  {
    id: 20, category: 'Pekerjaan', difficulty: 2,
    kana: 'わたしは まいにち アルバイトを しています。きっさてんで はたらいています。コーヒーの いれかたを おぼえました。いまでは ラテアートも できます。きゃくさんに きもちいい と いわれます。',
  },
  {
    id: 21, category: 'Keseharian', difficulty: 2,
    kana: 'うちの ちかくに ちいさな ラーメンやが あります。そこは ぎょうざが とても おいしいです。てんいんは いつも げんきで、たびたび おまけを くれます。しゅうに いっかいは かよって います。',
  },
  {
    id: 22, category: 'Olahraga & Kesehatan', difficulty: 2,
    kana: 'さいきん、パソコンを つかう じかんが おおくて、めが つかれます。いしゃに みてもらったら、めを やすませるように いわれました。いちじかんに いっかい、きゅうけいを する ように しています。',
  },

  // ---------- LEVEL 3 : cerita lebih panjang & padat ----------
  {
    id: 23, category: 'Cerita pendek', difficulty: 3,
    kana: 'きのうの よる、とつぜん じしんが ありました。テーブルの したに もぐって、じょうきょうが おちつくのを まちました。テレビの ニュースを みて、わりと はやく おさまったことを しりました。けっこう こわかったです。',
  },
  {
    id: 24, category: 'Belajar', difficulty: 3,
    kana: 'にほんごの べんきょうで いちばん たいへんなのは、かんじだと おもいます。でも、かなを ちゃんと おぼえてしまえば、ごいも ぶんぽうも ずっと やさしく かんじます。まずは まいにち すこしずつ つづけることが たいせつです。',
  },
  {
    id: 25, category: 'Keseharian', difficulty: 3,
    kana: 'わたしが すんでいる アパートは えきから とおいですが、やちんが やすいです。まわりに コンビニが ありません。だから、かえる とき、かならず スーパーに よります。たいへんですが、まいにち あるくので けんこうに なったと おもいます。',
  },
  {
    id: 26, category: 'Percakapan', difficulty: 3,
    kana: '「しつれいします。」「どうぞ、おかけください。」「はい。よろしく おねがいします。」「まず、かんたんに じこしょうかいを おねがいできますか。」「はい。わたしは いとう はると もうします。だいがくでは けいざいを べんきょうしました。」',
  },
  {
    id: 27, category: 'Musim & Cuaca', difficulty: 3,
    kana: 'らいしゅうは あたたかい ひが おおくなるそうです。さくらが はやく さくかもしれません。はなみの よていを たてている ひとが おおいです。ベンチで おべんとうを たべながら、はなを みたいです。',
  },
  {
    id: 28, category: 'Percakapan', difficulty: 3,
    kana: '「すみません、かばんを でんしゃの なかに わすれて しまいました。」「どの でんしゃですか。」「さっきの くじはんの でんしゃです。」「かたちと いろを おしえて ください。」「くろい、しかくい かばんです。ポケットが ついています。」',
  },
  {
    id: 29, category: 'Sekolah & Acara', difficulty: 3,
    kana: 'わたしの だいがくでは、りゅうがくせいが おおいです。きのうは こくさいこうりゅうかいに さんかしました。いろいろな くにの ひとと はなして、せかいが ひろくなった きが します。つぎは イベントの けいかくを つくりたいです。',
  },
  {
    id: 30, category: 'Hobi', difficulty: 3,
    kana: 'わたしは ギターを ひくのが すきです。すきな バンドの きょくを まねしたり、じぶんで しんきょくを つくったり します。らいぶは いつも チケットが すぐ きれて しまいます。こんど、だいがくの おんがくさいで えんそうする よていです。',
  },
  {
    id: 31, category: 'Belanja Online', difficulty: 3,
    kana: 'ネットショッピングで セーターを かいました。サイズを まちがえて、ちょっと きつかったです。でも、せんたくしたら、ちょうど よく なりました。レビューを かくのを わすれて いました。あとで かきます。',
  },
  {
    id: 32, category: 'Cerita pendek', difficulty: 3,
    kana: 'あめの ひは、でんしゃが こんでいて いやです。それに、かさを わすれやすいので きをつけなければ なりません。きょうは としょかんに いって、すきな しょうせつを よみます。あめの おとを ききながら よむ ほんは とくべつな きぶんに なります。',
  },
  {
    id: 33, category: 'Sekolah & Acara', difficulty: 3,
    kana: 'おしょうがつに かぞくで おてらへ まいりました。おみくじを ひいたら、だいきちでした。おせちりょうりは おかあさんが つくってくれました。こどもたちは おとしだまを もらって、とても よろこんでいました。',
  },
  {
    id: 34, category: 'Hobi', difficulty: 3,
    kana: 'わたしは しゃしんを とることと、りょこうが だいすきです。しゅうまつごとに、ちかい まちを あるいて いい しゅっちょうを さがします。しゃしんは ネットに はります。たくさんの ひとに みてもらえると、とても うれしいです。',
  },
  {
    id: 35, category: 'Pekerjaan', difficulty: 3,
    kana: 'らいしゅうから ざいたくではたらくことに なりました。でんしゃに のらなくても いいので、みんな よろこんでいます。でも、オンラインかいぎが おおくなって、たいへんな ことも あります。じかんを じょうずに つかいたいです。',
  },
  {
    id: 36, category: 'Cerita pendek', difficulty: 3,
    kana: 'こどもの とき、いぬを かって いました。なまえは ポチです。まいにち いっしょに こうえんを さんぽして、いっしょに あそびました。ポチは じゅうごさいまで いきました。いまでも ときどき ゆめに でてきます。',
  },
  {
    id: 37, category: 'Makanan', difficulty: 3,
    kana: 'にちようびは かぞくと デパートの レストランへ いきました。わたしは ステーキセットを、おとうとは パスタを たのみました。デザートに アイスクリームも たべました。ごちそうしてもらったので、とても うれしかったです。',
  },
  {
    id: 38, category: 'Rencana & Liburan', difficulty: 3,
    kana: 'なつやすみに ともだちと ふじさんに のぼる けいかくを しています。よなかから のぼって、あさひを てっぺんで みるつもりです。アウトドアようの くつも かいました。あまり つかれて いなければ いいのですが。',
  },

  // ---------- EXTENDED: 39-100 (mix variatif) ----------
  {
    id: 39, category: 'Teknologi', difficulty: 1,
    kana: 'スマホで しゃしんを とりました。とても きれいです。ともだちに おくりました。へんじが すぐに きました。',
  },
  {
    id: 40, category: 'Anime & Manga', difficulty: 1,
    kana: 'わたしは アニメが だいすきです。まいしゅう あたらしい エピソードを みます。キャラクターが かっこいいです。',
  },
  {
    id: 41, category: 'Traveling Modern', difficulty: 1,
    kana: 'えきで チケットを かいました。しんかんせんで とうきょうへ いきます。まどから ふじさんが みえます。',
  },
  {
    id: 42, category: 'Kuliner', difficulty: 1,
    kana: 'コンビニで おにぎりを かいました。ツナマヨが おいしいです。おちゃも いっしょに かいました。',
  },
  {
    id: 43, category: 'Kantor & Bisnis', difficulty: 1,
    kana: 'かいしゃで メールを かきます。まいあさ れんらくを します。ひるに ミーティングが あります。',
  },
  {
    id: 44, category: 'Hobi Digital', difficulty: 1,
    kana: 'スマホで ゲームを します。パズルゲームが すきです。しゅうまつは いちじかん あそびます。',
  },
  {
    id: 45, category: 'Keseharian', difficulty: 1,
    kana: 'あさは トーストと コーヒーです。ひるは コンビニの おべんとうを たべます。よるは うどんを つくります。',
  },
  {
    id: 46, category: 'Musik & Streaming', difficulty: 1,
    kana: 'ユーチューブで おんがくを ききます。すきな アーティストの ライブを みました。とても たのしかったです。',
  },
  {
    id: 47, category: 'Belanja Online', difficulty: 1,
    kana: 'ネットで スニーカーを かいました。サイズは エムです。いろは しろと くろです。はくのが たのしみです。',
  },
  {
    id: 48, category: 'Olahraga', difficulty: 1,
    kana: 'まいあさ ジョギングを します。こうえんで はしります。あせを かくと きもちいいです。',
  },
  {
    id: 49, category: 'Percakapan', difficulty: 1,
    kana: '「この アプリ、しってる？」「うん、べんりだよね。」「そう、まいにち つかってる。」',
  },
  {
    id: 50, category: 'Kuliner', difficulty: 1,
    kana: 'ラーメンやで ギョーザも たのみました。ビールも のみました。おなかが いっぱいです。',
  },
  {
    id: 51, category: 'Teknologi', difficulty: 2,
    kana: 'さいきん、エーアイで えを つくっています。プロンプトを かくと、すぐに えが できます。とても おもしろいですが、ときどき へんな えに なります。',
  },
  {
    id: 52, category: 'Anime & Manga', difficulty: 2,
    kana: 'ジャンプの マンガを まいしゅう よみます。バトルシーンが すごいです。らいしゅうの てんかいが たのしみです。アニメも みています。',
  },
  {
    id: 53, category: 'Traveling Modern', difficulty: 2,
    kana: 'エアビーアンドビーで アパートを よやくしました。えきから あるいて ごふんです。レビューが よかったので きめました。',
  },
  {
    id: 54, category: 'Kantor & Bisnis', difficulty: 2,
    kana: 'リモートワークで ズームかいぎを します。マイクが オフに なっていて、きづきませんでした。みんなが わらいました。',
  },
  {
    id: 55, category: 'Hobi Digital', difficulty: 2,
    kana: 'ツイッターで しゃしんを シェアしました。いいねが たくさん つきました。フォロワーが ふえました。うれしいです。',
  },
  {
    id: 56, category: 'Kuliner', difficulty: 2,
    kana: 'ウーバーイーツで カレーを ちゅうもんしました。ナンと サラダも ついていました。はこが きれいでした。おいしかったです。',
  },
  {
    id: 57, category: 'Musik & Streaming', difficulty: 2,
    kana: 'スポティファイで プレイリストを つくりました。ドライブようの きょくを あつめました。ともだちに シェアしました。',
  },
  {
    id: 58, category: 'Belajar', difficulty: 2,
    kana: 'ユーチューブで にほんごを べんきょうします。ネイティブの はなしを きいて、シャドーイングを します。まいにち つづけています。',
  },
  {
    id: 59, category: 'Keseharian', difficulty: 2,
    kana: 'スマートウォッチで ほすうを はかります。いちまんぽ あるくと、おしらせが きます。けんこうの ために がんばります。',
  },
  {
    id: 60, category: 'Percakapan', difficulty: 2,
    kana: '「しゅうまつ、カラオケに いかない？」「いいね。なにを うたう？」「ボカロの きょくが うたいたい。」',
  },
  {
    id: 61, category: 'Teknologi', difficulty: 2,
    kana: 'パスワードを わすれました。リセットの メールが こないので、サポートに れんらくしました。へんじを まっています。',
  },
  {
    id: 62, category: 'Olahraga & Kesehatan', difficulty: 2,
    kana: 'ジムに かよいはじめました。トレーナーに メニューを つくって もらいました。きんにくが すこし つきました。',
  },
  {
    id: 63, category: 'Traveling Modern', difficulty: 2,
    kana: 'グーグルマップで みせを さがしました。レビューを よんで、いちばん ひょうかが いい みせに いきました。',
  },
  {
    id: 64, category: 'Kantor & Bisnis', difficulty: 2,
    kana: 'エクセルで ひょうを つくりました。グラフも つくりました。じょうしに ほめられました。うれしかったです。',
  },
  {
    id: 65, category: 'Hobi Digital', difficulty: 2,
    kana: 'スイッチで ゲームを します。オンラインで ともだちと あそびます。ボイスチャットを しながら たたかいます。',
  },
  {
    id: 66, category: 'Anime & Manga', difficulty: 2,
    kana: 'コミケに はじめて いきました。ひとが とても おおかったです。すきな サークルの ほんを かえました。たからものです。',
  },
  {
    id: 67, category: 'Kuliner', difficulty: 2,
    kana: 'スタバで しんさくのアイスを のみました。クリームが おおかったです。しゃしんを とって インスタに あげました。',
  },
  {
    id: 68, category: 'Keseharian', difficulty: 2,
    kana: 'アマゾンで ほんを かいました。 kindle で よみます。よる ねるまえに すこしずつ よみます。',
  },
  {
    id: 69, category: 'Teknologi', difficulty: 3,
    kana: 'チャットジーピーティーに レポートを てつだって もらいました。ぶんしょうを なおして もらいました。でも、じぶんで かくことが たいせつだと おもいました。',
  },
  {
    id: 70, category: 'Anime & Manga', difficulty: 3,
    kana: 'さいきんの アニメは エフェクトが すごいです。スタジオが じかんを かけて つくったことが わかります。ブルーレイを かって、なんかいも みています。',
  },
  {
    id: 71, category: 'Traveling Modern', difficulty: 3,
    kana: 'エルシーシーで ひこうきの チケットを かいました。よやくサイトで セールを みつけました。きゃりーばっぐだけで りょこうします。けいひを せつやくできました。',
  },
  {
    id: 72, category: 'Kantor & Bisnis', difficulty: 3,
    kana: 'スラックで プロジェクトの しんちょくを ほうこくしました。タスクを かんばんで かんりしています。しめきりに まにあうように がんばります。',
  },
  {
    id: 73, category: 'Hobi Digital', difficulty: 3,
    kana: 'ティックトックで ダンスどうがを とうこうしました。へんしゅうアプリで エフェクトを つけました。さいせいかいすうが きゅうに ふえました。',
  },
  {
    id: 74, category: 'Musik & Streaming', difficulty: 3,
    kana: 'ネットフリックスで ドラマを いっきみしました。ストーリーが おもしろくて、とまることが できませんでした。レビューを かこうと おもいます。',
  },
  {
    id: 75, category: 'Kuliner', difficulty: 3,
    kana: 'デリバリーアプリで タピオカミルクティーを たのみました。ポイントが たまっていたので、わりびきに なりました。チャイムが なって、すぐに とどきました。',
  },
  {
    id: 76, category: 'Belajar', difficulty: 3,
    kana: 'オンラインこうざで プログラミングを ならっています。パイソンの きそを べんきょうしました。エラーを なおすのが むずかしいですが、たのしいです。',
  },
  {
    id: 77, category: 'Keseharian', difficulty: 3,
    kana: 'スマートスピーカーに 「あしたの てんきは？」と ききました。へんじが かえってきました。アラームも セットして もらいました。べんりな じだいです。',
  },
  {
    id: 78, category: 'Percakapan', difficulty: 3,
    kana: '「この げんこう、チェックして もらえますか。」「いいですよ。ごじまで みておきます。」「ありがとうございます。たすかります。」',
  },
  {
    id: 79, category: 'Olahraga & Kesehatan', difficulty: 3,
    kana: 'ユーチューブの トレーニングどうがを みて、うちで うんどうしています。インストラクターが やさしく おしえてくれます。おかねも かかりません。',
  },
  {
    id: 80, category: 'Teknologi', difficulty: 3,
    kana: 'スマホの バッテリーが すぐに なくなります。せっていを みたら、アプリが バックグラウンドで うごいていました。オフに したら、よくなりました。',
  },
  {
    id: 81, category: 'Anime & Manga', difficulty: 3,
    kana: 'フィギュアを ネットオークションで かいました。げんていばんでした。はこを あけるとき、とても きんちょうしました。だいじに かざっています。',
  },
  {
    id: 82, category: 'Traveling Modern', difficulty: 3,
    kana: 'グーグルトランスレートで メニューを よみました。しゃしんで ほんやくできるので、とても べんりです。ちゅうもんを まちがえずに すみました。',
  },
  {
    id: 83, category: 'Kantor & Bisnis', difficulty: 3,
    kana: 'プレゼンの スライドを パワーポイントで つくりました。グラフと しゃしんを いれました。リハーサルを なんかいも しました。きんちょうします。',
  },
  {
    id: 84, category: 'Hobi Digital', difficulty: 3,
    kana: 'フォトショップで しゃしんを しゅうせいしました。めいどを あかるくして、いらない ものを けしました。プロみたいに なりました。',
  },
  {
    id: 85, category: 'Kuliner', difficulty: 3,
    kana: 'インスタで みた カフェに いきました。パンケーキが めいぶつです。クリームと イチゴが のっていました。ぎょうれつに ならびましたが、まんぞくです。',
  },
  {
    id: 86, category: 'Belanja Online', difficulty: 3,
    kana: 'メルカリで ふくを うりました。しゃしんを とって、せつめいを かきました。すぐに かいてが みつかりました。そうりょうも かんたんでした。',
  },
  {
    id: 87, category: 'Keseharian', difficulty: 3,
    kana: 'ラインで グループを つくりました。りょこうの けいかくを はなしています。カレンダーきのうで よていを あわせました。べんりです。',
  },
  {
    id: 88, category: 'Percakapan', difficulty: 3,
    kana: '「データの バックアップ、とりましたか。」「はい、クラウドに ほぞんしました。」「よかった。あんしんです。」',
  },
  {
    id: 89, category: 'Teknologi', difficulty: 3,
    kana: 'パソコンが とつぜん おそくなりました。さいきどうしたら、アップデートが はじまりました。じかんが かかりましたが、あたらしい きのうが つかえるように なりました。',
  },
  {
    id: 90, category: 'Musik & Streaming', difficulty: 3,
    kana: 'カラオケアプリで うたを ろくおんしました。エコーを かけて、ミックスしました。エスエヌエスに シェアしたら、ともだちが ほめてくれました。',
  },
  {
    id: 91, category: 'Traveling Modern', difficulty: 3,
    kana: 'ホテルを チェックアウトして、スーツケースを あずけました。チェックインまで じかんが あるので、まちを さんぽします。カフェで じかんを つぶします。',
  },
  {
    id: 92, category: 'Kantor & Bisnis', difficulty: 3,
    kana: 'オンラインめんせつを うけました。カメラと マイクを テストしました。きんちょうしましたが、しつもんに ちゃんと こたえられました。',
  },
  {
    id: 93, category: 'Hobi Digital', difficulty: 3,
    kana: 'マインクラフトで いえを たてました。ともだちと マルチプレイで あそびました。よるに ゾンビが きて、びっくりしました。',
  },
  {
    id: 94, category: 'Kuliner', difficulty: 3,
    kana: 'コンビニの しんしょうひんの グミを かいました。パッケージが かわいいです。ソーダあじで、とても おいしいです。リピートしたいです。',
  },
  {
    id: 95, category: 'Belajar', difficulty: 3,
    kana: 'ズームで にほんごの じゅぎょうを うけています。ブレイクアウトルームで グループワークを します。チャットで しつもんも できます。べんりです。',
  },
  {
    id: 96, category: 'Olahraga & Kesehatan', difficulty: 3,
    kana: 'ヘルスケアアプリで すいみんじかんを きろくしています。グラフを みると、へいきんが わかります。はやく ねるように しています。',
  },
  {
    id: 97, category: 'Percakapan', difficulty: 3,
    kana: '「この しりょう、ピー ディー エフで おくって ください。」「わかりました。メールで そうしんします。」「おねがいします。」',
  },
  {
    id: 98, category: 'Cerita pendek', difficulty: 3,
    kana: 'きんようの よる、オンラインゲームの イベントに さんかしました。チームで きょうりょくして、ボスを たおしました。ボイスチャットで おおさわぎしました。',
  },
  {
    id: 99, category: 'Keseharian', difficulty: 3,
    kana: 'でんきやで エアコンを かいました。ネットで くちこみを しらべました。こうにゅうレビューが さんこうに なりました。とりつけを よやくしました。',
  },
  {
    id: 100, category: 'Rencana & Liburan', difficulty: 3,
    kana: 'らいげつの れんきゅうに おきなわへ いきます。エアビーで コテージを かりました。シュノーケリングを したいです。いまから ワクワクしています。',
  },
]
