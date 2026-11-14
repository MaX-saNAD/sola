import React from 'react'

const base = { width: '1.2em', height: '1.2em', fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round' }
const I = (children) => (props) => <svg viewBox="0 0 24 24" {...base} {...props}>{children}</svg>

export const Bag = I(<><path d="M6 8h12l-1 12H7L6 8z" /><path d="M9 8V6a3 3 0 0 1 6 0v2" /></>)
export const Instagram = I(<><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.3" cy="6.7" r=".6" fill="currentColor" /></>)
export const TikTok = I(<path d="M14 3v11.5a3.5 3.5 0 1 1-3.5-3.5M14 3c.4 2.6 2 4.2 5 4.5" />)
export const Facebook = I(<path d="M14 8h3V4h-3a4 4 0 0 0-4 4v3H7v4h3v6h4v-6h3l1-4h-4V8.5c0-.3.2-.5.5-.5z" />)
export const WhatsApp = I(<><path d="M4 20l1.2-4A8 8 0 1 1 8 18.8L4 20z" /><path d="M9 9c0 3 3 6 6 6l1-1.5-2-1-1 .7c-.8-.4-1.6-1.2-2-2l.7-1-1-2L9 9z" /></>)
export const Close = I(<path d="M6 6l12 12M18 6L6 18" />)
export const Arrow = I(<path d="M5 12h14M13 6l6 6-6 6" />)
export const Diamond = I(<><path d="M6 4h12l3 5-9 11L3 9l3-5z" /><path d="M3 9h18M9 4l3 16M15 4l-3 16" /></>)
export const Leaf = I(<><path d="M5 19c0-9 5-14 15-14 0 10-5 15-14 15" /><path d="M5 19l8-8" /></>)
export const Sparkle = I(<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3z" />)
