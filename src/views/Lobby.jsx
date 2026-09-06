import React, { useState, useEffect, useRef } from 'react'
import { Card, Button, Badge, Segmented } from '../components/ui.jsx'
import { genRoomCode, createMultiplayer, setActiveMultiplayer } from '../lib/multiplayer.js'
import { sendViaRelay, pollRelay } from '../lib/relay.js'
import { createRelayMultiplayer } from '../lib/relayMultiplayer.js'

export default function Lobby({ onStartGame, onBack, initialRoomCode }) {
  const [roomCode, setRoomCode] = useState('')
  const [joinCode, setJoinCode] = useState('')
  const [hostStatus, setHostStatus] = useState('idle')
  const [joinStatus, setJoinStatus] = useState('idle')
  const [joinError, setJoinError] = useState('')
  const [copied, setCopied] = useState(false)
  const [settings, setSettings] = useState({ mode: 'quiz', length: 20, challenge: false, dakuten: false })
  const mpRef = useRef(null)
  const lobbyIdRef = useRef(Math.random().toString(36).slice(2,9))
  const seedRef = useRef('')
  const startedRef = useRef(false)

  useEffect(() => {
    if (initialRoomCode) setJoinCode(initialRoomCode.toUpperCase())
  }, [initialRoomCode])

  useEffect(() => {
    return () => {
      // Jangan destroy kalau lobby unmount karena game dimulai —
      // koneksi dipindah ke MultiplayerGame via registry aktif.
      if (!startedRef.current) { try { mpRef.current?.destroy() } catch {} }
    }
  }, [])

  useEffect(() => {
    if (hostStatus === 'connected' && mpRef.current) {
      mpRef.current.send({ type: 'settings', settings, seed: seedRef.current })
    }
  }, [settings, hostStatus])

  const handleCreateRoom = () => {
    const code = genRoomCode()
    const seed = code + '-' + Date.now().toString(36)
    seedRef.current = seed
    setRoomCode(code)
    setHostStatus('connecting')
    setJoinStatus('idle')
    setJoinError('')
    setCopied(false)
    try { mpRef.current?.destroy() } catch {}
    const mp = createMultiplayer({
      onData: () => {},
      onPeerJoin: () => {
        setHostStatus('connected')
        setTimeout(() => { try { mp.send({ type: 'settings', settings, seed, _sender: lobbyIdRef.current }); sendViaRelay(code, { type: 'settings', settings, seed, _sender: lobbyIdRef.current }) } catch {} }, 400)
      },
      onPeerLeave: () => setHostStatus('waiting'),
      onError: (err) => {
        console.error('host err',err?.type,err?.message,err)
        if(err?.type==='unavailable-id'){
          setHostStatus('error')
          setJoinError(`Kode ${code} sudah dipakai — buat ulang.`)
        } else if(err?.type==='network' || err?.type==='server-error' || err?.type==='socket-error'){
          setHostStatus('error')
          setJoinError(`Host gagal konek ke PeerJS (${err.type}). Cek internet & refresh.`)
        }
      }
    })
    mpRef.current = mp
    setActiveMultiplayer(mp)
    const peer = mp.host(code)
    peer.on('open', (id)=>{
      console.log('host open',id)
      setHostStatus('waiting')
      try{ sendViaRelay(code, { type: 'host-ready', seed, settings, _sender: lobbyIdRef.current }) }catch{}
      const stop = pollRelay(code, (data)=>{
        if(data?._sender===lobbyIdRef.current) return
        if(data?.type==='relay-join'){ setHostStatus('connected'); try{ mp.send({ type: 'settings', settings, seed, _sender: lobbyIdRef.current }); sendViaRelay(code, { type: 'settings', settings, seed, _sender: lobbyIdRef.current })}catch{} }
      }, {since: Date.now() - 60000})
      mp._relayStop = stop
    })
    peer.on('error', (err)=>{
      console.error('host peer error',err)
      if(err?.type==='unavailable-id'){
        setHostStatus('error')
      }
    })
    peer.on('disconnected', ()=> console.log('host disconnected'))
    setTimeout(()=>{
      if(mp.getPeer()?.open===false){
        console.warn('host not open after 5s')
      }
    },5000)
  }

  const handleJoin = () => {
    const code = joinCode.trim().toUpperCase()
    if (!code || code.length < 4) { setJoinError('Kode minimal 4 karakter'); return }
    setJoinError('')
    setJoinStatus('connecting')
    setRoomCode(code)
    try { mpRef.current?.destroy() } catch {}
    const mp = createMultiplayer({
      onData: (data) => {
        if (!data) return
        if (data.type === 'settings') {
          if (data.settings) setSettings(data.settings)
          if (data.seed) seedRef.current = data.seed
        }
        if (data.type === 'start') {
          startedRef.current = true
          onStartGame({ roomCode: code, seed: data.seed || seedRef.current, settings: data.settings || settings, isHost: false })
        }
      },
      onPeerJoin: () => { setJoinStatus('connected'); setJoinError('') },
      onPeerLeave: () => setJoinStatus((s)=> s==='connected' ? 'idle':'error'),
      onError: (err) => {
        const t=err?.type||'unknown'
        const msg=err?.message||JSON.stringify(err).slice(0,120)
        console.error('peer error',t,msg,err)
        if(t==='peer-unavailable'){
          setJoinStatus('error')
          setJoinError(`Room ${code} tidak ditemukan (${t}). Host belum open.`)
        } else if(t==='network' || t==='server-error' || t==='socket-error' || t==='socket-closed'){
          setJoinStatus('error')
          setJoinError(`Peer server error (${t}: ${msg}). Coba refresh & buat ulang.`)
        } else if(t==='webrtc'){
          setJoinStatus('error')
          setJoinError(`WebRTC gagal (${msg}). Cek firewall / coba jaringan lain.`)
        } else if(t!=='unavailable-id'){
          setJoinStatus('error')
          setJoinError(`Error ${t}: ${msg}`)
        }
      }
    })
    mpRef.current = mp
    setActiveMultiplayer(mp)
    let relayMp=null
    let relayStop=null
    let relayPollStarted=false
    const ensureRelayPoll = () => {
      if(relayPollStarted) return
      relayPollStarted=true
      relayStop = pollRelay(code, (data)=>{
        if(!data || data._sender===lobbyIdRef.current) return
        if(data.type==='settings'){ if(data.settings) setSettings(data.settings); if(data.seed) seedRef.current=data.seed }
        if(data.type==='host-ready'){ setJoinStatus('connected'); setJoinError(''); try{ sendViaRelay(code,{type:'relay-join', _sender: lobbyIdRef.current}) }catch{} }
        if(data.type==='start'){ if(startedRef.current) return; startedRef.current=true; onStartGame({ roomCode:code, seed:data.seed||seedRef.current, settings:data.settings||settings, isHost:false }) }
      }, {since: Date.now() - 60000})
    }
    ensureRelayPoll()
    const tryRelay = () => {
      console.log('fallback to relay',code)
      setJoinStatus('connecting')
      setJoinError('P2P gagal, coba via relay...')
      try{ mp.getPeer()?.destroy?.() }catch{}
      relayMp = createRelayMultiplayer(code, {
        onData: (data)=>{
          if(!data || data._sender===lobbyIdRef.current) return
          if(data.type==='settings'){ if(data.settings) setSettings(data.settings); if(data.seed) seedRef.current=data.seed }
          if(data.type==='start'){ startedRef.current=true; onStartGame({ roomCode:code, seed:data.seed||seedRef.current, settings:data.settings||settings, isHost:false }) }
          if(data.type==='host-ready'){ setJoinStatus('connected'); setJoinError(''); try{ sendViaRelay(code,{type:'relay-join', _sender: lobbyIdRef.current}) }catch{} }
        },
        onPeerJoin: ()=>{ setJoinStatus('connected'); setJoinError('Terhubung via relay') }
      })
      mpRef.current = relayMp
      setActiveMultiplayer(relayMp)
      try{ sendViaRelay(code,{type:'relay-join', _sender: lobbyIdRef.current}) }catch{}
      relayStop = pollRelay(code, (data)=>{
        if(!data || data._sender===lobbyIdRef.current) return
        if(data.type==='settings'){ if(data.settings) setSettings(data.settings); if(data.seed) seedRef.current=data.seed }
        if(data.type==='start'){ startedRef.current=true; onStartGame({ roomCode:code, seed:data.seed||seedRef.current, settings:data.settings||settings, isHost:false }) }
      }, {since: Date.now() - 60000})
      setTimeout(()=>{ if(joinStatus==='connecting'){ setJoinStatus('connected'); setJoinError('Terhubung via relay (fallback)') } },1000)
    }
    const attemptJoin = (retries=3) => {
      mp.join(code)
      setTimeout(() => {
        setJoinStatus((s) => {
          if(s!=='connecting') return s
          if(retries>0){
            console.log(`retry join ${code} left ${retries}`)
            try{ mp.getPeer()?.destroy?.() }catch{}
            setTimeout(()=> attemptJoin(retries-1), 1500)
            return 'connecting'
          }
          tryRelay()
          return 'connecting'
        })
        if(retries<=0){
          setJoinError((prev) => {
            if(prev && !prev.includes('Gagal terhubung')) return prev
            return `P2P gagal, mencoba relay...`
          })
        }
      }, 5000)
    }
    attemptJoin(3)
  }

  const handleCopy = async (text) => {
    try { await navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000) } catch {}
  }

  const handleStartGame = () => {
    startedRef.current = true
    const seed = seedRef.current || roomCode + '-' + Date.now().toString(36)
    seedRef.current = seed
    const payload = { type: 'start', seed, settings, roomCode, _sender: lobbyIdRef.current }
    try { mpRef.current?.send(payload) } catch {}
    try { sendViaRelay(roomCode, payload) } catch {}
    onStartGame({ roomCode, seed, settings, isHost: true })
  }

  const shareLink = roomCode ? `${window.location.origin}${window.location.pathname}?room=${roomCode}` : ''

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <div className="flex items-center gap-3">
        <Button variant="ghost" onClick={onBack} className="px-3 py-2 text-xs">Beranda</Button>
        <Badge tone="slate">Multiplayer</Badge>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <Card className="flex flex-col p-6 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">Buat Room</h2>
          <p className="mt-1 text-xs text-slate-600 dark:text-zinc-400">Jadi host dan undang lawan.</p>

          {hostStatus === 'idle' ? (
            <Button onClick={handleCreateRoom} className="mt-5 w-full">Buat Room</Button>
          ) : (
            <div className="mt-4 space-y-4">
              <div className="rounded-2xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-900 p-4 text-center">
                <div className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-zinc-400">Kode Room</div>
                <div className="mt-1 text-3xl font-extrabold tracking-widest text-slate-900 dark:text-white">{roomCode}</div>
                {shareLink && (
                  <div className="mt-3 space-y-2">
                    <div className="break-all rounded-xl bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 px-3 py-2 text-xs text-slate-600 dark:text-zinc-300">{shareLink}</div>
                    <Button variant="ghost" onClick={() => handleCopy(shareLink)} className="w-full py-2 text-xs">{copied ? 'Tersalin' : 'Salin Link'}</Button>
                    <Button variant="ghost" onClick={() => handleCopy(roomCode)} className="w-full py-2 text-xs">Salin Kode</Button>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 text-xs">
                {hostStatus === 'waiting' && <><span className="h-2 w-2 animate-pulse rounded-full bg-amber-500" /><span className="text-slate-600 dark:text-zinc-400">Menunggu lawan bergabung</span><Badge tone="amber" className="ml-auto">Menunggu</Badge></>}
                {hostStatus === 'connected' && <><span className="h-2 w-2 rounded-full bg-emerald-500" /><span className="font-semibold text-emerald-700 dark:text-emerald-300">Lawan terhubung</span><Badge tone="emerald" className="ml-auto">Terhubung</Badge></>}
              </div>

              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-600 dark:text-zinc-400">Mode</label>
                <select value={settings.mode} onChange={(e)=>{ const v=e.target.value; setSettings((s)=>{ let len=s.length; if(v==='translate') len=[1,2,5].includes(len)?len:2; else if(v==='vocab') len=[10,20,30].includes(len)?len:20; else len=[1,2,5].includes(len)?20:len; return {...s, mode:v, length:len} })}}
                  className="w-full rounded-xl border border-slate-300 dark:border-zinc-600 bg-white dark:bg-zinc-700 px-4 py-3 text-sm font-medium text-slate-900 dark:text-white outline-none focus:border-zinc-500 focus:ring-2 focus:ring-zinc-500/20">
                  <option value="translate">Translate</option>
                  <option value="quiz">Tes Huruf</option>
                  <option value="combo">Combo</option>
                  <option value="vocab">Kosakata</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-600 dark:text-zinc-400">Jumlah soal</label>
                {settings.mode==='translate' ? (
                  <Segmented value={settings.length} onChange={(v) => setSettings((s) => ({ ...s, length: v }))} options={[{ value: 1, label: '1 soal' },{ value: 2, label: '2 soal' },{ value: 5, label: '5 soal' }]} />
                ) : settings.mode==='vocab' ? (
                  <Segmented value={settings.length} onChange={(v) => setSettings((s) => ({ ...s, length: v }))} options={[{ value: 10, label: '10 soal' },{ value: 20, label: '20 soal' },{ value: 30, label: '30 soal' }]} />
                ) : (
                  <Segmented value={settings.length} onChange={(v) => setSettings((s) => ({ ...s, length: v }))} options={[{ value: 20, label: '20 soal' },{ value: 30, label: '30 soal' },{ value: 0, label: 'Endless' }]} />
                )}
              </div>

              <div className="flex flex-col gap-3">
                {(settings.mode==='quiz' || settings.mode==='combo') && (
                  <label className="flex cursor-pointer items-center gap-3 text-sm text-slate-900 dark:text-zinc-200">
                    <input type="checkbox" checked={settings.dakuten} onChange={(e) => setSettings((s) => ({ ...s, dakuten: e.target.checked }))} className="h-4 w-4 accent-zinc-900" />
                    <span>Sertakan dakuten dan handakuten <span className="text-slate-600 dark:text-zinc-400">(ga, pa, zo...)</span></span>
                  </label>
                )}
                <label className="flex cursor-pointer items-center gap-3 text-sm text-slate-900 dark:text-zinc-200">
                  <input type="checkbox" checked={settings.challenge} onChange={(e) => setSettings((s) => ({ ...s, challenge: e.target.checked }))} className="h-4 w-4 accent-zinc-900" />
                  <span>Challenge <span className="text-slate-600 dark:text-zinc-400">10 detik per soal</span></span>
                </label>
              </div>

              <Button onClick={handleStartGame} className="w-full" disabled={hostStatus !== 'connected'}>Mulai Game</Button>
              {hostStatus === 'waiting' && <p className="text-center text-xs text-slate-500 dark:text-zinc-400">Tunggu lawan bergabung untuk memulai</p>}
              <Button variant="ghost" onClick={handleCreateRoom} className="w-full py-2 text-xs">Buat Ulang Kode</Button>
            </div>
          )}
        </Card>

        <Card className="flex flex-col p-6 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">Gabung Room</h2>
          <p className="mt-1 text-xs text-slate-600 dark:text-zinc-400">Masukkan kode dari host.</p>

          <div className="mt-5 space-y-3">
            <input value={joinCode} onChange={(e) => setJoinCode(e.target.value.toUpperCase())} placeholder="CONTOH: AB12CD" maxLength={6} className="w-full rounded-xl border border-slate-300 dark:border-zinc-600 bg-white dark:bg-zinc-700 px-4 py-3 text-center text-lg font-bold uppercase tracking-widest text-slate-900 dark:text-white placeholder:text-slate-400 outline-none focus:border-zinc-500 focus:ring-2 focus:ring-zinc-500/20" />
            <Button onClick={handleJoin} className="w-full" disabled={joinStatus === 'connecting' || joinStatus === 'connected'}>{joinStatus === 'connecting' ? 'Menghubungkan' : joinStatus === 'connected' ? 'Terhubung' : 'Gabung'}</Button>

            <div className="min-h-[28px] text-center text-xs">
              {joinStatus === 'idle' && <span className="text-slate-500 dark:text-zinc-400">Menunggu kode</span>}
              {joinStatus === 'connecting' && <span className="inline-flex items-center gap-2 text-slate-600 dark:text-zinc-300"><span className="h-2 w-2 animate-pulse rounded-full bg-amber-500" />Menghubungkan ke host</span>}
              {joinStatus === 'connected' && <span className="font-semibold text-emerald-700 dark:text-emerald-300">Siap bermain. Menunggu host memulai</span>}
              {joinStatus === 'error' && <span className="text-red-600 dark:text-red-300">{joinError}</span>}
            </div>

            {joinStatus === 'connected' && (
              <div className="rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-900 p-4 text-sm">
                <div className="flex items-center justify-between"><span className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-zinc-400">Room</span><Badge tone="emerald">Terhubung</Badge></div>
                <div className="mt-2 flex flex-wrap gap-1.5 text-xs">
                  <Badge tone="slate">{settings.mode}</Badge>
                  <Badge tone="slate">{settings.length === 0 ? 'Endless' : `${settings.length} soal`}</Badge>
                  {settings.dakuten && <Badge tone="slate">Dakuten</Badge>}
                  {settings.challenge && <Badge tone="amber">Challenge</Badge>}
                </div>
              </div>
            )}

            {joinError && joinStatus !== 'connected' && <p className="text-center text-xs text-red-600 dark:text-red-300">{joinError}</p>}
          </div>

          <div className="mt-auto pt-6">
            <div className="rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 p-3 text-xs leading-relaxed text-slate-600 dark:text-zinc-400">
              Host akan mengatur mode dan jumlah soal. Kamu akan otomatis masuk saat host menekan Mulai Game.
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
