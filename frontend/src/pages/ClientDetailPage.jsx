import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  CreditCard,
  Send,
  Download,
  Edit2,
  Trash2,
  Calendar,
  Phone,
  Mail,
  MapPin,
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  Receipt,
  Plus,
} from 'lucide-react';
import { api } from '../services/api';
import { generateClientStatementPDF } from '../services/exportService';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export const ClientDetailPage = ({
  clientId,
  onBack,
  onOpenNewPayment,
  onOpenEditClient,
  onOpenWhatsApp,
  onViewReceipt,
}) => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [clientData, setClientData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchClientDetails = async () => {
    try {
      setLoading(true);
      const res = await api.clients.getById(clientId);
      setClientData(res.data);
    } catch (err) {
      addToast(err.message || 'Failed to load client dossier', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (clientId) {
      fetchClientDetails();
    }
  }, [clientId]);

  const handleDeletePayment = async (paymentId) => {
    if (!window.confirm('Are you sure you want to delete this payment record? The client remaining balance will be recalculated.')) {
      return;
    }

    try {
      await api.payments.delete(paymentId);
      addToast('Payment transaction deleted', 'success');
      fetchClientDetails();
    } catch (err) {
      addToast(err.message || 'Failed to delete payment', 'error');
    }
  };

  const handleDownloadPDF = () => {
    if (clientData) {
      generateClientStatementPDF(clientData, clientData.payments || [], user);
      addToast('Client statement PDF downloaded!', 'success');
    }
  };

  if (loading && !clientData) {
    return (
      <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-secondary)' }}>
        Loading client dossier...
      </div>
    );
  }

  if (!clientData) {
    return (
      <div className="card" style={{ padding: '40px', textAlign: 'center' }}>
        <p>Client not found or deleted.</p>
        <button className="btn btn-secondary" onClick={onBack} style={{ marginTop: '16px' }}>
          <ArrowLeft size={16} /> Back to Clients
        </button>
      </div>
    );
  }

  const isOverdue = clientData.status === 'Overdue';
  const payments = clientData.payments || [];

  return (
    <div>
      {/* Back Button & Top Navigation */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <button className="btn btn-secondary btn-sm" onClick={onBack}>
          <ArrowLeft size={16} /> Back to Client List
        </button>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="btn btn-secondary btn-sm" onClick={handleDownloadPDF}>
            <Download size={15} /> Statement PDF
          </button>
          {clientData.remainingAmount > 0 && (
            <button className="btn btn-whatsapp btn-sm" onClick={() => onOpenWhatsApp(clientData)}>
              <Send size={15} /> WhatsApp Reminder
            </button>
          )}
          <button className="btn btn-primary btn-sm" onClick={() => onOpenNewPayment(clientData)}>
            <Plus size={15} /> Record Payment
          </button>
          <button className="btn btn-secondary btn-sm" onClick={() => onOpenEditClient(clientData)}>
            <Edit2 size={15} /> Edit
          </button>
        </div>
      </div>

      {/* Main Client Profile Header Card */}
      <div
        className="card"
        style={{
          marginBottom: '28px',
          background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.7) 0%, rgba(15, 23, 42, 0.8) 100%)',
          border: '1px solid var(--border-color)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
              <h1 style={{ fontSize: '26px', fontWeight: 800 }}>{clientData.name}</h1>
              <span
                style={{
                  fontSize: '12px',
                  padding: '4px 10px',
                  borderRadius: '6px',
                  background: clientData.ledgerType === 'PAYABLE' ? 'rgba(244, 63, 94, 0.2)' : 'rgba(16, 185, 129, 0.2)',
                  color: clientData.ledgerType === 'PAYABLE' ? '#f43f5e' : '#10b981',
                  border: `1px solid ${clientData.ledgerType === 'PAYABLE' ? 'rgba(244, 63, 94, 0.4)' : 'rgba(16, 185, 129, 0.4)'}`,
                  fontWeight: 800,
                  textTransform: 'uppercase',
                }}
              >
                {clientData.ledgerType === 'PAYABLE' ? '🔴 I Borrowed (To Pay / Give)' : '🟢 Borrowed From Me (To Receive)'}
              </span>
              <span
                className={`badge ${
                  clientData.status === 'Paid'
                    ? 'badge-paid'
                    : clientData.status === 'Overdue'
                    ? 'badge-overdue'
                    : 'badge-partial'
                }`}
              >
                {clientData.status}
              </span>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '18px', marginTop: '12px', fontSize: '13px', color: 'var(--text-secondary)' }}>
              {clientData.phone && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Phone size={14} color="#818cf8" />
                  <span>{clientData.phone}</span>
                </div>
              )}
              {clientData.email && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Mail size={14} color="#818cf8" />
                  <span>{clientData.email}</span>
                </div>
              )}
              {clientData.clientRefId && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Ref ID:</span>
                  <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>{clientData.clientRefId}</span>
                </div>
              )}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Calendar size={14} color={isOverdue ? '#f43f5e' : '#10b981'} />
                <span>
                  Due: {new Date(clientData.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  {isOverdue && ` (${clientData.daysOverdue} days overdue)`}
                </span>
              </div>
            </div>

            {clientData.address && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '8px', fontSize: '13px', color: 'var(--text-muted)' }}>
                <MapPin size={14} />
                <span>{clientData.address}</span>
              </div>
            )}

            {clientData.notes && (
              <div style={{ marginTop: '12px', padding: '10px 14px', borderRadius: '8px', background: 'rgba(255, 255, 255, 0.03)', fontSize: '12px', color: 'var(--text-secondary)' }}>
                <strong>Notes / Terms:</strong> {clientData.notes}
              </div>
            )}
          </div>

          {/* Large Financial Balance Block */}
          <div
            style={{
              background: 'rgba(0, 0, 0, 0.3)',
              borderRadius: 'var(--radius-md)',
              padding: '18px 24px',
              border: '1px solid var(--border-color)',
              minWidth: '260px',
              textAlign: 'right',
            }}
          >
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {clientData.ledgerType === 'PAYABLE' ? 'Remaining Balance To Pay' : 'Remaining Balance To Receive'}
            </div>
            <div
              style={{
                fontSize: '32px',
                fontWeight: 800,
                color: clientData.remainingAmount > 0 ? (isOverdue ? '#f43f5e' : '#f59e0b') : '#10b981',
                marginTop: '4px',
              }}
            >
              ₹{Number(clientData.remainingAmount).toLocaleString('en-IN')}
            </div>
            <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>
              of ₹{Number(clientData.totalExpected).toLocaleString('en-IN')} {clientData.ledgerType === 'PAYABLE' ? 'total borrowed' : 'total lent'}
            </div>
          </div>
        </div>

        {/* Progress Bar in Card */}
        <div style={{ marginTop: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '6px' }}>
            <span>
              {clientData.ledgerType === 'PAYABLE' ? 'Repaid:' : 'Received:'} <strong>₹{Number(clientData.totalPaid).toLocaleString('en-IN')}</strong> ({clientData.paymentPercentage}%)
            </span>
            <span>
              {clientData.ledgerType === 'PAYABLE' ? 'Pending to Pay:' : 'Pending to Receive:'} <strong>₹{Number(clientData.remainingAmount).toLocaleString('en-IN')}</strong>
            </span>
          </div>
          <div className="progress-container" style={{ height: '10px' }}>
            <div
              className={`progress-bar ${
                clientData.status === 'Paid'
                  ? 'progress-bar-paid'
                  : clientData.status === 'Overdue'
                  ? 'progress-bar-overdue'
                  : 'progress-bar-partial'
              }`}
              style={{ width: `${clientData.paymentPercentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Payment Ledger Timeline Section */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 700 }}>Payment Transactions Ledger</h2>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              Complete chronological record of all partial and full payments received
            </p>
          </div>
          <button className="btn btn-primary btn-sm" onClick={() => onOpenNewPayment(clientData)}>
            <Plus size={14} /> Record New Payment
          </button>
        </div>

        {payments.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
            <Receipt size={40} style={{ margin: '0 auto 12px', opacity: 0.5 }} />
            <p style={{ fontSize: '14px', marginBottom: '16px' }}>No payments have been recorded for this client yet.</p>
            <button className="btn btn-secondary btn-sm" onClick={() => onOpenNewPayment(clientData)}>
              <CreditCard size={14} /> Record First Payment
            </button>
          </div>
        ) : (
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Payment Date</th>
                  <th>Method</th>
                  <th>Reference / UTR #</th>
                  <th>Notes</th>
                  <th>Amount Paid</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((p, index) => (
                  <tr key={p._id}>
                    <td style={{ color: 'var(--text-muted)', fontSize: '12px' }}>{index + 1}</td>
                    <td>
                      <div style={{ fontWeight: 600 }}>
                        {new Date(p.paymentDate).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </div>
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
                      <span style={{ fontWeight: 800, fontSize: '15px', color: 'var(--status-paid-text)' }}>
                        ₹{Number(p.amount).toLocaleString('en-IN')}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
                        <button
                          className="btn btn-secondary btn-icon"
                          style={{ padding: '6px' }}
                          title="View / Print Receipt"
                          onClick={() => onViewReceipt(clientData, p)}
                        >
                          <Receipt size={14} />
                        </button>
                        <button
                          className="btn btn-danger btn-icon"
                          style={{ padding: '6px' }}
                          title="Delete Payment Record"
                          onClick={() => handleDeletePayment(p._id)}
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
    </div>
  );
};
