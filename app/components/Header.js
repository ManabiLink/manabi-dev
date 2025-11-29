"use client"

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

export default function Header() {
  const [userEmail, setUserEmail] = useState(null)
  const router = useRouter()

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const { data } = await supabase.auth.getUser()
        const user = data?.user || null
        if (!mounted) return
        setUserEmail(user?.email || null)
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
        <nav className="nav">
          <Link href="/expert-check">承認一覧</Link>
          <Link href="/expert-check/list">リスト</Link>
        </nav>
        <div className="account">
          {userEmail ? (
            <>
              <span className="email">{userEmail}</span>
              <button className="signout" onClick={signOut}>サインアウト</button>
            </>
          ) : (
            <Link href="/login">ログイン</Link>
          )}
        </div>
      </div>
      <style jsx>{`
        .site-header { border-block-end: 1px solid #eee; background: #fff }
        .inner { max-inline-size: 1100px; margin-inline: auto; padding: 12px 18px; display:flex; align-items:center; gap:12px }
        .brand a { font-weight:700; color:#111; text-decoration:none }
        .nav { display:flex; gap:12px; margin-inline-start:12px }
        .nav a { color:#0066cc; text-decoration:none }
        .account { margin-inline-start:auto; display:flex; gap:8px; align-items:center }
        .signout { background:transparent; border:1px solid #ddd; padding:6px 8px; border-radius:6px; cursor:pointer }
        .email { font-size:13px; color:#333 }
      `}</style>
    </header>
  )
}
