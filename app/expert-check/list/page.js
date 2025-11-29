"use client"

import React, { useEffect, useState } from 'react'

// 承認済み・許可済みの絞り込みリスト
// テーブル名: expert_requests

export default function ExpertApprovedListPage() {
    const [items, setItems] = useState([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [selected, setSelected] = useState(null)
    const [activeTab, setActiveTab] = useState('全て')

    const fetchItems = async () => {
        setLoading(true)
        setError(null)
        try {
            const res = await fetch('/api/expert-requests')
            if (!res.ok) {
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

    // ステータスの可能な保存値に対応（日本語 / 英語）
    const approvedStatuses = new Set(['承認', 'approved', 'APPROVED'])
    const allowedStatuses = new Set(['許可', 'allowed', 'ALLOWED'])

    // タブ切替用のステータス集計
    const all = items
    const pending = items.filter((it) => String(it.status || '') === '未確認')
    const approved = items.filter((it) => approvedStatuses.has(String(it.status)))
    const allowed = items.filter((it) => allowedStatuses.has(String(it.status)))
    const others = items.filter((it) => String(it.status || '') !== '未確認' && !approvedStatuses.has(String(it.status)) && !allowedStatuses.has(String(it.status)))

    const tabs = [
        { key: '全て', label: `全て (${all.length})` },
        { key: '未確認', label: `未確認 (${pending.length})` },
        { key: '承認', label: `承認 (${approved.length})` },
        { key: '許可', label: `許可 (${allowed.length})` },
        { key: 'その他', label: `その他 (${others.length})` },
    ]

    const itemsForActiveTab = () => {
        switch (activeTab) {
            case '未確認':
                return pending
            case '承認':
                return approved
            case '許可':
                return allowed
            case 'その他':
                return others
            case '全て':
            default:
                return all
        }
    }

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

    const renderSummary = (item) => {
        const preferred = ['name', 'display_name', 'full_name', 'email', 'phone', 'created_at']
        for (const k of preferred) {
            if (k in item && !hideKeys.has(k) && item[k] !== null && item[k] !== undefined) {
                // 名前フィールドは押せるようにする
                if (['name', 'display_name', 'full_name'].includes(k)) {
                    return (
                        <div className="summary">
                            {labelMap[k] || k}: <button type="button" className="name-btn" onClick={() => setSelected(item)}>{String(item[k])}</button>
                        </div>
                    )
                }
                return <div className="summary">{labelMap[k] || k}: {String(item[k])}</div>
            }
        }
        // フォールバック: 最初の表示可能なフィールドを返す
        const first = Object.keys(item).find((k) => !hideKeys.has(k))
        return (
            <div className="summary">
                {first}: <button type="button" className="name-btn" onClick={() => setSelected(item)}>{String(item[first])}</button>
            </div>
        )
    }

    return (
        <div className="wrap">
            <h2>承認済み / 許可済み リスト</h2>

            {loading && <p>読み込み中…</p>}
            {error && <p className="error">{error}</p>}

            <div className="tabs">
                {tabs.map((t) => (
                    <button
                        key={t.key}
                        className={`tab-btn ${activeTab === t.key ? 'active' : ''}`}
                        onClick={() => setActiveTab(t.key)}
                        type="button"
                    >
                        {t.label}
                    </button>
                ))}
            </div>

            <div className="lists">
                <section className="panel full-panel">
                    <h3>{activeTab} <small>({itemsForActiveTab().length})</small></h3>
                    {itemsForActiveTab().length === 0 ? (
                        <p>該当する申請はありません。</p>
                    ) : (
                        <ul className="list">
                            {itemsForActiveTab().map((it) => (
                                <li key={it.id || JSON.stringify(it)} className="item">
                                    <div className="left">{renderSummary(it)}</div>
                                    <div className="right">{String(it.status)}</div>
                                </li>
                            ))}
                        </ul>
                    )}
                </section>
            </div>

            {selected && (
                <div className="modal-overlay" onClick={() => setSelected(null)} role="button" tabIndex={0}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-head">
                            <h4>詳細情報</h4>
                            <button className="modal-close" onClick={() => setSelected(null)}>✕</button>
                        </div>
                        <div className="modal-body">
                            {Object.entries(selected).filter(([k]) => !hideKeys.has(k)).map(([k, v]) => (
                                <div key={k} className="modal-row">
                                    <div className="modal-label">{labelMap[k] || k}</div>
                                    <div className="modal-value">{String(v)}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            <style jsx>{`
        .wrap { padding: 18px }
        h2 { margin: 0 0 12px 0 }
        .error { color: #c00 }
        .lists { display: flex; gap: 16px; align-items: flex-start }
        .panel { flex: 1; border: 1px solid #eee; padding: 12px; border-radius: 8px; background: #fff }
        .full-panel { inline-size: 100% }
        .tabs { display:flex; gap:8px; margin-block-end:12px; flex-wrap:wrap }
        .tab-btn { background:transparent; border:1px solid #e6e6e6; padding:6px 10px; border-radius:6px; cursor:pointer }
        .tab-btn.active { background:#0066cc; color:#fff; border-color: #0066cc }
        .panel h3 { margin: 0 0 8px 0; font-size: 16px }
        .list { list-style: none; padding: 0; margin: 0 }
        .item { display:flex; justify-content:space-between; padding: 8px 6px; border-block-end: 1px solid #f3f3f3 }
        .item:last-child { border-block-end: none }
        .summary { font-size: 13px; color: #111 }
        .right { font-size: 13px; color: #666; min-inline-size: 80px; text-align: end }

        /* modal */
        .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.4); display:flex; align-items:center; justify-content:center; z-index:60 }
        .modal { inline-size: 90%; max-inline-size:720px; background:#fff; border-radius:8px; box-shadow:0 8px 30px rgba(0,0,0,0.15); overflow:auto }
        .modal-head { display:flex; align-items:center; justify-content:space-between; padding:12px 16px; border-block-end:1px solid #eee }
        .modal-body { padding:12px 16px; max-block-size:70vh; overflow:auto }
        .modal-row { display:flex; gap:12px; padding:6px 0; border-block-end:1px solid #fafafa }
        .modal-label { min-inline-size:140px; font-weight:600 }
        .modal-close { border:0; background:transparent; font-size:16px; cursor:pointer }
        .name-btn { border:0; background:transparent; color:#0066cc; cursor:pointer; padding:0; font-weight:600 }

        @media (max-inline-size: 720px) {
          .lists { flex-direction: column }
          .right { text-align: start }
        }
      `}</style>
        </div>
    )
}
