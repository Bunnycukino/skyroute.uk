'use client';
import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';

const NAV = [
  { title: 'Ramp', href: '/ramp', icon: '📦' },
  { title: 'Logistics', href: '/logistic', icon: '📋' },
  { title: 'C209/C208 Register', href: '/entries', icon: '📄' },
  { title: 'Print Out', href: '/printout', icon: '🖨' },
];

export function Sidebar({ active }: { active: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  async function signOut() {
    await fetch('/api/auth', { method: 'DELETE' });
    router.push('/');
  }

  // Close drawer on navigation
  function handleNav() {
    setMobileOpen(false);
  }

  const sidebarContent = (
    <>
      <div
        style={{
          background: 'linear-gradient(135deg, #1e3a5f 0%, #2563eb 100%)',
          padding: '20px 16px',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
        }}
      >
        <div
          style={{
            background: 'rgba(255,255,255,0.2)',
            borderRadius: 10,
            width: 40,
            height: 40,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 20,
          }}
        >
          ✈️
        </div>
        <div>
          <div style={{ color: '#fff', fontWeight: 700, fontSize: 17 }}>
            Skyroute
          </div>
          <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 11 }}>
            C209/C208 System
          </div>
        </div>
      </div>
      <div style={{ padding: '8px 12px', flex: 1 }}>
        <div
          style={{
            color: '#9ca3af',
            fontSize: 10,
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: 1,
            padding: '14px 8px 6px',
          }}
        >
          NAVIGATION
        </div>
        {NAV.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            onClick={handleNav}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '10px 12px',
              borderRadius: 8,
              marginBottom: 2,
              textDecoration: 'none',
              background: active === item.href ? '#eff6ff' : 'transparent',
              color: active === item.href ? '#2563eb' : '#374151',
              fontWeight: active === item.href ? 600 : 400,
              fontSize: 14,
            }}
          >
            <span style={{ fontSize: 16 }}>{item.icon}</span>
            {item.title}
          </Link>
        ))}
      </div>
      <div style={{ padding: '12px 16px', borderTop: '1px solid #e5e7eb' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            marginBottom: 10,
          }}
        >
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: '50%',
              background: '#2563eb',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontWeight: 700,
            }}
          >
            U
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600 }}>User</div>
            <div style={{ fontSize: 11, color: '#6b7280' }}>
              Aviation Logistics
            </div>
          </div>
        </div>
        <button
          onClick={signOut}
          style={{
            width: '100%',
            padding: '8px',
            background: '#f3f4f6',
            border: 'none',
            borderRadius: 6,
            cursor: 'pointer',
            fontSize: 13,
            color: '#374151',
          }}
        >
          🚪 Sign Out
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile top bar */}
      <div className="mobile-topbar">
        <button
          className="hamburger-btn"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? '✕' : '☰'}
        </button>
        <span className="mobile-title">✈️ Skyroute</span>
      </div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="mobile-overlay"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar — desktop always visible, mobile slides in */}
      <aside
        className={`sidebar ${mobileOpen ? 'sidebar-open' : ''}`}
        style={{
          width: 240,
          minWidth: 240,
          background: '#fff',
          borderRight: '1px solid #e5e7eb',
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100vh',
        }}
      >
        {sidebarContent}
      </aside>

      <style jsx>{`
        /* Mobile top bar — hidden on desktop */
        .mobile-topbar {
          display: none;
        }

        @media (max-width: 768px) {
          .mobile-topbar {
            display: flex;
            align-items: center;
            gap: 12px;
            background: linear-gradient(135deg, #1e3a5f 0%, #2563eb 100%);
            padding: 14px 16px;
            color: #fff;
            font-weight: 700;
            font-size: 16px;
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            z-index: 100;
            box-shadow: 0 2px 8px rgba(0,0,0,0.15);
          }

          .hamburger-btn {
            background: rgba(255,255,255,0.2);
            border: none;
            color: #fff;
            font-size: 20px;
            width: 40px;
            height: 40px;
            border-radius: 8px;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .mobile-title {
            display: flex;
            align-items: center;
            gap: 6px;
          }

          .sidebar {
            position: fixed !important;
            top: 0;
            left: 0;
            bottom: 0;
            z-index: 200;
            transform: translateX(-100%);
            transition: transform 0.25s ease;
            box-shadow: 2px 0 12px rgba(0,0,0,0.15);
            padding-top: 0;
          }

          .sidebar-open {
            transform: translateX(0) !important;
          }

          .mobile-overlay {
            position: fixed;
            inset: 0;
            background: rgba(0,0,0,0.5);
            z-index: 150;
          }
        }
      `}</style>
    </>
  );
}
