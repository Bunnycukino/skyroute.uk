'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/Sidebar';

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
            <span>📋</span> Logistic Input
          </h1>
          <p style={{ color: '#6b7280', fontSize: 14, marginTop: 4 }}>Update an existing C209 or create a NEW BUILD</p>
        </div>
        {success && (
          <div style={{ background: '#10b981', borderRadius: 12, padding: '20px 24px', marginBottom: 24, color: '#fff' }}>
            <div style={{ fontWeight: 700, fontSize: 18 }}>✅ Data saved! C209: {success.c209}, C208: {success.c208}</div>
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
              <h2 style={{ margin: 0, fontSize: 15, fontWeight: 600, color: '#1f2937' }}>Logistic Form</h2>
            </div>
            <form onSubmit={handleSubmit} style={{ padding: 20 }}>
              <div style={{ marginBottom: 16 }}>
                <label style={labelStyle}>C209 Number *</label>
                <input style={inputStyle} placeholder="Enter C209" value={formData.c209_number} onChange={e => set('c209_number', e.target.value)} required />
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={labelStyle}>Flight Number *</label>
                <input style={inputStyle} placeholder="e.g. LH123 or RW456" value={formData.flight_number} onChange={e => set('flight_number', e.target.value)} required />
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={labelStyle}>Flight Date</label>
                <input style={inputStyle} type="date" value={formData.date_received} onChange={e => set('date_received', e.target.value)} />
              </div>
              {isNewBuild && (
                <>
                  <div style={{ marginBottom: 16 }}>
                    <label style={labelStyle}>Bar Number</label>
                    <input style={inputStyle} placeholder="Optional for existing C209" value={formData.bar_number} onChange={e => set('bar_number', e.target.value)} />
                  </div>
                  <div style={{ marginBottom: 16 }}>
                    <label style={labelStyle}>Pieces</label>
                    <input style={inputStyle} type="number" placeholder="Optional for existing C209" value={formData.pieces} onChange={e => set('pieces', e.target.value)} />
                  </div>
                </>
              )}
              <div style={{ marginBottom: 16 }}>
                <label style={labelStyle}>Signature</label>
                <input style={inputStyle} placeholder="Name" value={formData.signature} onChange={e => set('signature', e.target.value)} />
              </div>
              <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                <button type="submit" disabled={loading} style={{ flex: 1, padding: '12px', background: loading ? '#6ee7b7' : 'linear-gradient(135deg,#10b981,#059669)', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 600, fontSize: 14, cursor: loading ? 'not-allowed' : 'pointer' }}>
                  {loading ? 'Saving...' : '✅ Save'}
                </button>
                <button type="button" onClick={() => setFormData({ c209_number: '', flight_number: '', signature: '', date_received: new Date().toISOString().split('T')[0], bar_number: '', pieces: '', notes: '' })} style={{ padding: '12px 20px', background: '#fff', color: '#374151', border: '1px solid #e5e7eb', borderRadius: 8, fontWeight: 500, fontSize: 14, cursor: 'pointer' }}>
                  ✕ Clear
                </button>
              </div>
            </form>
          </div>
          <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e5e7eb', overflow: 'hidden', alignSelf: 'flex-start' }}>
            <div style={{ padding: '18px 24px', borderBottom: '1px solid #e5e7eb', background: '#fafafa' }}>
              <h2 style={{ margin: 0, fontSize: 15, fontWeight: 600, color: '#1f2937' }}>Information</h2>
            </div>
            <div style={{ padding: 20 }}>
              {[
                isNewBuild ? 'A new entry will be created' : 'Existing C209 will be updated',
                'C208 number will be generated automatically',
                'RW flights are detected automatically',
                'Date and time will be saved automatically',
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
