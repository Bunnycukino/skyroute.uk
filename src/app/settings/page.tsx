'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/Sidebar';

export default function SettingsPage() {
  const router = useRouter();
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  async function loadSettings() {
    setLoading(true);
    try {
      const res = await fetch('/api/settings');
      if (res.status === 401) { router.push('/'); return; }
      if (res.status === 403) { router.push('/entries'); return; }
      const data = await res.json();
      setSettings(data.settings || {});
    } catch (err) { setError('Failed to load settings'); }
    finally { setLoading(false); }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess(false);
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) { setError(err.message); }
    finally { setSaving(false); }
  }

  const set = (k: string, v: string) => setSettings(s => ({ ...s, [k]: v }));
  const inputStyle = { width: '100%', border: '1px solid #e5e7eb', borderRadius: 8, padding: '10px 14px', fontSize: 14, outline: 'none', boxSizing: 'border-box' as const, background: '#fff' };
  const labelStyle = { display: 'block', fontSize: 14, fontWeight: 500, color: '#374151', marginBottom: 6 };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f9fafb' }}>
      <Sidebar active="/settings" />
      <main style={{ flex: 1, padding: 32, maxWidth: 700 }}>
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: '#111827', margin: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
            ⚙️ Admin Settings
          </h1>
          <p style={{ color: '#6b7280', fontSize: 14, marginTop: 4 }}>Configure email notifications and system settings</p>
        </div>

        {error && (
          <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '12px 16px', marginBottom: 16, color: '#dc2626', fontSize: 14 }}>
            {error}
          </div>
        )}
        {success && (
          <div style={{ background: '#d1fae5', border: '1px solid #a7f3d0', borderRadius: 8, padding: '12px 16px', marginBottom: 16, color: '#059669', fontSize: 14 }}>
            ✅ Settings saved successfully
          </div>
        )}

        {loading ? (
          <div style={{ padding: 40, textAlign: 'center', color: '#6b7280' }}>Loading settings...</div>
        ) : (
          <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {/* Email Notification Settings */}
            <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e5e7eb', overflow: 'hidden' }}>
              <div style={{ padding: '18px 24px', borderBottom: '1px solid #e5e7eb', background: '#fafafa' }}>
                <h2 style={{ margin: 0, fontSize: 15, fontWeight: 600, color: '#1f2937' }}>📧 Email Notifications</h2>
              </div>
              <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <label style={labelStyle}>Notification Email (recipient)</label>
                  <input style={inputStyle} type="email" placeholder="raf.rajkowski@dnata.com" value={settings.notification_email || ''} onChange={e => set('notification_email', e.target.value)} />
                  <p style={{ fontSize: 12, color: '#9ca3af', marginTop: 4 }}>Emails about ramp issues will be sent to this address</p>
                </div>
                <div>
                  <label style={labelStyle}>From Email</label>
                  <input style={inputStyle} type="email" placeholder="noreply@skyroute.uk" value={settings.from_email || ''} onChange={e => set('from_email', e.target.value)} />
                </div>
                <div>
                  <label style={labelStyle}>From Name</label>
                  <input style={inputStyle} placeholder="SkyRoute System" value={settings.from_name || ''} onChange={e => set('from_name', e.target.value)} />
                </div>
              </div>
            </div>

            {/* SMTP Settings */}
            <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e5e7eb', overflow: 'hidden' }}>
              <div style={{ padding: '18px 24px', borderBottom: '1px solid #e5e7eb', background: '#fafafa' }}>
                <h2 style={{ margin: 0, fontSize: 15, fontWeight: 600, color: '#1f2937' }}>🔌 SMTP Configuration</h2>
                <p style={{ margin: '4px 0 0', fontSize: 12, color: '#9ca3af' }}>Configure SMTP server to send emails. If empty, emails will be logged but not sent.</p>
              </div>
              <div style={{ padding: 20, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <label style={labelStyle}>SMTP Host</label>
                  <input style={inputStyle} placeholder="smtp.gmail.com" value={settings.smtp_host || ''} onChange={e => set('smtp_host', e.target.value)} />
                </div>
                <div>
                  <label style={labelStyle}>SMTP Port</label>
                  <input style={inputStyle} placeholder="587" value={settings.smtp_port || ''} onChange={e => set('smtp_port', e.target.value)} />
                </div>
                <div>
                  <label style={labelStyle}>SMTP Username</label>
                  <input style={inputStyle} placeholder="your.email@gmail.com" value={settings.smtp_user || ''} onChange={e => set('smtp_user', e.target.value)} />
                </div>
                <div>
                  <label style={labelStyle}>SMTP Password</label>
                  <input style={inputStyle} type="password" placeholder="App password" value={settings.smtp_password || ''} onChange={e => set('smtp_password', e.target.value)} />
                </div>
              </div>
              <div style={{ padding: '0 20px 20px' }}>
                <div style={{ background: '#fef3c7', border: '1px solid #fcd34d', borderRadius: 8, padding: '12px 16px', fontSize: 12, color: '#92400e' }}>
                  <strong>Gmail users:</strong> Use an App Password, not your regular password. Create one at Google Account → Security → App Passwords.
                </div>
              </div>
            </div>

            <button type="submit" disabled={saving} style={{ padding: '14px', background: saving ? '#93c5fd' : 'linear-gradient(135deg,#1e3a8a,#2563eb)', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 600, fontSize: 15, cursor: saving ? 'not-allowed' : 'pointer' }}>
              {saving ? 'Saving...' : '💾 Save Settings'}
            </button>
          </form>
        )}
      </main>
    </div>
  );
}
