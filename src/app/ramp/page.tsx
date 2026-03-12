'use client';
import { useState } from 'react';
import Link from 'next/link';
import { PlusCircle, Printer, CheckCircle2, Loader2 } from 'lucide-react';

export default function RampInputPage() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<{ c209: string, bar: string, flight: string, pieces: number, signature: string, notes: string, date: string } | null>(null);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    bar_number: '',
    pieces: '',
    flight_number: '',
    origin: '',
    destination: '',
    signature: '',
    notes: '',
    date_received: new Date().toISOString().split('T')[0]
  });

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
        origin: formData.origin.toUpperCase(),
        destination: formData.destination.toUpperCase(),
        signature: formData.signature.toUpperCase(),
        notes: formData.notes,
        date_received: formData.date_received
      };

      const res = await fetch('/api/entries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Blad zapisu');

      setSuccess({
        c209: data.c209,
        bar: payload.container_code,
        flight: payload.flight_number,
        pieces: payload.pieces,
        signature: payload.signature,
        notes: payload.notes,
        date: new Date(payload.date_received).toLocaleDateString('en-GB')
      });

      setFormData({
        bar_number: '',
        pieces: '',
        flight_number: '',
        origin: '',
        destination: '',
        signature: '',
        notes: '',
        date_received: new Date().toISOString().split('T')[0]
      });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background flex">
      <aside className="w-64 bg-card border-r border-border flex flex-col">
        <div className="p-6 border-b border-border">
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold">SR</div>
            <div>
              <h1 className="font-bold text-foreground text-sm">SkyRoute.uk</h1>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">C209 System</p>
            </div>
          </Link>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-accent transition-colors text-sm text-muted-foreground hover:text-foreground">
            <span>📊</span> Dashboard
          </Link>
          <Link href="/ramp" className="flex items-center gap-3 px-3 py-2 rounded-lg bg-primary/10 text-primary font-medium text-sm">
            <span>✈️</span> C209 Input ( Ramp Input )
          </Link>
          <Link href="/logistic" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-accent transition-colors text-sm text-muted-foreground hover:text-foreground">
            <span>📦</span> C208 Input ( Logistic Input )
          </Link>
          <Link href="/entries" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-accent transition-colors text-sm text-muted-foreground hover:text-foreground">
            <span>🗂️</span> All Entries
          </Link>
          <Link href="/sheets" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-accent transition-colors text-sm text-muted-foreground hover:text-foreground border-t border-border/50 pt-3 mt-3">
            <span>📑</span> VBA Sheets View
          </Link>
        </nav>
      </aside>

      <main className="flex-1 p-8 bg-slate-50/50 overflow-y-auto">
        <div className="max-w-4xl mx-auto">
          <header className="mb-8">
            <h1 className="text-4xl font-black tracking-tight text-slate-900">C209 RAMP INPUT</h1>
            <p className="text-slate-500 font-bold uppercase tracking-widest text-xs mt-1">Register incoming containers - C209 auto-generated</p>
          </header>

          <form onSubmit={handleSubmit} className="bg-white border-2 border-slate-100 rounded-[32px] shadow-2xl shadow-slate-200/50 overflow-hidden">
            <div className="p-8 md:p-12 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Bar Number</label>
                  <input
                    required
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 font-black text-xl focus:border-blue-500 transition-all outline-none uppercase"
                    placeholder="e.g. TA2009"
                    value={formData.bar_number}
                    onChange={e => setFormData({...formData, bar_number: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Number of Pieces</label>
                  <input
                    required
                    type="number"
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 font-black text-xl focus:border-blue-500 transition-all outline-none"
                    placeholder="0"
                    value={formData.pieces}
                    onChange={e => setFormData({...formData, pieces: e.target.value})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Flight Number</label>
                  <input
                    required
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 font-black text-xl focus:border-blue-500 transition-all outline-none uppercase"
                    placeholder="e.g. TOM123"
                    value={formData.flight_number}
                    onChange={e => setFormData({...formData, flight_number: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Date Received</label>
                  <input
                    type="date"
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 font-black text-xl focus:border-blue-500 transition-all outline-none"
                    value={formData.date_received}
                    onChange={e => setFormData({...formData, date_received: e.target.value})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Origin (e.g. MAN)</label>
                  <input
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 font-black text-xl focus:border-blue-500 transition-all outline-none uppercase"
                    placeholder="e.g. MAN"
                    value={formData.origin}
                    onChange={e => setFormData({...formData, origin: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Destination (e.g. DXB)</label>
                  <input
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 font-black text-xl focus:border-blue-500 transition-all outline-none uppercase"
                    placeholder="e.g. DXB"
                    value={formData.destination}
                    onChange={e => setFormData({...formData, destination: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Comments (e.g. no seal, cart 13)</label>
                <textarea
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 font-bold focus:border-blue-500 transition-all outline-none h-24"
                  value={formData.notes}
                  onChange={e => setFormData({...formData, notes: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Signature (Initials)</label>
                <input
                  required
                  className="w-24 bg-slate-50 border-2 border-slate-100 rounded-2xl px-4 py-3 font-black text-center focus:border-blue-500 transition-all outline-none uppercase"
                  placeholder="RR"
                  maxLength={3}
                  value={formData.signature}
                  onChange={e => setFormData({...formData, signature: e.target.value})}
                />
              </div>
            </div>

            {error && (
              <div className="mx-8 mb-4 p-4 bg-red-50 border border-red-200 rounded-2xl text-red-600 font-bold text-sm">{error}</div>
            )}

            <div className="p-6 bg-slate-50 flex justify-end">
              <button
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 text-white px-12 py-5 rounded-2xl font-black uppercase tracking-widest transition-all disabled:opacity-50 flex items-center gap-3"
              >
                {loading ? <Loader2 className="animate-spin" /> : <PlusCircle />}
                {loading ? 'Submitting...' : 'Register C209 Entry'}
              </button>
            </div>
          </form>

          {success && (
            <div className="mt-8 bg-green-500 p-8 rounded-[32px] shadow-2xl animate-in zoom-in">
              <div className="flex flex-col md:flex-row justify-between items-center gap-8">
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center">
                    <CheckCircle2 className="text-green-500 w-10 h-10" />
                  </div>
                  <div>
                    <div className="text-white/80 text-[10px] font-black uppercase tracking-widest">Registration Successful</div>
                    <div className="text-4xl font-black text-white tracking-tighter">C209: {success.c209}</div>
                    <div className="text-white/70 text-sm mt-1">{success.bar} • {success.flight} • {success.pieces} pcs • {success.date}</div>
                  </div>
                </div>
                <Link
                  href={`/in-bond?c209=${success.c209}&bar=${success.bar}&pieces=${success.pieces}&sig=${success.signature}&notes=${encodeURIComponent(success.notes)}&date=${success.date}&autoPrint=true`}
                  className="bg-white text-green-600 px-10 py-5 rounded-2xl font-black uppercase tracking-widest hover:scale-105 transition-all flex items-center gap-3"
                >
                  <Printer />
                  Print Official Form
                </Link>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
