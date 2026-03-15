'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function ReallocationPage() {
  const router = useRouter();
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [c208Input, setC208Input] = useState('');
  const [adding, setAdding] = useState(false);
  const [autoFilling, setAutoFilling] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const res = await fetch('/api/reallocation');
      if (res.status === 401) { router.push('/'); return; }
      const data = await res.json();
      setRows(data.rows || []);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }

  async function handleAddRow() {
    if (!c208Input.trim()) return;
    setAdding(true);
    try {
      const res = await fetch('/api/reallocation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ c208_number: c208Input.trim() }),
      });
      if (!res.ok) throw new Error('Failed to add row');
      setC208Input('');
      setMessage('Wiersz dodany!');
      await loadData();
    } catch (e: any) {
      setMessage(e.message);
    } finally {
      setAdding(false);
      setTimeout(() => setMessage(''), 3000);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Usunąć ten wpis?')) return;
    try {
      await fetch(`/api/reallocation?id=${id}`, { method: 'DELETE' });
      await loadData();
    } catch {
      // ignore
    }
  }

  async function handleAutoFill() {
    setAutoFilling(true);
    try {
      const res = await fetch('/api/reallocation', { method: 'PATCH' });
      const data = await res.json();
      setMessage(`Dane automatycznie uzupełnione! (${data.updatedCount || 0} wpisów)`);
      await loadData();
    } catch (e: any) {
      setMessage(e.message);
    } finally {
      setAutoFilling(false);
      setTimeout(() => setMessage(''), 4000);
    }
  }

  async function handleSignOut() {
    await fetch('/api/auth', { method: 'DELETE' });
    router.push('/');
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
          <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-accent transition-colors text-sm text-muted-foreground hover:text-foreground">
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
          <Link href="/reallocation" className="flex items-center gap-3 px-3 py-2 rounded-lg bg-primary/10 text-primary font-medium text-sm">
            <span>🔄</span> Reallocation Register
          </Link>
          <Link href="/sheets" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-accent transition-colors text-sm text-muted-foreground hover:text-foreground border-t border-border/50 pt-3 mt-3">
            <span>📑</span> VBA Sheets View
          </Link>
        </nav>
        <div className="pt-4 mt-4 border-t border-border p-4">
          <button onClick={handleSignOut} className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-destructive/10 text-sm text-muted-foreground w-full">
            <span>🚪</span> Wyloguj
          </button>
        </div>
      </aside>

      <main className="flex-1 p-8 overflow-y-auto">
        <header className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight">Reallocation Register</h1>
          <p className="text-muted-foreground">Rejestr realokacji - powiązanie C208 z C209, BAR, lotem i datą</p>
        </header>

        {message && (
          <div className="mb-4 px-4 py-2 bg-green-100 text-green-700 rounded-lg text-sm border border-green-300">
            {message}
          </div>
        )}

        <div className="bg-card border border-border rounded-2xl shadow-sm mb-6">
          <div className="p-5 border-b border-border flex flex-wrap gap-3 items-center justify-between">
            <div className="flex gap-2 items-center">
              <input
                type="text"
                value={c208Input}
                onChange={(e) => setC208Input(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddRow()}
                placeholder="Wpisz numer C208..."
                className="px-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary w-56"
              />
              <button
                onClick={handleAddRow}
                disabled={adding || !c208Input.trim()}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-bold hover:opacity-90 disabled:opacity-50"
              >
                {adding ? 'Dodawanie...' : '+ Dodaj wiersz'}
              </button>
            </div>
            <button
              onClick={handleAutoFill}
              disabled={autoFilling}
              className="px-4 py-2 bg-teal-600 text-white rounded-lg text-sm font-bold hover:opacity-90 disabled:opacity-50"
            >
              {autoFilling ? 'Uzupełnianie...' : '🔄 Auto-uzupełnij z C209'}
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="bg-muted/50 border-b border-border text-muted-foreground uppercase text-[10px] tracking-wider">
                  <th className="px-4 py-3 font-semibold">C208</th>
                  <th className="px-4 py-3 font-semibold">Numer BAR</th>
                  <th className="px-4 py-3 font-semibold">C209</th>
                  <th className="px-4 py-3 font-semibold">Lot</th>
                  <th className="px-4 py-3 font-semibold">Data</th>
                  <th className="px-4 py-3 font-semibold">Akcje</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">Ładowanie...</td></tr>
                ) : rows.length === 0 ? (
                  <tr><td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">Brak wpisów w rejestrze realokacji.</td></tr>
                ) : (
                  rows.map((row: any) => (
                    <tr key={row.id} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                      <td className="px-4 py-3 font-mono font-bold text-muted-foreground">{row.c208_number || '-'}</td>
                      <td className="px-4 py-3 font-mono font-bold">
                        {row.bar_number ? (
                          <span className="text-green-600">{row.bar_number}</span>
                        ) : (
                          <span className="text-orange-400 text-xs">Oczekuje...</span>
                        )}
                      </td>
                      <td className="px-4 py-3 font-mono text-primary">{row.c209_number || '-'}</td>
                      <td className="px-4 py-3 font-bold">{row.flight_number || '-'}</td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {row.date ? new Date(row.date).toLocaleDateString('pl-PL') : '-'}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => handleDelete(row.id)}
                          className="px-2 py-1 text-xs bg-destructive/10 text-destructive rounded hover:bg-destructive/20"
                        >
                          Usuń
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
