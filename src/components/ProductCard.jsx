import React from 'react'
import { Link } from 'react-router-dom'
import { useShop } from '../cart.jsx'
import { money } from '../api.js'

export default function ProductCard({ p }) {
  const { add } = useShop()
  const out = p.stock <= 0
  return (
    <article className="showcase reveal">
      <Link to={`/product/${p.id}`} className="frame" aria-label={p.name}>
        <img src={p.image_url} alt={p.name} loading="lazy" />
        {out && <span className="tag">Sold out</span>}
      </Link>
      <div className="floor" />
      <div className="show-body">
        <h3><Link to={`/product/${p.id}`}>{p.name}</Link></h3>
        {p.tagline && <p className="tagline">{p.tagline}</p>}
        {p.description && <p className="muted">{p.description}</p>}
        <p className="price">{money(p.price)}{p.size && <small> · {p.size}</small>}</p>
        <div className="row center-row">
          <button className="btn" disabled={out} onClick={() => add(p)}>{out ? 'Sold out' : 'Add to cart'}</button>
          <Link className="btn o" to={`/product/${p.id}`}>Details</Link>
        </div>
      </div>
    </article>
  )
}
