import React, { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api, money } from '../api.js'

const KEY = 'sola-admin-token'
const getToken = () => { try { return localStorage.getItem(KEY) || '' } catch { return '' } }
const EMPTY = { name: '', tagline: '', description: '', price: 0, size: '50 ml', image_url: '', stock: 10, visible: true, sort: 0 }

// Shrinks the photo in the browser so uploads stay small and fast.
function resizeImage(file, max = 1400) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      const scale = Math.min(1, max / Math.max(img.width, img.height))
      const c = document.createElement('canvas')
      c.width = Math.round(img.width * scale)
      c.height = Math.round(img.height * scale)
      c.getContext('2d').drawImage(img, 0, 0, c.width, c.height)
      c.toBlob((blob) => {
        if (!blob) return reject(new Error('Could not read image'))
        const r = new FileReader()
        r.onload = () => resolve({ type: 'image/jpeg', data: String(r.result).split(',')[1] })
        r.readAsDataURL(blob)
      }, 'image/jpeg', 0.88)
    }
    img.onerror = () => reject(new Error('Could not read image'))
    img.src = URL.createObjectURL(file)
  })
}

export default function Admin() {
  const [token, setToken] = useState(getToken)
  const logout = () => { try { localStorage.removeItem(KEY) } catch {}; setToken('') }
  return token
    ? <Dashboard token={token} onLogout={logout} />
    : <Login onDone={(t) => { try { localStorage.setItem(KEY, t) } catch {}; setToken(t) }} />
}

function Login({ onDone }) {
  const [pw, setPw] = useState('')
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)
  const submit = async (e) => {
    e.preventDefault(); setBusy(true); setErr('')
    try { onDone((await api.login(pw)).token) } catch (e2) { setErr(e2.message) } finally { setBusy(false) }
  }
  return (
    <div className="login">
      <form onSubmit={submit} className="panel">
        <img src="/logo.jpg" alt="SOLA" />
        <h2>Admin</h2>
        <input type="password" placeholder="Password" value={pw} onChange={(e) => setPw(e.target.value)} autoFocus />
        {err && <p className="err">{err}</p>}
        <button className="btn full" disabled={busy || !pw}>{busy ? 'Signing in…' : 'Sign in'}</button>
        <Link to="/" className="back">← Back to store</Link>
      </form>
    </div>
  )
}

function Dashboard({ token, onLogout }) {
  const [tab, setTab] = useState('products')
  return (
    <div className="admin">
      <header className="admin-bar">
        <b className="logo">SOLA <small>ADMIN</small></b>
        <nav>
          <button className={tab === 'products' ? 'on' : ''} onClick={() => setTab('products')}>Products</button>
          <button className={tab === 'settings' ? 'on' : ''} onClick={() => setTab('settings')}>Settings</button>
        </nav>
        <div>
          <Link to="/" className="link">View store</Link>
          <button className="link" onClick={onLogout}>Log out</button>
        </div>
      </header>
      <div className="admin-main">
        {tab === 'products' ? <Products token={token} onLogout={onLogout} /> : <Settings token={token} onLogout={onLogout} />}
      </div>
    </div>
  )
}

function useGuard(onLogout) {
  return useCallback((e) => { if (e.status === 401) onLogout(); return e.message }, [onLogout])
}

function Products({ token, onLogout }) {
  const [rows, setRows] = useState(null)
  const [edit, setEdit] = useState(null)
  const [msg, setMsg] = useState('')
  const guard = useGuard(onLogout)

  const load = useCallback(() => {
    api.adminProducts(token).then(setRows).catch((e) => setMsg(guard(e)))
  }, [token, guard])
  useEffect(load, [load])

  const quick = async (p, patch) => {
    try { await api.updateProduct(token, p.id, patch); load() } catch (e) { setMsg(guard(e)) }
  }
  const remove = async (p) => {
    if (!confirm(`Delete "${p.name}"? This cannot be undone.`)) return
    try { await api.deleteProduct(token, p.id); load() } catch (e) { setMsg(guard(e)) }
  }

  return (
    <>
      <div className="admin-head">
        <h2>Products</h2>
        <button className="btn sm" onClick={() => setEdit({ ...EMPTY, sort: (rows?.length || 0) + 1 })}>+ Add product</button>
      </div>
      {msg && <p className="err">{msg}</p>}
      {!rows ? <p className="muted">Loading…</p> : (
        <div className="table">
          {rows.map((p) => (
            <div className="trow" key={p.id}>
              <img src={p.image_url} alt="" />
              <div className="tname"><b>{p.name}</b><span>{money(p.price)} · {p.size}</span></div>
              <label className="mini">Stock
                <input type="number" min="0" defaultValue={p.stock} onBlur={(e) => Number(e.target.value) !== p.stock && quick(p, { stock: Number(e.target.value) })} />
              </label>
              <label className="switch">
                <input type="checkbox" checked={p.visible} onChange={(e) => quick(p, { visible: e.target.checked })} />
                <span>{p.visible ? 'Visible' : 'Hidden'}</span>
              </label>
              <div className="tact">
                <button className="link" onClick={() => setEdit(p)}>Edit</button>
                <button className="link danger" onClick={() => remove(p)}>Delete</button>
              </div>
            </div>
          ))}
          {rows.length === 0 && <p className="muted">No products yet.</p>}
        </div>
      )}
      {edit && <Editor token={token} product={edit} guard={guard} onClose={() => setEdit(null)} onSaved={() => { setEdit(null); load() }} />}
    </>
  )
}

function Editor({ token, product, guard, onClose, onSaved }) {
  const [f, setF] = useState(product)
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)
  const set = (k) => (e) => setF({ ...f, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value })

  const pick = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setBusy(true); setErr('')
    try {
      const { type, data } = await resizeImage(file)
      const { url } = await api.upload(token, type, data)
      setF((cur) => ({ ...cur, image_url: url }))
    } catch (e2) { setErr(guard(e2)) } finally { setBusy(false) }
  }

  const save = async (e) => {
    e.preventDefault(); setBusy(true); setErr('')
    try {
      const body = { name: f.name, tagline: f.tagline, description: f.description, price: f.price, size: f.size, image_url: f.image_url, stock: f.stock, visible: f.visible, sort: f.sort }
      if (f.id) await api.updateProduct(token, f.id, body); else await api.createProduct(token, body)
      onSaved()
    } catch (e2) { setErr(guard(e2)); setBusy(false) }
  }

  return (
    <div className="modal" onClick={onClose}>
      <form className="panel editor" onClick={(e) => e.stopPropagation()} onSubmit={save}>
        <h2>{f.id ? 'Edit product' : 'New product'}</h2>
        <div className="img-edit">
          {f.image_url ? <img src={f.image_url} alt="" /> : <div className="noimg">No image</div>}
          <label className="btn o sm">
            {busy ? 'Uploading…' : 'Upload image'}
            <input type="file" accept="image/png,image/jpeg,image/webp" onChange={pick} hidden />
          </label>
        </div>
        <label>Name<input required value={f.name} onChange={set('name')} /></label>
        <label>Tagline<input value={f.tagline} onChange={set('tagline')} /></label>
        <label>Description<textarea rows="3" value={f.description} onChange={set('description')} /></label>
        <div className="two">
          <label>Price (EGP)<input type="number" min="0" step="any" value={f.price} onChange={set('price')} /></label>
          <label>Size<input value={f.size} onChange={set('size')} /></label>
        </div>
        <div className="two">
          <label>Stock<input type="number" min="0" value={f.stock} onChange={set('stock')} /></label>
          <label>Order (1 = first)<input type="number" value={f.sort} onChange={set('sort')} /></label>
        </div>
        <label>Image URL (or upload above)<input value={f.image_url} onChange={set('image_url')} /></label>
        <label className="switch"><input type="checkbox" checked={f.visible} onChange={set('visible')} /><span>Visible in store</span></label>
        {err && <p className="err">{err}</p>}
        <div className="row">
          <button className="btn" disabled={busy}>Save</button>
          <button type="button" className="btn o" onClick={onClose}>Cancel</button>
        </div>
      </form>
    </div>
  )
}

function Settings({ token, onLogout }) {
  const [f, setF] = useState(null)
  const [msg, setMsg] = useState('')
  const guard = useGuard(onLogout)
  useEffect(() => { api.settings().then(setF).catch((e) => setMsg(guard(e))) }, [guard])
  if (!f) return <p className="muted">{msg || 'Loading…'}</p>
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value })
  const save = async (e) => {
    e.preventDefault(); setMsg('')
    try { setF(await api.saveSettings(token, f)); setMsg('Saved ✓') } catch (e2) { setMsg(guard(e2)) }
  }
  return (
    <form className="panel settings" onSubmit={save}>
      <h2>Store settings</h2>
      <label>WhatsApp number for orders (country code, digits only)<input value={f.whatsapp} onChange={set('whatsapp')} placeholder="201005226506" /></label>
      <label>Instagram link<input value={f.instagram} onChange={set('instagram')} /></label>
      <label>TikTok link<input value={f.tiktok} onChange={set('tiktok')} /></label>
      <label>Facebook link<input value={f.facebook} onChange={set('facebook')} /></label>
      {msg && <p className={msg.includes('✓') ? 'ok' : 'err'}>{msg}</p>}
      <button className="btn">Save settings</button>
    </form>
  )
}
