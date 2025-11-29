'use client'
import React from 'react'

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="inner">© {new Date().getFullYear()} まなびリンク2025</div>
      <style jsx>{`
        .site-footer { border-block-start: 1px solid #eee; background:#fff; margin-block-start:24px }
        .inner { max-inline-size:1100px; margin-inline:auto; padding:12px 18px; color:#666 }
      `}</style>
    </footer>
  )
}
