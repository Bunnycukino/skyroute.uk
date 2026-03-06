'use client';
import { useState } from 'react';
import Link from 'next/link';

// Mirrors VBA LOGISTIC INPUT sheet (A2=C209, B2=Flight, C2=Sign, D2=Date, F2=BarNumber, G2=Pieces)
// Also matches VBA AIRLINES lookup table on the sheet
const AIRLINES = [
  { name: 'TUI Airways',       prefix: 'TA',   rw: 'RWTA'   },
  { name: 'Ryanair',           prefix: 'RYR',  rw: 'RWRYR'  },
  { name: 'EasyJet',           prefix: 'EZ',   rw: 'RWEZ'   },
  { name: 'Singapore Airlines',prefix: 'POLY', rw: 'RWPOLY' },
  { name: 'Emirates',          prefix: 'EK',   rw: 'RWEK'   },
];

export default function LogisticInputPage() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<{c209: string; c208: string} | null>(null);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    c209_number: '',       // A2 - C209 number (or 'NEW BUILD')
    flight_number: '',     // B2 - Flight number
    signature: '',         // C2 - Signature
    date_received: new Date().toISOString().split('T')[0], // D2 - Flight date
    bar_number: '',        // F2 - Bar number (for NEW BUILD only)
    pieces: '',            // G2 - Pieces (for NEW BUILD only)
    notes: '',
  });

  // Whether this is a NEW BUILD entry (mirrors VBA: isNewBuild = c209Number = 'NEW BUILD')
  const isNewBuild = formData.c209_number.toUpperCase().trim() === 'NEW BUILD';
  // Whether this is a RW (rewarehouse) flight (mirrors VBA: UCase(Left(flightNumber, 2)) = 'RW')
  const isRW = formData.flight_number.toUpperCase().trim().startsWith('RW');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(null);

    const c209Input = formData.c209_number.trim().toUpperCase();
    // Mirrors VBA: If flightNumber = '' Then MsgBox ... : GoTo CleanUp
    if (!formData.flight_number.trim()) {
      setError('Flight Number is required (LOGISTIC INPUT B2).');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/entries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'logistic_input',
          c209_number: c209Input,
          flight_number: formData.flight_number.toUpperCase(),
          signature: formData.signature.toUpperCase(),
          date_received: formData.date_received,
          // Bar number and pieces only relevant for NEW BUILD
          container_code: isNewBuild ? formData.bar_number.toUpperCase() : '',
          bar_number: isNewBuild ? formData.bar_number.toUpperCase() : '',
          pieces: parseInt(formData.pieces) || 0,
          notes: formData.notes,
          is_new_build: isNewBuild,
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Save error');
      setSuccess({ c209: data.c209, c208: data.c208 });
      setFormData({
        c209_number: '',
        flight_number: '',
        signature: '',
        date_received: new Date().toISOString().split('T')[0],
        bar_number: '',
        pieces: '',
        notes: '',
      });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6">
      <div className="max-w-lg mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-blue-400">LOGISTIC INPUT</h1>
          <Link href="/dashboard" className="text-sm text-gray-400 hover:text-white">← Dashboard</Link>
        </div>
        <p className="text-gray-400 text-sm mb-6">
          Mirrors <strong>C208 INPUT</strong> sheet — generates C208 outbound number and links to existing C209 RAMP entry.
        </p>

        {/* Airline reference table - mirrors VBA sheet lookup table */}
        <div className="bg-gray-900 rounded-lg p-4 mb-6 text-xs">
          <p className="text-gray-400 font-semibold mb-2">AIRLINE PREFIX REFERENCE</p>
          <table className="w-full">
            <thead>
              <tr className="text-gray-500">
                <th className="text-left">Airline</th>
                <th className="text-right">Prefix</th>
                <th className="text-right">RW Prefix</th>
              </tr>
            </thead>
            <tbody>
              {AIRLINES.map(a => (
                <tr key={a.name} className="border-t border-gray-800">
                  <td className="py-1 text-gray-300">{a.name}</td>
                  <td className="text-right text-yellow-300">{a.prefix}</td>
                  <td className="text-right text-orange-300">{a.rw}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* A2 - C209 Number (or NEW BUILD) */}
          <div>
            <label className="block text-sm text-gray-400 mb-1">
              C209 Number <span className="text-gray-500">(or type NEW BUILD)</span>
            </label>
            <input
              type="text"
              value={formData.c209_number}
              onChange={e => setFormData(p => ({ ...p, c209_number: e.target.value }))}
              placeholder="e.g. MAR0001 or NEW BUILD"
              className="w-full bg-gray-800 rounded px-3 py-2 text-white"
            />
            {isNewBuild && (
              <p className="text-yellow-400 text-xs mt-1">⚠️ NEW BUILD mode — bar number and pieces required below</p>
            )}
            {isRW && (
              <p className="text-orange-400 text-xs mt-1">⚠️ RW flight detected — C208 will be set to &quot;RW&quot;</p>
            )}
          </div>

          {/* B2 - Flight Number */}
          <div>
            <label className="block text-sm text-gray-400 mb-1">Flight Number (B2)</label>
            <input
              type="text"
              value={formData.flight_number}
              onChange={e => setFormData(p => ({ ...p, flight_number: e.target.value }))}
              placeholder="e.g. EK123 or RWEK123"
              required
              className="w-full bg-gray-800 rounded px-3 py-2 text-white"
            />
          </div>

          {/* C2 - Signature */}
          <div>
            <label className="block text-sm text-gray-400 mb-1">Signature (C2)</label>
            <input
              type="text"
              value={formData.signature}
              onChange={e => setFormData(p => ({ ...p, signature: e.target.value }))}
              placeholder="Initials"
              className="w-full bg-gray-800 rounded px-3 py-2 text-white"
            />
          </div>

          {/* D2 - Flight Date */}
          <div>
            <label className="block text-sm text-gray-400 mb-1">Flight Date (D2)</label>
            <input
              type="date"
              value={formData.date_received}
              onChange={e => setFormData(p => ({ ...p, date_received: e.target.value }))}
              className="w-full bg-gray-800 rounded px-3 py-2 text-white"
            />
          </div>

          {/* F2 + G2 - Bar Number and Pieces (NEW BUILD only, or optional override) */}
          {/* Mirrors VBA: logisticBarNumber (F2) and logisticPieces (G2) */}
          <div className={`grid grid-cols-2 gap-3 ${!isNewBuild ? 'opacity-50' : ''}`}>
            <div>
              <label className="block text-sm text-gray-400 mb-1">
                Bar Number (F2){isNewBuild ? '' : ' — NEW BUILD only'}
              </label>
              <input
                type="text"
                value={formData.bar_number}
                onChange={e => setFormData(p => ({ ...p, bar_number: e.target.value }))}
                placeholder="e.g. POLY"
                disabled={!isNewBuild}
                className="w-full bg-gray-800 rounded px-3 py-2 text-white disabled:cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">
                Pieces (G2){isNewBuild ? '' : ' — NEW BUILD only'}
              </label>
              <input
                type="number"
                value={formData.pieces}
                onChange={e => setFormData(p => ({ ...p, pieces: e.target.value }))}
                placeholder="0"
                disabled={!isNewBuild}
                className="w-full bg-gray-800 rounded px-3 py-2 text-white disabled:cursor-not-allowed"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm text-gray-400 mb-1">Notes</label>
            <input
              type="text"
              value={formData.notes}
              onChange={e => setFormData(p => ({ ...p, notes: e.target.value }))}
              placeholder="Optional"
              className="w-full bg-gray-800 rounded px-3 py-2 text-white"
            />
          </div>

          {error && (
            <div className="bg-red-900/40 border border-red-500 rounded p-3 text-red-300 text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-900/40 border border-green-500 rounded p-4 text-sm">
              <p className="text-green-300 font-bold mb-2">LOGISTIC data saved!</p>
              <p>C209: <span className="font-mono text-yellow-300">{success.c209}</span></p>
              <p>C208: <span className="font-mono text-blue-300">{success.c208}</span></p>
              {success.c208 === 'RW' && (
                <p className="text-orange-300 mt-1">Bar marked as REWAREHOUSED</p>
              )}
              <Link
                href={`/in-bond?c209=${success.c209}`}
                className="mt-3 inline-block bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm"
              >
                Print InBond Form
              </Link>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white py-3 rounded font-semibold"
          >
            {loading ? 'Saving...' : 'AddEntry'}
          </button>
        </form>
      </div>
    </div>
  );
}
