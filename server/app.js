import express from 'express'
import cors from 'cors'
import jwt from 'jsonwebtoken'
import crypto from 'node:crypto'
import * as store from './store.js'

const app = express()
app.use(cors())
app.use(express.json({ limit: '4mb' }))

const isProd = process.env.NODE_ENV === 'production' || Boolean(process.env.VERCEL)
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || (isProd ? '' : 'admin123')
const JWT_SECRET = process.env.JWT_SECRET || (isProd ? '' : 'dev-secret')

const wrap = (fn) => (req, res) =>
  Promise.resolve(fn(req, res)).catch((e) => {
    console.error(e)
    res.status(500).json({ error: e.message || 'Server error' })
  })

function safeEqual(a, b) {
  const ha = crypto.createHash('sha256').update(String(a)).digest()
  const hb = crypto.createHash('sha256').update(String(b)).digest()
  return crypto.timingSafeEqual(ha, hb)
}

function requireAdmin(req, res, next) {
  const token = (req.headers.authorization || '').replace('Bearer ', '')
  try {
    jwt.verify(token, JWT_SECRET)
    next()
  } catch {
    res.status(401).json({ error: 'Not authorized' })
  }
}

function cleanProduct(b) {
  const out = {}
  if (b.name !== undefined) out.name = String(b.name).trim()
  if (b.tagline !== undefined) out.tagline = String(b.tagline).trim()
  if (b.description !== undefined) out.description = String(b.description).trim()
  if (b.size !== undefined) out.size = String(b.size).trim()
  if (b.image_url !== undefined) out.image_url = String(b.image_url).trim()
  if (b.price !== undefined) out.price = Math.max(0, Number(b.price) || 0)
  if (b.stock !== undefined) out.stock = Math.max(0, Math.floor(Number(b.stock) || 0))
  if (b.sort !== undefined) out.sort = Math.floor(Number(b.sort) || 0)
  if (b.visible !== undefined) out.visible = Boolean(b.visible)
  return out
}

// ---------- Public ----------
app.get('/api/health', (req, res) => res.json({ ok: true, supabase: store.usingSupabase }))

app.get('/api/products', wrap(async (req, res) => res.json(await store.listProducts())))

app.get('/api/products/:id', wrap(async (req, res) => {
  const p = await store.getProduct(req.params.id)
  if (!p || !p.visible) return res.status(404).json({ error: 'Not found' })
  res.json(p)
}))

app.get('/api/settings', wrap(async (req, res) => res.json(await store.getSettings())))

// ---------- Admin ----------
app.post('/api/admin/login', (req, res) => {
  if (!ADMIN_PASSWORD || !JWT_SECRET) {
    return res.status(500).json({ error: 'ADMIN_PASSWORD / JWT_SECRET are not set on the server.' })
  }
  if (!safeEqual(req.body?.password ?? '', ADMIN_PASSWORD)) {
    return res.status(401).json({ error: 'Wrong password' })
  }
  res.json({ token: jwt.sign({ role: 'admin' }, JWT_SECRET, { expiresIn: '7d' }) })
})

app.get('/api/admin/products', requireAdmin, wrap(async (req, res) =>
  res.json(await store.listProducts({ all: true }))))

app.post('/api/admin/products', requireAdmin, wrap(async (req, res) => {
  const p = cleanProduct(req.body)
  if (!p.name) return res.status(400).json({ error: 'Name is required' })
  res.status(201).json(await store.createProduct({
    tagline: '', description: '', size: '', image_url: '', price: 0, stock: 0, visible: true, sort: 0, ...p,
  }))
}))

app.put('/api/admin/products/:id', requireAdmin, wrap(async (req, res) => {
  const p = cleanProduct(req.body)
  if (p.name === '') return res.status(400).json({ error: 'Name is required' })
  const row = await store.updateProduct(req.params.id, p)
  if (!row) return res.status(404).json({ error: 'Not found' })
  res.json(row)
}))

app.delete('/api/admin/products/:id', requireAdmin, wrap(async (req, res) => {
  await store.deleteProduct(req.params.id)
  res.json({ ok: true })
}))

const EXT = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' }
app.post('/api/admin/upload', requireAdmin, wrap(async (req, res) => {
  const { contentType, data } = req.body || {}
  const ext = EXT[contentType]
  if (!ext || !data) return res.status(400).json({ error: 'Send a JPG, PNG or WebP image' })
  const buffer = Buffer.from(data, 'base64')
  if (buffer.length > 3.2 * 1024 * 1024) return res.status(413).json({ error: 'Image too large' })
  res.json({ url: await store.uploadImage({ contentType, buffer, ext }) })
}))

app.put('/api/admin/settings', requireAdmin, wrap(async (req, res) => {
  const allowed = ['whatsapp', 'instagram', 'tiktok', 'facebook']
  const s = {}
  for (const k of allowed) if (req.body?.[k] !== undefined) s[k] = String(req.body[k]).trim()
  if (s.whatsapp) s.whatsapp = s.whatsapp.replace(/\D/g, '')
  res.json(await store.saveSettings(s))
}))

export default app
