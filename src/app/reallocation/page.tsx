'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/Sidebar';

export default function ReallocationPage() {
  const router = useRouter();
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [c208Input, setC208Input] = useState('');
  const [adding, setAdding] = useState(false);
  const [autoFilling, setAutoFilling] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const res = await fetch('/api/reallocation');
      if (res.status === 401) { router.push('/'); return; }
      const data = await res.json();
      setRows(data.rows || []);
    } catch { // ignore 
    } finally {
      setLoading(false);
    }
  }

  async function handleAddRow() {
    if (!c208Input.trim()) return;
    setAdding(true);
    try {
      const res = await fetch('/api/reallocation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ c208_number: c208Input.toUpperCase() })
      });
      const data = await res.json();
      if (!res.ok) { alert(data.error); return; }
      setRows([data.row, ...rows]);
      setC208Input('');
    } catch { alert('Failed to add'); }
    finally { setAdding(false); }
  }

  async function handleAutoFill() {
    setAutoFilling(true);
    try {
      const res = await fetch('/api/reallocation', { method: 'PATCH' });
      const data = await res.json();
      setMessage(data.message);
      loadData();
      setTimeout(() => setMessage(''), 3000);
    } catch { alert('Auto-fill failed'); }
    finally { setAutoFilling(false); }
  }

  async function handleDelete(id: number) {
    if (!confirm('Are you sure you want to delete this row?')) return;
    try {
      await fetch(`/api/reallocation?id=${id}`, { method: 'DELETE' });
      setRows(rows.filter(r => r.id !== id));
    } catch { alert('Delete failed'); }
  }

  return (
    <div className=\"realloc-container\" style={{ display: 'flex', minHeight: '100vh', background: '#f8fafc' }}>
      <Sidebar active=\"/reallocation\" />
      <main className=\"main-content\" style={{ flex: 1, padding: '24px' }}>
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: '#1e293b', margin: 0 }}>Reallocation Register</h1>
          <p style={{ color: '#64748b', marginTop: 4 }}>Manage container reallocation and C208 mapping</p>
        </div>

        <div style={{ background: '#fff', padding: 20, borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginBottom: 24, display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ flex: 1, minWidth: '200px' }}>
            <input 
              type=\"text\" 
              placeholder=\"Enter C208 Number...\" 
              value={c208Input}
              onChange={e => setC208Input(e.target.value)}
              style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid #cbd5e1', outline: 'none' }}
            />
          </div>
          <button 
            onClick={handleAddRow}
            disabled={adding}
            style={{ padding: '10px 20px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 600, cursor: 'pointer' }}
          >
            {adding ? 'Adding...' : '+ Add C208'}
          </button>
          <button 
            onClick={handleAutoFill}
            disabled={autoFilling}
            style={{ padding: '10px 20px', background: '#10b981', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 600, cursor: 'pointer' }}
          >
            {autoFilling ? 'Processing...' : '🔄 Auto-Fill Bar/C209'}
          </button>
        </div>

        {message && (
          <div style={{ padding: '12px 16px', background: '#dcfce7', color: '#166534', borderRadius: 8, marginBottom: 20, fontWeight: 500 }}>
            {message}
          </div>
        )}

        <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                <th style={{ padding: '12px 16px', textAlign: 'left', color: '#64748b', fontSize: 13, fontWeight: 600 }}>C208 Number</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', color: '#64748b', fontSize: 13, fontWeight: 600 }}>Bar Number</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', color: '#64748b', fontSize: 13, fontWeight: 600 }}>C209 Link</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', color: '#64748b', fontSize: 13, fontWeight: 600 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={4} style={{ padding: 40, textAlign: 'center', color: '#94a3b8' }}>Loading register...</td></tr>
              ) : rows.length === 0 ? (
                <tr><td colSpan={4} style={{ padding: 40, textAlign: 'center', color: '#94a3b8' }}>No records found</td></tr>
              ) : (
                rows.map(row => (
                  <tr key={row.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '14px 16px', fontWeight: 600, color: '#1e293b' }}>{row.c208_number}</td>
                    <td style={{ padding: '14px 16px', color: '#475569' }}>{row.bar_number || '-'}</td>
                    <td style={{ padding: '14px 16px', color: '#475569' }}>
                      {row.c209_number ? (
                        <span style={{ padding: '2px 8px', background: '#eff6ff', color: '#2563eb', borderRadius: 6, fontSize: 12, fontWeight: 600 }}>{row.c209_number}</span>
                      ) : (
                        <span style={{ color: '#cbd5e1', fontSize: 12 }}>Pending Auto-Fill</span>
                      )}
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <button 
                        onClick={() => handleDelete(row.id)}
                        style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 500, fontSize: 13 }}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </main>
      <style jsx>{`
        @media (max-width: 768px) {
          .realloc-container {
            flex-direction: column !important;
          }
          .main-content {
            padding: 16px !important;
          }
          table {
            display: block;
            overflow-x: auto;
          }
        }
      `}</style>
    </div>
  );
}
