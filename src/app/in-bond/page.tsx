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

  const sh = 'bg-gray-200 p-2 font-black text-[11px] border-b-2 border-black uppercase tracking-widest flex justify-between text-black';
  const cs = 'p-3 border-r-2 border-black last:border-r-0 bg-white';
  const ls = 'text-[9px] font-black uppercase text-black mb-1 block';
  const is = 'w-full text-base font-black uppercase outline-none bg-transparent placeholder:text-gray-300 text-black';

  return (
    <div className='min-h-screen bg-gray-100 p-4 text-black'>
      <div className='print:hidden flex justify-between items-center mb-4 max-w-[1000px] mx-auto'>
        <Link href='/ramp' className='text-xs font-bold text-gray-600 hover:text-black'>← BACK TO RAMP</Link>
        <button onClick={() => window.print()} className='bg-black text-white px-6 py-2 rounded-xl font-bold text-xs uppercase'>Print Official Form</button>
      </div>

      <form onSubmit={handleSubmit} className='max-w-[1000px] mx-auto bg-white border-[4px] border-black shadow-2xl print:shadow-none print:border-[2px]'>
        {/* HEADER */}
        <div className='p-6 border-b-4 border-black flex justify-between items-end bg-white'>
          <div className='flex gap-5 items-center'>
            <div className='w-14 h-14 bg-black text-white flex items-center justify-center font-black text-3xl rounded-sm'>SR</div>
            <div>
              <h1 className='text-3xl font-black uppercase tracking-tighter leading-none'>In Bond Control Sheet</h1>
              <p className='text-[10px] font-bold text-gray-500 mt-1 uppercase tracking-widest italic'>Official Logistics Document - Emirates Group</p>
            </div>
          </div>
          <div className='text-right'>
            <p className='text-[9px] font-black text-gray-400 uppercase tracking-widest'>Official Ref No.</p>
            <p className='text-3xl font-black leading-none'>SR-{formData.c209_number || '---'}</p>
            <p className='text-[8px] font-bold text-gray-400 mt-1'>Template v1.2 250124</p>
          </div>
        </div>

        {/* DETAILS GRID */}
        <div className='grid grid-cols-4 border-b-2 border-black divide-x-2 divide-black'>
          <div className={cs}>
            <label className={ls}>C209 Number</label>
            <input required className={is} value={formData.c209_number} onChange={e => setFormData({...formData, c209_number: e.target.value})} />
          </div>
          <div className={cs}>
            <label className={ls}>Bar Number</label>
            <input required className={is} value={formData.bar_number} onChange={e => setFormData({...formData, bar_number: e.target.value})} />
          </div>
          <div className={cs}>
            <label className={ls}>Date Received</label>
            <input type='date' className={is} value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
          </div>
          <div className={cs}>
            <label className={ls}>Time Received</label>
            <input className={is} value={formData.time} onChange={e => setFormData({...formData, time: e.target.value})} />
          </div>
        </div>

        {/* SECTION 1 */}
        <div className={sh}><span>SECTION 1: INBOUND BARS</span> <span className='text-[9px] opacity-60'>VERIFY SEALS & LOCKS</span></div>
        <div className='grid grid-cols-2 divide-x-2 divide-black border-b-2 border-black'>
          <div className='p-4 space-y-3 bg-white'>
            <div className='flex justify-between items-center'><span className='text-[10px] font-black uppercase'>Locks/Seals Checked Prior to Opening?</span>
              <select className='bg-black text-white text-[10px] font-black p-1.5 rounded cursor-pointer' value={formData.lock_seal_check} onChange={e => setFormData({...formData, lock_seal_check: e.target.value})}>
                <option value='YES'>YES</option><option value='NO'>NO</option>
              </select>
            </div>
            <div className='flex justify-between items-center'><span className='text-[10px] font-black uppercase'>Lock Seals Intact?</span>
              <select className='bg-black text-white text-[10px] font-black p-1.5 rounded cursor-pointer' value={formData.lock_seal_intact} onChange={e => setFormData({...formData, lock_seal_intact: e.target.value})}>
                <option value='YES'>YES</option><option value='NO'>NO</option>
              </select>
            </div>
          </div>
          <div className='p-4 space-y-3 bg-white'>
            <div className='flex justify-between items-center'><span className='text-[10px] font-black uppercase'>Seal numbers match paperwork?</span>
              <select className='bg-black text-white text-[10px] font-black p-1.5 rounded cursor-pointer' value={formData.seals_match_paperwork} onChange={e => setFormData({...formData, seals_match_paperwork: e.target.value})}>
                <option value='YES'>YES</option><option value='NO'>NO</option>
              </select>
            </div>
            <div className='flex justify-between items-center'><span className='text-[10px] font-black uppercase'>C209 Present?</span>
              <select className='bg-black text-white text-[10px] font-black p-1.5 rounded cursor-pointer' value={formData.c209_present} onChange={e => setFormData({...formData, c209_present: e.target.value})}>
                <option value='YES'>YES</option><option value='NO'>NO</option>
              </select>
            </div>
          </div>
        </div>

        {/* SECTION 2: COMMENTS & SEALS */}
        <div className={sh}><span>SECTION 2: INBOUND COMMENTS / DISCREPANCIES</span></div>
        <div className='grid grid-cols-3 border-b-2 border-black divide-x-2 divide-black'>
          <div className='col-span-2 p-4 bg-white'>
            <label className={ls}>Inbound Comments / Discrepancies</label>
            <textarea rows={2} className='w-full text-sm font-bold uppercase outline-none bg-transparent resize-none text-black placeholder:text-gray-200' placeholder='NONE...' value={formData.inbound_comments} onChange={e => setFormData({...formData, inbound_comments: e.target.value})} />
          </div>
          <div className='p-4 bg-white flex flex-col justify-between'>
            <label className={ls}>Seal Numbers (Actual)</label>
            <input className='w-full text-base font-black uppercase outline-none border-b border-black pb-1' placeholder='ENTER SEALS...' value={formData.seal_numbers} onChange={e => setFormData({...formData, seal_numbers: e.target.value})} />
          </div>
        </div>

        {/* SECTION 3 */}
        <div className={sh}><span>SECTION 3: BAR PACKING - CORE BAR</span></div>
        <div className='grid grid-cols-4 border-b-2 border-black divide-x-2 divide-black'>
          <div className={cs}>
            <label className={ls}>No. of Pieces</label>
            <input className={is} value={formData.packing_pieces} onChange={e => setFormData({...formData, packing_pieces: e.target.value})} />
          </div>
          <div className='p-4 space-y-3 col-span-2 bg-white'>
            <div className='flex justify-between items-center'><span className='text-[10px] font-black uppercase'>Recorded on IB Despatch Sheet?</span>
              <select className='bg-black text-white text-[10px] font-black p-1.5 rounded cursor-pointer' value={formData.recorded_on_dispatch} onChange={e => setFormData({...formData, recorded_on_dispatch: e.target.value})}>
                <option value='YES'>YES</option><option value='NO'>NO</option>
              </select>
            </div>
            <div className='flex justify-between items-center'><span className='text-[10px] font-black uppercase'>Manager/Shift Leader Informed?</span>
              <select className='bg-black text-white text-[10px] font-black p-1.5 rounded cursor-pointer' value={formData.manager_informed} onChange={e => setFormData({...formData, manager_informed: e.target.value})}>
                <option value='YES'>YES</option><option value='NO'>NO</option>
              </select>
            </div>
          </div>
          <div className='p-4 bg-white flex flex-col justify-between'>
            <label className={ls}>Staff Signature</label>
            <input className='w-full text-xl font-black uppercase outline-none border-b border-black pb-1' value={formData.packing_signature} onChange={e => setFormData({...formData, packing_signature: e.target.value})} />
          </div>
        </div>

        {/* SECTION 4: MANAGEMENT VERIFICATION */}
        <div className={sh}><span>SECTION 4: MANAGEMENT VERIFICATION</span></div>
        <div className='p-4 border-b-2 border-black bg-white'>
          <label className={ls}>Manager / Shift Leader Name</label>
          <input className='w-full text-xl font-black uppercase outline-none border-b border-black pb-1' placeholder='ENTER NAME...' value={formData.manager_name} onChange={e => setFormData({...formData, manager_name: e.target.value})} />
        </div>

        {/* SECTION 5 */}
        <div className={sh}><span>SECTION 5: BAR COMPLETION</span> <span className='text-[9px] opacity-60'>EQUIPMENT CHECK</span></div>
        <div className='grid grid-cols-2 divide-x-2 divide-black border-b-2 border-black'>
          <div className='p-4 space-y-3 bg-white'>
            <div className='flex justify-between items-center'><span className='text-[10px] font-black uppercase'>Doors/Locks Serviceable?</span>
              <select className='bg-black text-white text-[10px] font-black p-1.5 rounded cursor-pointer' value={formData.equip_doors_locks} onChange={e => setFormData({...formData, equip_doors_locks: e.target.value})}>
                <option value='YES'>YES</option><option value='NO'>NO</option>
              </select>
            </div>
            <div className='flex justify-between items-center'><span className='text-[10px] font-black uppercase'>Wheels/Brakes Serviceable?</span>
              <select className='bg-black text-white text-[10px] font-black p-1.5 rounded cursor-pointer' value={formData.equip_wheels_brakes} onChange={e => setFormData({...formData, equip_wheels_brakes: e.target.value})}>
                <option value='YES'>YES</option><option value='NO'>NO</option>
              </select>
            </div>
          </div>
          <div className='p-4 flex flex-col justify-end bg-white'>
            <label className={ls}>Print Name / Signature</label>
            <input className='w-full text-2xl font-black uppercase outline-none border-b-2 border-black pb-1 mb-1' value={formData.completion_name} onChange={e => setFormData({...formData, completion_name: e.target.value})} />
            <p className='text-[8px] font-bold text-gray-400 uppercase tracking-tighter'>I confirm all details are accurate & equipment has been checked.</p>
          </div>
        </div>

        {/* SUBMIT */}
        <div className='p-10 flex justify-end bg-gray-50 print:hidden'>
          <button type='submit' disabled={loading} className='bg-black text-white px-14 py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-sm shadow-xl active:scale-95 transition-all disabled:opacity-50'>
            {loading ? 'PROCESSING...' : 'SAVE & CLOSE FORM'}
          </button>
        </div>
      </form>

      {success && (
        <div className='fixed inset-0 flex items-center justify-center bg-black/50 z-[100] backdrop-blur-sm print:hidden'>
          <div className='bg-white p-10 rounded-3xl shadow-2xl border-4 border-black text-center max-w-md'>
            <div className='w-20 h-20 bg-green-500 rounded-full flex items-center justify-center text-white text-4xl font-black mx-auto mb-6'>✓</div>
            <h2 className='text-3xl font-black uppercase mb-2'>SUCCESS</h2>
            <p className='text-gray-500 font-bold mb-8 uppercase tracking-widest'>Form Saved to Database</p>
            <Link href='/ramp' className='bg-black text-white px-8 py-3 rounded-xl font-black uppercase text-xs inline-block'>Return to Dashboard</Link>
          </div>
        </div>
      )}
    </div>
  );
}

export default function InBondPage() {
  return (
    <Suspense fallback={<div className='p-20 text-center font-black uppercase text-xs tracking-widest text-gray-400'>Loading Official Template...</div>}>
      <InBondFormContent />
    </Suspense>
  );
}
