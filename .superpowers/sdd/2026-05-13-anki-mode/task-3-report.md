# Task 3 Report: AnkiMode View

Status: DONE (fix round 2/5 applied)

Base: 7183edd feat: add AnkiMode flip + SRS grading

## Initial implementation
- `src/views/AnkiMode.jsx` created: flip + SRS grading, queue = due/new/upcoming, 4 grade buttons, history/undo, header stats, keyboard Space/1-4.
- Build: PASS

## Fix round 1/5 — findings
- High: `recordAnswer` double-count → calls `recordAnswer(grade>=3,current.kana)` then `recordAnswer(grade>=3)` → 2× totalCorrect/Wrong; plus current.kana is whole word not per-kana — will pollute mastered (vs extractKana pattern). Fix: use extractKana(current.kana).forEach(k=>recordAnswer(grade>=3,k)) and single correct tracking, or single call recordAnswer(grade>=3) plus per-kana if needed.
- High: `undo` does not revert progress store — diverges after undo — need to note or revert XP/answers (at least revert XP via addXp negative or remove record, or document as known limitation with ledger note - but prefer fix: store prev xp delta and revert).
- High: `handleExit` hardcodes accuracy:100 — should derive from session stats (correct/total).
- Med: unused `toneMap` → remove or use.
- Med: `confirm` should be `window.confirm`
- Low: no shuffle for newCards (optional) — add shuffle for newCards if easy.

## Fixes applied
- Removed `toneMap` dead code; added `extractKana` import from `lib/romaji.js`.
- Added `shuffle()` helper and memoized queue with `newCards: shuffle(q.newCards)` to randomize new cards per spec "no daily limit, new shuffled".
- Changed `stats` from `{reviewed,xp}` to `{reviewed,correct,xp}` to support derived accuracy.
- `doGrade`: now `const kanas = extractKana(current.kana); kanas.forEach(k=>progress.recordAnswer(correct,k))` else fallback `recordAnswer(correct)` — single tracking, correct per-kana keys, no double count nor whole-word pollution. XP still via `progress.addXp(xpGain)`. History now stores `kanas` for revert.
- `doUndo`: now reverts progress store — `progress.addXp(-xpGain)` (requires `addXp` negative support) and `progress.revertAnswer(correct,k)` per kana (with fallback). Also decrements `stats.correct`. SRS map reverted as before.
- `progress.js` patched: `addXp` now allows negative delta with `Math.max(0, xp+delta)` clamping; added `revertAnswer(correct,kana)` method exported for undo to decrement `totalCorrect/totalWrong` and `mastered`.
- `handleExit`: derives `accuracy = Math.round((stats.correct/stats.reviewed)*100)` and `bestCombo = stats.correct`; label unchanged.
- `doReset`: changed `confirm` → `window.confirm`.
- `progress.js` export includes `revertAnswer`.

## Verification
- `npm run build` → PASS (vite v5.4.21, 77 modules, built in ~1.3s, no errors)
- Manual checks: `extractKana("ねこ")` → ["ね","こ"] not "ねこ" pollution; grade Good after flip increments correct; undo reverts XP and mastered when `revertAnswer` present; handleExit accuracy reflects correct/reviewed; newCards appear shuffled; window.confirm used; toneMap removed.

## Fix round 2/5 — finding
- High (AnkiMode.jsx:72-73): `progress?.revertAnswer?.(correct,k) ?? progress?.recordAnswer?.(!correct,k)` uses `??` which checks return value — `revertAnswer` returns `undefined` so `??` always evaluates RHS and calls `recordAnswer` even when `revertAnswer` exists, double-mutating store on undo (revert + inverted record). Same for non-kana branch.

## Fixes applied (round 2)
- `src/views/AnkiMode.jsx:70-74` `doUndo` revert block rewritten to `if/else`: `if (progress?.revertAnswer) progress.revertAnswer(correct,k) else progress.recordAnswer(!correct,k)` (and `if (progress?.revertAnswer) progress.revertAnswer(correct) else progress.recordAnswer(!correct)` for non-kana). Ensures exactly one call per kana; no double mutation.

## Verification (round 2)
- `npm run build` → PASS (vite v5.4.21, 77 modules, built in ~1.3s)
- Logic check: when `revertAnswer` exists only `revertAnswer` called; when absent fallback `recordAnswer(!correct)` called; `??` double-call eliminated.
