"use client"

import React, { useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

export default function LoginPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const router = useRouter()

    const onSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError(null)
        try {
            // 1) まず dev_account にメールが存在するか確認
            const checkRes = await fetch('/api/auth/check-allowed', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            })
            const checkBody = await checkRes.json().catch(() => ({}))
            if (!checkRes.ok) throw new Error(checkBody?.error || '許可チェックに失敗しました')

            if (!checkBody.allowed) {
                setError('アカウントが登録されていません')
                setLoading(false)
                return
            }

            // 2) 登録されている場合のみ auth の認証を行う
            const { data, error } = await supabase.auth.signInWithPassword({ email, password })
            if (error) throw error

            // 認証成功 -> 遷移
            router.push('/expert-check')
        } catch (err) {
            setError(err.message || String(err))
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="login-wrap">
            <h1>ログイン</h1>
            <form onSubmit={onSubmit}>
                <label>
                    メールアドレス
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </label>
                <label>
                    パスワード
                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                </label>
                <div style={{ marginBlockStart: 12 }}>
                    <button type="submit" disabled={loading}>{loading ? 'ログイン中…' : 'ログイン'}</button>
                </div>
                {error && <p style={{ color: 'red' }}>{error}</p>}
            </form>
            <style jsx>{`
        .login-wrap { padding: 18px; max-inline-size: 480px }
        label { display:block; margin-block-end:12px }
        input { inline-size: 100%; padding:8px; border:1px solid #ddd; border-radius:4px }
      `}</style>
        </div>
    )
}