import { VOCAB } from './vocab.js'
import { VOCAB_EXTRA } from './vocab_extra.js'
export const VOCAB_ALL = [...VOCAB, ...VOCAB_EXTRA]
export const VOCAB_COUNT = VOCAB_ALL.length

// Kategori + jumlah kata (dihitung sekali agar Setup & mode konsisten)
const _counts = new Map()
for (const v of VOCAB_ALL) {
  if (!v?.kategori) continue
  _counts.set(v.kategori, (_counts.get(v.kategori) || 0) + 1)
}
export const VOCAB_CATEGORIES = [..._counts.entries()]
  .map(([name, count]) => ({ name, count }))
  .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name))

export const VOCAB_CATEGORY_NAMES = VOCAB_CATEGORIES.map((c) => c.name)

export function getVocabByCategories(categories) {
  if (!categories || categories.length === 0) return []
  const set = new Set(categories)
  // 'Semua' dianggap sebagai seluruh vocab (dipakai Setup saat semua dicentang)
  if (set.has('Semua') || set.size >= VOCAB_CATEGORIES.length) return [...VOCAB_ALL]
  return VOCAB_ALL.filter((v) => set.has(v.kategori))
}
