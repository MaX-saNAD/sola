const base = '/api'

async function req(path, opts = {}, token) {
  const res = await fetch(base + path, {
    ...opts,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    const err = new Error(data.error || 'Something went wrong')
    err.status = res.status
    throw err
  }
  return data
}

export const api = {
  products: () => req('/products'),
  product: (id) => req(`/products/${id}`),
  settings: () => req('/settings'),
  login: (password) => req('/admin/login', { method: 'POST', body: JSON.stringify({ password }) }),
  adminProducts: (t) => req('/admin/products', {}, t),
  createProduct: (t, p) => req('/admin/products', { method: 'POST', body: JSON.stringify(p) }, t),
  updateProduct: (t, id, p) => req(`/admin/products/${id}`, { method: 'PUT', body: JSON.stringify(p) }, t),
  deleteProduct: (t, id) => req(`/admin/products/${id}`, { method: 'DELETE' }, t),
  saveSettings: (t, s) => req('/admin/settings', { method: 'PUT', body: JSON.stringify(s) }, t),
  upload: (t, contentType, data) =>
    req('/admin/upload', { method: 'POST', body: JSON.stringify({ contentType, data }) }, t),
}

export const money = (n) => `EGP ${Number(n).toLocaleString('en-US', { maximumFractionDigits: 2 })}`
