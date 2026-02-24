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
    <div className="min-h-screen bg-slate-900 flex flex-col md:flex-row">
      <aside className="w-full md:w-64 bg-slate-950 p-6 flex flex-col border-r border-white/5">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center font-black text-white shadow-lg shadow-blue-500/20">SR</div>
          <div className="font-black text-white tracking-tighter">SkyRoute.uk</div>
        </div>
        <nav className="space-y-2">
          <Link href="/dashboard" className="block p-3 rounded-lg text-slate-400 hover:bg-white/5">Dashboard</Link>
          <Link href="/ramp" className="block p-3 rounded-lg bg-blue-600 text-white font-bold">Ramp Input (C209)</Link>
          <Link href="/logistic" className="block p-3 rounded-lg text-slate-400 hover:bg-white/5">Logistic Input (C208)</Link>
          <Link href="/entries" className="block p-3 rounded-lg text-slate-400 hover:bg-white/5">All Entries</Link>
        </nav>
      </aside>

      <main className="flex-1 p-4 md:p-8 overflow-y-auto">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-black text-white tracking-tight">C209 RAMP INPUT</h1>
            <p className="text-slate-400 font-medium">Register incoming containers - C209 auto-generated</p>
          </div>

          <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-white/10">
            <div className="p-8 space-y-6">

              {/* Row 1: Bar Number + Pieces */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

              {/* Row 2: Flight Number + Date */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

              {/* Row 3: Origin + Destination */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

              {/* Row 4: Comments */}
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Comments (e.g. no seal, cart 13)</label>
                <textarea
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 font-bold focus:border-blue-500 transition-all outline-none h-24"
                  value={formData.notes}
                  onChange={e => setFormData({...formData, notes: e.target.value})}
                />
              </div>

              {/* Row 5: Signature */}
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
            <div className="mt-8 bg-green-500 p-8 rounded-3xl shadow-2xl animate-in zoom-in">
              <div className="flex flex-col md:flex-row justify-between items-center gap-8">
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center"><CheckCircle2 className="text-green-500 w-10 h-10" /></div>
                  <div>
                    <div className="text-white/80 text-[10px] font-black uppercase tracking-widest">Registration Successful</div>
                    <div className="text-4xl font-black text-white tracking-tighter">C209: {success.c209}</div>
                    <div className="text-white/70 text-sm mt-1">{success.bar} &bull; {success.flight} &bull; {success.pieces} pcs &bull; {success.date}</div>
                  </div>
                </div>
                <Link
                  href={`/in-bond?c209=${success.c209}&bar=${success.bar}&pieces=${success.pieces}&sig=${success.signature}&notes=${encodeURIComponent(success.notes)}&date=${success.date}&autoPrint=true`}
                  className="bg-white text-green-600 px-10 py-5 rounded-2xl font-black uppercase tracking-widest hover:scale-105 transition-all flex items-center gap-3"
                >
                  <Printer /> Print Official Form
                </Link>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
