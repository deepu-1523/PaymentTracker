import React, { useState, useEffect } from 'react';
import { Settings, Save, Shield, QrCode, User, Mail, DollarSign, Database, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';

export const SettingsPage = () => {
  const { user, updateProfileState } = useAuth();
  const { addToast } = useToast();
  const [name, setName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [upiId, setUpiId] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setBusinessName(user.businessName || '');
      setUpiId(user.upiId || '');
    }
  }, [user]);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const res = await api.auth.updateProfile({
        name,
        businessName,
        upiId,
      });
      updateProfileState(res.user);
      addToast('Admin settings and preferences updated successfully!', 'success');
    } catch (err) {
      addToast(err.message || 'Failed to update settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Admin & System Settings</h1>
          <p className="page-subtitle">
            Configure business identity, UPI payment receivers, reminder formats, and account security
          </p>
        </div>
      </div>

      <div style={{ maxWidth: '800px' }}>
        <form onSubmit={handleSave}>
          {/* Business & Payment Identity */}
          <div className="card" style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
              <div style={{ background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8', padding: '8px', borderRadius: '8px' }}>
                <QrCode size={20} />
              </div>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: 700 }}>Business & UPI Configuration</h3>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  This information will be embedded into WhatsApp payment reminders, statement PDFs, and receipts
                </p>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Business / Account Name</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. DueLedger Solutions / Saurabh Personal"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Default UPI ID / VPA for Reminders</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. saurabh@upi / 9876543210@paytm"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
              />
              <span style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
                Clients will receive this UPI handle in automated WhatsApp payment reminder messages.
              </span>
            </div>
          </div>

          {/* Admin Profile */}
          <div className="card" style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
              <div style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', padding: '8px', borderRadius: '8px' }}>
                <User size={20} />
              </div>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: 700 }}>Admin Profile</h3>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  Personal details for the account owner
                </p>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Admin Name</label>
              <input
                type="text"
                className="form-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Email Address (Read-only)</label>
              <input
                type="email"
                className="form-input"
                value={user?.email || ''}
                disabled
                style={{ opacity: 0.7, cursor: 'not-allowed' }}
              />
            </div>
          </div>

          {/* Database & Architecture Note */}
          <div className="card" style={{ marginBottom: '24px', background: 'rgba(255, 255, 255, 0.02)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <Database size={20} color="#818cf8" />
              <h3 style={{ fontSize: '15px', fontWeight: 700 }}>Architecture & Database Engine</h3>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              DueLedger operates on a transaction-based ledger model. Client balances are computed dynamically from actual payment records in MongoDB. Every financial transaction has an audit timestamp.
            </p>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              <Save size={16} />
              {saving ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
