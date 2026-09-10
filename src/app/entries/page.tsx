'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/Sidebar';

export default function EntriesPage() {
  const router = useRouter();
  const [entries, setEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [currentUser, setCurrentUser] = useState('');

  const isAdmin = currentUser === 'admin';

  useEffect(() => {
    async function load() {
      try {
        const params = new URLSearchParams({ search });
        const res = await fetch(`/api/entries?${params}`);
        if (res.status === 401) { router.push('/'); return; }
        const data = await res.json();
        setEntries(data.entries || []);
        setCurrentUser(data.user || '');
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

  const thRamp = { padding: '8px 10px', textAlign: 'left' as const, fontWeight: 700, fontSize: 11, textTransform: 'uppercase' as const, whiteSpace: 'nowrap' as const, background: '#fef9c3', color: '#854d0e', border: '1px solid #ca8a04' };
  const thLog = { padding: '8px 10px', textAlign: 'left' as const, fontWeight: 700, fontSize: 11, textTransform: 'uppercase' as const, whiteSpace: 'nowrap' as const, background: '#dcfce7', color: '#166534', border: '1px solid #16a34a' };
  const thComment = { padding: '8px 10px', textAlign: 'left' as const, fontWeight: 700, fontSize: 11, textTransform: 'uppercase' as const, whiteSpace: 'nowrap' as const, background: '#fef9c3', color: '#854d0e', border: '1px solid #ca8a04' };
  const td = { padding: '8px 10px', fontSize: 12, whiteSpace: 'nowrap' as const, border: '1px solid #e5e7eb' };
  const tdRamp = { ...td, background: '#fefce8' };
  const tdLog = { ...td, background: '#f0fdf4' };

  function fmtDate(val: string | null): string {
    if (!val) return '';
    try { return new Date(val).toLocaleDateString('en-GB'); } catch { return ''; }
  }
  function fmtTime(val: string | null): string {
    if (!val) return '';
    try { return new Date(val).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }); } catch { return ''; }
  }
  function fmtMonthYear(val: string | null): string {
    if (!val) return '';
    try {
      const d = new Date(val);
      const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
      return months[d.getMonth()] + '-' + String(d.getFullYear()).slice(-2);
    } catch { return ''; }
  }

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
              <table style={{ width: '100%', minWidth: '1800px', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th colSpan={8} style={{ padding: '8px', textAlign: 'center', background: '#facc15', color: '#713f12', fontWeight: 800, fontSize: 13, textTransform: 'uppercase', border: '1px solid #ca8a04' }}>
                      RAMP INPUT (C209)
                    </th>
                    <th colSpan={8} style={{ padding: '8px', textAlign: 'center', background: '#22c55e', color: '#14532d', fontWeight: 800, fontSize: 13, textTransform: 'uppercase', border: '1px solid #16a34a' }}>
                      LOGISTIC INPUT (C208)
                    </th>
                    <th style={{ padding: '8px', textAlign: 'center', background: '#facc15', color: '#713f12', fontWeight: 800, fontSize: 13, textTransform: 'uppercase', border: '1px solid #ca8a04' }}>
                      COMMENT
                    </th>
                  </tr>
                  <tr>
                    {/* Ramp columns A-H */}
                    <th style={thRamp}>C209 Number</th>
                    <th style={thRamp}>Date</th>
                    <th style={thRamp}>Time</th>
                    <th style={thRamp}>Month-Year</th>
                    <th style={thRamp}>Bar Number</th>
                    <th style={thRamp}>Pieces</th>
                    <th style={thRamp}>Flight Number</th>
                    <th style={thRamp}>Signature</th>
                    {/* Logistic columns I-P */}
                    <th style={thLog}>C208 Number</th>
                    <th style={thLog}>Flight Date</th>
                    <th style={thLog}>Time</th>
                    <th style={thLog}>Month-Year</th>
                    <th style={thLog}>Flight Number</th>
                    <th style={thLog}>Bar Number</th>
                    <th style={thLog}>Pieces</th>
                    <th style={thLog}>Signature</th>
                    {/* Comment Q */}
                    <th style={thComment}>Ramp Comment</th>
                    <th style={{ ...thComment, background: '#f3f4f6', color: '#374151', border: '1px solid #d1d5db' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {entries.map(entry => {
                    const created = new Date(entry.created_at);
                    const updated = entry.updated_at ? new Date(entry.updated_at) : null;
                    return (
                      <tr key={entry.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                        {/* Ramp A-H */}
                        <td style={{ ...tdRamp, fontWeight: 600, color: '#111827' }}>{entry.c209_number || '-'}</td>
                        <td style={tdRamp}>{fmtDate(entry.created_at)}</td>
                        <td style={tdRamp}>{fmtTime(entry.created_at)}</td>
                        <td style={tdRamp}>{fmtMonthYear(entry.created_at)}</td>
                        <td style={tdRamp}>{entry.bar_number || entry.container_code || '-'}</td>
                        <td style={tdRamp}>{entry.pieces ?? '-'}</td>
                        <td style={tdRamp}>{entry.flight_number || '-'}</td>
                        <td style={tdRamp}>{entry.signature || '-'}</td>
                        {/* Logistic I-P */}
                        <td style={{ ...tdLog, fontWeight: 600, color: '#111827' }}>{entry.c208_number || '-'}</td>
                        <td style={tdLog}>{fmtDate(entry.outbound_date)}</td>
                        <td style={tdLog}>{fmtTime(entry.updated_at)}</td>
                        <td style={tdLog}>{fmtMonthYear(entry.outbound_date)}</td>
                        <td style={tdLog}>{entry.outbound_flight || '-'}</td>
                        <td style={tdLog}>{entry.outbound_bar_number || '-'}</td>
                        <td style={tdLog}>{entry.outbound_pieces ?? '-'}</td>
                        <td style={tdLog}>{entry.outbound_signature || '-'}</td>
                        {/* Comment Q */}
                        <td style={{ ...td, maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>{entry.notes || '-'}</td>
                        <td style={{ ...td, background: '#f9fafb' }}>
                          {isAdmin ? (
                            <button onClick={() => handleDelete(entry.id)} style={{ color: '#dc2626', background: 'none', border: 'none', cursor: 'pointer', fontSize: 11, fontWeight: 600 }}>Delete</button>
                          ) : (
                            <span style={{ color: '#d1d5db', fontSize: 11 }}>—</span>
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
          .entries-container { flex-direction: column !important; }
          .main-content { padding: 12px !important; }
          table { min-width: 1200px !important; }
        }
      `}</style>
    </div>
  );
}
