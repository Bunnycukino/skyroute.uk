'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/Sidebar';

interface ExpiryRow {
  id: number;
  c209_number: string;
  creation_date: string;
  last_checked: string;
  status: 'Active' | 'Expired';
  inserted_at: string;
}

export default function ExpiryPage() {
  const router = useRouter();
  const [rows, setRows] = useState<ExpiryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'Active' | 'Expired'>('all');

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/tracker');
        if (res.status === 401) { router.push('/'); return; }
        const data = await res.json();
        setRows(data.rows || []);
      } catch (err) { console.error('Failed to load expiry tracker'); }
      finally { setLoading(false); }
    }
    load();
  }, [router]);

  function hoursElapsed(dateStr: string): number {
    return (Date.now() - new Date(dateStr).getTime()) / 3_600_000;
  }

  function hoursRemaining(dateStr: string): number {
    return Math.max(0, 48 - hoursElapsed(dateStr));
  }

  const filtered = rows.filter(r => filter === 'all' || r.status === filter);

  const stats = {
    total: rows.length,
    active: rows.filter(r => r.status === 'Active').length,
    expired: rows.filter(r => r.status === 'Expired').length,
    expiringSoon: rows.filter(r => r.status === 'Active' && hoursRemaining(r.creation_date) <= 12).length,
  };

  const cards = [
    { label: 'Total Tracked', value: stats.total, icon: '📋', grad: 'linear-gradient(135deg,#3b82f6,#1d4ed8)' },
    { label: 'Active', value: stats.active, icon: '✅', grad: 'linear-gradient(135deg,#10b981,#059669)' },
    { label: 'Expiring Soon', value: stats.expiringSoon, icon: '⚠️', grad: 'linear-gradient(135deg,#f59e0b,#d97706)' },
    { label: 'Expired', value: stats.expired, icon: '⏰', grad: 'linear-gradient(135deg,#ef4444,#dc2626)' },
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f8fafc', fontFamily: 'system-ui,-apple-system,sans-serif' }} className="expiry-container">
      <Sidebar active="/expiry" />
      <main style={{ flex: 1, padding: '16px' }} className="main-content">
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: '#1e3a5f', margin: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
            ⏰ Expiry Tracker
          </h1>
          <p style={{ color: '#6b7280', marginTop: 6, fontSize: 14 }}>C209 numbers pending logistic completion — 48-hour expiry window</p>
        </div>

        {/* Stats cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: 12, marginBottom: 24 }}>
          {cards.map(c => (
            <div key={c.label} style={{ background: c.grad, borderRadius: 12, padding: '16px 14px', color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: 12, opacity: 0.85 }}>{c.label}</div>
                <div style={{ fontSize: 28, fontWeight: 700, lineHeight: 1.1 }}>{loading ? '...' : c.value}</div>
              </div>
              <span style={{ fontSize: 22, opacity: 0.8 }}>{c.icon}</span>
            </div>
          ))}
        </div>

        {/* Filter tabs */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          {(['all', 'Active', 'Expired'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                padding: '8px 18px',
                borderRadius: 8,
                border: 'none',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: 13,
                background: filter === f ? '#2563eb' : '#e5e7eb',
                color: filter === f ? '#fff' : '#374151',
              }}
            >
              {f === 'all' ? 'All' : f}
            </button>
          ))}
        </div>

        {/* Table */}
        <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
          {loading ? (
            <div style={{ padding: 40, textAlign: 'center', color: '#6b7280' }}>Loading expiry tracker...</div>
          ) : filtered.length === 0 ? (
            <div style={{ padding: 40, textAlign: 'center', color: '#6b7280' }}>
              {rows.length === 0
                ? 'No C209 numbers being tracked. New ramp entries will appear here automatically.'
                : 'No entries match this filter.'}
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', minWidth: '700px', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)', color: '#fff' }}>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: '#e0f2fe', fontSize: 11, textTransform: 'uppercase' }}>C209 Number</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: '#e0f2fe', fontSize: 11, textTransform: 'uppercase' }}>Created</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: '#e0f2fe', fontSize: 11, textTransform: 'uppercase' }}>Age (Hours)</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: '#e0f2fe', fontSize: 11, textTransform: 'uppercase' }}>Time Left</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: '#e0f2fe', fontSize: 11, textTransform: 'uppercase' }}>Last Checked</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: '#e0f2fe', fontSize: 11, textTransform: 'uppercase' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(row => {
                    const elapsed = hoursElapsed(row.creation_date);
                    const remaining = hoursRemaining(row.creation_date);
                    const pct = Math.min(100, (elapsed / 48) * 100);
                    const isExpired = row.status === 'Expired';
                    const isWarning = row.status === 'Active' && remaining <= 12;
                    const barColor = isExpired ? '#ef4444' : isWarning ? '#f59e0b' : '#10b981';

                    return (
                      <tr key={row.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                        <td style={{ padding: '14px 16px', fontWeight: 700, color: '#1e3a5f', fontFamily: 'monospace' }}>{row.c209_number}</td>
                        <td style={{ padding: '14px 16px', color: '#6b7280' }}>{new Date(row.creation_date).toLocaleString('en-GB')}</td>
                        <td style={{ padding: '14px 16px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div style={{ width: 80, height: 6, background: '#f3f4f6', borderRadius: 3, overflow: 'hidden' }}>
                              <div style={{ width: `${pct}%`, height: '100%', background: barColor, borderRadius: 3 }} />
                            </div>
                            <span style={{ fontSize: 12, fontWeight: 600, color: barColor }}>{elapsed.toFixed(1)}h</span>
                          </div>
                        </td>
                        <td style={{ padding: '14px 16px', fontWeight: 600, color: isExpired ? '#ef4444' : isWarning ? '#d97706' : '#059669' }}>
                          {isExpired ? 'Expired' : `${remaining.toFixed(1)}h left`}
                        </td>
                        <td style={{ padding: '14px 16px', color: '#9ca3af', fontSize: 12 }}>{row.last_checked ? new Date(row.last_checked).toLocaleString('en-GB') : '-'}</td>
                        <td style={{ padding: '14px 16px' }}>
                          {isExpired ? (
                            <span style={{ background: '#fef2f2', color: '#dc2626', padding: '3px 10px', borderRadius: 6, fontSize: 11, fontWeight: 700 }}>EXPIRED</span>
                          ) : isWarning ? (
                            <span style={{ background: '#fef3c7', color: '#d97706', padding: '3px 10px', borderRadius: 6, fontSize: 11, fontWeight: 700 }}>EXPIRING</span>
                          ) : (
                            <span style={{ background: '#dcfce7', color: '#166534', padding: '3px 10px', borderRadius: 6, fontSize: 11, fontWeight: 700 }}>ACTIVE</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
      <style jsx>{`
        @media (max-width: 768px) {
          .expiry-container {
            flex-direction: column !important;
          }
          .main-content {
            padding: 12px !important;
          }
          table {
            min-width: 500px !important;
          }
        }
      `}</style>
    </div>
  );
}
