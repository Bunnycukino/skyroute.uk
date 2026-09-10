'use client';
import { useEffect, useState, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/Sidebar';

// Column definitions: key, label, accessor function, style type
const COLUMNS = [
  { key: 'c209', label: 'C209 Number', accessor: (e: any) => e.c209_number || '-', type: 'ramp' },
  { key: 'date', label: 'Date', accessor: (e: any) => e.created_at ? new Date(e.created_at).toLocaleDateString('en-GB') : '-', type: 'ramp' },
  { key: 'time', label: 'Time', accessor: (e: any) => e.created_at ? new Date(e.created_at).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) : '-', type: 'ramp' },
  { key: 'month', label: 'Month-Year', accessor: (e: any) => e.created_at ? (() => { const d = new Date(e.created_at); const m = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']; return m[d.getMonth()] + '-' + String(d.getFullYear()).slice(-2); })() : '-', type: 'ramp' },
  { key: 'bar', label: 'Bar Number', accessor: (e: any) => e.bar_number || e.container_code || '-', type: 'ramp' },
  { key: 'pieces', label: 'Pieces', accessor: (e: any) => e.pieces != null ? String(e.pieces) : '-', type: 'ramp' },
  { key: 'flight', label: 'Flight Number', accessor: (e: any) => e.flight_number || '-', type: 'ramp' },
  { key: 'sign', label: 'Signature', accessor: (e: any) => e.signature || '-', type: 'ramp' },
  { key: 'c208', label: 'C208 Number', accessor: (e: any) => e.c208_number || '-', type: 'log' },
  { key: 'fdate', label: 'Flight Date', accessor: (e: any) => e.outbound_date ? new Date(e.outbound_date).toLocaleDateString('en-GB') : '-', type: 'log' },
  { key: 'ftime', label: 'Time', accessor: (e: any) => e.updated_at ? new Date(e.updated_at).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) : '-', type: 'log' },
  { key: 'fmonth', label: 'Month-Year', accessor: (e: any) => e.outbound_date ? (() => { const d = new Date(e.outbound_date); const m = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']; return m[d.getMonth()] + '-' + String(d.getFullYear()).slice(-2); })() : '-', type: 'log' },
  { key: 'fflight', label: 'Flight Number', accessor: (e: any) => e.outbound_flight || '-', type: 'log' },
  { key: 'fbar', label: 'Bar Number', accessor: (e: any) => e.outbound_bar_number || '-', type: 'log' },
  { key: 'fpieces', label: 'Pieces', accessor: (e: any) => e.outbound_pieces != null ? String(e.outbound_pieces) : '-', type: 'log' },
  { key: 'fsign', label: 'Signature', accessor: (e: any) => e.outbound_signature || '-', type: 'log' },
  { key: 'comment', label: 'Ramp Comment', accessor: (e: any) => e.notes || '-', type: 'comment' },
];

export default function EntriesPage() {
  const router = useRouter();
  const [entries, setEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [currentUser, setCurrentUser] = useState('');
  const [filterCol, setFilterCol] = useState<string | null>(null);
  const [filters, setFilters] = useState<Record<string, Set<string>>>({});
  const [sortCol, setSortCol] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [filterSearch, setFilterSearch] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isAdmin = currentUser === 'admin';

  useEffect(() => {
    async function load() {
      try {
        const params = new URLSearchParams({ search });
        const res = await fetch(`/api/entries?${params}`);
        if (res.status === 401) { router.push('/'); return; }
        const data = await res.json();
        setEntries(data.entries || []);
        setCurrentUser(data.user || '');
      } catch (err) { console.error('Failed to load entries'); }
      finally { setLoading(false); }
    }
    load();
  }, [search, router]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setFilterCol(null);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  async function handleDelete(id: number) {
    if (!confirm('Delete this entry?')) return;
    try {
      await fetch(`/api/entries?id=${id}`, { method: 'DELETE' });
      setEntries(entries.filter(e => e.id !== id));
    } catch (err) { alert('Failed to delete'); }
  }

  // Get unique values for a column
  const uniqueValues = useMemo(() => {
    if (!filterCol) return [];
    const col = COLUMNS.find(c => c.key === filterCol);
    if (!col) return [];
    const vals = new Set<string>();
    entries.forEach(e => vals.add(col.accessor(e)));
    let arr = Array.from(vals).sort();
    if (filterSearch) {
      arr = arr.filter(v => v.toLowerCase().includes(filterSearch.toLowerCase()));
    }
    return arr;
  }, [filterCol, entries, filterSearch]);

  // Filtered + sorted entries
  const displayEntries = useMemo(() => {
    let result = [...entries];
    // Apply column filters
    for (const [colKey, selected] of Object.entries(filters)) {
      if (selected.size === 0) continue;
      const col = COLUMNS.find(c => c.key === colKey);
      if (!col) continue;
      result = result.filter(e => selected.has(col.accessor(e)));
    }
    // Apply sort
    if (sortCol) {
      const col = COLUMNS.find(c => c.key === sortCol);
      if (col) {
        result.sort((a, b) => {
          const va = col.accessor(a);
          const vb = col.accessor(b);
          if (va < vb) return sortDir === 'asc' ? -1 : 1;
          if (va > vb) return sortDir === 'asc' ? 1 : -1;
          return 0;
        });
      }
    }
    return result;
  }, [entries, filters, sortCol, sortDir]);

  function toggleFilterValue(colKey: string, value: string) {
    setFilters(prev => {
      const next = { ...prev };
      if (!next[colKey]) next[colKey] = new Set();
      if (next[colKey].has(value)) {
        next[colKey].delete(value);
      } else {
        next[colKey].add(value);
      }
      return { ...next };
    });
  }

  function selectAllFilter(colKey: string) {
    const col = COLUMNS.find(c => c.key === colKey);
    if (!col) return;
    const vals = new Set<string>();
    entries.forEach(e => vals.add(col.accessor(e)));
    setFilters(prev => ({ ...prev, [colKey]: vals }));
  }

  function clearFilter(colKey: string) {
    setFilters(prev => {
      const next = { ...prev };
      delete next[colKey];
      return next;
    });
  }

  function clearAllFilters() {
    setFilters({});
    setSortCol(null);
    setSortDir('asc');
  }

  function handleHeaderClick(colKey: string) {
    if (filterCol === colKey) {
      setFilterCol(null);
    } else {
      setFilterCol(colKey);
      setFilterSearch('');
    }
  }

  function handleSort(colKey: string) {
    if (sortCol === colKey) {
      setSortDir(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortCol(colKey);
      setSortDir('asc');
    }
  }

  const activeFilterCount = Object.values(filters).filter(s => s.size > 0).length;

  const thBase = { padding: '8px 10px', textAlign: 'left' as const, fontWeight: 700, fontSize: 11, textTransform: 'uppercase' as const, whiteSpace: 'nowrap' as const, border: '1px solid #e5e7eb', cursor: 'pointer', userSelect: 'none' as const };
  const td = { padding: '8px 10px', fontSize: 12, whiteSpace: 'nowrap' as const, border: '1px solid #e5e7eb' };
  const tdRamp = { ...td, background: '#fefce8' };
  const tdLog = { ...td, background: '#f0fdf4' };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f8fafa' }} className="entries-container">
      <Sidebar active="/entries" />
      <main style={{ flex: 1, padding: '16px' }} className="main-content">
        <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 700, color: '#111827', margin: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
              📄 C209/C208 Register
            </h1>
            <input
              type="text"
              placeholder="Search all fields..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ width: 400, maxWidth: '100%', marginTop: 12, padding: '10px 14px', fontSize: 14, border: '1px solid #d1d5db', borderRadius: 8, outline: 'none' }}
            />
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <span style={{ fontSize: 12, color: '#6b7280' }}>
              {displayEntries.length} of {entries.length} rows
              {activeFilterCount > 0 && ` • ${activeFilterCount} filter${activeFilterCount > 1 ? 's' : ''} active`}
            </span>
            {activeFilterCount > 0 && (
              <button onClick={clearAllFilters} style={{ padding: '6px 12px', background: '#f3f4f6', border: '1px solid #d1d5db', borderRadius: 6, fontSize: 12, cursor: 'pointer', color: '#374151', fontWeight: 500 }}>
                ✕ Clear all filters
              </button>
            )}
          </div>
        </div>
        <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden', position: 'relative' }}>
          {loading ? (
            <div style={{ padding: 40, textAlign: 'center', color: '#6b7280' }}>Loading entries...</div>
          ) : entries.length === 0 ? (
            <div style={{ padding: 40, textAlign: 'center', color: '#6b7280' }}>No entries found</div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', minWidth: '1800px', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th colSpan={8} style={{ padding: '8px', textAlign: 'center', background: '#facc15', color: '#713f12', fontWeight: 800, fontSize: 13, textTransform: 'uppercase', border: '1px solid #ca8a04' }}>
                      RAMP INPUT (C209)
                    </th>
                    <th colSpan={8} style={{ padding: '8px', textAlign: 'center', background: '#22c55e', color: '#14532d', fontWeight: 800, fontSize: 13, textTransform: 'uppercase', border: '1px solid #16a34a' }}>
                      LOGISTIC INPUT (C208)
                    </th>
                    <th style={{ padding: '8px', textAlign: 'center', background: '#facc15', color: '#713f12', fontWeight: 800, fontSize: 13, textTransform: 'uppercase', border: '1px solid #ca8a04' }}>
                      COMMENT
                    </th>
                    <th style={{ padding: '8px', textAlign: 'center', background: '#f3f4f6', color: '#374151', fontWeight: 800, fontSize: 13, border: '1px solid #d1d5db' }}>
                      ACTIONS
                    </th>
                  </tr>
                  <tr>
                    {COLUMNS.map(col => {
                      const isFiltered = filters[col.key] && filters[col.key].size > 0;
                      const isSorted = sortCol === col.key;
                      const bg = col.type === 'ramp' ? '#fef9c3' : col.type === 'log' ? '#dcfce7' : '#fef9c3';
                      const color = col.type === 'ramp' ? '#854d0e' : col.type === 'log' ? '#166534' : '#854d0e';
                      const borderColor = col.type === 'ramp' ? '#ca8a04' : col.type === 'log' ? '#16a34a' : '#ca8a04';
                      return (
                        <th
                          key={col.key}
                          style={{ ...thBase, background: bg, color, border: `1px solid ${borderColor}` }}
                          onClick={() => handleHeaderClick(col.key)}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: 4, justifyContent: 'space-between' }}>
                            <span>{col.label}</span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                              {isSorted && <span style={{ fontSize: 10 }}>{sortDir === 'asc' ? '▲' : '▼'}</span>}
                              {isFiltered ? (
                                <span style={{ fontSize: 10, color: '#dc2626' }}>▼</span>
                              ) : (
                                <span style={{ fontSize: 10, opacity: 0.4 }}>▼</span>
                              )}
                            </span>
                          </div>
                        </th>
                      );
                    })}
                    <th style={{ ...thBase, background: '#f3f4f6', color: '#374151', border: '1px solid #d1d5db', cursor: 'default' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {displayEntries.map(entry => (
                    <tr key={entry.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                      {COLUMNS.map(col => {
                        const style = col.type === 'ramp' ? tdRamp : col.type === 'log' ? tdLog : td;
                        const isBold = col.key === 'c209' || col.key === 'c208';
                        return (
                          <td key={col.key} style={{ ...style, fontWeight: isBold ? 600 : 400, color: isBold ? '#111827' : undefined, maxWidth: col.key === 'comment' ? 200 : undefined, overflow: col.key === 'comment' ? 'hidden' : undefined, textOverflow: col.key === 'comment' ? 'ellipsis' : undefined }}>
                            {col.accessor(entry)}
                          </td>
                        );
                      })}
                      <td style={{ ...td, background: '#f9fafb' }}>
                        {isAdmin ? (
                          <button onClick={() => handleDelete(entry.id)} style={{ color: '#dc2626', background: 'none', border: 'none', cursor: 'pointer', fontSize: 11, fontWeight: 600 }}>Delete</button>
                        ) : (
                          <span style={{ color: '#d1d5db', fontSize: 11 }}>—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Filter dropdown */}
          {filterCol && (
            <div
              ref={dropdownRef}
              style={{
                position: 'absolute',
                top: 60,
                left: 20,
                background: '#fff',
                border: '1px solid #d1d5db',
                borderRadius: 8,
                boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
                zIndex: 50,
                width: 260,
                maxHeight: 400,
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <div style={{ padding: '8px 12px', borderBottom: '1px solid #e5e7eb', display: 'flex', gap: 6 }}>
                <button onClick={() => handleSort(filterCol)} style={{ flex: 1, padding: '4px 8px', background: sortCol === filterCol ? '#eff6ff' : '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 4, fontSize: 11, cursor: 'pointer', color: '#374151', fontWeight: 500 }}>
                  {sortCol === filterCol ? (sortDir === 'asc' ? '▲ Sort A-Z' : '▼ Sort Z-A') : 'Sort A-Z'}
                </button>
                <button onClick={() => selectAllFilter(filterCol)} style={{ padding: '4px 8px', background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 4, fontSize: 11, cursor: 'pointer', color: '#374151', fontWeight: 500 }}>
                  Select All
                </button>
                <button onClick={() => clearFilter(filterCol)} style={{ padding: '4px 8px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 4, fontSize: 11, cursor: 'pointer', color: '#dc2626', fontWeight: 500 }}>
                  Clear
                </button>
              </div>
              <div style={{ padding: '6px 12px', borderBottom: '1px solid #e5e7eb' }}>
                <input
                  type="text"
                  placeholder="Search values..."
                  value={filterSearch}
                  onChange={e => setFilterSearch(e.target.value)}
                  autoFocus
                  style={{ width: '100%', padding: '6px 8px', fontSize: 12, border: '1px solid #d1d5db', borderRadius: 4, outline: 'none', boxSizing: 'border-box' }}
                />
              </div>
              <div style={{ overflowY: 'auto', maxHeight: 280 }}>
                {uniqueValues.length === 0 ? (
                  <div style={{ padding: 12, textAlign: 'center', color: '#9ca3af', fontSize: 12 }}>No values</div>
                ) : (
                  uniqueValues.map(val => {
                    const checked = filters[filterCol]?.has(val) || false;
                    return (
                      <label
                        key={val}
                        className="filter-option"
                        style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 12px', cursor: 'pointer', fontSize: 12, color: '#374151' }}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleFilterValue(filterCol, val)}
                          style={{ cursor: 'pointer' }}
                        />
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{val}</span>
                      </label>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>
      </main>
      <style jsx>{`
        @media (max-width: 768px) {
          .entries-container { flex-direction: column !important; }
          .main-content { padding: 12px !important; }
          table { min-width: 1200px !important; }
        }
        .filter-option:hover { background: #f9fafb; }
      `}</style>
    </div>
  );
}
