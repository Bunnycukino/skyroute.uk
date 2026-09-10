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
    if (!confirm('Delete this entry?')) return;
    try {
      await fetch(`/api/entries?id=${id}`, { method: 'DELETE' });
      setEntries(entries.filter(e => e.id !== id));
    } catch (err) { alert('Failed to delete'); }
  }

  const thStyle = { padding: '10px 12px', textAlign: 'left' as const, fontWeight: 600, color: '#e0f2fe', fontSize: 11, textTransform: 'uppercase' as const, whiteSpace: 'nowrap' as const };
  const tdStyle = { padding: '10px 12px', fontSize: 13, whiteSpace: 'nowrap' as const };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f8fafa' }} className="entries-container">
      <Sidebar active="/entries" />
      <main style={{ flex: 1, padding: '16px' }} className="main-content">
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: '#111827', margin: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
            📄 C209/C208 Register
          </h1>
          <input
            type="text"
            placeholder="Search by C209, C208, Bar, Flight, Signature..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ width: '100%', maxWidth: '600px', marginTop: 16, padding: '12px 16px', fontSize: 15, border: '1px solid #d1d5db', borderRadius: 8, outline: 'none' }}
          />
        </div>
        <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
          {loading ? (
            <div style={{ padding: 40, textAlign: 'center', color: '#6b7280' }}>Loading entries...</div>
          ) : entries.length === 0 ? (
            <div style={{ padding: 40, textAlign: 'center', color: '#6b7280' }}>No entries found</div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', minWidth: '1200px', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)', color: '#fff' }}>
                    <th style={thStyle}>C209 Number</th>
                    <th style={thStyle}>Date</th>
                    <th style={thStyle}>Time</th>
                    <th style={thStyle}>Bar Number</th>
                    <th style={thStyle}>Pieces</th>
                    <th style={thStyle}>Flight</th>
                    <th style={thStyle}>Sign</th>
                    <th style={thStyle}>C208</th>
                    <th style={thStyle}>Flight Date</th>
                    <th style={thStyle}>Comment</th>
                    <th style={thStyle}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {entries.map(entry => {
                    const created = new Date(entry.created_at);
                    const dateStr = created.toLocaleDateString('en-GB');
                    const timeStr = created.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
                    const flightDate = entry.outbound_date ? new Date(entry.outbound_date).toLocaleDateString('en-GB') : '';
                    return (
                      <tr key={entry.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                        <td style={{ ...tdStyle, fontWeight: 600, color: '#111827' }}>{entry.c209_number || '-'}</td>
                        <td style={{ ...tdStyle, color: '#6b7280' }}>{dateStr}</td>
                        <td style={{ ...tdStyle, color: '#6b7280' }}>{timeStr}</td>
                        <td style={{ ...tdStyle, color: '#6b7280' }}>{entry.bar_number || entry.container_code || '-'}</td>
                        <td style={{ ...tdStyle, color: '#6b7280' }}>{entry.pieces ?? '-'}</td>
                        <td style={{ ...tdStyle, color: '#6b7280' }}>{entry.flight_number || '-'}</td>
                        <td style={{ ...tdStyle, color: '#6b7280' }}>{entry.signature || '-'}</td>
                        <td style={{ ...tdStyle, fontWeight: 600, color: '#111827' }}>{entry.c208_number || '-'}</td>
                        <td style={{ ...tdStyle, color: '#6b7280' }}>{flightDate}</td>
                        <td style={{ ...tdStyle, color: '#6b7280', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>{entry.notes || '-'}</td>
                        <td style={tdStyle}>
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
          .entries-container { flex-direction: column !important; }
          .main-content { padding: 12px !important; }
          table { min-width: 800px !important; }
        }
      `}</style>
    </div>
  );
}
