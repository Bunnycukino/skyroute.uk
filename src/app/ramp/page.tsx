'use client';
import { useState } from 'react';
import { Sidebar } from '@/components/Sidebar';

export default function RampInputPage() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<{ c209: string; bar: string; flight: string; pieces: number; signature: string; notes: string } | null>(null);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    bar_number: '',
    pieces: '',
    flight_number: '',
    signature: '',
    notes: ''
  });

  const set = (k: string, v: string) => setFormData(f => ({ ...f, [k]: v }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(null);
    try {
      const payload = {
        action: 'ramp_input',
        container_code: formData.bar_number.toUpperCase(),
        pieces: parseInt(formData.pieces) || 0,
        flight_number: formData.flight_number.toUpperCase(),
        signature: formData.signature.toUpperCase(),
        notes: formData.notes
      };
      const res = await fetch('/api/entries', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save');
      setSuccess({
        c209: data.c209,
        bar: payload.container_code,
        flight: payload.flight_number,
        pieces: payload.pieces,
        signature: payload.signature,
        notes: payload.notes
      });
      setFormData({ bar_number: '', pieces: '', flight_number: '', signature: '', notes: '' });

      // Auto-generate and print IN BOND Control Sheet using original PDF template
      try {
        const printRes = await fetch('/api/print-in-bond', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            c209: data.c209,
            bar_number: payload.container_code,
            pieces: payload.pieces,
            flight_number: payload.flight_number,
            signature: payload.signature,
            date_received: new Date().toISOString().split('T')[0],
            comments: payload.notes
          })
        });
        if (printRes.ok) {
          const blob = await printRes.blob();
          const url = URL.createObjectURL(blob);
          const win = window.open(url, '_blank');
          if (win) {
            win.addEventListener('load', () => {
              setTimeout(() => { win.print(); }, 500);
            });
          }
        }
      } catch (printErr) {
        console.error('Print failed:', printErr);
      }
    } catch (err: any) { setError(err.message); }
    finally { setLoading(false); }
  }

  const inputStyle = { width: '100%', border: '1px solid #e5e7eb', borderRadius: 8, padding: '10px 14px', fontSize: 14, outline: 'none', boxSizing: 'border-box' as const, background: '#fff' };
  const labelStyle = { display: 'block', fontSize: 14, fontWeight: 500, color: '#374151', marginBottom: 6 };

  return (
    <div className="ramp-container" style={{ display: 'flex', minHeight: '100vh', background: '#f9fafb' }}>
      <Sidebar active="/ramp" />
      <main className="main-content" style={{ flex: 1, padding: 32 }}>
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: '#111827', margin: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
            <span>📦</span> Ramp Input
          </h1>
          <p style={{ color: '#6b7280', fontSize: 14, marginTop: 4 }}>Create new C209 entry from ramp received data</p>
        </div>

        {success && (
          <div style={{ background: '#10b981', borderRadius: 12, padding: '20px 24px', marginBottom: 24, color: '#fff' }}>
            <div style={{ fontWeight: 700, fontSize: 18 }}>✅ Entry Saved! C209: {success.c209}</div>
            <div style={{ fontSize: 14, marginTop: 4, opacity: 0.9 }}>{success.bar} • {success.flight} • {success.pieces} pcs</div>
            <div style={{ fontSize: 13, marginTop: 8, opacity: 0.8 }}>IN BOND Control Sheet generated — print dialog should open automatically.</div>
          </div>
        )}

        {error && (
          <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 12, padding: '16px 20px', marginBottom: 24, color: '#dc2626', fontSize: 14 }}>
            {error}
          </div>
        )}

        <div className="form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 24, alignItems: 'start' }}>
          <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e5e7eb', overflow: 'hidden' }}>
            <div style={{ padding: '18px 24px', borderBottom: '1px solid #e5e7eb', background: '#fafafa' }}>
              <h2 style={{ margin: 0, fontSize: 15, fontWeight: 600, color: '#1f2937' }}>Input Form</h2>
            </div>
            <form onSubmit={handleSubmit} style={{ padding: 20 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                <div>
                  <label style={labelStyle}>Bar Number *</label>
                  <input style={inputStyle} placeholder="e.g. ABC12345" value={formData.bar_number} onChange={e => set('bar_number', e.target.value)} required />
                </div>
                <div>
                  <label style={labelStyle}>Pieces</label>
                  <input style={inputStyle} type="number" placeholder="e.g. 5" value={formData.pieces} onChange={e => set('pieces', e.target.value)} />
                </div>
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={labelStyle}>Flight Number</label>
                <input style={inputStyle} placeholder="e.g. EK123" value={formData.flight_number} onChange={e => set('flight_number', e.target.value)} />
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={labelStyle}>Signature (initials)</label>
                <input style={inputStyle} placeholder="e.g. RR" value={formData.signature} onChange={e => set('signature', e.target.value)} maxLength={10} />
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={labelStyle}>Comments</label>
                <textarea value={formData.notes} onChange={e => set('notes', e.target.value)} style={{ ...inputStyle, minHeight: 80, resize: 'vertical' }} placeholder="e.g. seal missing, cart 13" />
              </div>
              <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                <button type="submit" disabled={loading} style={{ flex: 1, padding: '12px', background: loading ? '#93c5fd' : 'linear-gradient(135deg,#1e3a8a,#2563eb)', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 600, fontSize: 14, cursor: loading ? 'not-allowed' : 'pointer' }}>
                  {loading ? 'Saving...' : '✅ Save Entry'}
                </button>
                <button type="button" onClick={() => setFormData({ bar_number: '', pieces: '', flight_number: '', signature: '', notes: '' })} style={{ padding: '12px 20px', background: '#fff', color: '#374151', border: '1px solid #e5e7eb', borderRadius: 8, fontWeight: 500, fontSize: 14, cursor: 'pointer' }}>
                  ✕ Clear
                </button>
              </div>
            </form>
          </div>

          <div className="info-panel" style={{ background: '#fff', borderRadius: 12, border: '1px solid #e5e7eb', overflow: 'hidden', alignSelf: 'flex-start' }}>
            <div style={{ padding: '18px 24px', borderBottom: '1px solid #e5e7eb', background: '#fafafa' }}>
              <h2 style={{ margin: 0, fontSize: 15, fontWeight: 600, color: '#1f2937' }}>Information</h2>
            </div>
            <div style={{ padding: 20 }}>
              {[
                'C209 number will be generated automatically',
                'C208 will be generated at Logistics stage',
                'Date and time saved automatically',
              ].map(info => (
                <div key={info} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 10, fontSize: 13, color: '#374151' }}>
                  <span style={{ color: '#2563eb', marginTop: 1 }}>•</span>
                  {info}
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
      <style jsx>{`
        @media (max-width: 768px) {
          .ramp-container { flex-direction: column !important; }
          .main-content { padding: 16px !important; }
          .form-grid { grid-template-columns: 1fr !important; }
          .info-panel { order: -1; }
        }
      `}</style>
    </div>
  );
}
