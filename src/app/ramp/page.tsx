'use client';
import { useRef, useState } from 'react';
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

function InBondPrintModal({ data, onClose }: { data: any; onClose: () => void }) {
  const printRef = useRef<HTMLDivElement>(null);

  function handlePrint() {
    const content = printRef.current?.innerHTML;
    if (!content) return;
    const win = window.open('', '_blank');
    if (!win) return;
    win.document.write(`
      <!DOCTYPE html><html><head><title>IN BOND CONTROL SHEET - ${data.c209}</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 10mm; color: #000; }
        .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px; }
        .logo { font-size: 28px; font-weight: 900; color: #00a0c6; letter-spacing: -1px; }
        .logo span { color: #5cb85c; }
        .title-block { text-align: center; }
        .title-block h1 { font-size: 18px; font-weight: 900; margin: 0; text-transform: uppercase; }
        .c209-box { border: 2px solid #000; padding: 8px 16px; min-width: 180px; text-align: center; }
        .c209-box .label { font-size: 11px; font-weight: bold; text-transform: uppercase; }
        .c209-box .value { font-size: 22px; font-weight: 900; margin-top: 4px; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 8px; }
        td, th { border: 1px solid #000; padding: 6px 8px; font-size: 11px; }
        .section-header { background: #f0f0f0; font-weight: bold; font-size: 12px; }
        .yesno { font-weight: bold; }
        .photo-box { border: 2px solid #000; min-height: 120px; display: flex; align-items: center; justify-content: center; margin-top: 8px; }
        .photo-box img { max-width: 100%; max-height: 200px; object-fit: contain; }
        .footer { margin-top: 16px; font-size: 9px; text-align: center; color: #666; border-top: 1px solid #ccc; padding-top: 6px; }
        @page { margin: 10mm; }
        @media print { body { margin: 0; } }
      </style></head><body>${content}</body></html>
    `);
    win.document.close();
    win.focus();
    setTimeout(() => { win.print(); win.close(); }, 400);
  }

  const td = (label: string, value: string, colSpan = 1) =>
    `<td${colSpan > 1 ? ` colspan="${colSpan}"` : ''}><strong>${label}:</strong> ${value || '...........'}</td>`;

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 1000, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '20px', overflowY: 'auto' }}>
      <div style={{ background: '#fff', borderRadius: 12, maxWidth: 820, width: '100%', overflow: 'hidden', boxShadow: '0 25px 60px rgba(0,0,0,0.3)' }}>
        <div style={{ background: 'linear-gradient(135deg, #1e3a5f, #2563eb)', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ color: '#fff', fontWeight: 700, fontSize: 17 }}>📴 IN BOND CONTROL SHEET</div>
            <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12 }}>C209: {data.c209} • {data.bar} • {data.flight}</div>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={handlePrint} style={{ background: '#10b981', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 20px', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
              🖨 Drukuj Control Sheet
            </button>
            <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.2)', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 16px', fontWeight: 700, cursor: 'pointer' }}>
              ✕ Zamknij
            </button>
          </div>
        </div>
        <div style={{ padding: 24, overflowY: 'auto', maxHeight: '80vh' }}>
          <div ref={printRef}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
              <div>
                <div style={{ fontSize: 32, fontWeight: 900, color: '#00a0c6', letterSpacing: -1 }}>d<span style={{ color: '#5cb85c' }}>n</span>ata</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontWeight: 900, fontSize: 16, textTransform: 'uppercase', lineHeight: 1.2 }}>IN BOND<br/>CONTROL SHEET</div>
              </div>
              <div style={{ border: '2px solid #000', padding: '8px 16px', minWidth: 180, textAlign: 'center' }}>
                <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase' }}>C209 Number</div>
                <div style={{ fontSize: 24, fontWeight: 900, marginTop: 4 }}>{data.c209}</div>
              </div>
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 8, fontSize: 12 }}>
              <tbody>
                <tr><td colSpan={3} style={{ border: '1px solid #000', background: '#f0f0f0', fontWeight: 'bold', padding: '6px 8px' }}>SECTION 1: INBOUND BARS</td></tr>
                <tr>
                  <td style={{ border: '1px solid #000', padding: '6px 8px' }}><strong>Bar Number:</strong> {data.bar}</td>
                  <td style={{ border: '1px solid #000', padding: '6px 8px' }}><strong>Number of Pieces:</strong> {data.pieces}</td>
                  <td style={{ border: '1px solid #000', padding: '6px 8px' }}><strong>Date Received:</strong> {data.date}</td>
                </tr>
                <tr>
                  <td style={{ border: '1px solid #000', padding: '6px 8px' }}><strong>Lock &amp; Seal Check:</strong> YES / NO</td>
                  <td style={{ border: '1px solid #000', padding: '6px 8px' }}><strong>C209 Present:</strong> YES / NO</td>
                  <td style={{ border: '1px solid #000', padding: '6px 8px' }}><strong>Bar Recorded on I/B Despatch Sheet:</strong> YES / NO</td>
                </tr>
                <tr><td colSpan={3} style={{ border: '1px solid #000', padding: '6px 8px' }}><strong>Comments:</strong> {data.notes || ''}<br/><br/></td></tr>
                <tr>
                  <td colSpan={2} style={{ border: '1px solid #000', padding: '6px 8px' }}><strong>PRINT NAME:</strong> {data.signature}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</td>
                  <td style={{ border: '1px solid #000', padding: '6px 8px' }}><strong>SIGN NAME:</strong>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</td>
                </tr>
              </tbody>
            </table>
            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 8, fontSize: 12 }}>
              <tbody>
                <tr><td colSpan={2} style={{ border: '1px solid #000', background: '#f0f0f0', fontWeight: 'bold', padding: '6px 8px' }}>SECTION 2: BAR STORAGE &nbsp;&nbsp;&nbsp;&nbsp; to be used for bars that are being stored and/or checked</td></tr>
                <tr><td colSpan={2} style={{ border: '1px solid #000', padding: '6px 8px' }}><strong>Comments:</strong><br/><br/><br/></td></tr>
              </tbody>
            </table>
            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 8, fontSize: 12 }}>
              <tbody>
                <tr>
                  <td style={{ border: '1px solid #000', background: '#f0f0f0', fontWeight: 'bold', padding: '6px 8px', width: '50%' }}>SECTION 3: BAR PACKING - CORE BAR</td>
                  <td style={{ border: '1px solid #000', background: '#f0f0f0', fontWeight: 'bold', padding: '6px 8px' }}>BAR PACKING - GIFT CARTS</td>
                </tr>
                {['Locks &amp; Seals Checked Prior to Opening Bar:', 'Lock &amp; Seals Intact:', 'Seal numbers match paperwork?'].map(item => (
                  <tr key={item}>
                    <td style={{ border: '1px solid #000', padding: '6px 8px' }}>{item} YES / NO</td>
                    <td style={{ border: '1px solid #000', padding: '6px 8px' }}>{item} YES / NO</td>
                  </tr>
                ))}
                <tr>
                  <td colSpan={2} style={{ border: '1px solid #000', padding: '6px 8px', fontSize: 10, color: '#555' }}>* If NO, complete details below &amp; inform Manager/Shift Leader</td>
                </tr>
                <tr>
                  <td style={{ border: '1px solid #000', padding: '6px 8px' }}><strong>Number of Pieces:</strong> {data.pieces}</td>
                  <td style={{ border: '1px solid #000', padding: '6px 8px' }}><strong>Number of Pieces:</strong></td>
                </tr>
                <tr>
                  <td style={{ border: '1px solid #000', padding: '6px 8px' }}><strong>Date Received:</strong> {data.date}</td>
                  <td style={{ border: '1px solid #000', padding: '6px 8px' }}><strong>Date Received:</strong></td>
                </tr>
                <tr>
                  <td style={{ border: '1px solid #000', padding: '6px 8px' }}><strong>Print Name:</strong> {data.signature}</td>
                  <td style={{ border: '1px solid #000', padding: '6px 8px' }}><strong>Print Name:</strong></td>
                </tr>
                <tr>
                  <td style={{ border: '1px solid #000', padding: '6px 8px' }}><strong>Sign Name:</strong></td>
                  <td style={{ border: '1px solid #000', padding: '6px 8px' }}><strong>Sign Name:</strong></td>
                </tr>
                <tr><td colSpan={2} style={{ border: '1px solid #000', padding: '6px 8px' }}><strong>Flight:</strong> {data.flight} &nbsp;&nbsp;&nbsp;&nbsp; <strong>C208:</strong> {data.c208 || '...........'}</td></tr>
              </tbody>
            </table>
            {data.photo && (
              <div style={{ marginTop: 12 }}>
                <div style={{ fontWeight: 700, fontSize: 12, marginBottom: 6, borderBottom: '2px solid #000', paddingBottom: 4 }}>ZDJĘCIE POTWIERDZAJĄCE ODBIÓR</div>
                <div style={{ border: '2px solid #000', padding: 8, textAlign: 'center' }}>
                  <img src={data.photo} alt="Confirmation photo" style={{ maxWidth: '100%', maxHeight: 300, objectFit: 'contain' }} />
                </div>
              </div>
            )}
            <div style={{ marginTop: 12, fontSize: 9, textAlign: 'center', color: '#666', borderTop: '1px solid #ccc', paddingTop: 6 }}>
              SYSTEM GENERATED • SKYROUTE.UK C209 SYSTEM • {new Date().toLocaleString('en-GB')} • Template v1.2
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function RampInputPage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<{ c209: string, c208: string, bar: string, flight: string, pieces: number, signature: string, notes: string, date: string, photo?: string } | null>(null);
  const [error, setError] = useState('');
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    bar_number: '',
    pieces: '',
    flight_number: '',
    origin: '',
    destination: '',
    signature: '',
    notes: '',
    date_received: new Date().toISOString().split('T')[0],
    photo: null as File | null
  });

  const set = (k: string, v: string | File | null) => setFormData(f => ({ ...f, [k]: v }));

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      set('photo', file);
      const reader = new FileReader();
      reader.onloadend = () => setPhotoPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(null);
    try {
      let photoDataUrl = null;
      if (formData.photo) {
        photoDataUrl = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(formData.photo!);
        });
      }

      const payload = {
        action: 'ramp_input',
        container_code: formData.bar_number.toUpperCase(),
        pieces: parseInt(formData.pieces) || 0,
        flight_number: formData.flight_number.toUpperCase(),
        origin: formData.origin.toUpperCase(),
        destination: formData.destination.toUpperCase(),
        signature: formData.signature.toUpperCase(),
        notes: formData.notes,
        date_received: formData.date_received,
        photo: photoDataUrl
      };
      const res = await fetch('/api/entries', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Błąd zapisu');
      setSuccess({ c209: data.c209, c208: data.c208 || '', bar: payload.container_code, flight: payload.flight_number, pieces: payload.pieces, signature: payload.signature, notes: payload.notes, date: new Date(payload.date_received).toLocaleDateString('pl-PL'), photo: photoDataUrl || undefined });
      setFormData({ bar_number: '', pieces: '', flight_number: '', origin: '', destination: '', signature: '', notes: '', date_received: new Date().toISOString().split('T')[0], photo: null });
      setPhotoPreview(null);
    } catch (err: any) { setError(err.message); }
    finally { setLoading(false); }
  }

  const inputStyle = { width: '100%', border: '1px solid #e5e7eb', borderRadius: 8, padding: '10px 14px', fontSize: 14, outline: 'none', boxSizing: 'border-box' as const, background: '#fff' };
  const labelStyle = { display: 'block', fontSize: 14, fontWeight: 500, color: '#374151', marginBottom: 6 };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f9fafb' }}>
      <Sidebar active="/ramp" />
      <main style={{ flex: 1, padding: 32 }}>
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: '#111827', margin: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
            <span>📦</span> Wprowadzanie z rampy
          </h1>
          <p style={{ color: '#6b7280', fontSize: 14, marginTop: 4 }}>Utwórz nowy wpis C209 z danych otrzymanych na rampie</p>
        </div>

        {success && (
          <div style={{ background: '#10b981', borderRadius: 12, padding: '20px 24px', marginBottom: 24, color: '#fff' }}>
            <div style={{ fontWeight: 700, fontSize: 18 }}>✅ Rejestracja udana! C209: {success.c209}</div>
            <div style={{ fontSize: 14, marginTop: 4, opacity: 0.9 }}>{success.bar} • {success.flight} • {success.pieces} szt. • {success.date}</div>
            <button onClick={() => setShowPrintModal(true)} style={{ marginTop: 12, background: '#fff', color: '#10b981', border: 'none', borderRadius: 8, padding: '10px 20px', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
              🖨 Drukuj IN BOND Control Sheet
            </button>
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
              <h2 style={{ margin: 0, fontSize: 15, fontWeight: 600, color: '#1f2937' }}>Formularz wprowadzania</h2>
            </div>
            <form onSubmit={handleSubmit} style={{ padding: 20 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                <div>
                  <label style={labelStyle}>Kod kontenera / Numer BAR *</label>
                  <input style={inputStyle} placeholder="np. ABC12345" value={formData.bar_number} onChange={e => set('bar_number', e.target.value)} required />
                </div>
                <div>
                  <label style={labelStyle}>Liczba sztuk</label>
                  <input style={inputStyle} type="number" placeholder="np. 5" value={formData.pieces} onChange={e => set('pieces', e.target.value)} />
                </div>
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={labelStyle}>Numer lotu</label>
                <input style={inputStyle} placeholder="np. LH123" value={formData.flight_number} onChange={e => set('flight_number', e.target.value)} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                <div>
                  <label style={labelStyle}>Skąd (np. MAN)</label>
                  <input style={inputStyle} placeholder="np. MAN" value={formData.origin} onChange={e => set('origin', e.target.value)} />
                </div>
                <div>
                  <label style={labelStyle}>Dokąd (np. DXB)</label>
                  <input style={inputStyle} placeholder="np. DXB" value={formData.destination} onChange={e => set('destination', e.target.value)} />
                </div>
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={labelStyle}>Uwagi</label>
                <textarea value={formData.notes} onChange={e => set('notes', e.target.value)} style={{ ...inputStyle, minHeight: 80, resize: 'vertical' }} placeholder="np. brak plomby, wózek 13" />
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={labelStyle}>Podpis (inicjały)</label>
                <input style={inputStyle} placeholder="np. RR" value={formData.signature} onChange={e => set('signature', e.target.value)} maxLength={10} />
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={labelStyle}>Data lotu</label>
                <input style={inputStyle} type="date" value={formData.date_received} onChange={e => set('date_received', e.target.value)} />
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={labelStyle}>📷 Zdjęcie potwierdzające (opcjonalne)</label>
                <input ref={fileInputRef} type="file" accept="image/*" capture="environment" onChange={handlePhotoChange} style={{ display: 'none' }} />
                <button type="button" onClick={() => fileInputRef.current?.click()} style={{ ...inputStyle, cursor: 'pointer', textAlign: 'center', background: '#f9fafb', borderStyle: 'dashed' }}>
                  {photoPreview ? '✅ Zdjęcie załączone (kliknij aby zmienić)' : '📷 Kliknij aby zrobić/wybrać zdjęcie'}
                </button>
                {photoPreview && (
                  <div style={{ marginTop: 8, border: '2px solid #e5e7eb', borderRadius: 8, overflow: 'hidden' }}>
                    <img src={photoPreview} alt="Preview" style={{ width: '100%', maxHeight: 200, objectFit: 'contain' }} />
                  </div>
                )}
              </div>
              <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                <button type="submit" disabled={loading} style={{ flex: 1, padding: '12px', background: loading ? '#93c5fd' : 'linear-gradient(135deg,#3b82f6,#1d4ed8)', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 600, fontSize: 14, cursor: loading ? 'not-allowed' : 'pointer' }}>
                  {loading ? 'Zapisywanie...' : '✅ Zapisz wpis'}
                </button>
                <button type="button" onClick={() => { setFormData({ bar_number: '', pieces: '', flight_number: '', origin: '', destination: '', signature: '', notes: '', date_received: new Date().toISOString().split('T')[0], photo: null }); setPhotoPreview(null); }} style={{ padding: '12px 20px', background: '#fff', color: '#374151', border: '1px solid #e5e7eb', borderRadius: 8, fontWeight: 500, fontSize: 14, cursor: 'pointer' }}>
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
                'Numer C209 zostanie wygenerowany automatycznie',
                'Numer C208 zostanie wygenerowany automatycznie',
                'Wpis zostanie dodany do systemu śledzenia wygaśnięcia (48h)',
                'Możesz dodać zdjęcie potwierdzające odbiór',
                'Po zapisie możesz wydrukować IN BOND Control Sheet',
              ].map(info => (
                <div key={info} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 10, fontSize: 13, color: '#374151' }}>
                  <span style={{ color: '#3b82f6', marginTop: 1 }}>•</span>
                  {info}
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
      {showPrintModal && success && <InBondPrintModal data={success} onClose={() => setShowPrintModal(false)} />}
    </div>
  );
}
