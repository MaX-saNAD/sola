import React from 'react'
import { useShop } from '../cart.jsx'
import { Instagram, TikTok, Facebook, WhatsApp } from './Icons.jsx'

export default function Footer() {
  const { settings } = useShop()
  return (
    <footer className="ftr">
      <b className="ftr-logo">SOLA</b>
      <div className="socials">
        {settings.instagram && (
          <a href={settings.instagram} target="_blank" rel="noopener noreferrer" aria-label="SOLA on Instagram">
            <Instagram /> Instagram
          </a>
        )}
        {settings.tiktok && (
          <a href={settings.tiktok} target="_blank" rel="noopener noreferrer" aria-label="SOLA on TikTok"><TikTok /> TikTok</a>
        )}
        {settings.facebook && (
          <a href={settings.facebook} target="_blank" rel="noopener noreferrer" aria-label="SOLA on Facebook"><Facebook /> Facebook</a>
        )}
        {settings.whatsapp && (
          <a href={`https://wa.me/${settings.whatsapp}`} target="_blank" rel="noopener noreferrer" aria-label="SOLA on WhatsApp"><WhatsApp /> WhatsApp</a>
        )}
      </div>
      <p>© {new Date().getFullYear()} SOLA Cosmetics. All rights reserved.<br />Your glow, your aura, your story.</p>
    </footer>
  )
}
