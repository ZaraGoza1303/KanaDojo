const getPeerConstructor = () => {
  if (typeof window !== 'undefined' && window.Peer) return window.Peer
  return null
}

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
    c.on('error', (e) => { console.error('conn error',e); cleanup(); leaveHandler?.(c); errorHandler?.({type:'webrtc', message:String(e?.message||e)}) })
    c.on('iceStateChanged', s=> console.log('ice',s))
    onPeerJoin?.(c)
  }
  const PEER_CFG={ host:'0.peerjs.com', port:443, path:'/', secure:true, key:'peerjs', debug:1, config:{ iceServers:[
    {urls:'stun:stun.l.google.com:19302'},{urls:'stun:stun1.l.google.com:19302'},{urls:'stun:stun2.l.google.com:19302'},{urls:'stun:stun3.l.google.com:19302'},{urls:'stun:stun4.l.google.com:19302'},
    {urls:'stun:openrelay.metered.ca:80'},{urls:'stun:stun.relay.metered.ca:80'},
    {urls:'turn:openrelay.metered.ca:80', username:'openrelayproject', credential:'openrelayproject'},
    {urls:'turn:openrelay.metered.ca:443', username:'openrelayproject', credential:'openrelayproject'},
    {urls:'turn:openrelay.metered.ca:443?transport=tcp', username:'openrelayproject', credential:'openrelayproject'},
    {urls:'turns:openrelay.metered.ca:443', username:'openrelayproject', credential:'openrelayproject'},
    {urls:'turn:global.relay.metered.ca:80', username:'e8dd3445f13362573124c7d7', credential:'4FZcSuz4Wb5rFqas'},
    {urls:'turn:global.relay.metered.ca:443', username:'e8dd3445f13362573124c7d7', credential:'4FZcSuz4Wb5rFqas'},
    {urls:'turn:global.relay.metered.ca:443?transport=tcp', username:'e8dd3445f13362573124c7d7', credential:'4FZcSuz4Wb5rFqas'},
    {urls:'turns:global.relay.metered.ca:443', username:'e8dd3445f13362573124c7d7', credential:'4FZcSuz4Wb5rFqas'},
    {urls:'turn:turn.anyfirewall.com:443?transport=tcp', username:'webrtc', credential:'webrtc'}
  ], iceTransportPolicy:'all', sdpSemantics:'unified-plan', iceCandidatePoolSize:10 } }
  function host(code) {
    const id = `kanadojo-${code}`
    const PeerCtor = getPeerConstructor()
    if (!PeerCtor) throw new Error('PeerJS not loaded')
    peer = new PeerCtor(id, PEER_CFG)
    peer.on('open', (pid)=> console.log('peer open host',pid))
    peer.on('connection', c => {
      console.log('host incoming',c.peer)
      c.on('open', () => { console.log('host conn open',c.peer); setup(c) })
      c.on('error', (e) => { console.error('host conn error',e); cleanup(); leaveHandler?.(c) })
    })
    peer.on('error', err => {
      console.error('host peer error', err?.type, err?.message, err)
      errorHandler?.(err)
    })
    peer.on('disconnected', () => { console.log('host disconnected, reconnect'); try { peer.reconnect() } catch {} })
    peer.on('close', ()=>{ console.log('host close'); cleanup() })
    return peer
  }
  function join(hostCode) {
    const PeerCtor = getPeerConstructor()
    if (!PeerCtor) throw new Error('PeerJS not loaded')
    peer = new PeerCtor(undefined, PEER_CFG)
    peer.on('open', (pid) => {
      console.log('join peer open',pid,'connecting to',`kanadojo-${hostCode}`)
      const c = peer.connect(`kanadojo-${hostCode}`, { reliable: true })
      c.on('open', () => { console.log('join conn open',c.peer); setup(c) })
      c.on('error', e => { console.error('join conn error',e); errorHandler?.({type:'webrtc', message:String(e?.message||e)}); cleanup(); leaveHandler?.(c) })
      c.on('close', () => { console.log('join conn close'); cleanup(); leaveHandler?.(c) })
    })
    peer.on('error', err => { console.error('join peer error', err?.type, err?.message, err); errorHandler?.(err); if(err?.type==='peer-unavailable') leaveHandler?.({}) })
    peer.on('disconnected', () => { console.log('join disconnected'); try { peer.reconnect() } catch {} })
    peer.on('close', ()=>{ console.log('join close'); cleanup() })
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
