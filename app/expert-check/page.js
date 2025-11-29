"use client"

import React, { useEffect, useState } from 'react'

// 専門家の承認フローの確認画面
// 表示: `expert_requests` テーブルの全データを一覧表示し、承認/却下で status を更新

const APPROVED = '承認'
const REJECTED = '拒否'

export default function ExpertCheckPage() {
    const [items, setItems] = useState([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    const fetchItems = async () => {
        setLoading(true)
        setError(null)
        try {
            const res = await fetch('/api/expert-requests')
            if (!res.ok) {
                // Try to parse error message from server
                const errBody = await res.json().catch(() => null)
                throw new Error(errBody?.error || `Failed to fetch (status ${res.status})`)
            }
            const data = await res.json()
            setItems(data || [])
        } catch (err) {
            setError(err.message || String(err))
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchItems()
    }, [])

    const updateStatus = async (id, status) => {
        if (!confirm(`ID ${id} のステータスを「${status}」に変更しますか？`)) return
        try {
            const res = await fetch('/api/expert-requests', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, status }),
            })
            if (!res.ok) {
                const errBody = await res.json().catch(() => null)
                throw new Error(errBody?.error || `更新に失敗しました (status ${res.status})`)
            }
            const updated = await res.json()
            setItems((prev) => prev.map((p) => (p.id === updated.id ? updated : p)))
        } catch (err) {
            alert(err.message)
        }
    }

    return (
        <div className="container">
            <h1>専門家申請の承認</h1>
            {loading && <p>読み込み中…</p>}
            {error && <p className="error">{error}</p>}
            {!loading && items.length === 0 && <p>申請はありません。</p>}

            {/* デスクトップ: テーブル表示 */}
            {items.length > 0 && (
                <table className="desktop-table">
                    <thead>
                        <tr>
                            <th>申請者情報</th>
                            <th>ステータス</th>
                            <th>操作</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.map((item) => (
                            <tr key={item.id || JSON.stringify(item)}>
                                <td className="cell-info">
                                    {(() => {
                                        const hideKeys = new Set(['id', 'pic', 'picture', 'avatar'])
                                        const labelMap = {
                                            name: '名前',
                                            full_name: '名前',
                                            display_name: '表示名',
                                            email: 'メール',
                                            phone: '電話',
                                            bio: '自己紹介',
                                            note: '備考',
                                            status: 'ステータス',
                                            created_at: '申請日時',
                                            updated_at: '更新日時',
                                        }

                                        const preferredOrder = ['name', 'display_name', 'full_name', 'email', 'phone', 'bio', 'note', 'created_at']

                                        const parts = []

                                        for (const key of preferredOrder) {
                                            if (key in item && !hideKeys.has(key)) {
                                                parts.push(
                                                    <div key={key} className="row">
                                                        <strong>{labelMap[key] || key}:</strong> {String(item[key])}
                                                    </div>
                                                )
                                            }
                                        }

                                        const otherKeys = Object.keys(item).filter((k) => !preferredOrder.includes(k) && !hideKeys.has(k))
                                        if (otherKeys.length > 0) {
                                            parts.push(
                                                <div key="others" className="other">
                                                    <strong>その他:</strong>
                                                    <div className="other-list">
                                                        {otherKeys.map((k) => (
                                                            <div key={k} className="other-row">
                                                                <strong>{labelMap[k] || k}:</strong> {String(item[k])}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )
                                        }

                                        return parts
                                    })()}
                                </td>
                                <td className="cell-status">{item.status}</td>
                                <td className="cell-actions">
                                    <div className="actions">
                                        <button onClick={() => updateStatus(item.id, APPROVED)} disabled={item.status === APPROVED}>
                                            承認
                                        </button>
                                        <button onClick={() => updateStatus(item.id, REJECTED)} disabled={item.status === REJECTED}>
                                            却下
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}

            {/* モバイル: カード表示 */}
            {items.length > 0 && (
                <div className="card-list">
                    {items.map((item) => (
                        <div className="card" key={item.id || JSON.stringify(item)}>
                            <div className="card-info">
                                {(() => {
                                    const hideKeys = new Set(['id', 'pic', 'picture', 'avatar'])
                                    const labelMap = {
                                        name: '名前',
                                        full_name: '名前',
                                        display_name: '表示名',
                                        email: 'メール',
                                        phone: '電話',
                                        bio: '自己紹介',
                                        note: '備考',
                                        status: 'ステータス',
                                        created_at: '申請日時',
                                        updated_at: '更新日時',
                                    }

                                    const preferredOrder = ['name', 'display_name', 'full_name', 'email', 'phone', 'bio', 'note', 'created_at']

                                    const parts = []
                                    for (const key of preferredOrder) {
                                        if (key in item && !hideKeys.has(key)) {
                                            parts.push(
                                                <div key={key} className="card-row">
                                                    <span className="card-label">{labelMap[key] || key}</span>
                                                    <span className="card-value">{String(item[key])}</span>
                                                </div>
                                            )
                                        }
                                    }
                                    const otherKeys = Object.keys(item).filter((k) => !preferredOrder.includes(k) && !hideKeys.has(k))
                                    if (otherKeys.length > 0) {
                                        parts.push(
                                            <div key="others" className="card-other">
                                                <div className="card-row"><span className="card-label">その他</span></div>
                                                {otherKeys.map((k) => (
                                                    <div key={k} className="card-row">
                                                        <span className="card-label">{labelMap[k] || k}</span>
                                                        <span className="card-value">{String(item[k])}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        )
                                    }
                                    return parts
                                })()}
                            </div>
                            <div className="card-footer">
                                <div className="card-status">{item.status}</div>
                                <div className="card-actions">
                                    <button onClick={() => updateStatus(item.id, APPROVED)} disabled={item.status === APPROVED}>承認</button>
                                    <button onClick={() => updateStatus(item.id, REJECTED)} disabled={item.status === REJECTED}>却下</button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <style jsx>{`
                .container { padding: 20px; }
                h1 { margin: 0 0 12px 0; }
                .error { color: red; }
                table { inline-size: 100%; border-collapse: collapse; }
                table thead th { border: 1px solid #ddd; padding: 8px; text-align: start; background:#fafafa }
                table tbody td { border: 1px solid #eee; padding: 8px; vertical-align: top }
                .cell-status { text-align: center; inline-size: 120px }
                .cell-actions { inline-size: 160px }
                .actions { display: flex; gap: 8px }

                /* card list (mobile) */
                .card-list { display: none }
                .card { border: 1px solid #eee; padding: 12px; border-radius: 8px; margin-block-end: 12px; }
                .card-row { display:flex; gap:8px; margin-block-end:6px }
                .card-label { min-inline-size:80px; font-weight:600 }
                .card-value { flex:1 }
                .card-footer { display:flex; justify-content:space-between; align-items:center; margin-block-start:8px }
                .card-actions { display:flex; gap:8px }

                @media (max-inline-size: 640px) {
                    /* hide table, show cards */
                    table { display: none }
                    .card-list { display: block }
                }
            `}</style>
        </div>
    )
}
