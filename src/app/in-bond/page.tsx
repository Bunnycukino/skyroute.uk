'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

function InBondFormContent() {
  const searchParams = useSearchParams();
  
  // Data from URL
  const c209 = searchParams.get('c209') || '';
  const barNumber = searchParams.get('bar') || '';
  const pieces = searchParams.get('pieces') || '';
  const signature = searchParams.get('sig') || '';
  const dateStr = new Date().toLocaleDateString('en-GB');

  const Label = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => (
    <span className={`text-[10px] font-bold uppercase text-black ${className}`}>{children}</span>
  );

  const Box = ({ label, value, className = "" }: { label: string, value?: string, className?: string }) => (
    <div className={`border-r border-black p-1 flex flex-col justify-start h-full ${className}`}>
      <Label>{label}</Label>
      <div className="text-sm font-bold mt-0.5">{value}</div>
    </div>
  );

  const Checkbox = ({ label }: { label: string }) => (
    <div className="flex items-center gap-1">
      <div className="w-3 h-3 border border-black"></div>
      <span className="text-[9px] font-bold">{label}</span>
    </div>
  );

  const SectionHeader = ({ num, title, sub }: { num: number, title: string, sub?: string }) => (
    <div className="bg-black text-white p-1 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className="w-5 h-5 rounded-full border border-white flex items-center justify-center text-xs font-bold">
          {num}
        </div>
        <span className="text-xs font-bold uppercase tracking-wider">{title}</span>
      </div>
      {sub && <span className="text-[9px] italic opacity-80 lowercase">{sub}</span>}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100 p-4 font-sans text-black">
      {/* Print Button - Hidden on Print */}
      <div className="max-w-[800px] mx-auto mb-4 print:hidden flex justify-between items-center">
        <button 
          onClick={() => window.print()}
          className="bg-primary text-white px-6 py-2 rounded-lg font-bold shadow-lg hover:bg-primary/90 transition-all"
        >
          PRINT OFFICIAL FORM
        </button>
        <div className="text-xs text-gray-500 italic">Official In Bond Control Sheet v1.2</div>
      </div>

      {/* Main Sheet */}
      <div className="max-w-[800px] mx-auto bg-white border-[1.5px] border-black shadow-2xl print:shadow-none print:border-black overflow-hidden">
        
        {/* Header Section */}
        <div className="flex border-b border-black h-20">
          <div className="w-1/2 p-4 flex items-center gap-4">
            <div className="text-primary text-5xl font-black italic tracking-tighter scale-y-125 origin-left">dnata</div>
            <div className="h-full w-[1.5px] bg-black/20 mx-2"></div>
            <div>
              <h1 className="text-lg font-black leading-tight uppercase tracking-tight">In Bond<br/>Control Sheet</h1>
            </div>
          </div>
          <div className="w-1/2 flex border-l border-black">
            <div className="flex-1 p-2 border-r border-black">
              <Label>C209 Number</Label>
              <div className="text-2xl font-black text-center mt-1 tracking-widest">{c209}</div>
            </div>
            <div className="flex-1"></div>
          </div>
        </div>

        {/* SECTION 1: INBOUND BARS */}
        <SectionHeader num={1} title="Inbound Bars" />
        <div className="grid grid-cols-3 border-b border-black h-10">
          <Box label="Bar Number:" value={barNumber} />
          <Box label="Number of Pieces:" value={pieces} />
          <Box label="Date Received:" value={dateStr} />
        </div>
        <div className="grid grid-cols-3 border-b border-black h-8 bg-gray-50">
          <div className="border-r border-black p-1 flex items-center justify-around">
            <Label>Lock & Seal Check:</Label>
            <Checkbox label="YES" />
            <Checkbox label="NO" />
          </div>
          <div className="border-r border-black p-1 flex items-center justify-around">
            <Label>C209 Present:</Label>
            <Checkbox label="YES" />
            <Checkbox label="NO" />
          </div>
          <div className="p-1 flex items-center justify-around">
            <Label>Recorded on I/B Despatch:</Label>
            <Checkbox label="YES" />
            <Checkbox label="NO" />
          </div>
        </div>
        <div className="border-b border-black h-16 p-1">
          <Label>Comments:</Label>
        </div>
        <div className="grid grid-cols-2 border-b border-black h-8">
          <div className="border-r border-black p-1 flex items-center justify-start gap-2">
            <Label>Print Name:</Label>
          </div>
          <div className="p-1 flex items-center justify-start gap-2">
            <Label>Sign Name:</Label>
            <span className="font-serif italic text-sm">{signature}</span>
          </div>
        </div>

        {/* SECTION 2: BAR STORAGE */}
        <SectionHeader num={2} title="Bar Storage" sub="to be used for bars that are being stored and/or checked" />
        <div className="border-b border-black h-16 p-1">
          <Label>Comments:</Label>
        </div>

        {/* SECTION 3: BAR PACKING */}
        <div className="grid grid-cols-2">
          <div className="border-r border-black">
            <SectionHeader num={3} title="Bar Packing - Core Bar" />
            <div className="border-b border-black h-8 p-1 flex items-center justify-around">
              <Label>Checks Prior to Opening:</Label>
              <Checkbox label="YES" />
              <Checkbox label="NO" />
            </div>
            <div className="border-b border-black h-8 p-1 flex items-center justify-around">
              <Label>Lock Seals Intact:</Label>
              <Checkbox label="YES" />
              <Checkbox label="NO" />
            </div>
            <div className="border-b border-black h-8 p-1 flex items-center justify-around">
              <Label>Seals match paperwork?</Label>
              <Checkbox label="YES" />
              <Checkbox label="NO" />
            </div>
            <div className="border-b border-black h-8 p-1 flex items-center justify-start px-2">
              <Label className="text-[8px] italic">* If NO, inform Manager/Shift Leader</Label>
            </div>
            <div className="border-b border-black h-8 grid grid-cols-2">
              <div className="border-r border-black p-1 flex items-center gap-1"><Label>Print:</Label></div>
              <div className="p-1 flex items-center gap-1"><Label>Sign:</Label></div>
            </div>
            <div className="h-16 p-1"><Label>Comments:</Label></div>
          </div>
          <div>
            <SectionHeader num={3} title="Bar Packing - Gift Carts" />
            <div className="border-b border-black h-8 p-1 flex items-center justify-around">
              <Label>Checks Prior to Opening:</Label>
              <Checkbox label="YES" />
              <Checkbox label="NO" />
            </div>
            <div className="border-b border-black h-8 p-1 flex items-center justify-around">
              <Label>Lock Seals Intact:</Label>
              <Checkbox label="YES" />
              <Checkbox label="NO" />
            </div>
            <div className="border-b border-black h-8 p-1 flex items-center justify-around">
              <Label>Seals match paperwork?</Label>
              <Checkbox label="YES" />
              <Checkbox label="NO" />
            </div>
            <div className="border-b border-black h-8 p-1 opacity-0"><Label>.</Label></div>
            <div className="border-b border-black h-8 grid grid-cols-2">
              <div className="border-r border-black p-1 flex items-center gap-1"><Label>Print:</Label></div>
              <div className="p-1 flex items-center gap-1"><Label>Sign:</Label></div>
            </div>
            <div className="h-16 p-1 border-b border-black"><Label>Comments:</Label></div>
          </div>
        </div>
        <div className="border-y border-black h-8 grid grid-cols-2 bg-gray-50">
          <div className="border-r border-black p-1 flex items-center justify-around"><Label>Manager Informed?</Label><Checkbox label="YES" /><Checkbox label="NO" /></div>
          <div className="p-1 flex items-center gap-2 px-2"><Label>Manager Name:</Label></div>
        </div>

        {/* SECTION 4: RE-SEALED / RE-ALLOCATED */}
        <SectionHeader num={4} title="Re-Sealed or Re-Allocated Bar" sub="To be completed for incomplete Bar left by Previous Shift or Bar Re-opened" />
        <div className="grid grid-cols-3 border-b border-black h-8 bg-gray-100/50">
          <div className="border-r border-black flex items-center justify-center font-bold text-[9px]">SEAL NUMBERS</div>
          <div className="border-r border-black flex items-center justify-center font-bold text-[9px]">FROM</div>
          <div className="flex items-center justify-center font-bold text-[9px]">TO</div>
        </div>
        <div className="grid grid-cols-3 border-b border-black h-12">
          <div className="border-r border-black"></div>
          <div className="border-r border-black"></div>
          <div></div>
        </div>

        {/* SECTION 5: COMPLETION */}
        <div className="grid grid-cols-2">
          <div className="border-r border-black">
            <SectionHeader num={5} title="Bar Completion - Core Bar" />
            <div className="border-b border-black h-8 p-1 flex items-center justify-around">
              <Label>Doors & Locks Serviceable?</Label>
              <Checkbox label="YES" />
              <Checkbox label="NO" />
            </div>
            <div className="border-b border-black h-8 p-1 flex items-center justify-around">
              <Label>Wheels & Brakes Serviceable?</Label>
              <Checkbox label="YES" />
              <Checkbox label="NO" />
            </div>
            <div className="h-16 p-1"><Label>Comments:</Label></div>
            <div className="border-y border-black h-8 grid grid-cols-2">
              <div className="border-r border-black p-1 flex items-center gap-1"><Label>Print:</Label></div>
              <div className="p-1 flex items-center gap-1"><Label>Sign:</Label></div>
            </div>
          </div>
          <div>
            <SectionHeader num={5} title="Bar Completion - Gift Carts" />
            <div className="border-b border-black h-8 p-1 flex items-center justify-around">
              <Label>Doors & Locks Serviceable?</Label>
              <Checkbox label="YES" />
              <Checkbox label="NO" />
            </div>
            <div className="border-b border-black h-8 p-1 flex items-center justify-around">
              <Label>Wheels & Brakes Serviceable?</Label>
              <Checkbox label="YES" />
              <Checkbox label="NO" />
            </div>
            <div className="h-16 p-1 border-b border-black"><Label>Comments:</Label></div>
            <div className="border-b border-black h-8 grid grid-cols-2">
              <div className="border-r border-black p-1 flex items-center gap-1"><Label>Print:</Label></div>
              <div className="p-1 flex items-center gap-1"><Label>Sign:</Label></div>
            </div>
          </div>
        </div>

        {/* SECTION 6: RECORD BAR */}
        <SectionHeader num={6} title="Record Bar on Dispatch Sheet" />
        <div className="grid grid-cols-3 h-14 border-b border-black">
          <div className="border-r border-black p-1 flex flex-col justify-between">
            <Label>Date:</Label>
            <div className="text-xs font-bold">{dateStr}</div>
          </div>
          <div className="border-r border-black p-1 flex flex-col justify-between">
            <Label>Time:</Label>
          </div>
          <div className="p-1 flex items-center justify-around">
            <Label>Entered on Dispatch?</Label>
            <Checkbox label="YES" />
            <Checkbox label="NO" />
          </div>
        </div>
        <div className="grid grid-cols-2 h-8 border-b border-black bg-gray-50">
          <div className="border-r border-black p-1 flex items-center gap-2"><Label>Print Name:</Label></div>
          <div className="p-1 flex items-center gap-2"><Label>Sign Name:</Label></div>
        </div>

        {/* Footer */}
        <div className="p-2 flex justify-between items-center bg-gray-100">
          <div className="text-[8px] font-bold text-gray-500 uppercase tracking-widest">Official In Bond Control Document - Emirates Group Logistics</div>
          <div className="text-[8px] italic text-gray-400">In Bond Control Sheet Template v1.2 250124</div>
        </div>
      </div>

      <style jsx global>{`
        @media print {
          body { background: white !important; padding: 0 !important; }
          .print-hidden { display: none !important; }
          @page { margin: 0.5cm; }
        }
      `}</style>
    </div>
  );
}

export default function InBondPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center animate-pulse">Loading Official Template...</div>}>
      <InBondFormContent />
    </Suspense>
  );
}
