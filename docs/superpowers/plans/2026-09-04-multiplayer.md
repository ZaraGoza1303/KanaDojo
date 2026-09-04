# Multiplayer Realtime P2P Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Tambah mode multiplayer online realtime 1v1 untuk semua mode KanaDojo via PeerJS P2P tanpa backend sendiri.

**Architecture:** PeerJS Cloud untuk signalling, DataChannel untuk game sync. Seed RNG untuk soal deterministik. Lobby untuk buat/join room, game wrapper yang reuse logika existing.

**Tech Stack:** React 18, Vite 5, Tailwind 4, peerjs 1.5

**Spec:** docs/superpowers/specs/2026-09-04-multiplayer-design.md

## Global Constraints
- Tetap static hosting via vite build
- PeerJS Cloud gratis, no backend deploy
- Max 4 peer per room, MVP trust client
- Style: zinc neutral dark, no indigo/blue purple, no emoji

---

### Task 1: Dependensi dan util seed

**Files:**
- Modify: `package.json`
- Create: `src/lib/seedRandom.js`
- Test: `src/lib/seedRandom.test.js` manual node check

**Interfaces:**
- Produces: `seededRandom(seed) => () => number 0-1`, `shuffleWithSeed(arr, seed)`

- [ ] **Step 1: Install peerjs**

```bash
npm install peerjs
```

- [ ] **Step 2: Buat src/lib/seedRandom.js**

```js
export function seededRandom(seed){ let h=0; for(let i=0;i<seed.length;i++) h=Math.imul(31,h)+seed.charCodeAt(i)|0; return ()=>{ h+=0x6D2B79F5; let t=Math.imul(h^h>>>15,h|1); t^=t+Math.imul(t^h>>>7,61|t); return ((t^ t>>>14)>>>0)/4294967296 }}
export function shuffleWithSeed(arr, seed){ const r=seededRandom(seed); const a=[...arr]; for(let i=a.length-1;i>0;i--){ const j=Math.floor(r()*(i+1)); [a[i],a[j]]=[a[j],a[i]] } return a }
```

- [ ] **Step 3: Verifikasi manual**

```bash
node --input-type=module -e "import {shuffleWithSeed} from './src/lib/seedRandom.js'; console.log(shuffleWithSeed([1,2,3,4,5],'abc'))"
```

Expected: deterministik output sama tiap run

- [ ] **Step 4: Commit**

```bash
git add package.json src/lib/seedRandom.js
git commit -m "feat: add peerjs and seeded RNG"
```

### Task 2: Multiplayer lib wrapper

**Files:**
- Create: `src/lib/multiplayer.js`

**Interfaces:**
- Consumes: peerjs, seedRandom
- Produces: `createHost(roomId?)`, `joinRoom(peerId, roomCode)`, `broadcast(data)`, `onData(cb)`, `onPeerClose(cb)`, `genRoomCode()`

- [ ] **Step 1: Buat src/lib/multiplayer.js**

```js
import Peer from 'peerjs'
export function genRoomCode(){ return Math.random().toString(36).slice(2,8).toUpperCase() }
export function createMultiplayer({onData, onPeerJoin, onPeerLeave}){
 let peer, conn
 function host(code){ peer=new Peer(`kanadojo-${code}`); peer.on('connection', c=>{conn=c; setup(c)}); return peer }
 function join(hostCode){ peer=new Peer(); peer.on('open', ()=>{ conn=peer.connect(`kanadojo-${hostCode}`); setup(conn)}) }
 function setup(c){ c.on('data', onData); c.on('close', onPeerLeave); onPeerJoin?.(c) }
 function send(d){ conn?.send(d) }
 return {host, join, send, getPeer:()=>peer}
}
```

- [ ] **Step 2: Build check**

```bash
npm run build
```

Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add src/lib/multiplayer.js
git commit -m "feat: add multiplayer peer wrapper"
```

### Task 3: Lobby view

**Files:**
- Create: `src/views/Lobby.jsx`
- Modify: `src/App.jsx` view routing

**Interfaces:**
- Consumes: multiplayer.js, Card Button Badge
- Produces: Lobby component with code share and join

- [ ] **Step 1: Buat Lobby.jsx** form buat room dan join via input code, tampil link ?room=CODE, tombol ke game

- [ ] **Step 2: Update App.jsx** tambah view multiplayer dan handle ?room param

- [ ] **Step 3: Build check**

```bash
npm run build
```

- [ ] **Step 4: Commit**

### Task 4: MultiplayerGame wrapper

**Files:**
- Create: `src/views/MultiplayerGame.jsx`

**Interfaces:**
- Consumes: multiplayer.js, romaji.js, progress.js, seedRandom
- Produces: game yang sync soal via seed, kirim answer event

- [ ] **Step 1: Buat MultiplayerGame.jsx** reuse Quiz/Combo/Translate logic dengan seed, tampil skor lawan

- [ ] **Step 2: Build check**

- [ ] **Step 3: Commit**

### Task 5: Integrasi dan polish

**Files:**
- Modify: `src/views/Home.jsx` tambah kartu Multiplayer
- Modify: `src/App.jsx` footer tetap

- [ ] **Step 1: Tambah card Multiplayer di Home**

- [ ] **Step 2: Final build dan manual test 2 tab**

```bash
npm run build && npm run dev
```

- [ ] **Step 3: Commit**
