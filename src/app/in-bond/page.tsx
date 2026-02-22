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
    inbound_comments: '',
    inbound_signature: '',

    // SECTION 3: BAR PACKING
    packing_pieces: '',
    packing_date: new Date().toISOString().split('T')[0],
    recorded_on_dispatch: 'YES',
    manager_informed: 'YES',
    packing_signature: '',

    // SECTION 5: BAR COMPLETION
    equip_doors_locks: 'YES',
    equip_wheels_brakes: 'YES',
    completion_name: '',
    completion_signature: '',
    
    // Common
    flight_number: '',
    seal_numbers: '',
    manager_name: ''
  });

  useEffect(() => {
    const c209 = searchParams.get('c209') || '';
    const bar = searchParams.get('bar') || '';
    const flight = searchParams.get('flight') || '';
    const pieces = searchParams.get('pieces') || '';
    const sig = searchParams.get('sig') || '';
    if (c209 || bar || flight || pieces || sig) {
      setFormData(prev => ({
        ...prev,
        c209_number: c209,
        bar_number: bar,
        flight_number: flight,
        packing_pieces: pieces,
        packing_signature: sig,
        completion_name: sig,
        completion_signature: sig,
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
        body: JSON.stringify({ action: 'in_bond_input', ...formData })
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

  const sectionHeader = "bg-gray-100 p-2 font-black text-[10px] border-b-2 border-black uppercase tracking-widest flex justify-between";
  const cellStyle = "p-3 border-r-2 border-black last:border-r-0";
  const labelStyle = "text-[8px] font-black uppercase text-gray-500 mb-0.5 block";
  const inputStyle = "w-full text-base font-black uppercase outline-none bg-transparent placeholder:text-gray-300 text-black";

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="print:hidden flex justify-between items-center mb-4 max-w-[1000px] mx-auto">
        <Link href="/ramp" className="text-xs font-bold text-gray-500 hover:text-black tracking-tighter">&larr; BACK TO RAMP</Link>
        <button onClick={() => window.print()} className="bg-black text-white px-5 py-2 rounded-lg font-bold text-xs uppercase">Print Sheet</button>
      </div>

      <form onSubmit={handleSubmit} className="max-w-[1000px] mx-auto bg-white border-[3px] border-black shadow-2xl print:shadow-none print:border-[2px]">
        {/* Header Block */}
        <div className="p-5 border-b-4 border-black flex justify-between items-end">
          <div className="flex gap-4 items-center">
            <div className="w-12 h-12 bg-black text-white flex items-center justify-center font-black text-2xl">SR</div>
            <div>
              <h1 className="text-2xl font-black uppercase tracking-tighter leading-none">In Bond Control Sheet</h1>
              <p className="text-[9px] font-bold text-gray-400 mt-1 uppercase tracking-widest italic">Official Logistics Document - Emirates Group</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Official Ref No.</p>
            <p className="text-2xl font-black leading-none">SR-{formData.c209_number || '---'}</p>
            <p className="text-[7px] font-bold text-gray-300 mt-1">Template v1.2 250124</p>
          </div>
        </div>

        {/* Top Info Grid */}
        <div className="grid grid-cols-4 border-b-2 border-black divide-x-2 divide-black bg-gray-50/50">
          <div className={cellStyle}>
            <label className={labelStyle}>C209 Number</label>
            <input required className={inputStyle} value={formData.c209_number} onChange={e => setFormData({...formData, c209_number: e.target.value})} />
          </div>
          <div className={cellStyle}>
            <label className={labelStyle}>Bar Number</label>
            <input required className={inputStyle} value={formData.bar_number} onChange={e => setFormData({...formData, bar_number: e.target.value})} />
          </div>
          <div className={cellStyle}>
            <label className={labelStyle}>Date Received</label>
            <input type="date" className={inputStyle} value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
          </div>
          <div className={cellStyle}>
            <label className={labelStyle}>Time Received</label>
            <input className={inputStyle} value={formData.time} onChange={e => setFormData({...formData, time: e.target.value})} />
          </div>
        </div>

        {/* SECTION 1 */}
        <div className={sectionHeader}><span>SECTION 1: INBOUND BARS</span> <span className="text-[8px] opacity-50">VERIFY SEALS & LOCKS</span></div>
        <div className="grid grid-cols-2 divide-x-2 divide-black border-b-2 border-black">
          <div className="p-3 space-y-2">
            <div className="flex justify-between items-center"><span className="text-[9px] font-black uppercase">Locks/Seals Checked Prior to Opening?</span>
              <select className="bg-black text-white text-[9px] font-black p-1 rounded" value={formData.lock_seal_check} onChange={e => setFormData({...formData, lock_seal_check: e.target.value})}>
                <option value="YES">YES</option><option value="NO">NO</option>
              </select>
            </div>
            <div className="flex justify-between items-center"><span className="text-[9px] font-black uppercase">Lock Seals Intact?</span>
              <select className="bg-black text-white text-[9px] font-black p-1 rounded" value={formData.lock_seal_intact} onChange={e => setFormData({...formData, lock_seal_intact: e.target.value})}>
                <option value="YES">YES</option><option value="NO">NO</option>
              </select>
            </div>
          </div>
          <div className="p-3 space-y-2">
            <div className="flex justify-between items-center"><span className="text-[9px] font-black uppercase">Seal numbers match paperwork?</span>
              <select className="bg-black text-white text-[9px] font-black p-1 rounded" value={formData.seals_match_paperwork} onChange={e => setFormData({...formData, seals_match_paperwork: e.target.value})}>
                <option value="YES">YES</option><option value="NO">NO</option>
              </select>
            </div>
            <div className="flex justify-between items-center"><span className="text-[9px] font-black uppercase">C209 Present?</span>
              <select className="bg-black text-white text-[9px] font-black p-1 rounded" value={formData.c209_present} onChange={e => setFormData({...formData, c209_present: e.target.value})}>
                <option value="YES">YES</option><option value="NO">NO</option>
              </select>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-3 border-b-2 border-black divide-x-2 divide-black">
           <div className="col-span-2 p-3">
             <label className={labelStyle}>Inbound Comments</label>
             <textarea rows={1} className="w-full text-[11px] font-bold uppercase outline-none bg-transparent resize-none text-black" placeholder="DISCREPANCIES..." value={formData.inbound_comments} onChange={e => setFormData({...formData, inbound_comments: e.target.value})} />
           </div>
           <div className={cellStyle}>
             <label className={labelStyle}>Staff Signature</label>
             <input className="w-full text-xs font-black uppercase outline-none" value={formData.inbound_signature} onChange={e => setFormData({...formData, inbound_signature: e.target.value})} />
           </div>
        </div>

        {/* SECTION 3 */}
        <div className={sectionHeader}><span>SECTION 3: BAR PACKING</span> <span className="text-[8px] opacity-50">CORE BAR DETAILS</span></div>
        <div className="grid grid-cols-4 border-b-2 border-black divide-x-2 divide-black">
          <div className={cellStyle}>
            <label className={labelStyle}>No. of Pieces</label>
            <input className={inputStyle} value={formData.packing_pieces} onChange={e => setFormData({...formData, packing_pieces: e.target.value})} />
          </div>
          <div className="p-3 space-y-2 col-span-2">
            <div className="flex justify-between items-center"><span className="text-[9px] font-black uppercase">Recorded on Dispatch?</span>
              <select className="bg-black text-white text-[9px] font-black p-1 rounded" value={formData.recorded_on_dispatch} onChange={e => setFormData({...formData, recorded_on_dispatch: e.target.value})}>
                <option value="YES">YES</option><option value="NO">NO</option>
              </select>
            </div>
            <div className="flex justify-between items-center"><span className="text-[9px] font-black uppercase">Manager Informed?</span>
              <select className="bg-black text-white text-[9px] font-black p-1 rounded" value={formData.manager_informed} onChange={e => setFormData({...formData, manager_informed: e.target.value})}>
                <option value="YES">YES</option><option value="NO">NO</option>
              </select>
            </div>
          </div>
          <div className={cellStyle}>
            <label className={labelStyle}>Staff Signature</label>
            <input className="w-full text-xs font-black uppercase outline-none" value={formData.packing_signature} onChange={e => setFormData({...formData, packing_signature: e.target.value})} />
          </div>
        </div>

        {/* SECTION 5 */}
        <div className={sectionHeader}><span>SECTION 5: BAR COMPLETION</span> <span className="text-[8px] opacity-50">SERVICEABILITY CHECK</span></div>
        <div className="grid grid-cols-2 divide-x-2 divide-black border-b-2 border-black">
          <div className="p-3 space-y-2">
            <div className="flex justify-between items-center"><span className="text-[9px] font-black uppercase">Doors/Locks Serviceable?</span>
              <select className="bg-black text-white text-[9px] font-black p-1 rounded" value={formData.equip_doors_locks} onChange={e => setFormData({...formData, equip_doors_locks: e.target.value})}>
                <option value="YES">YES</option><option value="NO">NO</option>
              </select>Update In Bond sheet to match official v1.2 PDF layout (Sections 1, 3, 5) exactly
            </div>
            <div className="flex justify-between items-center"><span className="text-[9px] font-black uppercase">Wheels/Brakes Serviceable?</span>
              <select className="bg-black text-white text-[9px] font-black p-1 rounded" value={formData.equip_wheels_brakes} onChange={e => setFormData({...formData, equip_wheels_brakes: e.target.value})}>
                <option value="YES">YES</option><option value="NO">NO</option>
              </select>
            </div>
          </div>
          <div className="p-3 flex flex-col justify-end">
            <label className={labelStyle}>Print Name / Signature</label>
            <input className="w-full text-lg font-black uppercase outline-none border-b border-black mb-1" value={formData.completion_name} onChange={e => setFormData({...formData, completion_name: e.target.value})} />
            <p className="text-[7px] font-bold text-gray-400 uppercase tracking-tighter">I confirm all details are accurate & equipment has been checked.</p>
          </div>
        </div>

        {/* Action Bar */}
        <div className="p-6 flex justify-end bg-gray-50 print:hidden">
          <button type="submit" disabled={loading} className="bg-black text-white px-10 py-3 rounded-xl font-black uppercase tracking-widest text-xs disabled:opacity-50">
            {loading ? 'SAVING...' : 'Save & Finalize'}
          </button>
        </div>
      </form>
      
      {success && <div className="fixed top-6 right-6 bg-green-500 text-white p-4 rounded-xl shadow-2xl font-black text-xs z-50 uppercase tracking-widest">Saved Successfully</div>}
      {error && <div className="fixed top-6 right-6 bg-red-500 text-white p-4 rounded-xl shadow-2xl font-black text-xs z-50 uppercase tracking-widest">{error}</div>}
    </div>
  );
}

export default function InBondPage() {
  return (
    <Suspense fallback={<div className="p-20 text-center font-black uppercase text-xs tracking-widest">Initializing...</div>}>
      <InBondFormContent />
    </Suspense>
  );
}
