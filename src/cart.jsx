import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { api } from './api.js'

const Ctx = createContext(null)
export const useShop = () => useContext(Ctx)

const DEFAULT_SETTINGS = {
  whatsapp: '201005226506',
  instagram: 'https://www.instagram.com/sola_cosmatics',
  tiktok: '',
  facebook: '',
}

function load() {
  try { return JSON.parse(localStorage.getItem('sola-cart')) || [] } catch { return [] }
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(load) // [{ product, qty }]
  const [open, setOpen] = useState(false)
  const [settings, setSettings] = useState(DEFAULT_SETTINGS)

  useEffect(() => {
    api.settings().then((s) => setSettings({ ...DEFAULT_SETTINGS, ...s })).catch(() => {})
  }, [])

  useEffect(() => {
    try { localStorage.setItem('sola-cart', JSON.stringify(items)) } catch {}
  }, [items])

  const value = useMemo(() => {
    const add = (product, qty = 1) => {
      setItems((cur) => {
        const found = cur.find((i) => i.product.id === product.id)
        const max = product.stock
        if (found) {
          return cur.map((i) =>
            i.product.id === product.id ? { product, qty: Math.min(max, i.qty + qty) } : i)
        }
        return [...cur, { product, qty: Math.min(max, qty) }]
      })
      setOpen(true)
    }
    const setQty = (id, qty) =>
      setItems((cur) =>
        cur.flatMap((i) => {
          if (i.product.id !== id) return [i]
          if (qty <= 0) return []
          return [{ ...i, qty: Math.min(i.product.stock, qty) }]
        }))
    const clear = () => setItems([])
    const count = items.reduce((n, i) => n + i.qty, 0)
    const total = items.reduce((n, i) => n + i.qty * i.product.price, 0)
    return { items, add, setQty, clear, count, total, open, setOpen, settings, setSettings }
  }, [items, open, settings])

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}
