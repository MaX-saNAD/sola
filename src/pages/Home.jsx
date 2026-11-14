import React, { useEffect, useState } from 'react'
import { api } from '../api.js'
import { useShop } from '../cart.jsx'
import ProductCard from '../components/ProductCard.jsx'
import { Arrow, Diamond, Leaf, Sparkle, Instagram, WhatsApp } from '../components/Icons.jsx'

// Fade/slide elements in as they scroll into view.
function useReveal(dep) {
  useEffect(() => {
    const els = document.querySelectorAll('.reveal')
    if (!('IntersectionObserver' in window)) { els.forEach((e) => e.classList.add('in')); return }
    const io = new IntersectionObserver((entries) => entries.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target) }
    }), { threshold: 0.15 })
    els.forEach((e) => io.observe(e))
    return () => io.disconnect()
  }, [dep])
}

export default function Home() {
  const [products, setProducts] = useState(null)
  const [error, setError] = useState('')
  const { settings } = useShop()
  useReveal(products)
  const stageImgs = (products || []).filter((p) => p.image_url).slice(0, 2).map((p) => p.image_url)

  useEffect(() => {
    api.products().then(setProducts).catch((e) => setError(e.message))
  }, [])

  return (
    <>
      <section className="hero">
        <div className="glow" aria-hidden="true" />
        <img className="hero-logo" src="/logo.jpg" alt="SOLA Cosmetics" />
        <p className="sub">Eau de Parfum · 50 ml</p>
        <h1>Your glow, your aura, your story.</h1>
        <p className="lead">Fragrance made by pharmacy students, for girls and guys who want to glow.</p>
        <div className="row center-row">
          <a className="btn" href="#shop" onClick={(e) => { e.preventDefault(); document.getElementById('shop').scrollIntoView({ behavior: 'smooth' }) }}>
            Shop the collection <Arrow />
          </a>
        </div>

        <div className="stage" aria-hidden={!stageImgs.length}>
          {stageImgs.map((src, i) => (
            <img key={src + i} src={src} alt="" className={`stage-img s${i}`} />
          ))}
          <div className="floor" />
        </div>

        <ul className="proof">
          <li><Diamond /><b>Pharmacy-student made</b><span>Formulated with precision</span></li>
          <li><Sparkle /><b>Long-lasting</b><span>A scent that stays</span></li>
          <li><Leaf /><b>Premium quality</b><span>Elegant &amp; refreshing</span></li>
          <li><WhatsApp /><b>Order in a minute</b><span>Confirmed on WhatsApp</span></li>
        </ul>
        {settings.instagram && (
          <a className="follow" href={settings.instagram} target="_blank" rel="noopener noreferrer">
            <Instagram /> Follow @sola_cosmatics
          </a>
        )}
      </section>

      <section id="shop" className="wrap shop">
        <div className="sub center">The collection</div>
        <h2 className="center">Our Fragrances</h2>
        {error && <p className="center err">Could not load products. {error}</p>}
        {!products && !error && <p className="center muted">Loading…</p>}
        {products && products.length === 0 && <p className="center muted">New scents are on the way.</p>}
        <div className="stack">
          {products?.map((p) => <ProductCard key={p.id} p={p} />)}
        </div>
      </section>

      <section id="about" className="wrap about">
        <div className="sub">About SOLA</div>
        <h2>Made with science, finished with light.</h2>
        <p>SOLA was born in a pharmacy college, where formulas are studied before they are sold.</p>
        <p className="muted">Every product starts with one question: what does your skin actually need? We pair a pharmacist’s precision with a soft, sunlit approach to beauty.</p>
        <div className="values">
          <div><Diamond /><h3>Science first</h3><p>Pharmacy-student formulation, with every ingredient chosen for a reason.</p></div>
          <div><Sparkle /><h3>Glow for everyone</h3><p>Designed for girls and guys, in every skin type and story.</p></div>
          <div><Leaf /><h3>Honest details</h3><p>Clear labels, simple routines, and no empty promises.</p></div>
        </div>
      </section>

      <section id="contact" className="wrap contact">
        <div className="sub center">Get in touch</div>
        <h2 className="center">Contact Us</h2>
        <p className="center muted">Questions about a scent or an order? Message us, we reply fast.</p>
        <div className="row center-row">
          {settings.whatsapp && (
            <a className="btn" href={`https://wa.me/${settings.whatsapp}`} target="_blank" rel="noopener noreferrer"><WhatsApp /> WhatsApp</a>
          )}
          {settings.instagram && (
            <a className="btn o" href={settings.instagram} target="_blank" rel="noopener noreferrer"><Instagram /> Instagram</a>
          )}
        </div>
      </section>
    </>
  )
}
