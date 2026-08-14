import React from 'react';
import {
  LayoutDashboard,
  Users,
  CreditCard,
  Clock,
  BarChart3,
  Settings,
  ShieldCheck,
  PlusCircle,
  LogOut,
  AlertTriangle,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Sidebar = ({ currentTab, setCurrentTab, onOpenNewClient, onOpenNewPayment }) => {
  const { user, logout } = useAuth();

  const navItems = [
    { id: 'dashboard', label: 'Admin Dashboard', icon: LayoutDashboard },
    { id: 'clients', label: 'Clients & Debtors', icon: Users },
    { id: 'payments', label: 'Payment Ledger', icon: CreditCard },
    { id: 'due_tracker', label: 'Due & Overdue Radar', icon: Clock },
    { id: 'reports', label: 'Financial Analytics', icon: BarChart3 },
    { id: 'settings', label: 'System Settings', icon: Settings },
  ];

  return (
    <aside className="sidebar">
      {/* Brand Header */}
      <div style={{ padding: '24px 20px', borderBottom: '1px solid var(--border-color)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              background: 'var(--accent-gradient)',
              borderRadius: '10px',
              width: '36px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: 'var(--accent-glow)',
            }}
          >
            <ShieldCheck size={22} color="#ffffff" />
          </div>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: '800', lineHeight: 1.2 }}>DueLedger</h2>
            <div style={{ fontSize: '11px', color: 'var(--status-paid-text)', fontWeight: 600 }}>
              ADMIN CONSOLE
            </div>
          </div>
        </div>
      </div>

      {/* Quick Action Buttons */}
      <div style={{ padding: '16px 14px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <button
          className="btn btn-primary"
          onClick={onOpenNewPayment}
          style={{ width: '100%', fontSize: '13px', padding: '9px 12px' }}
        >
          <PlusCircle size={16} />
          Record Payment
        </button>
        <button
          className="btn btn-secondary"
          onClick={onOpenNewClient}
          style={{ width: '100%', fontSize: '13px', padding: '8px 12px' }}
        >
          <Users size={16} />
          Add Client
        </button>
      </div>

      {/* Navigation Items */}
      <nav style={{ flex: 1, padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentTab(item.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '11px 14px',
                borderRadius: 'var(--radius-sm)',
                border: 'none',
                background: isActive ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
                color: isActive ? '#ffffff' : 'var(--text-secondary)',
                fontWeight: isActive ? 700 : 500,
                fontSize: '14px',
                cursor: 'pointer',
                textAlign: 'left',
                width: '100%',
                transition: 'all 0.15s ease',
                borderLeft: isActive ? '3px solid var(--accent-primary)' : '3px solid transparent',
              }}
            >
              <Icon size={18} color={isActive ? '#818cf8' : '#64748b'} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Admin User Info & Logout */}
      <div
        style={{
          padding: '16px 14px',
          borderTop: '1px solid var(--border-color)',
          background: 'rgba(0, 0, 0, 0.2)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ overflow: 'hidden' }}>
            <div
              style={{
                fontSize: '13px',
                fontWeight: 700,
                color: 'var(--text-primary)',
                whiteSpace: 'nowrap',
                textOverflow: 'ellipsis',
                overflow: 'hidden',
              }}
            >
              {user?.name || 'Administrator'}
            </div>
            <div
              style={{
                fontSize: '11px',
                color: 'var(--text-muted)',
                whiteSpace: 'nowrap',
                textOverflow: 'ellipsis',
                overflow: 'hidden',
              }}
            >
              {user?.email || 'admin@dueledger.com'}
            </div>
          </div>
          <button
            onClick={logout}
            title="Logout"
            className="btn btn-secondary btn-icon"
            style={{ padding: '6px' }}
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
};
