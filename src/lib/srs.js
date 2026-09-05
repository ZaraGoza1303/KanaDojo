export const STORAGE_KEY='kana-dojo-anki-v1'
export function loadSRS(){ try{const j=localStorage.getItem(STORAGE_KEY); return new Map(j?JSON.parse(j):[])}catch{return new Map()}}
export function saveSRS(map){ localStorage.setItem(STORAGE_KEY, JSON.stringify([...map])) }
export function schedule(state, grade){
  let {ease=2.5, intervalMin=0, reps=0, lapses=0}=state||{}
  if(grade===1){ ease=Math.max(1.3,ease-0.2); intervalMin=1; lapses++ }
  else if(grade===2){ intervalMin=Math.max(10, Math.round((intervalMin||10)*1.2)) }
  else if(grade===3){ reps++; intervalMin=reps===1?1440:Math.round(intervalMin*ease) }
  else if(grade===4){ reps++; intervalMin=reps===1?5760:Math.round(intervalMin*ease*1.3); ease+=0.15 }
  const due=Date.now()+intervalMin*60000
  return {ease, intervalMin, due, reps, lapses}
}
export function getQueue(vocab, srsMap, now=Date.now()){
  const due=[], newCards=[], upcoming=[]
  for(const v of vocab){ const s=srsMap.get(v.id); if(!s) newCards.push(v); else if(s.due<=now) due.push({...v,_s:s}); else upcoming.push({...v,_s:s})}
  due.sort((a,b)=>a._s.due-b._s.due)
  return {due, newCards, upcoming}
}
export function gradeCard(id, grade){
  const m=loadSRS(); const cur=m.get(id)||{}; const next=schedule(cur, grade); m.set(id,next); saveSRS(m); return next
}
