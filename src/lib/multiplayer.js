import Peer from 'peerjs'

// Koneksi harus survive perpindahan view (Lobby -> MultiplayerGame),
// jadi instance aktif disimpan di level module, bukan di state komponen.
let activeInstance = null
export function getActiveMultiplayer() { return activeInstance }
export function setActiveMultiplayer(mp) { activeInstance = mp }

export function genRoomCode() { return Math.random().toString(36).slice(2, 8).toUpperCase().padEnd(6, 'X').slice(0, 6) }
export function createMultiplayer({ onData, onPeerJoin, onPeerLeave, onError } = {}) {
  let peer = null
  let conn = null
  let dataHandler = onData
  let leaveHandler = onPeerLeave
  let errorHandler = onError
  function cleanup() { conn = null }
  function setup(c) {
    conn = c
    c.on('data', d => dataHandler?.(d))
    c.on('close', () => { cleanup(); leaveHandler?.(c) })
    c.on('error', () => { cleanup(); leaveHandler?.(c) })
    onPeerJoin?.(c)
  }
  const ICE={ config:{ iceServers:[
    {urls:'stun:stun.l.google.com:19302'},{urls:'stun:stun1.l.google.com:19302'},{urls:'stun:stun2.l.google.com:19302'},{urls:'stun:stun3.l.google.com:19302'},
    {urls:'stun:openrelay.metered.ca:80'},
    {urls:'turn:openrelay.metered.ca:80', username:'openrelayproject', credential:'openrelayproject'},
    {urls:'turn:openrelay.metered.ca:443', username:'openrelayproject', credential:'openrelayproject'},
    {urls:'turn:openrelay.metered.ca:443?transport=tcp', username:'openrelayproject', credential:'openrelayproject'}
  ] } }
  function host(code) {
    const id = `kanadojo-${code}`
    peer = new Peer(id, ICE)
    peer.on('connection', c => {
      c.on('open', () => setup(c))
      c.on('error', () => { cleanup(); leaveHandler?.(c) })
    })
    peer.on('error', err => {
      if (err?.type === 'unavailable-id') console.error(`Room ${code} already taken`)
      else console.error('host peer error', err)
      errorHandler?.(err)
    })
    peer.on('disconnected', () => { try { peer.reconnect() } catch {} })
    peer.on('close', cleanup)
    return peer
  }
  function join(hostCode) {
    peer = new Peer(undefined, ICE)
    peer.on('open', () => {
      const c = peer.connect(`kanadojo-${hostCode}`, { reliable: true })
      c.on('open', () => setup(c))
      c.on('error', e => { console.error(e); cleanup(); leaveHandler?.(c) })
      c.on('close', () => { cleanup(); leaveHandler?.(c) })
    })
    peer.on('error', err => { console.error('join peer error', err); errorHandler?.(err); if(err?.type==='peer-unavailable') leaveHandler?.({}) })
    peer.on('disconnected', () => { try { peer.reconnect() } catch {} })
    peer.on('close', cleanup)
    return peer
  }
  function send(data) { if (conn?.open) conn.send(data) }
  function getPeer() { return peer }
  function setOnData(fn) { if (typeof fn === 'function') dataHandler = fn }
  function setOnPeerLeave(fn) { if (typeof fn === 'function') leaveHandler = fn }
  function setOnError(fn) { if (typeof fn === 'function') errorHandler = fn }
  function destroy() {
    try { conn?.close() } catch {}
    conn = null
    try { peer?.destroy() } catch {}
    peer = null
    if (activeInstance === api) activeInstance = null
  }
  const api = { host, join, send, getPeer, destroy, setOnData, setOnPeerLeave, setOnError }
  return api
}
