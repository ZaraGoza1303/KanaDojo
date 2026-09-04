# Multiplayer Realtime P2P Design

## Konteks
KanaDojo saat ini static Vite React 18, tanpa backend. User ingin multiplayer online realtime untuk semua mode (Translate, Tes Huruf, Kombinasi) tanpa backend sendiri. Dipilih PeerJS Cloud sebagai signalling.

## Tujuan
Dua pemain di device beda adu cepat jawab soal yang sama secara sinkron, skor realtime, tetap static hosting.

## Non Tujuan
Leaderboard global persisten, chat, lebih dari 4 pemain, anti cheat server side.

## Arsitektur
PeerJS DataChannel P2P. Host generate room ID 6 char, share via link ?room=CODE. Signalling lewat PeerJS Cloud gratis. Game data via DataChannel JSON. Soal sinkron via seed random agar kedua sisi dapat urutan sama tanpa streaming tiap soal. XP dan mastery tetap lokal via progress.js.

## Komponen
- src/lib/multiplayer.js: createPeer, hostRoom, joinRoom, send, onPeerData, onDisconnect, generateSeed
- src/views/Lobby.jsx: buat room, join via code, tampil share link, status koneksi, pilih mode/length/challenge
- src/views/MultiplayerGame.jsx: wrapper yang reuse logika Quiz/Combo/Translate tapi dengan hook useMultiplayer, papan skor lawan, indikator lawan sudah jawab
- src/lib/seedRandom.js: seeded RNG untuk bag/pool agar deterministik
- App.jsx: tambah view multiplayer dan routing ?room handling

## Alur Data
1 Host pilih mode, length, challenge, generate seed
2 Broadcast settings via DataChannel ke guest
3 Kedua sisi init bag/pool dengan seed yang sama
4 Tiap submit lokal hitung accuracy via romaji.js, kirim {index, accuracy, time, combo} ke peer
5 Kedua sisi render skor lawan realtime
6 Selesai hitung akurasi total, bestCombo, tampil hasil head to head, recordSession lokal masing masing
7 Disconnect: coba reconnect 10s, jika gagal host dinyatakan menang atau draw

## Sinkronisasi Mode
- Quiz/Combo: pool sama, tiap soal kirim event answered
- Translate: bag sama, tiap teks kirim accuracy, lawan lihat progress

## Error Handling
- Kode room salah: max 3 percobaan, tampil pesan
- PeerJS cloud down: fallback pesan coba lagi, opsi main lokal
- Putus tengah game: banner reconnecting, jika timeout akhiri game dengan skor saat itu
- Validasi tetap client side, trust peer untuk MVP

## Keamanan dan Batasan
MVP trust client. Tidak ada validasi server. Batas 4 peer per room.

## Testing
- 2 tab browser lokal same machine
- 2 device beda network
- Build static tetap jalan npm run build
- Uji putus jaringan via offline toggle

## Dependensi Baru
peerjs

## Langkah Implementasi
1 Tambah peerjs, buat multiplayer.js dan seedRandom.js
2 Buat Lobby.jsx
3 Buat MultiplayerGame.jsx
4 Integrasi App.jsx dan deep link
5 Uji P2P dan polish UI
