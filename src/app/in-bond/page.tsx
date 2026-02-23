'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

function InBondFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    c209_number: '',
    bar_number: '',
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    date: new Date().toISOString().split('T')[0],

    // SECTION 1: INBOUND BARS
    lock_seal_check: 'YES',
    lock_seal_intact: 'YES',
    seals_match_paperwork: 'YES',
    c209_present: 'YES',
    seal_numbers: '',

    // SECTION 2: COMMENTS
    inbound_comments: '',
    inbound_signature: '',

    // SECTION 3: BAR PACKING
    packing_pieces: '',
    recorded_on_dispatch: 'YES',
    manager_informed: 'YES',
    packing_signature: '',

    // SECTION 4: MANAGEMENT
    manager_name: '',

    // SECTION 5: BAR COMPLETION
    equip_doors_locks: 'YES',
    equip_wheels_brakes: 'YES',
    completion_name: '',
    completion_signature: ''
  });

  useEffect(() => {
    const c209 = searchParams.get('c209') || '';
    const bar = searchParams.get('bar') || '';
    const pieces = searchParams.get('pieces') || '';
    const sig = searchParams.get('sig') || '';

    if (c209 || bar || pieces || sig) {
      setFormData(prev => ({
        ...prev,
        c209_number: c209,
        bar_number: bar,
        packing_pieces: pieces,
        packing_signature: sig,
        completion_name: sig,
        inbound_signature: sig
      }));
    }
  }, [searchParams]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/entries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'in_bond_input', 
          ...formData,
          inbound_bars_comments: formData.inbound_comments,
          bar_recorded_on_dispatch: formData.recorded_on_dispatch,
          equipment_serviceable_doors: formData.equip_doors_locks,
          equipment_serviceable_wheels: formData.equip_wheels_brakes,
          packing_manager_informed: formData.manager_informed,
          manager_name: formData.manager_name,
          seal_numbers: formData.seal_numbers
        })
      });

      if (!res.ok) throw new Error('Failed to save');
      setSuccess(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4 text-black font-sans leading-tight">
      <div className="max-w-[950px] mx-auto mb-4 flex justify-between items-center print:hidden">
        <Link href="/ramp" className="text-[10px] font-bold text-gray-500 hover:text-black transition-colors uppercase tracking-widest bg-white px-3 py-1 border border-gray-200 rounded-sm">
          &larr; RAMP DASHBOARD
        </Link>
        <button 
          onClick={() => window.print()}
          className="bg-black text-white px-5 py-2 text-[10px] font-black uppercase tracking-widest rounded-sm hover:shadow-lg transition-all"
        >
          PRINT OFFICIAL SHEET
        </button>
      </div>

      <form onSubmit={handleSubmit} className="max-w-[950px] mx-auto bg-white border-[3px] border-black shadow-[15px_15px_0px_rgba(0,0,0,0.05)] print:shadow-none print:border-2 overflow-hidden">
        {/* TOP HEADER */}
        <div className="grid grid-cols-[1fr_300px] border-b-[3px] border-black">
          <div className="p-6 flex items-center gap-5 border-r-[3px] border-black">
            <div className="bg-black text-white w-16 h-16 flex items-center justify-center text-4xl font-black shrink-0">SR</div>
            <div className="space-y-1">
              <h1 className="text-4xl font-black uppercase tracking-tighter italic leading-none border-b-4 border-black inline-block pb-1">In Bond Control Sheet</h1>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.3em] pl-1">Official Logistics Document // Emirates Group</p>
            </div>
          </div>
          <div className="p-6 flex flex-col justify-center items-end bg-gray-50/50">
            <span className="text-[9px] font-black text-gray-300 uppercase tracking-[0.2em] mb-1">Official Tracking Ref</span>
            <span className="text-4xl font-black tracking-tighter italic leading-none">SR-{formData.c209_number || '0000'}</span>
            <span className="text-[8px] font-bold text-gray-200 mt-2 tracking-widest uppercase">Version 1.2 Revision 250124</span>
          </div>
        </div>

        {/* SHIPMENT METADATA */}
        <div className="grid grid-cols-4 divide-x-[3px] divide-black border-b-[3px] border-black bg-white">
          <div className="p-4 group hover:bg-yellow-50 transition-colors">
            <label className="text-[10px] font-black uppercase text-gray-400 block mb-1 tracking-tighter">C209 NUMBER</label>
            <input required className="w-full text-lg font-black uppercase bg-transparent outline-none placeholder:text-gray-100" placeholder="REQUIRED" value={formData.c209_number} onChange={e => setFormData({...formData, c209_number: e.target.value})} />
          </div>
          <div className="p-4 group hover:bg-yellow-50 transition-colors">
            <label className="text-[10px] font-black uppercase text-gray-400 block mb-1 tracking-tighter">BAR NUMBER</label>
            <input required className="w-full text-lg font-black uppercase bg-transparent outline-none placeholder:text-gray-100" placeholder="REQUIRED" value={formData.bar_number} onChange={e => setFormData({...formData, bar_number: e.target.value})} />
          </div>
          <div className="p-4 bg-gray-50/30">
            <label className="text-[10px] font-black uppercase text-gray-400 block mb-1 tracking-tighter">DATE RECEIVED</label>
            <input type="date" className="w-full text-base font-black bg-transparent outline-none" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
          </div>
          <div className="p-4 bg-gray-50/30">
            <label className="text-[10px] font-black uppercase text-gray-400 block mb-1 tracking-tighter">TIME RECEIVED</label>
            <input className="w-full text-lg font-black uppercase bg-transparent outline-none" value={formData.time} onChange={e => setFormData({...formData, time: e.target.value})} />
          </div>
        </div>

        {/* SECTION 1: INBOUND CHECK */}
        <div className="bg-black text-white px-4 py-2.5 text-[11px] font-black uppercase tracking-[0.4em] flex justify-between items-center">
          <div className="flex items-center gap-3">
            <span className="bg-white text-black w-5 h-5 flex items-center justify-center rounded-full text-[10px]">1</span>
            <span>Section 1: Inbound Verification</span>
          </div>
          <span className="text-[9px] opacity-40 font-bold tracking-widest">Protocol: Verify Seals & Locks</span>
        </div>
        <div className="grid grid-cols-2 divide-x-[3px] divide-black border-b-[3px] border-black bg-white">
          <div className="p-5 space-y-5">
            <div className="flex justify-between items-center">
              <span className="text-[11px] font-black uppercase tracking-tight">Locks/Seals Checked Prior to Opening?</span>
              <select className="bg-black text-white text-[10px] font-black px-3 py-1.5 rounded-sm cursor-pointer appearance-none text-center min-w-[60px]" value={formData.lock_seal_check} onChange={e => setFormData({...formData, lock_seal_check: e.target.value})}>
                <option value="YES">YES</option><option value="NO">NO</option>
              </select>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[11px] font-black uppercase tracking-tight">Lock Seals Intact?</span>
              <select className="bg-black text-white text-[10px] font-black px-3 py-1.5 rounded-sm cursor-pointer appearance-none text-center min-w-[60px]" value={formData.lock_seal_intact} onChange={e => setFormData({...formData, lock_seal_intact: e.target.value})}>
                <option value="YES">YES</option><option value="NO">NO</option>
              </select>
            </div>
          </div>
          <div className="p-5 space-y-5">
            <div className="flex justify-between items-center">
              <span className="text-[11px] font-black uppercase tracking-tight">Seal numbers match paperwork?</span>
              <select className="bg-black text-white text-[10px] font-black px-3 py-1.5 rounded-sm cursor-pointer appearance-none text-center min-w-[60px]" value={formData.seals_match_paperwork} onChange={e => setFormData({...formData, seals_match_paperwork: e.target.value})}>
                <option value="YES">YES</option><option value="NO">NO</option>
              </select>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[11px] font-black uppercase tracking-tight">C209 Present?</span>
              <select className="bg-black text-white text-[10px] font-black px-3 py-1.5 rounded-sm cursor-pointer appearance-none text-center min-w-[60px]" value={formData.c209_present} onChange={e => setFormData({...formData, c209_present: e.target.value})}>
                <option value="YES">YES</option><option value="NO">NO</option>
              </select>
            </div>
          </div>
        </div>

        {/* SECTION 2: COMMENTS & ACTUAL SEALS */}
        <div className="bg-gray-100 text-black px-4 py-2 text-[11px] font-black uppercase tracking-[0.4em] border-b-[3px] border-black flex items-center gap-3">
          <span className="bg-black text-white w-5 h-5 flex items-center justify-center rounded-full text-[10px]">2</span>
          <span>Section 2: Comments & Security Seals</span>
        </div>
        <div className="grid grid-cols-[1fr_350px] divide-x-[3px] divide-black border-b-[3px] border-black min-h-[120px]">
          <div className="p-5 bg-white">
            <label className="text-[10px] font-black uppercase text-gray-300 block mb-3 tracking-widest border-l-4 border-black pl-2">Comments & Discrepancies</label>
            <textarea rows={3} className="w-full text-[13px] font-bold uppercase outline-none bg-transparent resize-none placeholder:text-gray-100 leading-snug" placeholder="LIST ANY DAMAGE OR DISCREPANCIES HERE..." value={formData.inbound_comments} onChange={e => setFormData({...formData, inbound_comments: e.target.value})} />
          </div>
          <div className="p-5 bg-gray-50/50 flex flex-col justify-between space-y-4">
            <div>
              <label className="text-[10px] font-black uppercase text-gray-300 block mb-2 tracking-widest border-l-4 border-black pl-2 italic">Actual Seal Numbers</label>
              <input className="w-full text-lg font-black uppercase bg-transparent outline-none border-b-2 border-black/5 focus:border-black transition-colors" placeholder="ENTER NUMBERS..." value={formData.seal_numbers} onChange={e => setFormData({...formData, seal_numbers: e.target.value})} />
            </div>
            <div>
              <label className="text-[9px] font-black uppercase text-gray-400 block mb-1 pl-1">Staff Signature</label>
              <input className="w-full text-2xl font-black uppercase outline-none bg-transparent italic tracking-tighter border-b-2 border-dashed border-gray-200" value={formData.inbound_signature} onChange={e => setFormData({...formData, inbound_signature: e.target.value})} />
            </div>
          </div>
        </div>

        {/* SECTION 3: BAR PACKING */}
        <div className="bg-black text-white px-4 py-2.5 text-[11px] font-black uppercase tracking-[0.4em] flex items-center gap-3">
          <span className="bg-white text-black w-5 h-5 flex items-center justify-center rounded-full text-[10px]">3</span>
          <span>Section 3: Bar Packing Operations</span>
        </div>
        <div className="grid grid-cols-[180px_1fr_300px] divide-x-[3px] divide-black border-b-[3px] border-black bg-white">
          <div className="p-5 flex flex-col justify-center items-center bg-gray-50/50">
            <label className="text-[10px] font-black uppercase text-gray-300 mb-2">Pieces</label>
            <input className="w-full text-5xl font-black text-center bg-transparent outline-none" value={formData.packing_pieces} onChange={e => setFormData({...formData, packing_pieces: e.target.value})} />
          </div>
          <div className="p-6 space-y-6">
            <div className="flex justify-between items-center border-b border-gray-100 pb-2">
              <span className="text-[11px] font-black uppercase">Recorded on IB Despatch Sheet?</span>
              <select className="bg-black text-white text-[10px] font-black px-3 py-1.5 rounded-sm cursor-pointer appearance-none min-w-[60px] text-center" value={formData.recorded_on_dispatch} onChange={e => setFormData({...formData, recorded_on_dispatch: e.target.value})}>
                <option value="YES">YES</option><option value="NO">NO</option>
              </select>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[11px] font-black uppercase">Manager/Shift Leader Informed?</span>
              <select className="bg-black text-white text-[10px] font-black px-3 py-1.5 rounded-sm cursor-pointer appearance-none min-w-[60px] text-center" value={formData.manager_informed} onChange={e => setFormData({...formData, manager_informed: e.target.value})}>
                <option value="YES">YES</option><option value="NO">NO</option>
              </select>
            </div>
          </div>
          <div className="p-6 flex flex-col justify-end">
            <label className="text-[9px] font-black uppercase text-gray-400 block mb-1">Packing Verification</label>
            <input className="w-full text-2xl font-black uppercase outline-none bg-transparent italic tracking-tighter border-b-2 border-dashed border-gray-200" value={formData.packing_signature} onChange={e => setFormData({...formData, packing_signature: e.target.value})} />
          </div>
        </div>

        {/* SECTION 4: MANAGEMENT */}
        <div className="bg-gray-100 text-black px-4 py-2 text-[11px] font-black uppercase tracking-[0.4em] border-b-[3px] border-black flex items-center gap-3">
          <span className="bg-black text-white w-5 h-5 flex items-center justify-center rounded-full text-[10px]">4</span>
          <span>Section 4: Managerial Clearance</span>
        </div>
        <div className="p-6 border-b-[3px] border-black bg-white grid grid-cols-[1fr_1fr] gap-12">
          <div className="relative group">
            <label className="text-[10px] font-black uppercase text-gray-300 block mb-3 tracking-widest border-l-4 border-black pl-2">Manager / Shift Leader Name</label>
            <input className="w-full text-2xl font-black uppercase outline-none bg-transparent border-b-2 border-black/10 focus:border-black transition-colors" placeholder="PRINT NAME CLEARLY" value={formData.manager_name} onChange={e => setFormData({...formData, manager_name: e.target.value})} />
          </div>
          <div className="flex items-end border-b-2 border-dashed border-gray-200 pb-1 px-2 relative">
             <span className="absolute -top-4 right-0 text-[8px] font-black uppercase text-gray-200 italic tracking-[0.2em]">Authorized Signature &rarr;</span>
          </div>
        </div>

        {/* SECTION 5: COMPLETION */}
        <div className="bg-black text-white px-4 py-2.5 text-[11px] font-black uppercase tracking-[0.4em] flex justify-between items-center">
          <div className="flex items-center gap-3">
            <span className="bg-white text-black w-5 h-5 flex items-center justify-center rounded-full text-[10px]">5</span>
            <span>Section 5: Final Equipment Check</span>
          </div>
          <span className="text-[9px] opacity-40 font-bold tracking-widest uppercase">System Finalization</span>
        </div>
        <div className="grid grid-cols-2 divide-x-[3px] divide-black bg-white">
          <div className="p-6 space-y-6">
            <div className="flex justify-between items-center border-b border-gray-50 pb-3">
              <span className="text-[11px] font-black uppercase">Doors & Locks Serviceable?</span>
              <select className="bg-black text-white text-[10px] font-black px-3 py-1.5 rounded-sm cursor-pointer appearance-none min-w-[60px] text-center" value={formData.equip_doors_locks} onChange={e => setFormData({...formData, equip_doors_locks: e.target.value})}>
                <option value="YES">YES</option><option value="NO">NO</option>
              </select>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[11px] font-black uppercase">Wheels & Brakes Serviceable?</span>
              <select className="bg-black text-white text-[10px] font-black px-3 py-1.5 rounded-sm cursor-pointer appearance-none min-w-[60px] text-center" value={formData.equip_wheels_brakes} onChange={e => setFormData({...formData, equip_wheels_brakes: e.target.value})}>
                <option value="YES">YES</option><option value="NO">NO</option>
              </select>
            </div>
          </div>
          <div className="p-6 bg-gray-50/50 flex flex-col justify-end group">
            <label className="text-[10px] font-black uppercase text-gray-300 block mb-2 tracking-widest border-l-4 border-black pl-2">Final Official Signature</label>
            <input className="w-full text-4xl font-black uppercase outline-none bg-transparent italic tracking-tighter mb-2 border-b-4 border-black/5 focus:border-black transition-colors" value={formData.completion_name} onChange={e => setFormData({...formData, completion_name: e.target.value})} />
            <div className="flex gap-2 items-center">
              <div className="w-3 h-3 bg-black shrink-0" />
              <p className="text-[8px] font-black text-gray-400 uppercase tracking-tighter italic">I confirm all data above is accurate and equipment meets Emirates security standards.</p>
            </div>
          </div>
        </div>

        {/* SAVE BUTTON */}
        <div className="p-12 flex justify-center bg-gray-50 border-t-[3px] border-black print:hidden">
          <button 
            type="submit" 
            disabled={loading}
            className="group relative bg-black text-white px-20 py-7 font-black uppercase tracking-[0.4em] text-sm overflow-hidden active:scale-95 transition-all shadow-[8px_8px_0px_rgba(0,0,0,0.1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1"
          >
            <span className="relative z-10">{loading ? 'SECURITY SYNC...' : 'SAVE & LOG DOCUMENT'}</span>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
          </button>
        </div>
      </form>

      {/* SUCCESS OVERLAY */}
      {success && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/95 z-[100] backdrop-blur-xl p-4 print:hidden">
          <div className="bg-white p-16 border-[8px] border-black shadow-[30px_30px_0px_rgba(255,255,255,0.1)] text-center max-w-xl w-full transform -rotate-1">
            <div className="w-28 h-28 bg-green-500 text-white rounded-full flex items-center justify-center text-6xl font-black mx-auto mb-10 shadow-2xl animate-pulse">✓</div>
            <h2 className="text-5xl font-black uppercase mb-6 tracking-tighter leading-none italic skew-x-[-10deg]">Document Saved</h2>
            <p className="text-gray-400 font-bold mb-12 uppercase tracking-[0.3em] text-[10px] leading-relaxed">The in-bond record has been successfully transmitted to the central logistics database.</p>
            <Link href="/ramp" className="bg-black text-white px-12 py-5 font-black uppercase text-xs tracking-[0.2em] inline-block hover:bg-gray-800 transition-all hover:scale-105 active:scale-95">
              RETURN TO RAMP CONTROL
            </Link>
          </div>
        </div>
      )}

      {error && (
        <div className="fixed top-10 left-1/2 -translate-x-1/2 bg-red-600 text-white px-8 py-4 font-black uppercase text-[11px] tracking-[0.2em] shadow-2xl z-[200] border-4 border-white animate-bounce">
          SECURITY ALERT: {error}
        </div>
      )}

      <footer className="max-w-[950px] mx-auto mt-10 text-center space-y-2 pb-10">
        <p className="text-[9px] font-black text-gray-200 uppercase tracking-[0.6em]">SkyRoute // Global Operations // Internal Security Document</p>
        <div className="flex justify-center gap-4">
          <div className="h-[1px] w-20 bg-gray-100" />
          <div className="h-[1px] w-2 bg-gray-100" />
          <div className="h-[1px] w-20 bg-gray-100" />
        </div>
      </footer>
    </div>
  );
}

export default function InBondPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-black flex items-center justify-center overflow-hidden">
        <div className="text-center relative">
          <div className="w-24 h-24 border-[10px] border-white/5 border-t-white rounded-full animate-spin mx-auto mb-8" />
          <div className="font-black uppercase text-[12px] tracking-[0.5em] text-white animate-pulse">Loading Official Template...</div>
          <div className="absolute inset-0 bg-white/5 blur-3xl rounded-full" />
        </div>
      </div>
    }>
      <InBondFormContent />
    </Suspense>
  );
}
