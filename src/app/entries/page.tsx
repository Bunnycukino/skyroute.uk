'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/Sidebar';

export default function EntriesPage() {
  const router = useRouter();
  const [entries, setEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const params = new URLSearchParams({ search });
        const res = await fetch(`/api/entries?${params}`);
        if (res.status === 401) { router.push('/'); return; }
        const data = await res.json();
        setEntries(data.entries || []);
      } catch (err) { console.error('Failed to load entries'); }
      finally { setLoading(false); }
    }
    load();
  }, [search, router]);

  async function handleDelete(id: number) {
    if (!confirm('Are you sure you want to delete this entry?')) return;
    try {
      await fetch(`/api/entries?id=${id}`, { method: 'DELETE' });
      setEntries(entries.filter(e => e.id !== id));
    } catch (err) { alert('Failed to delete'); }
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f8fafa' }} className="entries-container">
      <Sidebar active="/entries" />
      <main style={{ flex: 1, padding: '16px' }} className="main-content">
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: '#111827', margin: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
            C209 Entries
          </h1>
          <input
            type="text"
            placeholder="Search by C209, Bar, Container, Pieces, Flight..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              width: '100%',
              maxWidth: '600px',
              marginTop: 16,
              padding: '12px 16px',
              fontSize: 15,
              border: '1px solid #d1d5db',
              borderRadius: 8,
              outline: 'none'
            }}
          />
        </div>
        <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
          {loading ? (
            <div style={{ padding: 40, textAlign: 'center', color: '#6b7280' }}>Loading entries...</div>
          ) : entries.length === 0 ? (
            <div style={{ padding: 40, textAlign: 'center', color: '#6b7280' }}>No entries found</div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', minWidth: '800px', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)', color: '#fff' }}>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: '#e0f2fe', fontSize: 11, textTransform: 'uppercase' }}>Date</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: '#e0f2fe', fontSize: 11, textTransform: 'uppercase' }}>Bar</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: '#e0f2fe', fontSize: 11, textTransform: 'uppercase' }}>Pieces</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: '#e0f2fe', fontSize: 11, textTransform: 'uppercase' }}>Container</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: '#e0f2fe', fontSize: 11, textTransform: 'uppercase' }}>C208</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: '#e0f2fe', fontSize: 11, textTransform: 'uppercase' }}>Status</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: '#e0f2fe', fontSize: 11, textTransform: 'uppercase' }}>Signature</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: '#e0f2fe', fontSize: 11, textTransform: 'uppercase' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {entries.map(entry => {
                    const date = new Date(entry.created_at);
                    return (
                      <tr key={entry.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                        <td style={{ padding: '14px 16px', fontWeight: 600, color: '#111827' }}>{entry.c209_number || '-'}</td>
                        <td style={{ padding: '14px 16px', color: '#6b7280' }}>{date.toLocaleDateString('en-GB')}</td>
                        <td style={{ padding: '14px 16px', color: '#6b7280' }}>{entry.bar_number || entry.container_code || '-'}</td>
                        <td style={{ padding: '14px 16px', color: '#6b7280' }}>{entry.pieces ?? '-'}</td>
                        <td style={{ padding: '14px 16px', color: '#6b7280' }}>{entry.flight_number || '-'}</td>
                        <td style={{ padding: '14px 16px', fontWeight: 600, color: '#111827' }}>{entry.c208_number || '-'}</td>
                        <td style={{ padding: '14px 16px' }}>
                          {entry.type === 'ramp_input' && <span style={{ background: '#dcfce7', color: '#166534', padding: '2px 8px', borderRadius: 6, fontSize: 11, fontWeight: 600 }}>RAMP</span>}
                          {entry.type === 'logistic_input' && <span style={{ background: '#dbeafe', color: '#1e3a8a', padding: '2px 8px', borderRadius: 6, fontSize: 11, fontWeight: 600 }}>LOGIC</span>}
                        </td>
                        <td style={{ padding: '14px 16px', color: '#6b7280' }}>{entry.signature || '-'}</td>
                        <td style={{ padding: '14px 16px' }}>
                          <button onClick={() => handleDelete(entry.id)} style={{ color: '#dc2626', background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>Delete</button>
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
          .entries-container {
            flex-direction: column !important;
          }
          .main-content {
            padding: 12px !important;
          }
          table {
            min-width: 600px !important;
          }
        }
      `}</style>
    </div>
  );
}
