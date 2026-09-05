# Anki Mode Design — KanaDojo

Date: 2026-05-13
Status: Approved
Scope: Bounded → upgraded to Architectural (new subsystem)
Mode: Flip + self-grade, SRS penuh, no daily limit

## 1. Ringkasan
Tambah mode Anki flashcard untuk kosakata (kana → arti Indonesia). User melihat kana di depan, menebak arti, flip, lalu nilai Again/Hard/Good/Easy. SRS SM-2 menentukan kapan kartu muncul lagi. 300 kata N5-N4 tanpa limit harian.

## 2. Architecture

### 2.1 File baru
- `src/data/vocab.js` — array 300 entri:
  ```js
  { id, kana, arti, contoh_kana, contoh_arti, kategori, level }
  // kana: hiragana/katakana murni + spasi
  // arti: Indonesia singkat
  // kategori: verba, nomina, adjektiva, makanan, dll
  // level: 1(N5) | 2(N4)
  ```
  Romaji digenerate via `kanaTextToRomaji(kana)` saat render, tidak disimpan.

- `src/lib/srs.js` — SRS engine:
  - `loadSRS() / saveSRS(map)` — localStorage key `kana-dojo-anki-v1`
  - `getDueQueue(vocab, srsMap, now)` — filter due <= now, urut due asc
  - `getNewQueue(...)` — kartu belum pernah dilihat
  - `schedule(cardState, grade)` → nextState { ease, intervalMin, due, reps, lapses }
  - `grade(cardId, grade)` — update & persist
  - SM-2 params: ease0=2.5, Again: ease-=0.2 interval=1m, Hard: interval*=1.2 (+6m min), Good: interval*=ease, Easy: interval*=ease*1.3. Ease floor 1.3.

- `src/views/AnkiMode.jsx` — UI utama
- Update `src/App.jsx` — route `anki`
- Update `src/views/Home.jsx` — card mode Anki

### 2.2 Dependencies
- `lib/romaji.js` untuk romaji display
- `lib/progress.js` untuk XP/streak (`addXp`, `recordSession`, `recordAnswer` opsional per kana)
- `components/ui.jsx` untuk Card/Button/Badge
- `lib/sound.js` / `confetti.js` opsional untuk feedback

## 3. Data Flow
```
vocab.js (300) ─┐
                ├─► srs.js (SRS map) ─► queue (due+new shuffled + future) ─► AnkiMode.jsx currentCard
lib/romaji.js ──┘                                                              │
                                                                          flip │
                                                                    grade(Anki)├─► update srs.js + localStorage
                                                                              └─► progress.addXp + stats
```

- Init: load SRS map, bangun queue. Jika SRS kosong, semua kartu = new.
- Session: tampilkan `current = due[0] || new[0] || upcoming[0]`. Setelah grade, kartu dijadwalkan ulang, queue direbuild.
- Tanpa limit harian: new queue = semua new cards (shuffle via seedRandom atau Math.random). Due selalu prioritas.

## 4. UX Detail
- **Card depan**: kana besar (text-3xl), kategori + level badge, tombol "Lihat Arti" / tap card untuk flip. Hint romaji opsional blur.
- **Card belakang**: arti (besar), romaji kecil, contoh kalimat kana + arti contoh, kategori.
- **Tombol grade** (muncul setelah flip): Again merah (1m), Hard oranye (10m), Good hijau (1d), Easy biru (4d). Keyboard 1-4.
- **Header**: due count, new count, total, sesi + XP, streak.
- **Aksi**: Undo last grade, Reset deck (konfirmasi), Beranda (simpan sesi).
- **Empty**: jika semua due di masa depan, tampilkan "Selesai — X kartu due dalam Y menit" + tombol review ahead.

## 5. Error Handling
- vocab.js gagal load / kosong → tampilkan pesan, jangan crash.
- localStorage corrupt → catch JSON.parse, reset map.
- kana tidak valid → romaji fallback '' , tetap tampilkan kana.
- SRS due = Invalid Date → treat as due now.

## 6. Testing
- `npm run build` harus sukses.
- Manual: 5 kartu random cek `kanaTextToRomaji` tidak error.
- Simulasi: grade Again → due ~1m, grade Good → due ~1d.
- Verifikasi: XP bertambah, sesi tersimpan di progress.sessions, localStorage persist setelah reload.
- Tidak ada kanji di kana field (regex check).

## 7. Out of Scope (YAGNI)
- Import/export Anki .apkg
- Audio TTS
- Multiplayer Anki
- Deck picker terpisah (v1 single deck 300, filter kategori bisa v2)
- Edit kartu di UI

## 8. Implementation Order
1. vocab.js 300 entri
2. srs.js engine + unit cek via node -e
3. AnkiMode.jsx
4. App.jsx + Home.jsx wiring
5. Build & verify
