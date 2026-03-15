'use client';
import { useRef } from 'react';

interface InBondPrintSheetProps {
  data: {
    c209?: string;
    bar?: string;
    pieces?: string;
    date?: string;
    agent?: string;
    notes?: string;
    photo?: string;
  };
  onClose: () => void;
}

export default function InBondPrintSheet({ data, onClose }: InBondPrintSheetProps) {
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    const content = printRef.current;
    if (!content) return;
    const win = window.open('', '_blank');
    if (!win) return;
    win.document.write('<html><head><title>IN BOND CONTROL SHEET</title><style>body{margin:0;font-family:Arial,sans-serif;font-size:10px;}table{border-collapse:collapse;width:100%;}td,th{border:1px solid #000;padding:3px 5px;}@media print{body{margin:0;}}</style></head><body>');
    win.document.write(content.innerHTML);
    win.document.write('</body></html>');
    win.document.close();
    win.print();
  };

  const td: React.CSSProperties = { border: '1px solid #000', padding: '3px 6px', fontSize: 10 };
  const th: React.CSSProperties = { border: '1px solid #000', padding: '3px 6px', fontSize: 10, backgroundColor: '#003580', color: '#fff', fontWeight: 700 };
  const sec: React.CSSProperties = { backgroundColor: '#003580', color: '#fff', fontWeight: 700, padding: '4px 8px', fontSize: 11 };
  const yn: React.CSSProperties = { width: 40, border: '1px solid #000', padding: '3px 6px', fontSize: 10, textAlign: 'center' as const };

  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'auto' }}>
      <div style={{ backgroundColor: '#fff', borderRadius: 8, padding: 24, maxWidth: 900, width: '95%', maxHeight: '90vh', overflow: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>IN BOND CONTROL SHEET</h2>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={handlePrint} style={{ backgroundColor: '#003580', color: '#fff', border: 'none', padding: '8px 20px', borderRadius: 6, cursor: 'pointer', fontWeight: 600 }}>Print</button>
            <button onClick={onClose} style={{ backgroundColor: '#e5e7eb', color: '#111', border: 'none', padding: '8px 16px', borderRadius: 6, cursor: 'pointer', fontWeight: 600 }}>Close</button>
          </div>
        </div>
        <div ref={printRef} style={{ fontFamily: 'Arial, sans-serif', fontSize: 10 }}>
          <table style={{ borderCollapse: 'collapse', width: '100%', marginBottom: 0 }}>
            <tbody>
              <tr>
                <td style={{ ...td, width: '18%', textAlign: 'center' as const, padding: 10 }}>
                  <div style={{ fontWeight: 900, fontSize: 30, color: '#003580', letterSpacing: -1, lineHeight: 1 }}>dn<span style={{ color: '#00a651' }}>a</span>ta</div>
                  <div style={{ fontSize: 7, color: '#555', letterSpacing: 1, marginTop: 2 }}>AN EMIRATES GROUP COMPANY</div>
                </td>
                <td style={{ ...td, textAlign: 'center' as const, backgroundColor: '#003580', padding: 12 }}>
                  <div style={{ color: '#fff', fontWeight: 900, fontSize: 20, letterSpacing: 2 }}>IN BOND CONTROL SHEET</div>
                  <div style={{ color: '#e0e0e0', fontSize: 9, marginTop: 2 }}>System C209/C208</div>
                </td>
                <td style={{ ...td, width: '25%', padding: 8, fontSize: 9 }}>
                  <div><strong>C209/C208 No:</strong> {data.c209 || '___________'}</div>
                  <div style={{ marginTop: 4 }}><strong>Date:</strong> {data.date || '___________'}</div>
                  <div style={{ marginTop: 4 }}><strong>Agent:</strong> {data.agent || '___________'}</div>
                </td>
              </tr>
            </tbody>
          </table>
          <div style={sec}>SECTION 1 - INBOUND BARS</div>
          <table style={{ borderCollapse: 'collapse', width: '100%' }}>
            <thead><tr>
              <th style={th}>Bar Number</th><th style={th}>Pieces</th><th style={th}>Weight (kg)</th><th style={th}>Seal No.</th><th style={th}>Condition</th><th style={th}>Signature</th>
            </tr></thead>
            <tbody>
              {[1,2,3,4].map(i => (
                <tr key={i}>
                  <td style={td}>{i === 1 ? (data.bar || '') : ''}</td>
                  <td style={td}>{i === 1 ? (data.pieces || '') : ''}</td>
                  <td style={td}></td><td style={td}></td><td style={td}></td><td style={td}></td>
                </tr>
              ))}
            </tbody>
          </table>
          <div style={sec}>SECTION 2 - BAR STORAGE</div>
          <table style={{ borderCollapse: 'collapse', width: '100%' }}>
            <tbody>
              <tr><td style={td}><strong>Storage Location:</strong></td><td style={td}></td><td style={td}><strong>Date Stored:</strong></td><td style={td}>{data.date || ''}</td></tr>
              <tr><td style={td}><strong>Stored By:</strong></td><td style={td}>{data.agent || ''}</td><td style={td}><strong>Signature:</strong></td><td style={td}></td></tr>
              <tr><td style={{ ...td }} colSpan={2}><strong>All seals intact?</strong></td><td style={yn}>YES</td><td style={yn}>NO</td></tr>
            </tbody>
          </table>
          <div style={sec}>SECTION 3 - BAR PACKING</div>
          <table style={{ borderCollapse: 'collapse', width: '100%' }}>
            <tbody>
              <tr><td style={td}><strong>Packed By:</strong></td><td style={td}></td><td style={td}><strong>Date:</strong></td><td style={td}></td></tr>
              <tr><td style={td}><strong>Pieces Packed:</strong></td><td style={td}>{data.pieces || ''}</td><td style={td}><strong>Signature:</strong></td><td style={td}></td></tr>
              <tr><td style={td}><strong>New Seal No.:</strong></td><td style={td}></td><td style={td}><strong>Weight:</strong></td><td style={td}></td></tr>
            </tbody>
          </table>
          <div style={sec}>SECTION 4 - RE-SEALED VERIFICATION</div>
          <table style={{ borderCollapse: 'collapse', width: '100%' }}>
            <tbody>
              <tr><td style={td}><strong>Verified By:</strong></td><td style={td}></td><td style={td}><strong>Date:</strong></td><td style={td}></td></tr>
              <tr><td style={td}><strong>Seal No. Confirmed:</strong></td><td style={td}></td><td style={td}><strong>Signature:</strong></td><td style={td}></td></tr>
              <tr><td style={{ ...td }} colSpan={2}><strong>Carton sealed correctly?</strong></td><td style={yn}>YES</td><td style={yn}>NO</td></tr>
            </tbody>
          </table>
          <div style={sec}>SECTION 5 - BAR COMPLETION</div>
          <table style={{ borderCollapse: 'collapse', width: '100%' }}>
            <tbody>
              <tr><td style={td}><strong>Completed By:</strong></td><td style={td}></td><td style={td}><strong>Date:</strong></td><td style={td}></td></tr>
              <tr><td style={td}><strong>C209 Ref:</strong></td><td style={td}>{data.c209 || ''}</td><td style={td}><strong>Bar No:</strong></td><td style={td}>{data.bar || ''}</td></tr>
              <tr><td style={td}><strong>All items accounted?</strong></td><td style={yn}>YES</td><td style={yn}>NO</td><td style={td}></td></tr>
              {data.notes && <tr><td style={td}><strong>Notes:</strong></td><td style={{ ...td }} colSpan={3}>{data.notes}</td></tr>}
            </tbody>
          </table>
          <div style={sec}>SECTION 6 - DISPATCH SHEET</div>
          <table style={{ borderCollapse: 'collapse', width: '100%' }}>
            <thead><tr>
              <th style={th}>Flight No.</th><th style={th}>Destination</th><th style={th}>Date</th><th style={th}>Pieces</th><th style={th}>Loaded By</th><th style={th}>Signature</th>
            </tr></thead>
            <tbody>
              {[1,2,3].map(i => <tr key={i}><td style={td}></td><td style={td}></td><td style={td}></td><td style={td}></td><td style={td}></td><td style={td}></td></tr>)}
            </tbody>
          </table>
          {data.photo && (
            <div style={{ marginTop: 8, border: '1px solid #000', padding: 8 }}>
              <div style={{ fontWeight: 700, marginBottom: 4 }}>CONFIRMATION PHOTO</div>
              <img src={data.photo} alt="Confirmation" style={{ maxWidth: '100%', maxHeight: 200 }} />
            </div>
          )}
          <div style={{ marginTop: 8, fontSize: 8, color: '#555', textAlign: 'center' as const, borderTop: '1px solid #000', paddingTop: 4 }}>
            dnata - An Emirates Group Company | IN BOND CONTROL SHEET | System C209/C208
          </div>
        </div>
      </div>
    </div>
  );
}
