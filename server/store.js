// Data layer. Uses Supabase when env vars are set; otherwise an in-memory
// demo store so you can try everything locally without any setup.
import { createClient } from '@supabase/supabase-js'
import { randomUUID } from 'node:crypto'

const url = process.env.SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_KEY
export const usingSupabase = Boolean(url && key)
const sb = usingSupabase ? createClient(url, key, { auth: { persistSession: false } }) : null

const DEFAULT_SETTINGS = {
  whatsapp: '201005226506',
  instagram: 'https://www.instagram.com/sola_cosmatics',
  tiktok: 'https://www.tiktok.com/@sola_cosmatics',
  facebook: 'https://www.facebook.com/share/1FNz7bcWtf/',
}

const demoProducts = [
  { id: randomUUID(), name: 'Inferno – sola', tagline: 'More than a fragrance .. a signature',
    description: 'A bold scent that leaves a lasting impression.', price: 850, size: '50 ml',
    image_url: '/products/inferno.png', stock: 50, visible: true, sort: 1, created_at: new Date().toISOString() },
  { id: randomUUID(), name: 'Violet Soul – sola', tagline: 'Your glow, your aura, your story.',
    description: 'A captivating fragrance that reveals your inner elegance.', price: 799, size: '50 ml',
    image_url: '/products/violet-soul.png', stock: 50, visible: true, sort: 2, created_at: new Date().toISOString() },
]
const demoSettings = { ...DEFAULT_SETTINGS }

const fail = (e) => { if (e) throw new Error(e.message || String(e)) }

export async function listProducts({ all = false } = {}) {
  if (!usingSupabase) {
    return demoProducts.filter((p) => all || p.visible).sort((a, b) => a.sort - b.sort)
  }
  let q = sb.from('products').select('*').order('sort').order('created_at')
  if (!all) q = q.eq('visible', true)
  const { data, error } = await q
  fail(error)
  return data
}

export async function getProduct(id) {
  if (!usingSupabase) return demoProducts.find((p) => p.id === id) || null
  const { data, error } = await sb.from('products').select('*').eq('id', id).maybeSingle()
  fail(error)
  return data
}

export async function createProduct(p) {
  if (!usingSupabase) {
    const row = { ...p, id: randomUUID(), created_at: new Date().toISOString() }
    demoProducts.push(row)
    return row
  }
  const { data, error } = await sb.from('products').insert(p).select().single()
  fail(error)
  return data
}

export async function updateProduct(id, p) {
  if (!usingSupabase) {
    const i = demoProducts.findIndex((x) => x.id === id)
    if (i < 0) return null
    demoProducts[i] = { ...demoProducts[i], ...p }
    return demoProducts[i]
  }
  const { data, error } = await sb.from('products').update(p).eq('id', id).select().maybeSingle()
  fail(error)
  return data
}

export async function deleteProduct(id) {
  if (!usingSupabase) {
    const i = demoProducts.findIndex((x) => x.id === id)
    if (i >= 0) demoProducts.splice(i, 1)
    return
  }
  const { error } = await sb.from('products').delete().eq('id', id)
  fail(error)
}

export async function getSettings() {
  if (!usingSupabase) return { ...demoSettings }
  const { data, error } = await sb.from('settings').select('*')
  fail(error)
  const out = { ...DEFAULT_SETTINGS }
  for (const r of data) out[r.key] = r.value
  return out
}

export async function saveSettings(s) {
  if (!usingSupabase) { Object.assign(demoSettings, s); return getSettings() }
  const rows = Object.entries(s).map(([key, value]) => ({ key, value: String(value ?? '') }))
  const { error } = await sb.from('settings').upsert(rows)
  fail(error)
  return getSettings()
}

// Returns a public URL for the uploaded image.
export async function uploadImage({ contentType, buffer, ext }) {
  if (!usingSupabase) {
    return `data:${contentType};base64,${buffer.toString('base64')}`
  }
  const path = `${randomUUID()}.${ext}`
  const { error } = await sb.storage.from('products').upload(path, buffer, { contentType, upsert: false })
  fail(error)
  return sb.storage.from('products').getPublicUrl(path).data.publicUrl
}

export { DEFAULT_SETTINGS }
