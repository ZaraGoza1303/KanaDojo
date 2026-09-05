import { test, expect } from '@playwright/test'
import { VOCAB } from '../src/data/vocab.js'

test('vocab: kana muncul di contoh_kana (no mismatch)', async () => {
  const bad=[]
  for(const v of VOCAB){
    if(!v.contoh_kana.includes(v.kana)){
      bad.push(`${v.id}:${v.kana} -> ${v.contoh_kana}`)
    }
  }
  expect(bad, `mismatch found:\n${bad.join('\n')}`).toEqual([])
})

test('vocab: gairaigo pakai Katakana (ホテル bukan ほてる)', async () => {
  const mustKatakana = ['ホテル','コーヒー','パン','ビール','ジュース','ワイン','バナナ','パンダ','ケーキ','チョコレート','アイス','ラーメン','ベッド','パソコン','テレビ','ラジオ','ペン','バス','タクシー','デパート','スーパー','コンビニ','レストラン','ピンク']
  for(const k of mustKatakana){
    const found = VOCAB.some(v=> v.kana===k)
    expect(found, `missing katakana ${k}`).toBeTruthy()
  }
  const hiraganaLoan = VOCAB.filter(v=> ['ほてる','こーひー','ぱん','びーる','じゅーす'].includes(v.kana))
  expect(hiraganaLoan).toEqual([])
})

test('vocab: spesifik よむ harus nyambung', async () => {
  const yomu = VOCAB.find(v=> v.kana==='よむ')
  expect(yomu).toBeTruthy()
  expect(yomu.contoh_kana).toBe('ほんを よむ')
})

test('UI: vocab hub tampil dan pilihan ganda bisa dimainkan', async ({ page }) => {
  await page.goto('/')
  await page.waitForLoadState('networkidle')
  const expand = page.getByText(/Lihat mode lebih banyak/)
  if(await expand.isVisible({ timeout: 2000 }).catch(()=>false)) await expand.click()
  await expect(page.getByText('Mode Kosakata')).toBeVisible()
  await page.getByText('Mode Kosakata').click()
  await expect(page.getByText('Pilih mode belajar')).toBeVisible()
  await page.getByText('Pilihan Ganda').click()
  await expect(page.getByText('Pilihan Ganda').first()).toBeVisible()
  await expect(page.getByLabel('Romaji')).toBeVisible()
})
