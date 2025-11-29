"use client"

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

export default function Header() {
  const [userEmail, setUserEmail] = useState(null)
  const [userName, setUserName] = useState(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const router = useRouter()

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const { data } = await supabase.auth.getUser()
        const user = data?.user || null
        if (!mounted) return
        setUserEmail(user?.email || null)
        const nameFromMeta = user?.user_metadata?.full_name || user?.user_metadata?.name
        setUserName(nameFromMeta || null)
      } catch (e) {
        // ignore
      }
    })()
    return () => { mounted = false }
  }, [])

  const signOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <header className="site-header">
      <div className="inner">
        <div className="brand">
          <Link href="/">まなびリンク 管理</Link>
        </div>
        {/* ハンバーガーメニュー */}
        <button
          className="menu-btn"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((s) => !s)}
          aria-label="メニュー切替"
        >
          ☰
        </button>
        <nav className={`nav ${menuOpen ? 'open' : ''}`}>
          <div className="nav-links">
            <Link href="/expert-check" onClick={() => setMenuOpen(false)}>承認一覧</Link>
            <Link href="/expert-check/list" onClick={() => setMenuOpen(false)}>リスト</Link>
          </div>
          <div className="nav-account">
            {userEmail ? (
              <>
                {userName && <div className="name">{userName}</div>}
                <div className="email">{userEmail}</div>
                <button className="signout" onClick={signOut}>サインアウト</button>
              </>
            ) : (
              <Link href="/login" onClick={() => setMenuOpen(false)}>ログイン</Link>
            )}
          </div>
        </nav>
      </div>
      <style jsx>{`
        .site-header { border-block-end: 1px solid #eee; background: #fff }
        .inner { max-inline-size: 1100px; margin-inline: auto; padding: 12px 18px; display:flex; align-items:center; gap:12px; position: relative }
        .brand a { font-weight:700; color:#111; text-decoration:none; display:inline-block }
        .menu-btn { margin-inline-start:auto; background:transparent; border:1px solid #eee; border-radius:6px; padding:6px 8px; cursor:pointer }

        /* 共通のメニュー */
        .nav { position:fixed; inset-block-start:0; inset-inline-end:0; inline-size:260px; block-size:100vh; background:#fff; border-inline-start:1px solid #eee; box-shadow:-4px 0 16px rgba(0,0,0,0.08); transform:translateX(100%); transition:transform 0.2s ease-out; display:flex; flex-direction:column; justify-content:space-between; padding:16px 18px; z-index:50 }
        .nav.open { transform:translateX(0) }
        .nav-links { display:flex; flex-direction:column; gap:8px }
        .nav a { color:#0066cc; text-decoration:none; padding:6px 4px; border-radius:6px }

        .nav-account { margin-block-start:auto; border-block-start:1px solid #eee; padding-block-start:12px; display:flex; flex-direction:column; gap:4px; font-size:13px; color:#333 }
        .name { font-weight:600 }
        .email { max-inline-size:100%; overflow:hidden; text-overflow:ellipsis; white-space:nowrap }
        .signout { margin-block-start:8px; align-self:flex-start; background:transparent; border:1px solid #ddd; padding:6px 8px; border-radius:6px; cursor:pointer; font-size:13px }

        @media (min-inline-size: 960px) {
          /* PC でも右サイドメニューだが、将来のために余白だけ調整 */
          .nav { inline-size:280px }
        }
      `}</style>
    </header>
  )
}
