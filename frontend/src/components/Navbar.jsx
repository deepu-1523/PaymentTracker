import React from 'react';
import { Search, Bell, Plus, Shield, RefreshCw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Navbar = ({ onOpenNewPayment, onOpenNewClient, onRefresh, isRefreshing, searchQuery, setSearchQuery }) => {
  const { user } = useAuth();

  return (
    <header className="top-navbar">
      {/* Search Input Bar */}
      <div style={{ display: 'flex', alignItems: 'center', position: 'relative', width: '380px' }}>
        <Search
          size={16}
          style={{ position: 'absolute', left: '12px', color: 'var(--text-muted)' }}
        />
        <input
          type="text"
          className="form-input"
          placeholder="Global search clients, phone, ref ID..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ paddingLeft: '38px', height: '40px', fontSize: '13px', borderRadius: 'var(--radius-full)' }}
        />
      </div>

      {/* Right Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button
          className="btn btn-secondary btn-icon"
          onClick={onRefresh}
          title="Refresh Data"
          disabled={isRefreshing}
        >
          <RefreshCw size={16} className={isRefreshing ? 'spin' : ''} />
        </button>

        <button
          className="btn btn-primary btn-sm"
          onClick={onOpenNewPayment}
          style={{ height: '38px' }}
        >
          <Plus size={16} />
          <span>Record Payment</span>
        </button>

        {/* Business Title Badge */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid var(--border-color)',
            padding: '6px 14px',
            borderRadius: 'var(--radius-full)',
          }}
        >
          <Shield size={14} color="#10b981" />
          <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)' }}>
            {user?.businessName || 'Admin Mode'}
          </span>
        </div>
      </div>
    </header>
  );
};
