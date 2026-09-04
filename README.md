# KanaDojo Hiragana & Katakana Trainer

Latihan baca hiragana & katakana yang bikin nagih. Tiga mode: Translate cerita, Tes Huruf cepat, dan Kombinasi Extended (ファ・ティ・ヴ・シェ + kata serapan).

## Fitur

- **📖 Mode Translate** 38 teks berjenjang (keseharian → percakapan → cerita panjang), akurasi tolerant (shi/si, tsu/tu, ou/oo), diff hijau/merah, timer, hint & XP combo.
- **⚡ Tes Huruf** hiragana / katakana / campur, filter dakuten, 20/30/♾ Endless, Challenge 10s/soal.
- **🧩 Kombinasi & Extended** 29 extended (ファ ティ ヴ シェ…), 33 yōon, 41 kata serapan; mode huruf / kata / campur, Challenge 12s.
- **Progres lokal** XP, level (300 XP/level), streak harian, mastery per-kana (≥3 benar), riwayat 7 hari & 20 sesi terakhir. Data di `localStorage` (`kanadojo:v1`).
- **Mobile-first** layout responsif, input 16px+ (anti-zoom iOS), confetti & sound toggle.

## Tech

Vite 5 + React 18 + Tailwind 4. Zero backend.

```
src/data/kana.js        # hiragana/katakana base & dakuten
src/data/extended.js    # kombinasi & loanwords
src/data/texts.js       # 38 teks translate
src/lib/romaji.js       # konversi kana→romaji, normalize, accuracy & diff
src/lib/progress.js     # store + streak + level
src/views/*.jsx         # Translate / Quiz / Combo / Home
```

## Jalankan

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # output ke dist/
npm run preview  # preview build
```

## Catatan Romaji

Hepburn waapuro: `shi/chi/tsu/fu/ji`. Toleransi: `si=shi`, `ti=chi`, `tu=tsu`, `hu=fu`, `ou=oo=o`, `wo=o`, `di=ji`, `du=zu`, spasi opsional.

## Lisensi

MIT.
