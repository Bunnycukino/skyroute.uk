'use client';
import { useState } from 'react';
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

export default function LogisticInputPage() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<{c209: string; c208: string} | null>(null);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    c209_number: '',
    flight_number: '',
    signature: '',
    date_received: new Date().toISOString().split('T')[0],
    bar_number: '',
    pieces: '',
    notes: ''
  });

  const isNewBuild = formData.c209_number.toUpperCase().trim() === 'NEW BUILD';
  const set = (k: string, v: string) => setFormData(f => ({ ...f, [k]: v }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(null);
    const c209Input = formData.c209_number.trim().toUpperCase();
    if (!formData.flight_number.trim()) {
      setError('Flight Number is required (LOGISTIC INPUT B2).');
      setLoading(false);
      return;
    }
    try {
      const res = await fetch('/api/entries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'logistic_input',
          c209_number: c209Input,
          flight_number: formData.flight_number.toUpperCase(),
          signature: formData.signature.toUpperCase(),
          date_received: formData.date_received,
          container_code: isNewBuild ? formData.bar_number.toUpperCase() : '',
          pieces: isNewBuild ? (parseInt(formData.pieces) || 0) : 0,
          notes: formData.notes
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Blad zapisu');
      setSuccess({ c209: data.c209, c208: data.c208 });
      setFormData({ c209_number: '', flight_number: '', signature: '', date_received: new Date().toISOString().split('T')[0], bar_number: '', pieces: '', notes: '' });
    } catch (err: any) { setError(err.message); }
    finally { setLoading(false); }
  }

  const inputStyle = { width: '100%', border: '1px solid #e5e7eb', borderRadius: 8, padding: '10px 14px', fontSize: 14, outline: 'none', boxSizing: 'border-box' as const, background: '#fff' };
  const labelStyle = { display: 'block', fontSize: 14, fontWeight: 500, color: '#374151', marginBottom: 6 };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f9fafb' }}>
      <Sidebar active="/logistic" />
      <main style={{ flex: 1, padding: 32 }}>
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: '#111827', margin: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
            <span>📋</span> Wprowadzanie logistyczne
          </h1>
          <p style={{ color: '#6b7280', fontSize: 14, marginTop: 4 }}>Zaktualizuj istniejący C209 lub utwórz NEW BUILD</p>
        </div>
        {success && (
          <div style={{ background: '#10b981', borderRadius: 12, padding: '20px 24px', marginBottom: 24, color: '#fff' }}>
            <div style={{ fontWeight: 700, fontSize: 18 }}>✅ Dane zapisane! C209: {success.c209}, C208: {success.c208}</div>
          </div>
        )}
        {error && (
          <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 12, padding: '16px 20px', marginBottom: 24, color: '#dc2626', fontSize: 14 }}>
            {error}
          </div>
        )}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 24, alignItems: 'start' }}>
          <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e5e7eb', overflow: 'hidden' }}>
            <div style={{ padding: '18px 24px', borderBottom: '1px solid #e5e7eb', background: '#fafafa' }}>
              <h2 style={{ margin: 0, fontSize: 15, fontWeight: 600, color: '#1f2937' }}>Formularz logistyczny</h2>
            </div>
            <form onSubmit={handleSubmit} style={{ padding: 20 }}>
              <div style={{ marginBottom: 16 }}>
                <label style={labelStyle}>Numer C209 *</label>
                <input style={inputStyle} placeholder="Wybierz C209" value={formData.c209_number} onChange={e => set('c209_number', e.target.value)} required />
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={labelStyle}>Numer lotu *</label>
                <input style={inputStyle} placeholder="np. LH123 lub RW456" value={formData.flight_number} onChange={e => set('flight_number', e.target.value)} required />
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={labelStyle}>Data lotu</label>
                <input style={inputStyle} type="date" value={formData.date_received} onChange={e => set('date_received', e.target.value)} />
              </div>
              {isNewBuild && (
                <>
                  <div style={{ marginBottom: 16 }}>
                    <label style={labelStyle}>Numer BAR</label>
                    <input style={inputStyle} placeholder="Opcjonalne dla istniejących C209" value={formData.bar_number} onChange={e => set('bar_number', e.target.value)} />
                  </div>
                  <div style={{ marginBottom: 16 }}>
                    <label style={labelStyle}>Liczba sztuk</label>
                    <input style={inputStyle} type="number" placeholder="Opcjonalne dla istniejących C209" value={formData.pieces} onChange={e => set('pieces', e.target.value)} />
                  </div>
                </>
              )}
              <div style={{ marginBottom: 16 }}>
                <label style={labelStyle}>Podpis</label>
                <input style={inputStyle} placeholder="Imię i nazwisko" value={formData.signature} onChange={e => set('signature', e.target.value)} />
              </div>
              <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                <button type="submit" disabled={loading} style={{ flex: 1, padding: '12px', background: loading ? '#6ee7b7' : 'linear-gradient(135deg,#10b981,#059669)', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 600, fontSize: 14, cursor: loading ? 'not-allowed' : 'pointer' }}>
                  {loading ? 'Zapisywanie...' : '✅ Zapisz dane'}
                </button>
                <button type="button" onClick={() => setFormData({ c209_number: '', flight_number: '', signature: '', date_received: new Date().toISOString().split('T')[0], bar_number: '', pieces: '', notes: '' })} style={{ padding: '12px 20px', background: '#fff', color: '#374151', border: '1px solid #e5e7eb', borderRadius: 8, fontWeight: 500, fontSize: 14, cursor: 'pointer' }}>
                  ✕ Wyczyść
                </button>
              </div>
            </form>
          </div>
          <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e5e7eb', overflow: 'hidden', alignSelf: 'flex-start' }}>
            <div style={{ padding: '18px 24px', borderBottom: '1px solid #e5e7eb', background: '#fafafa' }}>
              <h2 style={{ margin: 0, fontSize: 15, fontWeight: 600, color: '#1f2937' }}>Informacje</h2>
            </div>
            <div style={{ padding: 20 }}>
              {[
                isNewBuild ? 'Nowy wpis zostanie utworzony' : 'Istniejący C209 zostanie zaktualizowany',
                'Numer C208 zostanie wygenerowany automatycznie',
                'Lotnica RW są automatycznie rozpoznawane',
                'Data i czas będą zapisane automatycznie',
              ].map(info => (
                <div key={info} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 10, fontSize: 13, color: '#374151' }}>
                  <span style={{ color: '#10b981', marginTop: 1 }}>•</span>
                  {info}
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
