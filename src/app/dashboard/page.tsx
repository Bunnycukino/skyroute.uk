'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
export default function DashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState({ totalEntries: 0, todayEntries: 0, expiringSoon: 0, totalFlights: 0 });
  const [recentEntries, setRecentEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/entries?limit=20');
        if (res.status === 401) { router.push('/'); return; }
        const data = await res.json();
        setRecentEntries(data.entries || []);
        setStats(data.stats || {});
      } catch {
        // DB might not be connected yet
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [router]);
  async function handleSignOut() {
    await fetch('/api/auth', { method: 'DELETE' });
    router.push('/');
  }
  function getExpiryStatus(createdAt: string, type: string) {
    if (type === 'ramp_input') return null;
    const created = new Date(createdAt);
    const now = new Date();
    const hoursElapsed = (now.getTime() - created.getTime()) / (1000 * 60 * 60);
    const hoursLeft = 48 - hoursElapsed;
    if (hoursLeft < 0) return { label: 'WYGASL', color: 'bg-red-500/20 text-red-300' };
    if (hoursLeft < 12) return { label: `${Math.floor(hoursLeft)}h`, color: 'bg-orange-500/20 text-orange-300' };
    return { label: `${Math.floor(hoursLeft)}h`, color: 'bg-green-500/20 text-green-300' };
  }
  return (
    <div className="min-h-screen bg-background flex">
      <aside className="w-64 bg-card border-r border-border flex flex-col">
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
          <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2 rounded-lg bg-primary/10 text-primary font-medium text-sm">
            <span>📊</span> Dashboard
          </Link>
          <Link href="/ramp" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-accent transition-colors text-sm text-muted-foreground hover:text-foreground">
            <span>✈️</span> C209 Input ( Ramp Input )
          </Link>
          <Link href="/logistic" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-accent transition-colors text-sm text-muted-foreground hover:text-foreground">
            <span>📦</span> C208 Input ( Logistic Input )
          </Link>
          <Link href="/entries" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-accent transition-colors text-sm text-muted-foreground hover:text-foreground">
            <span>🗂️</span> All Entries
          </Link>
        </nav>
        <div className="pt-4 mt-4 border-t border-border">
          <button onClick={handleSignOut} className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-destructive/10 text-sm text-muted-foreground w-full">
            <span>🚪</span> Wyloguj
          </button>
        </div>
      </aside>
      <main className="flex-1 p-8 overflow-y-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">System C209 - Ramp &amp; Logistic Operations</p>
        </header>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Wszystkie wpisy', value: stats.totalEntries, icon: '📋', color: '' },
            { label: 'Dzisiaj', value: stats.todayEntries, icon: '📅', color: '' },
            { label: 'Wygasają wkrótce', value: stats.expiringSoon, icon: '⏳', color: stats.expiringSoon > 0 ? 'text-orange-400' : '' },
            { label: 'Loty dzisiaj', value: stats.totalFlights, icon: '✈️', color: '' },
          ].map((stat) => (
            <div key={stat.label} className="bg-card border border-border rounded-2xl shadow-sm p-4">
              <div className="flex justify-between items-start mb-2">
                <span className="text-muted-foreground text-sm font-medium">{stat.label}</span>
                <span className="text-lg">{stat.icon}</span>
              </div>
              <div className={`text-2xl font-bold ${stat.color || ''}`}>
                {loading ? '...' : stat.value ?? 0}
              </div>
            </div>
          ))}
        </div>
        <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
          <div className="p-6 border-b border-border flex justify-between items-center bg-muted/30">
            <h3 className="font-bold text-lg">Ostatnie wpisy</h3>
            <div className="flex gap-2">
              <Link href="/ramp" className="text-xs bg-primary text-primary-foreground px-3 py-1.5 rounded-lg font-bold hover:opacity-90">+ Ramp</Link>
              <Link href="/logistic" className="text-xs bg-teal-600 text-white px-3 py-1.5 rounded-lg font-bold hover:opacity-90">+ Logistic</Link>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="bg-muted/50 border-b border-border text-muted-foreground uppercase text-[10px] tracking-wider">
                  <th className="px-4 py-3 font-semibold">C209</th>
                  <th className="px-4 py-3 font-semibold">Flight Date</th>
                  <th className="px-4 py-3 font-semibold">Month</th>
                  <th className="px-4 py-3 font-semibold">Bar Number</th>
                  <th className="px-4 py-3 font-semibold">Pieces</th>
                  <th className="px-4 py-3 font-semibold">Flight</th>
                  <th className="px-4 py-3 font-semibold">C208</th>
                  <th className="px-4 py-3 font-semibold">Flags</th>
                  <th className="px-4 py-3 font-semibold">Podpis</th>
                  <th className="px-4 py-3 font-semibold">Ważność</th>
                  <th className="px-4 py-3 font-semibold">Data</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={11} className="px-4 py-12 text-center text-muted-foreground">Ładowanie danych...</td></tr>
                ) : recentEntries.length === 0 ? (
                  <tr><td colSpan={11} className="px-4 py-12 text-center text-muted-foreground">Brak wpisów w systemie.</td></tr>
                ) : (
                  recentEntries.map((entry: any) => {
                    const expiry = getExpiryStatus(entry.created_at, entry.type);
                    const date = new Date(entry.created_at);
                    const monthPrefix = getMonthPrefix(date);
                    return (
                      <tr key={entry.id} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                        <td className="px-4 py-3 font-mono font-bold text-primary">{entry.c209_number || '-'}</td>
                        <td className="px-4 py-3 text-muted-foreground">{date.toLocaleDateString('pl-PL')}</td>
                        <td className="px-4 py-3 text-[10px] font-bold text-muted-foreground">{monthPrefix}</td>
                        <td className="px-4 py-3 font-mono">{entry.bar_number || entry.container_code || '-'}</td>
                        <td className="px-4 py-3 font-medium">{entry.pieces ?? '-'}</td>
                        <td className="px-4 py-3 font-bold">{entry.flight_number || '-'}</td>
                        <td className="px-4 py-3 font-mono text-muted-foreground">{entry.c208_number || '-'}</td>
                        <td className="px-4 py-3">
                          <div className="flex gap-1">
                            {entry.type === 'ramp_input' && <span className="bg-gray-500/20 text-gray-400 text-[9px] px-1.5 py-0.5 rounded border border-gray-500/30">RAMP</span>}
                            {entry.type === 'logistic_input' && <span className="bg-teal-500/20 text-teal-400 text-[9px] px-1.5 py-0.5 rounded border border-teal-500/30">LOG</span>}
                            {entry.is_new_build && <span className="bg-blue-500/20 text-blue-300 text-[9px] px-1.5 py-0.5 rounded border border-blue-500/30">NEW</span>}
                            {entry.is_rw_flight && <span className="bg-purple-500/20 text-purple-300 text-[9px] px-1.5 py-0.5 rounded border border-purple-500/30">RW</span>}
                          </div>
                        </td>
                        <td className="px-4 py-3 font-medium uppercase">{entry.signature || '-'}</td>
                        <td className="px-4 py-3">
                          {expiry ? (
                            <span className={`px-2 py-0.5 rounded-[4px] text-[11px] font-bold ${expiry.color}`}>
                              {expiry.label}
                            </span>
                          ) : '-'}
                        </td>
                        <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                          {date.toLocaleString('pl-PL', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
function getMonthPrefix(date: Date): string {
  const months = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];
  return months[date.getMonth()] + '-' + String(date.getFullYear()).slice(-2);
}
