'use client'

import { useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

export default function Page() {
  const router = useRouter()

  useEffect(() => {
    let mounted = true
      ; (async () => {
        try {
          const { data } = await supabase.auth.getUser()
          const user = data?.user || null
          if (!mounted) return
          if (!user) {
            router.replace('/login')
          } else {
            // ログイン済みなら承認画面へ遷移
            router.replace('/expert-check')
          }
        } catch (e) {
          // エラー時はログインへ
          router.replace('/login')
        }
      })()

    return () => { mounted = false }
  }, [router])

  return null
}