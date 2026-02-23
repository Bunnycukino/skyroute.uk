'use client';
import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

function InBondFormContent() {
  const searchParams = useSearchParams();
  const c209 = searchParams.get('c209') || '';
  const barNumber = searchParams.get('bar') || '';
  const pieces = searchParams.get('pieces') || '';
  const dateStr = searchParams.get('date') || new Date().toLocaleDateString('en-GB');
  const signature = searchParams.get('sig') || '';
  const notes = searchParams.get('notes') || '';

  const Label = ({ children, className = \"\" }: { children: React.ReactNode, className?: string }) => (
    <span className={`text-[10px] font-bold uppercase text-black ${className}`}>{children}</span>
  );

  const Box = ({ label, value, className = \"\" }: { label: string, value?: string, className?: string }) => (
    <div className={`border-r-2 border-black p-1 flex flex-col justify-start h-full ${className}`}>
      <Label>{label}</Label>
      <div className=\"text-sm font-black mt-0.5\">{value}</div>
    </div>
  );

  return (
    <div className=\"min-h-screen bg-gray-100 p-4 font-sans text-black\">
      <div className=\"max-w-[800px] mx-auto mb-4 print:hidden flex justify-between items-center\">
        <button onClick={() => window.print()} className=\"bg-blue-600 text-white px-6 py-2 rounded font-bold\">PRINT FORM</button>
        <div className=\"text-xs italic text-gray-500\">v2.0 (Excel Redesign)</div>
      </div>

      <div className=\"max-w-[800px] mx-auto bg-white border-2 border-black shadow-2xl print:shadow-none\">
        <div className=\"grid grid-cols-12 border-b-2 border-black\">
          <div className=\"col-span-5 p-4 border-r-2 border-black flex items-center gap-4\">
            <div className=\"text-4xl font-black italic tracking-tighter text-blue-600\">dnata</div>
          </div>
          <div className=\"col-span-4 p-2 border-r-2 border-black\">
            <div className=\"text-lg font-black\">IN BOND</div>
            <div className=\"text-lg font-black\">CONTROL SHEET</div>
          </div>
          <div className=\"col-span-3\">
             <div className=\"border-b-2 border-black p-1 text-[10px] font-bold text-center\">C209 Number</div>
             <div className=\"p-2 text-center text-xl font-black\">{c209}</div>
          </div>
        </div>

        <div className=\"bg-black text-white p-1 text-[10px] font-black tracking-widest\">SECTION 1: INBOUND BARS</div>
        <div className=\"grid grid-cols-12 border-b-2 border-black divide-x-2 divide-black\">
          <div className=\"col-span-4 p-2\"><Box label=\"Bar Number:\" value={barNumber} className=\"border-0\" /></div>
          <div className=\"col-span-3 p-2\"><Box label=\"Number of Pieces:\" value={pieces} className=\"border-0\" /></div>
          <div className=\"col-span-5 p-2\"><Box label=\"Date Received:\" value={dateStr} className=\"border-0\" /></div>
        </div>
        <div className=\"grid grid-cols-3 border-b-2 border-black divide-x-2 divide-black text-[9px] font-black h-8\">
          <div className=\"p-2 flex items-center justify-between\">Lock & Seal Check: <span>YES / NO</span></div>
          <div className=\"p-2 flex items-center justify-between\">C209 Present: <span>YES / NO</span></div>
          <div className=\"p-2 flex items-center justify-between\">Bar Recorded on I/B Despatch: <span>YES / NO</span></div>
        </div>
        <div className=\"p-2 border-b-2 border-black h-12\">
          <Label>Comments:</Label>
          <div className=\"text-xs font-bold\">{notes}</div>
        </div>
        <div className=\"grid grid-cols-2 border-b-2 border-black divide-x-2 divide-black h-10\">
          <div className=\"p-2 flex items-center gap-2\"><Label>PRINT NAME:</Label> <span className=\"font-black\">TEST</span></div>
          <div className=\"p-2 flex items-center gap-2\"><Label>SIGN NAME:</Label> <span className=\"font-black italic\">{signature}</span></div>
        </div>

        <div className=\"bg-slate-100 p-1 text-[10px] font-black border-b-2 border-black\">SECTION 2: BAR STORAGE <span className=\"font-normal italic ml-4\">To be used for bars that are being stored and/or checked</span></div>
        <div className=\"p-2 border-b-2 border-black h-10\"><Label>Comments:</Label></div>

        <div className=\"grid grid-cols-2 border-b-2 border-black divide-x-2 divide-black\">
          <div>
            <div className=\"bg-black text-white p-1 text-[10px] font-black\">SECTION 3: BAR PACKING - CORE BAR</div>
            <div className=\"divide-y-2 divide-black text-[9px] font-black\">
              <div className=\"p-1 flex justify-between\">Locks & Seals Checked Prior to Opening Bar: <span>YES / NO</span></div>
              <div className=\"p-1 flex justify-between\">Locks & Seals Intact: <span>YES / NO</span></div>
              <div className=\"p-1 flex justify-between\">Seal numbers match paperwork? <span>YES / NO *</span></div>
              <div className=\"p-1 italic text-[8px]\">* If NO, complete details below & inform Manager/ Shift Leader</div>
              <div className=\"grid grid-cols-2 divide-x-2 divide-black h-8\">
                <div className=\"p-1\"><Label className=\"text-[8px]\">PRINT NAME:</Label></div>
                <div className=\"p-1\"><Label className=\"text-[8px]\">SIGN NAME:</Label></div>
              </div>
            </div>
          </div>
          <div>
            <div className=\"bg-black text-white p-1 text-[10px] font-black\">BAR PACKING - GIFT CART</div>
            <div className=\"divide-y-2 divide-black text-[9px] font-black\">
              <div className=\"p-1 flex justify-between\">Locks & Seals Checked Prior to Opening Bar: <span>YES / NO</span></div>
              <div className=\"p-1 flex justify-between\">Locks & Seals Intact: <span>YES / NO</span></div>
              <div className=\"p-1 flex justify-between\">Seal numbers match paperwork? <span>YES / NO *</span></div>
              <div className=\"p-1 h-4\"></div>
              <div className=\"grid grid-cols-2 divide-x-2 divide-black h-8\">
                <div className=\"p-1\"><Label className=\"text-[8px]\">PRINT NAME:</Label></div>
                <div className=\"p-1\"><Label className=\"text-[8px]\">SIGN NAME:</Label></div>
              </div>
            </div>
          </div>
        </div>
        <div className=\"p-2 border-b-2 border-black h-10 text-[9px] font-black\"><Label>Comments:</Label></div>
        <div className=\"grid grid-cols-2 border-b-2 border-black divide-x-2 divide-black h-8 text-[9px] font-black\">
          <div className=\"p-1 flex items-center justify-between\">MANAGER or SHIFT LEADER Informed: <span>YES / NO</span></div>
          <div className=\"p-1\"><Label>Name of MANAGER/SHIFT LEADER informed:</Label></div>
        </div>

        <div className=\"bg-black text-white p-1 text-[10px] font-black\">SECTION 4: RE-SEALED or RE-ALLOCATED BAR <span className=\"font-normal italic ml-4 text-[8px]\">To be completed for Incomplete Bar left by Previous Shift or Bar Re-opened for Bar Check or when bar Re-allocated</span></div>
        <div className=\"grid grid-cols-12 border-b-2 border-black divide-x-2 divide-black h-8\">
          <div className=\"col-span-6 p-1\"><Label>SEAL NUMBERS</Label></div>
          <div className=\"col-span-3 p-1\"><Label>FROM</Label></div>
          <div className=\"col-span-3 p-1\"><Label>TO</Label></div>
        </div>

        <div className=\"grid grid-cols-2 border-b-2 border-black divide-x-2 divide-black\">
          <div>
            <div className=\"bg-black text-white p-1 text-[10px] font-black\">SECTION 5: BAR COMPLETION - CORE BAR</div>
            <div className=\"divide-y-2 divide-black text-[9px] font-black\">
              <div className=\"p-1 flex justify-between\">Equipment Serviceable (Doors & Locks) <span>YES / NO</span></div>
              <div className=\"p-1 flex justify-between\">Equipment Serviceable (Wheels & Brakes) <span>YES / NO</span></div>
              <div className=\"p-1 h-8\"><Label>Comments:</Label></div>
              <div className=\"grid grid-cols-2 divide-x-2 divide-black h-8\">
                <div className=\"p-1\"><Label>PRINT NAME:</Label></div>
                <div className=\"p-1\"><Label>SIGN NAME:</Label></div>
              </div>
            </div>
          </div>
          <div>
            <div className=\"bg-black text-white p-1 text-[10px] font-black\">SECTION 5: BAR COMPLETION - GIFT CART</div>
            <div className=\"divide-y-2 divide-black text-[9px] font-black\">
              <div className=\"p-1 flex justify-between\">Equipment Serviceable (Doors & Locks) <span>YES / NO</span></div>
              <div className=\"p-1 flex justify-between\">Equipment Serviceable (Wheels & Brakes) <span>YES / NO</span></div>
              <div className=\"p-1 h-8\"><Label>Comments:</Label></div>
              <div className=\"grid grid-cols-2 divide-x-2 divide-black h-8\">
                <div className=\"p-1\"><Label>PRINT NAME:</Label></div>
                <div className=\"p-1\"><Label>SIGN NAME:</Label></div>
              </div>
            </div>
          </div>
        </div>

        <div className=\"grid grid-cols-12 border-black divide-x-2 divide-black h-12\">
          <div className=\"col-span-6\">
            <div className=\"bg-black text-white p-1 text-[10px] font-black\">SECTION 6: RECORD BAR ON DISPATCH SHEET</div>
            <div className=\"grid grid-cols-2 h-8 divide-x-2 divide-black\">
              <div className=\"p-1\"><Label>PRINT NAME:</Label></div>
              <div className=\"p-1\"><Label>SIGN NAME:</Label></div>
            </div>
          </div>
          <div className=\"col-span-6\">
            <div className=\"grid grid-cols-2 border-b-2 border-black h-6 divide-x-2 divide-black\">
              <div className=\"p-1 flex items-center gap-2\"><Label>Date:</Label> <span className=\"font-bold text-[10px]\">{dateStr}</span></div>
              <div className=\"p-1\"><Label>Time:</Label></div>
            </div>
            <div className=\"p-1 flex justify-between text-[9px] font-black h-6\">
              <span>Bar Details Entered on Despatch Sheet</span>
              <span>YES / NO</span>
            </div>
          </div>
        </div>
      </div>
      <style jsx global>{\`
        @media print {
          body { background: white !important; padding: 0 !important; }
          .print-hidden { display: none !important; }
          @page { margin: 0; size: A4; }
          .shadow-2xl { shadow: none !important; }
        }
      \`}</style>
    </div>
  );
}

export default function InBondPage() {
  return (
    <Suspense fallback={<div className=\"p-8 text-center font-black\">Loading Official Template...</div>}>
      <InBondFormContent />
    </Suspense>
  );
}
