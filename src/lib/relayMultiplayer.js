import { sendViaRelay, pollRelay } from './relay.js'

export function createRelayMultiplayer(room, { onData, onPeerJoin } = {}) {
  let dataHandler = onData
  let stop = null
  const startPoll = () => {
    if (stop) stop()
    stop = pollRelay(room, (data) => dataHandler?.(data))
  }
  startPoll()
  if (onPeerJoin) setTimeout(()=> onPeerJoin({ peer: `relay-${room}` }), 300)
  return {
    send: (data) => sendViaRelay(room, data),
    getPeer: () => ({ id: `relay-${room}`, open: true }),
    destroy: () => { if(stop) stop(); stop=null },
    setOnData: (fn) => { dataHandler = fn },
    setOnPeerLeave: () => {},
    setOnError: () => {},
    host: () => {},
    join: () => {},
  }
}
