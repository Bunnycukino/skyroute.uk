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
        <div style={{ background: 'rgba(255,255,255,0.2)', borderRadius: 10, width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>✈️</div>
        <div>
          <div style={{ color: '#fff', fontWeight: 700, fontSize: 17 }}>Skyroute</div>
          <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 11 }}>System C209/C208</div>
        </div>
      </div>
      <div style={{ padding: '8px 12px', flex: 1 }}>
        <div style={{ color: '#9ca3af', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, padding: '14px 8px 6px' }}>NAWIGACJA</div>
        {NAV.map(item => (
          <Link key={item.href} href={item.href} style={{
            display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px',
            borderRadius: 8, marginBottom: 2, textDecoration: 'none',
            background: active === item.href ? '#eff6ff' : 'transparent',
            color: active === item.href ? '#2563eb' : '#374151',
            fontWeight: active === item.href ? 600 : 400, fontSize: 14,
          }}>
            <span style={{ fontSize: 16 }}>{item.icon}</span>
            {item.title}
          </Link>
        ))}
      </div>
      <div style={{ padding: '12px 16px', borderTop: '1px solid #e5e7eb' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700 }}>U</div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600 }}>Użytkownik</div>
            <div style={{ fontSize: 11, color: '#6b7280' }}>Logistyka Lotnicza</div>
          </div>
        </div>
        <button onClick={signOut} style={{ width: '100%', padding: '8px', background: '#f3f4f6', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 13, color: '#374151' }}>🚪 Wyloguj</button>
      </div>
    </aside>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState({ totalEntries: 0, todayEntries: 0, expiringSoon: 0, totalFlights: 0 });
  const [recent, setRecent] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/entries?limit=10');
        if (res.status === 401) { router.push('/'); return; }
        const data = await res.json();
        setRecent(data.entries || []);
        setStats(data.stats || {});
      } catch {}
      finally { setLoading(false); }
    })();
  }, [router]);

  const cards = [
    { label: 'Wszystkie wpisy', value: stats.totalEntries, icon: '📋', grad: 'linear-gradient(135deg,#3b82f6,#1d4ed8)', desc: 'Całkowita liczba dokumentów' },
    { label: 'Aktywne', value: stats.todayEntries, icon: '⏱', grad: 'linear-gradient(135deg,#10b981,#059669)', desc: 'Oczekujące na zakończenie' },
    { label: 'Wygasające', value: stats.expiringSoon, icon: '⏰', grad: 'linear-gradient(135deg,#f59e0b,#d97706)', desc: 'Wymaga uwagi (48h)' },
    { label: 'Dzisiaj', value: stats.totalFlights, icon: '📦', grad: 'linear-gradient(135deg,#8b5cf6,#7c3aed)', desc: 'Utworzone dzisiaj' },
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f8fafc', fontFamily: 'system-ui,-apple-system,sans-serif' }}>
      <Sidebar active="/dashboard" />
      <main style={{ flex: 1, padding: 32, overflowY: 'auto' }}>
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontSize: 30, fontWeight: 700, color: '#1e3a5f', margin: 0 }}>Witaj w Skyroute</h1>
          <p style={{ color: '#2563eb', marginTop: 6, fontSize: 15 }}>System zarządzania dokumentami C209 i C208</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 16, marginBottom: 28 }}>
          {cards.map(c => (
            <div key={c.label} style={{ background: c.grad, borderRadius: 16, padding: '22px 20px', color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontSize: 13, opacity: 0.85, marginBottom: 6 }}>{c.label}</div>
                <div style={{ fontSize: 38, fontWeight: 700, lineHeight: 1 }}>{loading ? '...' : c.value}</div>
                <div style={{ fontSize: 11, opacity: 0.75, marginTop: 6 }}>{c.desc}</div>
              </div>
              <span style={{ fontSize: 26, opacity: 0.8 }}>{c.icon}</span>
            </div>
          ))}
        </div>

        <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e5e7eb', marginBottom: 24 }}>
          <div style={{ padding: '18px 24px', borderBottom: '1px solid #e5e7eb' }}>
            <h2 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: '#1f2937' }}>⚡ Szybkie akcje</h2>
          </div>
          <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
            <Link href="/ramp" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '13px', background: 'linear-gradient(135deg,#3b82f6,#1d4ed8)', color: '#fff', borderRadius: 10, textDecoration: 'none', fontWeight: 600 }}>📦 Nowy wpis z rampy</Link>
            <Link href="/logistic" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '13px', background: 'linear-gradient(135deg,#10b981,#059669)', color: '#fff', borderRadius: 10, textDecoration: 'none', fontWeight: 600 }}>📋 Nowy wpis logistyczny</Link>
            <Link href="/expiry" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '13px', background: '#fff', color: '#374151', borderRadius: 10, textDecoration: 'none', fontWeight: 600, border: '1px solid #e5e7eb' }}>⏰ Sprawdź wygasające</Link>
          </div>
        </div>

        <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e5e7eb', overflow: 'hidden' }}>
          <div style={{ padding: '18px 24px', borderBottom: '1px solid #e5e7eb' }}>
            <h2 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: '#1f2937' }}>📄 Ostatnie wpisy</h2>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ background: '#f9fafb' }}>
                  {['C209','Data','BAR','Sztuki','Lot','C208','Nowy lot','Status'].map(h => (
                    <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 600, color: '#6b7280', fontSize: 11, textTransform: 'uppercase', borderBottom: '1px solid #e5e7eb' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={8} style={{ textAlign: 'center', padding: 40, color: '#9ca3af' }}>Ładowanie danych...</td></tr>
                ) : recent.length === 0 ? (
                  <tr><td colSpan={8} style={{ textAlign: 'center', padding: 40, color: '#9ca3af' }}>Brak wpisów w systemie.</td></tr>
                ) : recent.map((e: any) => {
                  const d = new Date(e.created_at);
                  const active = (Date.now() - d.getTime()) < 48*3600*1000;
                  return (
                    <tr key={e.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                      <td style={{ padding: '10px 14px', fontFamily: 'monospace', fontWeight: 700, color: '#2563eb' }}>{e.c209_number || '-'}</td>
                      <td style={{ padding: '10px 14px', color: '#6b7280' }}>{d.toLocaleDateString('pl-PL')}</td>
                      <td style={{ padding: '10px 14px', fontFamily: 'monospace' }}>{e.bar_number || e.container_code || '-'}</td>
                      <td style={{ padding: '10px 14px', fontWeight: 500 }}>{e.pieces ?? '-'}</td>
                      <td style={{ padding: '10px 14px', fontWeight: 600 }}>{e.flight_number || '-'}</td>
                      <td style={{ padding: '10px 14px', fontFamily: 'monospace', color: '#6b7280' }}>{e.c208_number || '-'}</td>
                      <td style={{ padding: '10px 14px', fontFamily: 'monospace', color: '#6b7280' }}>{e.new_flight_number || '-'}</td>
                      <td style={{ padding: '10px 14px' }}>
                        <span style={{ background: active ? '#eff6ff' : '#fef2f2', color: active ? '#1d4ed8' : '#dc2626', fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20 }}>
                          {active ? 'Aktywny' : 'Zakończony'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
