'use client';
import { useRef } from 'react';

interface InBondData {
  c209: string;
  bar: string;
  pieces: number;
  date: string;
  flight: string;
  signature: string;
  notes?: string;
  photo?: string;
}

export default function InBondPrintSheet({ data, onClose }: { data: InBondData; onClose: () => void }) {
  const printRef = useRef<HTMLDivElement>(null);

  function handlePrint() {
    window.print();
  }

  const td = { border: '1px solid #000', padding: '6px 8px' };
  const tdBold = { ...td, fontWeight: 'bold' };
  const sectionHeader = { ...td, background: '#f0f0f0', fontWeight: 'bold', fontSize: 12 };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, overflowY: 'auto' }}>
      <div style={{ background: '#fff', maxWidth: 900, width: '100%', borderRadius: 12, boxShadow: '0 25px 50px rgba(0,0,0,0.5)' }}>
        <div style={{ background: 'linear-gradient(135deg, #1e3a5f, #2563eb)', padding: '16px 24px', borderRadius: '12px 12px 0 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ color: '#fff', fontWeight: 700, fontSize: 17 }}>📰 IN BOND CONTROL SHEET</div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={handlePrint} style={{ background: '#10b981', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 20px', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
              🖨 Drukuj
            </button>
            <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.2)', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 16px', fontWeight: 700, cursor: 'pointer' }}>
              ✕ Zamknij
            </button>
          </div>
        </div>
        
        <div ref={printRef} style={{ padding: '20px 30px', maxHeight: 'calc(100vh - 200px)', overflowY: 'auto' }}>
          {/* HEADER */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
            {/* dnata logo */}
            <div style={{ fontSize: 42, fontWeight: 900, color: '#00a0c6', letterSpacing: '-2px', fontFamily: 'Arial, sans-serif', lineHeight: 1 }}>
              d<span style={{ color: '#5cb85c' }}>n</span>ata
            </div>
            
            {/* Title */}
            <div style={{ textAlign: 'center', flex: 1 }}>
              <div style={{ fontSize: 18, fontWeight: 900, textTransform: 'uppercase' }}>IN BOND</div>
              <div style={{ fontSize: 18, fontWeight: 900, textTransform: 'uppercase' }}>CONTROL SHEET</div>
            </div>
            
            {/* C209 Box */}
            <div style={{ border: '2px solid #000', padding: '8px 16px', minWidth: 180, textAlign: 'center' }}>
              <div style={{ fontSize: 11, fontWeight: 700 }}>C209 Number</div>
              <div style={{ fontSize: 24, fontWeight: 900, marginTop: 4 }}>{data.c209}</div>
            </div>
          </div>

          {/* SECTION 1: INBOUND BARS */}
          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 8, fontSize: 11 }}>
            <tbody>
              <tr>
                <td colSpan={3} style={sectionHeader}>SECTION 1: INBOUND BARS</td>
              </tr>
              <tr>
                <td style={td}><strong>Bar Number:</strong> {data.bar}</td>
                <td style={td}><strong>Number of Pieces:</strong> {data.pieces}</td>
                <td style={td}><strong>Date Received:</strong> {data.date}</td>
              </tr>
              <tr>
                <td style={td}><strong>Lock & Seal Check:</strong> &nbsp; YES / NO</td>
                <td style={td}><strong>C209 Present:</strong> &nbsp; YES / NO</td>
                <td style={td}><strong>Bar Recorded on I/B Despatch Sheet:</strong> &nbsp; YES / NO</td>
              </tr>
              <tr>
                <td colSpan={3} style={td}>
                  <strong>Comments:</strong><br/>
                  {data.notes || ''}
                  <br/><br/>
                </td>
              </tr>
              <tr>
                <td colSpan={2} style={td}><strong>PRINT NAME:</strong> {data.signature}</td>
                <td style={td}><strong>SIGN NAME:</strong></td>
              </tr>
            </tbody>
          </table>

          {/* SECTION 2: BAR STORAGE */}
          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 8, fontSize: 11 }}>
            <tbody>
              <tr>
                <td colSpan={2} style={sectionHeader}>SECTION 2: BAR STORAGE &nbsp;&nbsp;&nbsp;&nbsp; to be used for bars that are being stored and/or checked</td>
              </tr>
              <tr>
                <td colSpan={2} style={{ ...td, height: 60 }}><strong>Comments:</strong><br/><br/></td>
              </tr>
            </tbody>
          </table>

          {/* SECTION 3: BAR PACKING */}
          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 8, fontSize: 11 }}>
            <tbody>
              <tr>
                <td style={{ ...sectionHeader, width: '50%' }}>SECTION 3: BAR PACKING - CORE BAR</td>
                <td style={sectionHeader}>BAR PACKING - GIFT CARTS</td>
              </tr>
              <tr>
                <td style={td}>Locks & Seals Checked Prior to Opening Bar: &nbsp; YES / NO</td>
                <td style={td}>Locks & Seals Checked Prior to Opening Bar: &nbsp; YES / NO</td>
              </tr>
              <tr>
                <td style={td}>Lock & Seals Intact: &nbsp; YES / NO *</td>
                <td style={td}>Lock & Seals Intact: &nbsp; YES / NO *</td>
              </tr>
              <tr>
                <td style={td}>Seal numbers match paperwork? &nbsp; YES / NO *</td>
                <td style={td}>Seal numbers match paperwork? &nbsp; YES / NO *</td>
              </tr>
              <tr>
                <td colSpan={2} style={{ ...td, fontSize: 9, color: '#555' }}>* If NO, complete details below & inform Manager/Shift Leader</td>
              </tr>
              <tr>
                <td style={td}><strong>Number of Pieces:</strong> {data.pieces}</td>
                <td style={td}><strong>Number of Pieces:</strong></td>
              </tr>
              <tr>
                <td style={td}><strong>Date Received:</strong> {data.date}</td>
                <td style={td}><strong>Date Received:</strong></td>
              </tr>
              <tr>
                <td style={td}><strong>PRINT NAME:</strong> {data.signature}</td>
                <td style={td}><strong>PRINT NAME:</strong></td>
              </tr>
              <tr>
                <td style={td}><strong>SIGN NAME:</strong></td>
                <td style={td}><strong>SIGN NAME:</strong></td>
              </tr>
              <tr>
                <td colSpan={2} style={{ ...td, height: 50 }}><strong>Comments:</strong><br/><br/></td>
              </tr>
              <tr>
                <td colSpan={2} style={td}>
                  <strong>MANAGER or SHIFT LEADER Informed:</strong> &nbsp; YES / NO &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                  <strong>Name of MANAGER / SHIFT LEADER informed:</strong>
                </td>
              </tr>
            </tbody>
          </table>

          {/* SECTION 4: RE-SEALED or RE-ALLOCATED BAR */}
          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 8, fontSize: 11 }}>
            <tbody>
              <tr>
                <td colSpan={3} style={sectionHeader}>SECTION 4: RE-SEALED or RE-ALLOCATED BAR &nbsp;&nbsp; To be completed for incomplete Bar left by Previous Shift or Bar Re-opened for Bar Check or when bar Re-Allocated</td>
              </tr>
              <tr>
                <td style={td}><strong>SEAL NUMBERS</strong></td>
                <td style={td}><strong>FROM</strong></td>
                <td style={td}><strong>TO</strong></td>
              </tr>
            </tbody>
          </table>

          {/* SECTION 5: BAR COMPLETION */}
          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 8, fontSize: 11 }}>
            <tbody>
              <tr>
                <td style={{ ...sectionHeader, width: '50%' }}>SECTION 5: BAR COMPLETION - CORE BAR</td>
                <td style={sectionHeader}>SECTION 5: BAR COMPLETION - GIFT CARTS</td>
              </tr>
              <tr>
                <td style={td}>Equipment Serviceable (Doors & Locks) &nbsp; YES / NO</td>
                <td style={td}>Equipment Serviceable (Doors & Locks) &nbsp; YES / NO</td>
              </tr>
              <tr>
                <td style={td}>Equipment Serviceable (Wheels & Brakes) &nbsp; YES / NO</td>
                <td style={td}>Equipment Serviceable (Wheels & Brakes) &nbsp; YES / NO</td>
              </tr>
              <tr>
                <td style={{ ...td, height: 40 }}><strong>Comments:</strong><br/><br/></td>
                <td style={{ ...td, height: 40 }}><strong>Comments:</strong><br/><br/></td>
              </tr>
              <tr>
                <td style={td}><strong>PRINT NAME:</strong></td>
                <td style={td}><strong>PRINT NAME:</strong></td>
              </tr>
              <tr>
                <td style={td}><strong>SIGN NAME:</strong></td>
                <td style={td}><strong>SIGN NAME:</strong></td>
              </tr>
            </tbody>
          </table>

          {/* SECTION 6: RECORD BAR ON DISPATCH SHEET */}
          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 8, fontSize: 11 }}>
            <tbody>
              <tr>
                <td colSpan={2} style={sectionHeader}>SECTION 6: RECORD BAR ON DISPATCH SHEET</td>
                <td style={td}><strong>Date:</strong></td>
                <td style={td}><strong>Time:</strong></td>
              </tr>
              <tr>
                <td colSpan={3} style={td}>Bar Details entered on Dispatch Sheet &nbsp; YES / NO</td>
                <td style={td}></td>
              </tr>
              <tr>
                <td colSpan={2} style={td}><strong>PRINT NAME:</strong></td>
                <td colSpan={2} style={td}><strong>SIGN NAME:</strong></td>
              </tr>
            </tbody>
          </table>

          {/* Photo Section */}
          {data.photo && (
            <div style={{ marginTop: 12, marginBottom: 12 }}>
              <div style={{ fontWeight: 700, fontSize: 12, padding: '6px 0', borderBottom: '2px solid #000', marginBottom: 8 }}>CONFIRMATION PHOTO</div>
              <div style={{ border: '2px solid #000', padding: 8, textAlign: 'center', background: '#f9f9f9' }}>
                <img src={data.photo} alt="Confirmation" style={{ maxWidth: '100%', maxHeight: 300, objectFit: 'contain' }} />
              </div>
            </div>
          )}

          {/* Footer */}
          <div style={{ marginTop: 16, fontSize: 9, textAlign: 'center', color: '#666', borderTop: '1px solid #ccc', paddingTop: 8 }}>
            In Bond Control Sheet Template v1.2 250124
          </div>
        </div>

        {/* Print Styles */}
        <style dangerouslySetInnerHTML={{ __html: `
          @media print {
            body * { visibility: hidden; }
            .print-content, .print-content * { visibility: visible; }
            .print-content { position: absolute; left: 0; top: 0; width: 100%; }
            @page { margin: 15mm; size: A4; }
          }
        `}} />
      </div>
    </div>
  );
}
