'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/Sidebar';

export default function UsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [newUser, setNewUser] = useState({ username: '', password: '', role: 'ramp' });
  const [editUser, setEditUser] = useState({ password: '', role: 'ramp', active: true });

  useEffect(() => {
    loadUsers();
  }, []);

  async function loadUsers() {
    setLoading(true);
    try {
      const res = await fetch('/api/users');
      if (res.status === 401) { router.push('/'); return; }
      if (res.status === 403) { router.push('/entries'); return; }
      const data = await res.json();
      setUsers(data.users || []);
    } catch (err) { setError('Failed to load users'); }
    finally { setLoading(false); }
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setShowAdd(false);
      setNewUser({ username: '', password: '', role: 'ramp' });
      await loadUsers();
    } catch (err: any) { setError(err.message); }
  }

  async function handleUpdate(id: number) {
    try {
      const res = await fetch('/api/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, password: editUser.password || undefined, role: editUser.role, active: editUser.active })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setEditingId(null);
      await loadUsers();
    } catch (err: any) { setError(err.message); }
  }

  async function handleDelete(id: number, username: string) {
    if (!confirm(`Delete user "${username}"?`)) return;
    try {
      const res = await fetch(`/api/users?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      await loadUsers();
    } catch (err: any) { setError(err.message); }
  }

  const inputStyle = { width: '100%', border: '1px solid #e5e7eb', borderRadius: 6, padding: '8px 12px', fontSize: 14, outline: 'none', boxSizing: 'border-box' as const };
  const labelStyle = { display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 4 };
  const roleColors: Record<string, string> = { admin: '#dc2626', ramp: '#2563eb', cargo: '#059669' };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f9fafb' }}>
      <Sidebar active="/users" />
      <main style={{ flex: 1, padding: 32 }}>
        <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 700, color: '#111827', margin: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
              👥 Manage Users
            </h1>
            <p style={{ color: '#6b7280', fontSize: 14, marginTop: 4 }}>Add, edit, and manage user accounts and access</p>
          </div>
          <button onClick={() => setShowAdd(!showAdd)} style={{ padding: '10px 20px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 600, fontSize: 14, cursor: 'pointer' }}>
            + Add User
          </button>
        </div>

        {error && (
          <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '12px 16px', marginBottom: 16, color: '#dc2626', fontSize: 14 }}>
            {error}
          </div>
        )}

        {showAdd && (
          <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e5e7eb', padding: 20, marginBottom: 16 }}>
            <h2 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 600 }}>New User</h2>
            <form onSubmit={handleAdd} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: 12, alignItems: 'end' }}>
              <div>
                <label style={labelStyle}>Username</label>
                <input style={inputStyle} placeholder="e.g. john" value={newUser.username} onChange={e => setNewUser({ ...newUser, username: e.target.value })} required />
              </div>
              <div>
                <label style={labelStyle}>Password</label>
                <input style={inputStyle} type="password" placeholder="Password" value={newUser.password} onChange={e => setNewUser({ ...newUser, password: e.target.value })} required />
              </div>
              <div>
                <label style={labelStyle}>Role</label>
                <select style={inputStyle} value={newUser.role} onChange={e => setNewUser({ ...newUser, role: e.target.value })}>
                  <option value="ramp">Ramp</option>
                  <option value="cargo">Cargo</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button type="submit" style={{ padding: '8px 16px', background: '#10b981', color: '#fff', border: 'none', borderRadius: 6, fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>Create</button>
                <button type="button" onClick={() => setShowAdd(false)} style={{ padding: '8px 16px', background: '#f3f4f6', color: '#374151', border: '1px solid #e5e7eb', borderRadius: 6, fontWeight: 500, fontSize: 13, cursor: 'pointer' }}>Cancel</button>
              </div>
            </form>
          </div>
        )}

        {loading ? (
          <div style={{ padding: 40, textAlign: 'center', color: '#6b7280' }}>Loading users...</div>
        ) : (
          <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e5e7eb', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f9fafb' }}>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase' }}>Username</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase' }}>Role</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase' }}>Status</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase' }}>Created</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                    <td style={{ padding: '12px 16px', fontSize: 14, fontWeight: 600, color: '#111827' }}>{u.username}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ padding: '4px 10px', borderRadius: 12, fontSize: 11, fontWeight: 600, color: '#fff', background: roleColors[u.role] || '#6b7280', textTransform: 'uppercase' }}>
                        {u.role}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ padding: '4px 10px', borderRadius: 12, fontSize: 11, fontWeight: 600, color: u.active ? '#10b981' : '#dc2626', background: u.active ? '#d1fae5' : '#fee2e2' }}>
                        {u.active ? 'Active' : 'Disabled'}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: 13, color: '#6b7280' }}>
                      {u.created_at ? new Date(u.created_at).toLocaleDateString('en-GB') : '-'}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      {editingId === u.id ? (
                        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                          <input type="password" placeholder="New password" style={{ ...inputStyle, width: 120 }} value={editUser.password} onChange={e => setEditUser({ ...editUser, password: e.target.value })} />
                          <select style={{ ...inputStyle, width: 90 }} value={editUser.role} onChange={e => setEditUser({ ...editUser, role: e.target.value })}>
                            <option value="ramp">Ramp</option>
                            <option value="cargo">Cargo</option>
                            <option value="admin">Admin</option>
                          </select>
                          <button type="button" onClick={() => handleUpdate(u.id)} style={{ padding: '6px 12px', background: '#10b981', color: '#fff', border: 'none', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>Save</button>
                          <button type="button" onClick={() => setEditingId(null)} style={{ padding: '6px 12px', background: '#f3f4f6', color: '#374151', border: '1px solid #e5e7eb', borderRadius: 6, fontSize: 12, cursor: 'pointer' }}>Cancel</button>
                        </div>
                      ) : (
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button onClick={() => { setEditingId(u.id); setEditUser({ password: '', role: u.role, active: u.active }); }} style={{ padding: '6px 12px', background: '#eff6ff', color: '#2563eb', border: '1px solid #bfdbfe', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>Edit</button>
                          <button onClick={() => handleDelete(u.id, u.username)} style={{ padding: '6px 12px', background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>Delete</button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
