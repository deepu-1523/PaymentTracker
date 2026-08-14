import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  Plus,
  Download,
  Filter,
  ArrowUpDown,
  CreditCard,
  Send,
  Eye,
  Edit2,
  Trash2,
  Phone,
  Calendar,
  AlertCircle,
  CheckCircle2,
  ArrowDownLeft,
  ArrowUpRight,
} from 'lucide-react';
import { api } from '../services/api';
import { exportClientsCSV } from '../services/exportService';
import { useToast } from '../context/ToastContext';

export const ClientsPage = ({
  onOpenNewClient,
  onOpenEditClient,
  onOpenNewPayment,
  onOpenWhatsApp,
  onSelectClient,
}) => {
  const { addToast } = useToast();
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [ledgerTypeFilter, setLedgerTypeFilter] = useState('ALL'); // 'ALL' | 'RECEIVABLE' | 'PAYABLE'
  const [statusFilter, setStatusFilter] = useState('All');
  const [sortBy, setSortBy] = useState('dueDate');
  const [sortOrder, setSortOrder] = useState('asc');

  const fetchClients = async () => {
    try {
      setLoading(true);
      const params = {
        search,
        status: statusFilter,
        ledgerType: ledgerTypeFilter,
        sortBy,
        sortOrder,
      };
      const res = await api.clients.getAll(params);
      setClients(res.data || []);
    } catch (err) {
      addToast(err.message || 'Failed to load records list', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, [search, statusFilter, ledgerTypeFilter, sortBy, sortOrder]);

  const handleDeleteClient = async (client) => {
    if (
      !window.confirm(
        `Are you sure you want to delete "${client.name}" and all associated payment transactions? This cannot be undone.`
      )
    ) {
      return;
    }

    try {
      await api.clients.delete(client._id || client.id);
      addToast(`Record for "${client.name}" removed from system`, 'success');
      fetchClients();
    } catch (err) {
      addToast(err.message || 'Failed to delete record', 'error');
    }
  };

  const handleExport = () => {
    if (clients.length === 0) {
      addToast('No records to export', 'info');
      return;
    }
    exportClientsCSV(clients, `DueLedger_Records_${new Date().toISOString().split('T')[0]}.csv`);
    addToast('Ledger CSV downloaded!', 'success');
  };

  const statusBadges = {
    Paid: 'badge-paid',
    Partial: 'badge-partial',
    Pending: 'badge-pending',
    Overdue: 'badge-overdue',
  };

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Personal Ledger & People Records</h1>
          <p className="page-subtitle">
            Manage who borrowed from you (Receivables) and who you borrowed from (Payables)
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn btn-secondary" onClick={handleExport}>
            <Download size={16} />
            Export CSV
          </button>
          <button className="btn btn-primary" onClick={onOpenNewClient}>
            <Plus size={16} />
            Add Person / Client
          </button>
        </div>
      </div>

      {/* Primary Type Filter Tabs (Borrowed from me vs I borrowed) */}
      <div
        style={{
          display: 'flex',
          gap: '10px',
          marginBottom: '16px',
        }}
      >
        <button
          onClick={() => setLedgerTypeFilter('ALL')}
          style={{
            padding: '8px 16px',
            borderRadius: 'var(--radius-sm)',
            border: ledgerTypeFilter === 'ALL' ? '1px solid var(--accent-primary)' : '1px solid var(--border-color)',
            background: ledgerTypeFilter === 'ALL' ? 'rgba(99, 102, 241, 0.2)' : 'var(--bg-card)',
            color: ledgerTypeFilter === 'ALL' ? '#ffffff' : 'var(--text-secondary)',
            fontWeight: 700,
            fontSize: '13px',
            cursor: 'pointer',
          }}
        >
          All Records ({clients.length})
        </button>

        <button
          onClick={() => setLedgerTypeFilter('RECEIVABLE')}
          style={{
            padding: '8px 16px',
            borderRadius: 'var(--radius-sm)',
            border: ledgerTypeFilter === 'RECEIVABLE' ? '1px solid #10b981' : '1px solid var(--border-color)',
            background: ledgerTypeFilter === 'RECEIVABLE' ? 'rgba(16, 185, 129, 0.2)' : 'var(--bg-card)',
            color: ledgerTypeFilter === 'RECEIVABLE' ? '#10b981' : 'var(--text-secondary)',
            fontWeight: 700,
            fontSize: '13px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <ArrowDownLeft size={16} />
          <span>🟢 Borrowed From Me (To Receive)</span>
        </button>

        <button
          onClick={() => setLedgerTypeFilter('PAYABLE')}
          style={{
            padding: '8px 16px',
            borderRadius: 'var(--radius-sm)',
            border: ledgerTypeFilter === 'PAYABLE' ? '1px solid #f43f5e' : '1px solid var(--border-color)',
            background: ledgerTypeFilter === 'PAYABLE' ? 'rgba(244, 63, 94, 0.2)' : 'var(--bg-card)',
            color: ledgerTypeFilter === 'PAYABLE' ? '#f43f5e' : 'var(--text-secondary)',
            fontWeight: 700,
            fontSize: '13px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <ArrowUpRight size={16} />
          <span>🔴 I Borrowed (To Pay / Give)</span>
        </button>
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
        {/* Status Tab Filters */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {['All', 'Paid', 'Partial', 'Pending', 'Overdue'].map((tab) => (
            <button
              key={tab}
              onClick={() => setStatusFilter(tab)}
              style={{
                padding: '6px 14px',
                borderRadius: 'var(--radius-full)',
                border: 'none',
                background: statusFilter === tab ? 'var(--accent-primary)' : 'rgba(255, 255, 255, 0.05)',
                color: statusFilter === tab ? '#ffffff' : 'var(--text-secondary)',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Search & Sort */}
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <div style={{ position: 'relative', width: '240px' }}>
            <Search size={14} style={{ position: 'absolute', left: '10px', top: '12px', color: 'var(--text-muted)' }} />
            <input
              type="text"
              className="form-input"
              placeholder="Search by name, phone, ref..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ paddingLeft: '32px', height: '36px', fontSize: '13px' }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <ArrowUpDown size={14} color="var(--text-muted)" />
            <select
              className="form-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={{ height: '36px', fontSize: '13px', padding: '6px 10px', width: '160px' }}
            >
              <option value="dueDate">Nearest Due Date</option>
              <option value="highest_balance">Highest Balance Due</option>
              <option value="oldest_overdue">Oldest Overdue First</option>
              <option value="name">Name (A-Z)</option>
              <option value="totalAmount">Total Agreed Amount</option>
            </select>
          </div>
        </div>
      </div>

      {/* Clients Table */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
          Loading records...
        </div>
      ) : clients.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '60px 20px' }}>
          <Users size={48} color="#64748b" style={{ margin: '0 auto 16px', display: 'block' }} />
          <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '8px' }}>No records found</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '20px' }}>
            {search || statusFilter !== 'All' || ledgerTypeFilter !== 'ALL'
              ? 'Try changing your search terms or filters.'
              : 'Add your first person/client to start tracking payments and receivables.'}
          </p>
          <button className="btn btn-primary" onClick={onOpenNewClient}>
            <Plus size={16} /> Add First Entry
          </button>
        </div>
      ) : (
        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Person / Type</th>
                <th>Total Agreed</th>
                <th>Cleared So Far</th>
                <th>Remaining Balance</th>
                <th>Progress</th>
                <th>Due Date & Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {clients.map((client) => {
                const badgeClass = statusBadges[client.status] || 'badge-pending';
                const isOverdue = client.status === 'Overdue';
                const isReceivable = (client.ledgerType || 'RECEIVABLE') === 'RECEIVABLE';

                return (
                  <tr key={client._id}>
                    {/* Name & Type Badge */}
                    <td>
                      <div
                        onClick={() => onSelectClient(client)}
                        style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column' }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontWeight: 700, fontSize: '15px', color: '#ffffff' }}>
                            {client.name}
                          </span>
                          <span
                            style={{
                              fontSize: '10px',
                              padding: '2px 6px',
                              borderRadius: '4px',
                              background: isReceivable ? 'rgba(16, 185, 129, 0.15)' : 'rgba(244, 63, 94, 0.15)',
                              color: isReceivable ? '#10b981' : '#f43f5e',
                              border: `1px solid ${isReceivable ? 'rgba(16, 185, 129, 0.3)' : 'rgba(244, 63, 94, 0.3)'}`,
                              fontWeight: 700,
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '3px',
                            }}
                          >
                            {isReceivable ? <ArrowDownLeft size={11} /> : <ArrowUpRight size={11} />}
                            {isReceivable ? 'They Borrowed' : 'I Borrowed'}
                          </span>
                        </div>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', gap: '8px', marginTop: '2px' }}>
                          {client.phone && <span>📞 {client.phone}</span>}
                          {client.clientRefId && <span style={{ fontFamily: 'monospace' }}>Ref: {client.clientRefId}</span>}
                        </div>
                      </div>
                    </td>

                    {/* Agreed Amount */}
                    <td>
                      <span className="currency-val" style={{ fontSize: '14px' }}>
                        ₹{Number(client.totalExpected || client.totalAmount).toLocaleString('en-IN')}
                      </span>
                    </td>

                    {/* Total Paid */}
                    <td>
                      <span className="currency-val" style={{ color: 'var(--status-paid-text)', fontWeight: 700 }}>
                        ₹{Number(client.totalPaid).toLocaleString('en-IN')}
                      </span>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                        {client.paymentCount || 0} transaction{client.paymentCount === 1 ? '' : 's'}
                      </div>
                    </td>

                    {/* Remaining Due */}
                    <td>
                      <span
                        className="currency-val"
                        style={{
                          fontSize: '15px',
                          fontWeight: 800,
                          color: client.remainingAmount > 0 ? (isOverdue ? '#f43f5e' : '#f59e0b') : '#10b981',
                        }}
                      >
                        ₹{Number(client.remainingAmount).toLocaleString('en-IN')}
                      </span>
                    </td>

                    {/* Progress Bar */}
                    <td style={{ width: '130px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '4px' }}>
                        <span>{client.paymentPercentage}%</span>
                      </div>
                      <div className="progress-container">
                        <div
                          className={`progress-bar ${
                            client.status === 'Paid'
                              ? 'progress-bar-paid'
                              : client.status === 'Overdue'
                              ? 'progress-bar-overdue'
                              : 'progress-bar-partial'
                          }`}
                          style={{ width: `${client.paymentPercentage}%` }}
                        />
                      </div>
                    </td>

                    {/* Due Date & Status Badge */}
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <span className={`badge ${badgeClass}`}>{client.status}</span>
                        <span style={{ fontSize: '11px', color: isOverdue ? '#f43f5e' : 'var(--text-secondary)' }}>
                          📅 {new Date(client.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                          {isOverdue && ` (${client.daysOverdue}d late)`}
                        </span>
                      </div>
                    </td>

                    {/* Actions */}
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
                        {/* Quick Pay */}
                        <button
                          className="btn btn-primary btn-icon"
                          style={{ padding: '6px 8px' }}
                          title={isReceivable ? 'Record Money Received' : 'Record Repayment Sent'}
                          onClick={() => onOpenNewPayment(client)}
                        >
                          <CreditCard size={14} />
                        </button>

                        {/* WhatsApp Follow-up */}
                        {client.remainingAmount > 0 && (
                          <button
                            className="btn btn-whatsapp btn-icon"
                            style={{ padding: '6px 8px' }}
                            title="Send WhatsApp Reminder / Update"
                            onClick={() => onOpenWhatsApp(client)}
                          >
                            <Send size={14} />
                          </button>
                        )}

                        {/* View Dossier / Ledger */}
                        <button
                          className="btn btn-secondary btn-icon"
                          style={{ padding: '6px 8px' }}
                          title="View Full Ledger History"
                          onClick={() => onSelectClient(client)}
                        >
                          <Eye size={14} />
                        </button>

                        {/* Edit */}
                        <button
                          className="btn btn-secondary btn-icon"
                          style={{ padding: '6px 8px' }}
                          title="Edit Details"
                          onClick={() => onOpenEditClient(client)}
                        >
                          <Edit2 size={14} />
                        </button>

                        {/* Delete */}
                        <button
                          className="btn btn-danger btn-icon"
                          style={{ padding: '6px 8px' }}
                          title="Delete Record"
                          onClick={() => handleDeleteClient(client)}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
