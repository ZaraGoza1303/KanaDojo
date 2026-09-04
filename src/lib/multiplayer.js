import Peer from 'peerjs'
export function genRoomCode(){ return Math.random().toString(36).slice(2,8).toUpperCase().padEnd(6,'X').slice(0,6) }
export function createMultiplayer({onData,onPeerJoin,onPeerLeave}={}){
  let peer=null
  let conn=null
  function cleanup(){ conn=null }
  function setup(c){
    conn=c
    c.on('data',d=>onData?.(d))
    c.on('close',()=>{ cleanup(); onPeerLeave?.(c) })
    c.on('error',()=>{ cleanup(); onPeerLeave?.(c) })
    onPeerJoin?.(c)
  }
  function host(code){
    const id=`kanadojo-${code}`
    peer=new Peer(id)
    peer.on('connection',c=>{
      c.on('open',()=>setup(c))
      c.on('error',()=>{ cleanup(); onPeerLeave?.(c) })
    })
    peer.on('error',err=>{
      if(err?.type==='unavailable-id') console.error(`Room ${code} already taken`)
    })
    peer.on('disconnected',()=>{ try{ peer.reconnect() }catch{} })
    peer.on('close',cleanup)
    return peer
  }
  function join(hostCode){
    peer=new Peer()
    peer.on('open',()=>{
      const c=peer.connect(`kanadojo-${hostCode}`,{reliable:true})
      c.on('open',()=>setup(c))
      c.on('error',e=>{ console.error(e); cleanup(); onPeerLeave?.(c) })
      c.on('close',()=>{ cleanup(); onPeerLeave?.(c) })
    })
    peer.on('error',err=>console.error(err))
    peer.on('disconnected',()=>{ try{ peer.reconnect() }catch{} })
    peer.on('close',cleanup)
    return peer
  }
  function send(data){ if(conn?.open) conn.send(data) }
  function getPeer(){ return peer }
  function destroy(){ try{ conn?.close() }catch{} conn=null; try{ peer?.destroy() }catch{} peer=null }
  return {host,join,send,getPeer,destroy}
}
