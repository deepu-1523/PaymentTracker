import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  Search,
  Download,
  Filter,
  Receipt,
  Trash2,
  Calendar,
  DollarSign,
  Plus,
} from 'lucide-react';
import { api } from '../services/api';
import { exportPaymentsCSV } from '../services/exportService';
import { useToast } from '../context/ToastContext';

export const PaymentsPage = ({ onOpenNewPayment, onViewReceipt }) => {
  const { addToast } = useToast();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [methodFilter, setMethodFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const params = {};
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const res = await api.payments.getAll(params);
      setPayments(res.data || []);
    } catch (err) {
      addToast(err.message || 'Failed to load payments ledger', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, [startDate, endDate]);

  const handleDeletePayment = async (payment) => {
    if (
      !window.confirm(
        `Are you sure you want to delete this payment record of ₹${Number(payment.amount).toLocaleString('en-IN')}?`
      )
    ) {
      return;
    }

    try {
      await api.payments.delete(payment._id);
      addToast('Payment transaction deleted', 'success');
      fetchPayments();
    } catch (err) {
      addToast(err.message || 'Failed to delete payment', 'error');
    }
  };

  const handleExport = () => {
    if (filteredPayments.length === 0) {
      addToast('No payment transactions to export', 'info');
      return;
    }
    exportPaymentsCSV(
      filteredPayments,
      `Payments_Ledger_${new Date().toISOString().split('T')[0]}.csv`
    );
    addToast('Payment ledger CSV downloaded!', 'success');
  };

  // Client-side search and method filtering
  const filteredPayments = payments.filter((p) => {
    const matchesMethod = methodFilter === 'All' || p.paymentMethod === methodFilter;
    const clientName = p.clientId?.name || '';
    const refNum = p.referenceNumber || '';
    const notes = p.notes || '';
    const matchesSearch =
      !search ||
      clientName.toLowerCase().includes(search.toLowerCase()) ||
      refNum.toLowerCase().includes(search.toLowerCase()) ||
      notes.toLowerCase().includes(search.toLowerCase());
    return matchesMethod && matchesSearch;
  });

  const totalFilteredAmount = filteredPayments.reduce((sum, p) => sum + (p.amount || 0), 0);

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Global Payment Ledger</h1>
          <p className="page-subtitle">
            Audit-ready transaction records of every payment received
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn btn-secondary" onClick={handleExport}>
            <Download size={16} />
            Export CSV
          </button>
          <button className="btn btn-primary" onClick={() => onOpenNewPayment(null)}>
            <Plus size={16} />
            Record Payment
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div
        className="card"
        style={{
          padding: '16px 20px',
          marginBottom: '24px',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '16px',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        {/* Method Tabs */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {['All', 'UPI', 'Cash', 'Bank Transfer', 'Card', 'Other'].map((method) => (
            <button
              key={method}
              onClick={() => setMethodFilter(method)}
              style={{
                padding: '6px 12px',
                borderRadius: 'var(--radius-full)',
                border: 'none',
                background: methodFilter === method ? 'var(--accent-primary)' : 'rgba(255, 255, 255, 0.05)',
                color: methodFilter === method ? '#ffffff' : 'var(--text-secondary)',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              {method}
            </button>
          ))}
        </div>

        {/* Date Range & Search Input */}
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', width: '200px' }}>
            <Search size={14} style={{ position: 'absolute', left: '10px', top: '12px', color: 'var(--text-muted)' }} />
            <input
              type="text"
              className="form-input"
              placeholder="Search client, ref #..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ paddingLeft: '30px', height: '36px', fontSize: '13px' }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Calendar size={14} color="var(--text-muted)" />
            <input
              type="date"
              className="form-input"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              style={{ height: '36px', fontSize: '12px', width: '130px', padding: '4px 8px' }}
              title="Start Date"
            />
            <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>to</span>
            <input
              type="date"
              className="form-input"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              style={{ height: '36px', fontSize: '12px', width: '130px', padding: '4px 8px' }}
              title="End Date"
            />
          </div>
        </div>
      </div>

      {/* Summary Mini Bar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '16px',
          padding: '0 4px',
          fontSize: '13px',
          color: 'var(--text-secondary)',
        }}
      >
        <span>
          Showing <strong>{filteredPayments.length}</strong> transactions
        </span>
        <span>
          Total Value:{' '}
          <strong style={{ color: 'var(--status-paid-text)', fontSize: '15px' }}>
            ₹{totalFilteredAmount.toLocaleString('en-IN')}
          </strong>
        </span>
      </div>

      {/* Transactions Table */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
          Loading transactions...
        </div>
      ) : filteredPayments.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '60px 20px' }}>
          <CreditCard size={48} color="#64748b" style={{ margin: '0 auto 16px', display: 'block' }} />
          <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '8px' }}>No payments found</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '20px' }}>
            {search || methodFilter !== 'All' || startDate || endDate
              ? 'No transactions matched your search or date criteria.'
              : 'Record your first payment to build the audit ledger.'}
          </p>
          <button className="btn btn-primary" onClick={() => onOpenNewPayment(null)}>
            <Plus size={16} /> Record Payment
          </button>
        </div>
      ) : (
        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Client Name</th>
                <th>Payment Mode</th>
                <th>Ref / UTR #</th>
                <th>Notes</th>
                <th>Amount (INR)</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPayments.map((p) => (
                <tr key={p._id}>
                  <td>
                    <div style={{ fontWeight: 600, fontSize: '13px' }}>
                      {new Date(p.paymentDate).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 700, color: '#ffffff' }}>
                      {p.clientId?.name || 'Client Removed'}
                    </div>
                    {p.clientId?.phone && (
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                        {p.clientId.phone}
                      </div>
                    )}
                  </td>
                  <td>
                    <span
                      style={{
                        background: 'rgba(99, 102, 241, 0.15)',
                        color: '#818cf8',
                        padding: '3px 8px',
                        borderRadius: '4px',
                        fontSize: '12px',
                        fontWeight: 600,
                      }}
                    >
                      {p.paymentMethod}
                    </span>
                  </td>
                  <td>
                    <span style={{ fontFamily: 'monospace', fontSize: '13px', color: 'var(--text-secondary)' }}>
                      {p.referenceNumber || '-'}
                    </span>
                  </td>
                  <td>
                    <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                      {p.notes || '-'}
                    </span>
                  </td>
                  <td>
                    <span style={{ fontWeight: 800, fontSize: '15px', color: '#10b981' }}>
                      ₹{Number(p.amount).toLocaleString('en-IN')}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
                      <button
                        className="btn btn-secondary btn-icon"
                        style={{ padding: '6px' }}
                        title="View / Print Receipt"
                        onClick={() => onViewReceipt(p.clientId, p)}
                      >
                        <Receipt size={14} />
                      </button>
                      <button
                        className="btn btn-danger btn-icon"
                        style={{ padding: '6px' }}
                        title="Delete Payment Record"
                        onClick={() => handleDeletePayment(p)}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
