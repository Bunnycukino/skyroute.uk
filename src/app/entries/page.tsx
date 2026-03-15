'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const NAV = [
  { title: 'Pulpit', href: '/dashboard', icon: '🏠' },
  { title: 'Rampa', href: '/ramp', icon: '📦' },
  { title: 'Logistyka', href: '/logistic', icon: '📋' },
  { title: 'Rejestr C209/C208', href: '/entries', icon: '📄' },
  { title: 'Śledzenie wygaśnięcia', href: '/expiry', icon: '⏰' },
  { title: 'Realokacja', href: '/reallocation', icon: '🔄' },
];

function Sidebar({ active }: { active: string }) {
  const router = useRouter();
  async function signOut() { await fetch('/api/auth', { method: 'DELETE' }); router.push('/'); }
  return (
    <aside style={{ width: 240, minWidth: 240, background: '#fff', borderRight: '1px solid #e5e7eb', display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <div style={{ background: 'linear-gradient(135deg, #1e3a5f 0%, #2563eb 100%)', padding: '20px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ background: 'rgba(255,255,255,0.2)', borderRadius: 10, width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>✈</div>
        <div>
          <div style={{ color: '#fff', fontWeight: 700, fontSize: 17 }}>Skyroute</div>
          <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 11 }}>System C209/C208</div>
        </div>
      </div>
      <div style={{ padding: '8px 12px', flex: 1 }}>
        <div style={{ color: '#9ca3af', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, padding: '14px 8px 6px' }}>NAWIGACJA</div>
        {NAV.map(item => (
          <Link key={item.href} href={item.href} style={{
            display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 8, marginBottom: 2,
            background: active === item.href ? 'rgba(37,99,235,0.1)' : 'transparent',
            color: active === item.href ? '#2563eb' : '#374151',
            fontWeight: active === item.href ? 600 : 400,
            fontSize: 14, textDecoration: 'none',
          }}>
            <span style={{ fontSize: 16 }}>{item.icon}</span>
            {item.title}
          </Link>
        ))}
      </div>
      <div style={{ padding: '12px 16px', borderTop: '1px solid #e5e7eb' }}>
        <div style={{ fontSize: 12, color: '#6b7280' }}>Użytkownik</div>
        <div style={{ fontSize: 11, color: '#9ca3af' }}>Logistyka Lotnicza</div>
        <button onClick={signOut} style={{ marginTop: 8, fontSize: 12, color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>Wyloguj</button>
      </div>
    </aside>
  );
}

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
    if (!confirm('Czy na pewno chcesz usunąć ten wpis?')) return;
    try {
      await fetch(`/api/entries?id=${id}`, { method: 'DELETE' });
      setEntries(entries.filter(e => e.id !== id));
    } catch (err) { alert('Nie udało się usunąć'); }
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f9fafb' }}>
      <Sidebar active="/entries" />
      <main style={{ flex: 1, padding: 32 }}>
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: '#111827', margin: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
            <span>📄</span> Rejestr C209 + C208
          </h1>
          <p style={{ color: '#6b7280', fontSize: 14, marginTop: 4 }}>Przeglądaj wszystkie wpisy w systemie</p>
        </div>

        <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e5e7eb', overflow: 'hidden' }}>
          <div style={{ padding: '18px 24px', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ margin: 0, fontSize: 15, fontWeight: 600, color: '#1f2937' }}>Wszystkie wpisy</h2>
            <input type="text" placeholder="Szukaj C209, C208, lotu..." value={search} onChange={e => setSearch(e.target.value)} style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: '8px 12px', fontSize: 13, outline: 'none', width: 240 }} />
          </div>
          <div style={{ overflowX: 'auto' }}>
            {loading ? (
              <div style={{ padding: 40, textAlign: 'center', color: '#9ca3af' }}>Wczytywa nie...</div>
            ) : entries.length === 0 ? (
              <div style={{ padding: 40, textAlign: 'center', color: '#9ca3af' }}>Brak wpisów</div>
            ) : (
              <table style={{ width: '100%', fontSize: 13, borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#fafafa', borderBottom: '1px solid #e5e7eb' }}>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: '#6b7280', fontSize: 11, textTransform: 'uppercase' }}>C209</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: '#6b7280', fontSize: 11, textTransform: 'uppercase' }}>Data</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: '#6b7280', fontSize: 11, textTransform: 'uppercase' }}>Numer BAR</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: '#6b7280', fontSize: 11, textTransform: 'uppercase' }}>Sztuki</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: '#6b7280', fontSize: 11, textTransform: 'uppercase' }}>Lot</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: '#6b7280', fontSize: 11, textTransform: 'uppercase' }}>C208</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: '#6b7280', fontSize: 11, textTransform: 'uppercase' }}>Status</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: '#6b7280', fontSize: 11, textTransform: 'uppercase' }}>Podpis</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: '#6b7280', fontSize: 11, textTransform: 'uppercase' }}>Akcje</th>
                  </tr>
                </thead>
                <tbody>
                  {entries.map(entry => {
                    const date = new Date(entry.created_at);
                    return (
                      <tr key={entry.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                        <td style={{ padding: '14px 16px', fontWeight: 600, color: '#111827' }}>{entry.c209_number || '-'}</td>
                        <td style={{ padding: '14px 16px', color: '#6b7280' }}>{date.toLocaleDateString('pl-PL')}</td>
                        <td style={{ padding: '14px 16px', color: '#6b7280' }}>{entry.bar_number || entry.container_code || '-'}</td>
                        <td style={{ padding: '14px 16px', color: '#6b7280' }}>{entry.pieces ?? '-'}</td>
                        <td style={{ padding: '14px 16px', color: '#6b7280' }}>{entry.flight_number || '-'}</td>
                        <td style={{ padding: '14px 16px', fontWeight: 600, color: '#111827' }}>{entry.c208_number || '-'}</td>
                        <td style={{ padding: '14px 16px' }}>
                          {entry.type === 'ramp_input' && <span style={{ background: '#dbeafe', color: '#1e40af', padding: '2px 8px', borderRadius: 6, fontSize: 11, fontWeight: 600 }}>RAMP</span>}
                          {entry.type === 'logistic_input' && <span style={{ background: '#d1fae5', color: '#065f46', padding: '2px 8px', borderRadius: 6, fontSize: 11, fontWeight: 600 }}>LOG</span>}
                        </td>
                        <td style={{ padding: '14px 16px', color: '#6b7280' }}>{entry.signature || '-'}</td>
                        <td style={{ padding: '14px 16px' }}>
                          <button onClick={() => handleDelete(entry.id)} style={{ color: '#dc2626', background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>Usuń</button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
