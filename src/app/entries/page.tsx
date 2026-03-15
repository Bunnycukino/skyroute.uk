'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function EntriesPage() {
  const router = useRouter();
  const [entries, setEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [selectedEntry, setSelectedEntry] = useState<any>(null);

  useEffect(() => {
    async function load() {
      try {
        const params = new URLSearchParams({ search });
        if (typeFilter) params.set('type', typeFilter);
        const res = await fetch(`/api/entries?${params}`);
        if (res.status === 401) { router.push('/'); return; }
        const data = await res.json();
        setEntries(data.entries || []);
      } catch (err) {
        console.error('Failed to load entries');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [search, typeFilter, router]);

  async function handleDelete(id: number) {
    if (!confirm('Are you sure you want to delete this entry?')) return;
    try {
      await fetch(`/api/entries?id=${id}`, { method: 'DELETE' });
      setEntries(entries.filter(e => e.id !== id));
    } catch (err) {
      alert('Failed to delete');
    }
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className="w-64 bg-card border-r border-border flex flex-col print:hidden">
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
          <Link href="/ramp" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-accent transition-colors text-sm text-muted-foreground hover:text-foreground">
            <span>✈️</span> C209 Input ( Ramp Input )
          </Link>
          <Link href="/logistic" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-accent transition-colors text-sm text-muted-foreground hover:text-foreground">
            <span>📦</span> C208 Input ( Logistic Input )
          </Link>
          <Link href="/entries" className="flex items-center gap-3 px-3 py-2 rounded-lg bg-primary text-primary-foreground font-medium text-sm">
            <span>📋</span> All Entries         </Link>         <Link href="/reallocation" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-accent transition-colors text-sm text-muted-foreground hover:text-foreground">           <span>🔄</span> Reallocation Register         </Link>         <Link href="/sheets" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-accent transition-colors text-sm text-muted-foreground hover:text-foreground border-t border-border/50 pt-3 mt-3">           <span>📑</span> VBA Sheets View
          </Link>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground">All Entries         </Link>         <Link href="/reallocation" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-accent transition-colors text-sm text-muted-foreground hover:text-foreground">           <span>🔄</span> Reallocation Register         </Link>         <Link href="/sheets" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-accent transition-colors text-sm text-muted-foreground hover:text-foreground border-t border-border/50 pt-3 mt-3">           <span>📑</span> VBA Sheets View</h1>
              <p className="text-muted-foreground">Detailed view of all system records.</p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-4">
            <input
              className="px-4 py-2 rounded-lg border border-input bg-background outline-none focus:ring-2 focus:ring-primary w-full md:w-72 text-sm"
              placeholder="Search by flight, code, number..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <div className="flex bg-muted p-1 rounded-lg">
              {[
                { id: '', label: 'All' },
                { id: 'ramp_input', label: 'RAMP' },
                { id: 'logistic_input', label: 'LOG' }
              ].map(t => (
                <button
                  key={t.id}
                  onClick={() => setTypeFilter(t.id)}
                  className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${
                    typeFilter === t.id
                      ? 'bg-card shadow-sm text-foreground'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-card rounded-xl border border-border overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="bg-muted/50 border-b border-border">
                    <th className="px-6 py-4 font-bold text-foreground">C209</th>
                    <th className="px-6 py-4 font-bold text-foreground">Date</th>
                    <th className="px-6 py-4 font-bold text-foreground">Month</th>
                    <th className="px-6 py-4 font-bold text-foreground">Bar Number</th>
                    <th className="px-6 py-4 font-bold text-foreground">Pieces</th>
                    <th className="px-6 py-4 font-bold text-foreground">Flight</th>
                    <th className="px-6 py-4 font-bold text-foreground">C208</th>
                    <th className="px-6 py-4 font-bold text-foreground">Flags</th>
                    <th className="px-6 py-4 font-bold text-foreground">Signature</th>
                    <th className="px-6 py-4 font-bold text-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {loading ? (
                    <tr><td colSpan={10} className="px-6 py-8 text-center text-muted-foreground">Loading entries...</td></tr>
                  ) : entries.length === 0 ? (
                    <tr><td colSpan={10} className="px-6 py-8 text-center text-muted-foreground">No records found</td></tr>
                  ) : (
                    entries.map(entry => {
                      const date = new Date(entry.created_at);
                      const monthPrefix = date.toLocaleString('en-US', { month: 'short' }).toUpperCase() + '-' + date.getFullYear().toString().slice(-2);
                      return (
                        <tr key={entry.id} className="hover:bg-muted/30 transition-colors">
                          <td className="px-6 py-4 font-medium text-foreground">{entry.c209_number || '-'}</td>
                          <td className="px-6 py-4 text-muted-foreground">{date.toLocaleDateString('pl-PL')}</td>
                          <td className="px-6 py-4 text-muted-foreground">{monthPrefix}</td>
                          <td className="px-6 py-4 text-muted-foreground">{entry.bar_number || entry.container_code || '-'}</td>
                          <td className="px-6 py-4 text-muted-foreground">{entry.pieces ?? '-'}</td>
                          <td className="px-6 py-4 text-muted-foreground">{entry.flight_number || '-'}</td>
                          <td className="px-6 py-4 text-muted-foreground">{entry.c208_number || '-'}</td>
                          <td className="px-6 py-4">
                            <div className="flex gap-1">
                              {entry.type === 'ramp_input' && <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-700 text-[10px] font-bold uppercase">RAMP</span>}
                              {entry.type === 'logistic_input' && <span className="px-2 py-0.5 rounded bg-purple-100 text-purple-700 text-[10px] font-bold uppercase">LOG</span>}
                              {entry.is_new_build && <span className="px-2 py-0.5 rounded bg-green-100 text-green-700 text-[10px] font-bold uppercase">NEW</span>}
                              {entry.is_rw_flight && <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-700 text-[10px] font-bold uppercase">RW</span>}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-muted-foreground italic">{entry.signature || '-'}</td>
                          <td className="px-6 py-4">
                            <div className="flex gap-3">
                              <button onClick={() => setSelectedEntry(entry)} className="text-primary hover:underline text-xs font-bold">Form</button>
                              <button onClick={() => handleDelete(entry.id)} className="text-destructive hover:underline text-xs font-bold">Del</button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>

      {/* Printable Form Modal */}
      {selectedEntry && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 print:p-0 print:static print:bg-white overflow-y-auto">
          <div className="bg-white w-full max-w-4xl min-h-screen p-8 shadow-2xl relative print:shadow-none print:w-full">
            {/* Modal Actions */}
            <div className="flex justify-between items-center mb-8 print:hidden border-b pb-4">
              <button 
                onClick={() => setSelectedEntry(null)}
                className="text-sm font-bold border border-black px-4 py-2 hover:bg-gray-100 uppercase"
              >
                Close
              </button>
              <button 
                onClick={() => window.print()}
                className="bg-black text-white px-6 py-2 text-sm font-bold uppercase hover:opacity-90"
              >
                Print Control Sheet
              </button>
            </div>

            {/* CONTROL SHEET CONTENT (PDF TEMPLATE) */}
            <div className="control-sheet font-sans text-black border-[3px] border-black p-6">
              {/* Header Section */}
              <div className="flex justify-between items-start border-b-[3px] border-black pb-4 mb-4">
                <div className="space-y-1">
                  <h2 className="text-4xl font-black tracking-tighter italic">dnata</h2>
                  <h3 className="text-xl font-bold uppercase tracking-widest bg-black text-white px-2">In Bond Control Sheet</h3>
                  <p className="text-[10px] font-mono mt-2">Template v1.2 250124</p>
                </div>
                <div className="text-right border-l-[3px] border-black pl-6 py-2">
                  <p className="text-xs font-bold uppercase mb-1">C209 Number</p>
                  <p className="text-3xl font-black underline">{selectedEntry.c209_number}</p>
                </div>
              </div>

              {/* Top Info Bar */}
              <div className="grid grid-cols-4 gap-0 border-b-[3px] border-black mb-6">
                <div className="col-span-1 border-r-[3px] border-black p-2">
                  <p className="text-[10px] font-bold uppercase">Bar Number</p>
                  <p className="text-xl font-bold">{selectedEntry.bar_number || selectedEntry.container_code}</p>
                </div>
                <div className="col-span-1 border-r-[3px] border-black p-2 bg-gray-50">
                  <p className="text-[10px] font-bold uppercase">Lock / Seal Check</p>
                  <p className="text-lg font-black text-center mt-1">YES &nbsp; / &nbsp; NO</p>
                </div>
                <div className="col-span-2 p-2">
                  <p className="text-[10px] font-bold uppercase mb-1">Seal Numbers</p>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="border-b border-dashed border-black pb-1">From: </div>
                    <div className="border-b border-dashed border-black pb-1">To: </div>
                  </div>
                </div>
              </div>

              {/* Section 1 & 2 */}
              <div className="grid grid-cols-2 gap-6 mb-6">
                <div className="border-[3px] border-black p-3">
                  <h4 className="bg-black text-white text-center font-bold uppercase text-xs p-1 mb-3">Section 1: Inbound Bars</h4>
                  <div className="space-y-4">
                    <div className="border-b-[2px] border-black pb-2">
                      <p className="text-[10px] font-bold uppercase text-gray-500">Comments: {selectedEntry.notes || 'No comments'}</p>
                    </div>
                  </div>
                </div>
                <div className="border-[3px] border-black p-3">
                  <h4 className="bg-black text-white text-center font-bold uppercase text-xs p-1 mb-3">Section 2: Bar Storage</h4>
                  <p className="text-[9px] text-center italic mb-4">To be used for bars being stored and/or checked...</p>
                  <div className="border-[2px] border-black h-20 bg-gray-50 flex items-center justify-center">
                    <span className="text-gray-300 font-bold uppercase tracking-[1em]">OFFICE ONLY</span>
                  </div>
                </div>
              </div>

              {/* Section 3: Bar Packing */}
              <div className="border-[3px] border-black p-3 mb-6 relative">
                <h4 className="bg-black text-white text-center font-bold uppercase text-xs p-1 mb-4">Section 3: Bar Packing - Core Bar</h4>
                
                <div className="grid grid-cols-2 gap-8 mb-6">
                  <div className="space-y-4">
                    <div className="flex justify-between items-end border-b-2 border-black pb-1">
                      <span className="text-[11px] font-bold uppercase">Number of Pieces</span>
                      <span className="text-xl font-black underline">{selectedEntry.pieces}</span>
                    </div>
                    <div className="flex justify-between items-end border-b-2 border-black pb-1">
                      <span className="text-[11px] font-bold uppercase">Date Received</span>
                      <span className="font-bold">{new Date(selectedEntry.created_at).toLocaleDateString('en-GB')}</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="border-2 border-black p-1 text-center">
                      <p className="text-[9px] font-bold uppercase border-b border-black mb-1">Print Name</p>
                      <p className="text-xs h-8 flex items-center justify-center italic">{selectedEntry.signature}</p>
                    </div>
                    <div className="border-2 border-black p-1 text-center">
                      <p className="text-[9px] font-bold uppercase border-b border-black mb-1">Sign Name</p>
                      <div className="h-8"></div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-x-8 gap-y-2">
                  {[
                    "Locks & Seals Checked Prior to Opening Bar",
                    "Lock & Seals Intact",
                    "Seal numbers match paperwork?",
                    "C209 Present",
                    "Bar Recorded on IB Despatch Sheet",
                    "Manager or Shift Leader Informed"
                  ].map((item, i) => (
                    <div key={i} className="flex justify-between items-center border-b border-gray-200 py-1">
                      <span className="text-[10px] font-bold">{item}</span>
                      <span className="text-[10px] font-black">YES / NO</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Section 4 & 5 */}
              <div className="grid grid-cols-2 gap-6 mb-6">
                <div className="border-[3px] border-black p-3">
                  <h4 className="bg-black text-white text-center font-bold uppercase text-xs p-1 mb-4">Section 4: Re-Sealed / Re-Allocated Bar</h4>
                  <div className="space-y-3">
                    <div className="border-b-2 border-black pb-2 flex justify-between">
                      <span className="text-[10px] font-bold uppercase">Print</span>
                      <span className="text-[10px] font-bold uppercase">Sign</span>
                    </div>
                    <div className="h-10 border border-dashed border-gray-300"></div>
                  </div>
                </div>
                <div className="border-[3px] border-black p-3">
                  <h4 className="bg-black text-white text-center font-bold uppercase text-xs p-1 mb-4">Section 5: Bar Completion</h4>
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-[10px] font-bold border-b border-black pb-1">
                      <span>Equipment Serviceable (Doors/Locks)</span>
                      <span>YES / NO</span>
                    </div>
                    <div className="flex justify-between text-[10px] font-bold border-b border-black pb-1">
                      <span>Equipment Serviceable (Wheels/Brakes)</span>
                      <span>YES / NO</span>
                    </div>
                    <div className="flex justify-between text-[10px] font-bold border-b border-black pb-1">
                      <span>Seal numbers match paperwork?</span>
                      <span>YES / NO</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-end gap-2">
                    <div className="flex-1 border-b-2 border-black"><p className="text-[8px] font-bold uppercase">Print</p><div className="h-4"></div></div>
                    <div className="flex-1 border-b-2 border-black"><p className="text-[8px] font-bold uppercase">Sign</p><div className="h-4"></div></div>
                  </div>
                </div>
              </div>

              {/* Section 6 */}
              <div className="border-[3px] border-black p-3">
                <h4 className="bg-black text-white text-center font-bold uppercase text-xs p-1 mb-4">Section 6: Record Bar on Dispatch Sheet</h4>
                <div className="grid grid-cols-3 gap-6 items-end">
                  <div className="col-span-1 flex justify-between border-b-2 border-black pb-1">
                    <span className="text-[10px] font-bold uppercase">Bar Details entered on Dispatch Sheet?</span>
                    <span className="text-xs font-black">YES / NO</span>
                  </div>
                  <div className="col-span-1 border-b-2 border-black pb-1">
                    <p className="text-[10px] font-bold uppercase">Print Name</p>
                    <div className="h-4"></div>
                  </div>
                  <div className="col-span-1 border-b-2 border-black pb-1">
                    <p className="text-[10px] font-bold uppercase">Sign Name</p>
                    <div className="h-4"></div>
                  </div>
                </div>
              </div>

              <div className="mt-4 text-center">
                <p className="text-[8px] font-mono uppercase text-gray-400">
                  SYSTEM GENERATED DOCUMENT - SKYROUTE.UK C209 SYSTEM - {new Date().toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
            background: white !important;
          }
          .control-sheet, .control-sheet * {
            visibility: visible;
          }
          .control-sheet {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            margin: 0;
            padding: 0;
          }
          @page {
            margin: 1cm;
          }
        }
      `}</style>
    </div>
  );
}
