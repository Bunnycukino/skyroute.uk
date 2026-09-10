'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/Sidebar';

export default function PrintOutPage() {
  const router = useRouter();
  const [entries, setEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [printing, setPrinting] = useState<number | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/entries?type=ramp_input');
        if (res.status === 401) { router.push('/'); return; }
        const data = await res.json();
        setEntries(data.entries || []);
      } catch (err) { console.error('Failed to load entries'); }
      finally { setLoading(false); }
    }
    load();
  }, [router]);

  async function handlePrint(entry: any) {
    setPrinting(entry.id);
    try {
      const res = await fetch('/api/print-in-bond', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          c209: entry.c209_number || '',
          bar_number: entry.bar_number || entry.container_code || '',
          pieces: entry.pieces || 0,
          flight_number: entry.flight_number || '',
          signature: entry.signature || '',
          date_received: entry.created_at ? entry.created_at.split('T')[0] : '',
          comments: entry.notes || ''
        })
      });
      if (!res.ok) throw new Error('Failed to generate PDF');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const win = window.open(url, '_blank');
      if (win) {
        win.addEventListener('load', () => {
          setTimeout(() => { win.print(); }, 500);
        });
      }
    } catch (err: any) {
      alert('Print failed: ' + err.message);
    } finally {
      setPrinting(null);
    }
  }

  function fmtDate(val: string): string {
    if (!val) return '-';
    try { return new Date(val).toLocaleDateString('en-GB'); } catch { return '-'; }
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f8fafa' }} className="printout-container">
      <Sidebar active="/printout" />
      <main style={{ flex: 1, padding: 32 }} className="main-content">
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: '#111827', margin: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
            🖨 Print Out
          </h1>
          <p style={{ color: '#6b7280', fontSize: 14, marginTop: 4 }}>
            Print IN BOND Control Sheet for any ramp entry — uses original PDF template
          </p>
        </div>

        {loading ? (
          <div style={{ padding: 40, textAlign: 'center', color: '#6b7280' }}>Loading entries...</div>
        ) : entries.length === 0 ? (
          <div style={{ background: '#fff', borderRadius: 12, padding: 40, textAlign: 'center', color: '#6b7280', border: '1px solid #e5e7eb' }}>
            No ramp entries yet. Add an entry on the Ramp page first.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {entries.map(entry => (
              <div
                key={entry.id}
                style={{
                  background: '#fff',
                  borderRadius: 12,
                  border: '1px solid #e5e7eb',
                  padding: '16px 20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 16,
                  boxShadow: '0 1px 2px rgba(0,0,0,0.04)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
                  <div style={{
                    background: '#eff6ff',
                    color: '#1e3a8a',
                    fontWeight: 700,
                    fontSize: 15,
                    padding: '6px 14px',
                    borderRadius: 8,
                    minWidth: 100,
                    textAlign: 'center'
                  }}>
                    {entry.c209_number || '-'}
                  </div>
                  <div style={{ fontSize: 13, color: '#6b7280' }}>
                    <div><strong style={{ color: '#374151' }}>Bar:</strong> {entry.bar_number || entry.container_code || '-'}</div>
                    <div><strong style={{ color: '#374151' }}>Flight:</strong> {entry.flight_number || '-'} • <strong style={{ color: '#374151' }}>Pieces:</strong> {entry.pieces ?? '-'}</div>
                    <div><strong style={{ color: '#374151' }}>Date:</strong> {fmtDate(entry.created_at)} • <strong style={{ color: '#374151' }}>Sign:</strong> {entry.signature || '-'}</div>
                  </div>
                </div>
                <button
                  onClick={() => handlePrint(entry)}
                  disabled={printing === entry.id}
                  style={{
                    background: printing === entry.id ? '#93c5fd' : 'linear-gradient(135deg,#1e3a8a,#2563eb)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 8,
                    padding: '10px 20px',
                    fontWeight: 600,
                    fontSize: 14,
                    cursor: printing === entry.id ? 'not-allowed' : 'pointer',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {printing === entry.id ? 'Generating...' : '🖨 Print IN BOND'}
                </button>
              </div>
            ))}
          </div>
        )}
      </main>
      <style jsx>{`
        @media (max-width: 768px) {
          .printout-container { flex-direction: column !important; }
          .main-content { padding: 16px !important; }
        }
      `}</style>
    </div>
  );
}
