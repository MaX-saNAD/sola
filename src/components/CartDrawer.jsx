import React, { useState } from 'react'
import { useShop } from '../cart.jsx'
import { money } from '../api.js'
import { Close, WhatsApp } from './Icons.jsx'

export default function CartDrawer() {
  const { items, setQty, clear, total, open, setOpen, settings } = useShop()
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [err, setErr] = useState('')

  const checkout = (e) => {
    e.preventDefault()
    if (!name.trim() || !phone.trim() || !address.trim()) {
      setErr('Please fill in your name, phone and address.')
      return
    }
    const lines = items.map((i) => `• ${i.qty} × ${i.product.name}${i.product.size ? ` (${i.product.size})` : ''} – ${money(i.qty * i.product.price)}`)
    const msg = [
      'Hi SOLA! I would like to order:',
      ...lines,
      `Total: ${money(total)}`,
      '',
      `Name: ${name.trim()}`,
      `Phone: ${phone.trim()}`,
      `Address: ${address.trim()}`,
    ].join('\n')
    window.open(`https://wa.me/${settings.whatsapp}?text=${encodeURIComponent(msg)}`, '_blank', 'noopener')
    clear()
    setErr('')
    setOpen(false)
  }

  return (
    <>
      <div className={open ? 'scrim show' : 'scrim'} onClick={() => setOpen(false)} />
      <aside className={open ? 'drawer open' : 'drawer'} aria-hidden={!open} aria-label="Shopping cart">
        <div className="drawer-head">
          <h2>Your cart</h2>
          <button className="icon-btn" onClick={() => setOpen(false)} aria-label="Close cart"><Close /></button>
        </div>

        {items.length === 0 ? (
          <p className="empty">Your cart is empty. Find your signature scent in the shop.</p>
        ) : (
          <form onSubmit={checkout} className="drawer-body">
            <ul className="lines">
              {items.map(({ product, qty }) => (
                <li key={product.id}>
                  <img src={product.image_url} alt="" />
                  <div>
                    <b>{product.name}</b>
                    <span>{money(product.price)}</span>
                    <div className="qty">
                      <button type="button" onClick={() => setQty(product.id, qty - 1)} aria-label="Less">−</button>
                      <span>{qty}</span>
                      <button type="button" onClick={() => setQty(product.id, qty + 1)} disabled={qty >= product.stock} aria-label="More">+</button>
                    </div>
                  </div>
                  <b>{money(qty * product.price)}</b>
                </li>
              ))}
            </ul>

            <div className="total"><span>Total</span><b>{money(total)}</b></div>

            <div className="fields">
              <input placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />
              <input placeholder="Phone number" value={phone} onChange={(e) => setPhone(e.target.value)} inputMode="tel" autoComplete="tel" />
              <textarea placeholder="Delivery address" rows="2" value={address} onChange={(e) => setAddress(e.target.value)} autoComplete="street-address" />
            </div>
            {err && <p className="err">{err}</p>}
            <button className="btn full" type="submit"><WhatsApp /> Order on WhatsApp</button>
            <p className="hint">We confirm your order and delivery on WhatsApp. Payment on delivery.</p>
          </form>
        )}
      </aside>
    </>
  )
}
