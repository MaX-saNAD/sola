import React, { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useShop } from '../cart.jsx'
import { Bag } from './Icons.jsx'

export default function Header() {
  const { count, setOpen } = useShop()
  const [menu, setMenu] = useState(false)
  const { pathname } = useLocation()
  const nav = useNavigate()

  const go = (id) => (e) => {
    e.preventDefault()
    setMenu(false)
    if (pathname !== '/') nav('/')
    setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }), pathname === '/' ? 0 : 120)
  }

  return (
    <header className="hdr">
      <div className="bar">
        <Link to="/" className="logo" aria-label="SOLA Cosmetics home">
          SOLA<small>COSMETICS</small>
        </Link>
        <nav className={menu ? 'nav open' : 'nav'}>
          <a href="/#shop" onClick={go('shop')}>Shop</a>
          <a href="/#about" onClick={go('about')}>About</a>
          <a href="/#contact" onClick={go('contact')}>Contact</a>
        </nav>
        <div className="bar-actions">
          <button className="icon-btn" onClick={() => setOpen(true)} aria-label={`Cart, ${count} items`}>
            <Bag />
            {count > 0 && <span className="badge">{count}</span>}
          </button>
          <button className="icon-btn burger" onClick={() => setMenu(!menu)} aria-label="Menu" aria-expanded={menu}>
            <span /><span />
          </button>
        </div>
      </div>
    </header>
  )
}
