'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const TABS = [
  { id: 'ramp', label: 'C209 INPUT', endpoint: '/api/entries?type=ramp_input' },
  { id: 'logistic', label: 'C208 INPUT', endpoint: '/api/entries?type=logistic_input' },
  { id: 'log_entries', label: 'C209 + C208 LOG', endpoint: '/api/entries' },
  { id: 'expiry', label: 'C209 Expiry Tracker', endpoint: '/api/tracker' },
  { id: 'reallocation', label: 'REALLOCATION REGISTER', endpoint: '/api/reallocation' },
];

export default function SheetsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('ramp');
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const tab = TABS.find(t => t.id === activeTab);
        const res = await fetch(tab?.endpoint || '');
        if (res.status === 401) { router.push('/'); return; }
        const json = await res.json();
        // Handle different response structures (entries vs rows)
        setData(json.entries || json.rows || []);
      } catch (err) {
        console.error('Failed to fetch sheet data');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [activeTab, router]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header / Nav */}
      <div className="bg-card border-b border-border p-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="text-primary font-bold hover:underline">← Back to Dashboard</Link>
          <h1 className="text-xl font-bold">VBA Sheets View</h1>
        </div>
        <div className="flex gap-2">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                activeTab === tab.id 
                ? 'bg-primary text-primary-foreground shadow-md' 
                : 'bg-muted text-muted-foreground hover:bg-accent hover:text-foreground'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 p-6 overflow-auto">
        <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            {loading ? (
              <div className="p-20 text-center text-muted-foreground animate-pulse font-bold">Loading sheet data...</div>
            ) : data.length === 0 ? (
              <div className="p-20 text-center text-muted-foreground">No data found in this sheet.</div>
            ) : (
              <table className="w-full text-xs text-left font-mono">
                <thead className="bg-muted/50 border-b border-border text-muted-foreground uppercase tracking-wider">
                  <tr>
                    {Object.keys(data[0]).map(key => (
                      <th key={key} className="px-4 py-3 font-bold border-r border-border/30 last:border-0">{key}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {data.map((row, i) => (
                    <tr key={i} className="hover:bg-muted/30 transition-colors">
                      {Object.values(row).map((val: any, j) => (
                        <td key={j} className="px-4 py-2 border-r border-border/30 last:border-0 whitespace-nowrap">
                          {val === null ? '-' : typeof val === 'boolean' ? (val ? 'TRUE' : 'FALSE') : String(val)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
