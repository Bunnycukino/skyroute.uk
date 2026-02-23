'use client';

import { useState } from 'react';
import Link from 'next/link';
import { PlusCircle, Printer, CheckCircle2, AlertCircle, Loader2, ArrowRight } from 'lucide-react';

export default function RampInputPage() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<{
    c209: string,
    bar: string,
    flight: string,
    pieces: number,
    signature: string,
    notes: string
  } | null>(null);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    bar_number: '',
    pieces: '',
    flight_number: '',
    signature: '',
    notes: ''
  });

  const PREFIXES = [
    { airline: 'TUI', bar: 'TA', flight: 'TOM' },
    { airline: 'RYANAIR', bar: 'RYR', flight: 'FR' },
    { airline: 'EASYJET', bar: 'EZ', flight: 'EZY' },
    { airline: 'SINGAPORE', bar: 'POLY', flight: 'SQ' },
    { airline: 'EMIRATES', bar: 'EK', flight: 'EK' },
  ];

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
        notes: payload.notes
      });
      setFormData({
        bar_number: '',
        pieces: '',
        flight_number: '',
        signature: '',
        notes: ''
      });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const Label = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => (
    <span className={`text-[10px] font-black uppercase text-black tracking-widest ${className}`}>{children}</span>
  );

  const Box = ({ label, value, className = "" }: { label: string, value?: string, className?: string }) => (
    <div className={`border-r border-black p-2 flex flex-col justify-start h-full ${className}`}>
      <Label>{label}</Label>
      <div className="text-sm font-black mt-1 uppercase">{value}</div>
    </div>
  );

  const SectionHeader = ({ num, title, sub }: { num: number, title: string, sub?: string }) => (
    <div className="bg-black text-white p-2 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <span className="text-xs font-black uppercase tracking-[0.2em]">SECTION {num}: {title}</span>
      </div>
      {sub && <span className="text-[9px] italic opacity-80 font-bold">{sub}</span>}
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex">
      {/* Sidebar Navigation */}
      <aside className="w-72 bg-slate-950 border-r border-slate-800 flex flex-col p-8">
        <Link href="/dashboard" className="flex items-center gap-4 mb-12">
          <div className="w-12 h-12 rounded-2xl bg-green-500 flex items-center justify-center text-slate-950 shadow-lg shadow-green-500/20">
            <span className="font-black text-2xl">SR</span>
          </div>
          <div>
            <h1 className="font-black text-xl tracking-tighter">SkyRoute</h1>
            <p className="text-[10px] text-green-500 uppercase font-black tracking-widest leading-none">Terminal Operations</p>
          </div>
        </Link>
        <nav className="flex-1 space-y-2">
          <Link href="/ramp" className="flex items-center gap-4 px-5 py-4 rounded-2xl bg-white/5 border border-white/10 text-white font-black shadow-xl">
            <span className="text-xl">✈️</span> Ramp Input
          </Link>
          <Link href="/logistic" className="flex items-center gap-4 px-5 py-4 rounded-2xl hover:bg-slate-900 text-slate-400 hover:text-white transition-all group">
            <span className="text-xl group-hover:scale-110 transition-transform">📦</span> Logistics
          </Link>
          <Link href="/entries" className="flex items-center gap-4 px-5 py-4 rounded-2xl hover:bg-slate-900 text-slate-400 hover:text-white transition-all group">
            <span className="text-xl group-hover:scale-110 transition-transform">📋</span> Logs
          </Link>
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-12 overflow-y-auto bg-slate-900">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h2 className="text-4xl font-black uppercase tracking-tighter">C209 RAMP INPUT</h2>
            <p className="text-slate-500 font-bold uppercase tracking-[0.2em] text-xs">Register incoming containers and cargo</p>
          </div>

          <form onSubmit={handleSubmit} className="bg-white text-black border-2 border-black overflow-hidden shadow-2xl transition-all">
            {/* Header Section */}
            <div className="flex border-b-2 border-black h-24">
              <div className="w-1/2 p-4 flex items-center gap-4">
                <div className="text-sky-600 text-6xl font-black italic tracking-tighter scale-y-110 origin-left">dnata</div>
                <div className="h-full w-[2px] bg-black/10 mx-2"></div>
                <div>
                  <h1 className="text-xl font-black leading-none uppercase tracking-tighter">IN BOND<br/>CONTROL SHEET</h1>
                </div>
              </div>
              <div className="w-1/2 flex border-l-2 border-black bg-slate-50">
                <div className="flex-1 p-3 flex flex-col items-center justify-center">
                  <Label>C209 Number</Label>
                  <div className="text-2xl font-black tracking-[0.2em] mt-1">-------</div>
                </div>
              </div>
            </div>

            {/* SECTION 1: INBOUND BARS */}
            <SectionHeader num={1} title="INBOUND BARS" />
            <div className="grid grid-cols-3 border-b-2 border-black h-20">
              <div className="border-r-2 border-black p-3 flex flex-col group focus-within:bg-blue-50 transition-colors">
                <Label>Bar Number:</Label>
                <input 
                  required
                  placeholder="e.g. TA2009"
                  className="w-full bg-transparent font-black text-lg outline-none placeholder:text-black/20"
                  value={formData.bar_number}
                  onChange={e => setFormData({...formData, bar_number: e.target.value})}
                />
              </div>
              <div className="border-r-2 border-black p-3 flex flex-col focus-within:bg-blue-50 transition-colors">
                <Label>Number of Pieces:</Label>
                <input 
                  required
                  type="number"
                  placeholder="0"
                  className="w-full bg-transparent font-black text-lg outline-none placeholder:text-black/20"
                  value={formData.pieces}
                  onChange={e => setFormData({...formData, pieces: e.target.value})}
                />
              </div>
              <div className="p-3 flex flex-col bg-slate-50">
                <Label>Date Received:</Label>
                <div className="font-black text-lg">{new Date().toLocaleDateString('en-GB')}</div>
              </div>
            </div>

            <div className="grid grid-cols-3 border-b-2 border-black h-12 bg-slate-100 font-black text-[10px]">
              <div className="border-r-2 border-black flex items-center justify-center gap-2">
                <Label>Lock & Seal Check:</Label>
                <span className="text-slate-400">YES / NO</span>
              </div>
              <div className="border-r-2 border-black flex items-center justify-center gap-2">
                <Label>C209 Present:</Label>
                <span className="text-slate-400">YES / NO</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <Label>Bar Recorded on I/B Despatch:</Label>
                <span className="text-slate-400">YES / NO</span>
              </div>
            </div>

            <div className="border-b-2 border-black p-3 min-h-[80px]">
              <Label>Comments:</Label>
              <textarea 
                placeholder="no seal cart 13..."
                className="w-full bg-transparent font-bold text-sm outline-none resize-none mt-1 h-12 placeholder:text-black/10"
                value={formData.notes}
                onChange={e => setFormData({...formData, notes: e.target.value})}
              />
            </div>

            <div className="grid grid-cols-2 border-b-2 border-black h-12">
              <div className="border-r-2 border-black p-3 flex items-center gap-4">
                <Label>Print Name:</Label>
                <span className="font-black uppercase text-sm">TEST USER</span>
              </div>
              <div className="p-3 flex items-center gap-4 focus-within:bg-blue-50 transition-colors">
                <Label>Sign Name:</Label>
                <input 
                  required
                  placeholder="RR"
                  className="bg-transparent font-black uppercase text-sm outline-none w-20 placeholder:text-black/20"
                  value={formData.signature}
                  onChange={e => setFormData({...formData, signature: e.target.value})}
                />
              </div>
            </div>

            {/* SECTION 2: BAR STORAGE */}
            <SectionHeader num={2} title="BAR STORAGE" sub="To be used for bars that are being stored and/or checked" />
            <div className="border-b-2 border-black p-3 h-16 bg-slate-50 opacity-50">
              <Label>Comments:</Label>
            </div>

            {/* SECTION 3: BAR PACKING */}
            <div className="grid grid-cols-2 border-b-2 border-black">
              <div className="border-r-2 border-black">
                <div className="bg-slate-900 text-white p-2 text-[10px] font-black uppercase tracking-widest">SECTION 3: BAR PACKING - CORE BAR</div>
                <div className="space-y-0 divide-y-2 divide-black">
                   <div className="p-2 flex items-center justify-between text-[9px] font-black"><Label className="text-[9px]">Locks & Seals Checked Prior to Opening:</Label> YES / NO</div>
                   <div className="p-2 flex items-center justify-between text-[9px] font-black"><Label className="text-[9px]">Locks & Seals Intact:</Label> YES / NO</div>
                   <div className="p-2 flex items-center justify-between text-[9px] font-black"><Label className="text-[9px]">Seal numbers match paperwork?</Label> YES / NO</div>
                   <div className="p-1 px-2 text-[8px] italic font-bold">* If NO, inform Manager/Shift Leader</div>
                   <div className="grid grid-cols-2 h-10 divide-x-2 divide-black">
                      <div className="p-1"><Label className="text-[8px]">PRINT NAME:</Label></div>
                      <div className="p-1"><Label className="text-[8px]">SIGN NAME:</Label></div>
                   </div>
                </div>
              </div>
              <div>
                <div className="bg-slate-900 text-white p-2 text-[10px] font-black uppercase tracking-widest">SECTION 3: BAR PACKING - GIFT CART</div>
                <div className="space-y-0 divide-y-2 divide-black">
                   <div className="p-2 flex items-center justify-between text-[9px] font-black"><Label className="text-[9px]">Locks & Seals Checked Prior to Opening:</Label> YES / NO</div>
                   <div className="p-2 flex items-center justify-between text-[9px] font-black"><Label className="text-[9px]">Locks & Seals Intact:</Label> YES / NO</div>
                   <div className="p-2 flex items-center justify-between text-[9px] font-black"><Label className="text-[9px]">Seal numbers match paperwork?</Label> YES / NO</div>
                   <div className="p-1 px-2 text-[8px] italic text-transparent">.</div>
                   <div className="grid grid-cols-2 h-10 divide-x-2 divide-black">
                      <div className="p-1"><Label className="text-[8px]">PRINT NAME:</Label></div>
                      <div className="p-1"><Label className="text-[8px]">SIGN NAME:</Label></div>
                   </div>
                </div>
              </div>
            </div>

            <div className="p-3 bg-slate-950 flex justify-end">
               <button 
                disabled={loading}
                className="group flex items-center gap-4 bg-green-500 hover:bg-green-400 text-slate-950 px-12 py-4 rounded-xl font-black uppercase tracking-[0.2em] text-sm transition-all hover:scale-105 shadow-xl shadow-green-500/20 disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <PlusCircle className="w-5 h-5" />}
                {loading ? 'Submitting...' : 'Register C209 Entry'}
              </button>
            </div>
          </form>

          {/* Success / Error States */}
          <div className="mt-8">
            {error && (
              <div className="bg-red-500/10 border-2 border-red-500/20 p-6 rounded-2xl flex items-center gap-4 text-red-500 animate-in fade-in slide-in-from-top-4">
                <AlertCircle className="w-6 h-6" />
                <span className="font-black uppercase text-sm tracking-tight">System Error: {error}</span>
              </div>
            )}
            
            {success && (
              <div className="bg-green-500 border-2 border-green-600 p-8 rounded-2xl animate-in zoom-in shadow-2xl">
                <div className="flex flex-col md:flex-row justify-between items-center gap-8">
                  <div className="flex items-center gap-6">
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-inner">
                      <CheckCircle2 className="w-10 h-10 text-green-500" />
                    </div>Redesign C209 Ramp Input to match Excel IN BOND CONTROL SHEET template exactly
                    <div>
                      <div className="text-slate-900 text-[10px] font-black uppercase tracking-[0.3em]">Registration Successful</div>
                      <div className="text-3xl font-black text-white drop-shadow-md">C209: {success.c209}</div>
                    </div>
                  </div>
                  <Link 
                    href={`/in-bond?c209=${success.c209}&bar=${success.bar}&flight=${success.flight}&pieces=${success.pieces}&sig=${success.signature}&notes=${encodeURIComponent(success.notes)}&autoPrint=true`}
                    className="flex items-center gap-4 bg-slate-950 text-white px-10 py-5 rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-black transition-all shadow-2xl group active:scale-95"
                  >
                    <Printer className="w-5 h-5 group-hover:animate-bounce" />
                    Print Official Form
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
