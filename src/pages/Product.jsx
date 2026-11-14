import React, { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { api, money } from '../api.js'
import { useShop } from '../cart.jsx'

export default function Product() {
  const { id } = useParams()
  const [p, setP] = useState(null)
  const [error, setError] = useState('')
  const [qty, setQty] = useState(1)
  const { add } = useShop()

  useEffect(() => {
    setP(null); setError('')
    api.product(id).then(setP).catch((e) => setError(e.message))
    window.scrollTo(0, 0)
  }, [id])

  if (error) return <div className="wrap center"><p className="err">{error === 'Not found' ? 'This product is not available.' : error}</p><Link className="btn" to="/">Back to shop</Link></div>
  if (!p) return <div className="wrap center muted">Loading…</div>
  const out = p.stock <= 0

  return (
    <div className="wrap detail">
      <Link to="/" className="back">← All fragrances</Link>
      <div className="detail-grid">
        <img className="detail-img" src={p.image_url} alt={p.name} />
        <div>
          <div className="sub">SOLA Cosmetics</div>
          <h1 className="detail-title">{p.name}</h1>
          {p.tagline && <p className="tagline">{p.tagline}</p>}
          {p.description && <p>{p.description}</p>}
          <p className="price big">{money(p.price)}{p.size && <small> · {p.size}</small>}</p>
          <p className={out ? 'stock out' : 'stock'}>{out ? 'Out of stock' : p.stock <= 5 ? `Only ${p.stock} left` : 'In stock'}</p>
          {!out && (
            <div className="row">
              <div className="qty lg">
                <button onClick={() => setQty(Math.max(1, qty - 1))} aria-label="Less">−</button>
                <span>{qty}</span>
                <button onClick={() => setQty(Math.min(p.stock, qty + 1))} aria-label="More">+</button>
              </div>
              <button className="btn" onClick={() => add(p, qty)}>Add to cart</button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
