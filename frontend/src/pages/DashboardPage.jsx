import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  CreditCard,
  AlertOctagon,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowUpRight,
  ArrowDownLeft,
  Send,
  Plus,
  Users,
  ChevronRight,
  Receipt,
  FileText,
  Scale,
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { api } from '../services/api';
import { StatCard } from '../components/StatCard';
import { useToast } from '../context/ToastContext';

export const DashboardPage = ({
  onOpenNewPayment,
  onOpenNewClient,
  onSelectClient,
  onOpenWhatsApp,
  onViewReceipt,
  onNavigateToTab,
}) => {
  const { addToast } = useToast();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const res = await api.dashboard.getSummary();
      setData(res.data);
    } catch (err) {
      addToast(err.message || 'Failed to load dashboard metrics', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading && !data) {
    return (
      <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-secondary)' }}>
        <div style={{ fontSize: '18px', fontWeight: 600 }}>Loading financial metrics...</div>
      </div>
    );
  }

  const {
    summary,
    recentPayments = [],
    upcomingDue = [],
    overdueClients = [],
    topOutstanding = [],
    monthlyCollections = [],
  } = data || {};

  const receivables = summary?.receivables || { remainingAmount: 0, totalExpected: 0, totalPaid: 0, count: 0 };
  const payables = summary?.payables || { remainingAmount: 0, totalExpected: 0, totalPaid: 0, count: 0 };
  const netBalance = summary?.netBalance !== undefined ? summary.netBalance : receivables.remainingAmount - payables.remainingAmount;

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Executive Command Center</h1>
          <p className="page-subtitle">
            Two-way personal payment tracker: Money you'll receive vs Money you'll give
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn btn-secondary" onClick={() => onNavigateToTab('reports')}>
            <FileText size={16} />
            View Reports
          </button>
          <button className="btn btn-primary" onClick={() => onOpenNewPayment(null)}>
            <CreditCard size={16} />
            Record Payment
          </button>
        </div>
      </div>

      {/* TWO-WAY PRIMARY HIGHLIGHT CARDS (RECEIVABLES vs PAYABLES vs NET POSITION) */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px', marginBottom: '28px' }}>
        {/* 1. YOU WILL RECEIVE (BORROWED FROM ME) */}
        <div
          className="card card-interactive"
          onClick={() => onNavigateToTab('clients')}
          style={{
            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.12) 0%, rgba(6, 78, 59, 0.18) 100%)',
            border: '1px solid rgba(16, 185, 129, 0.35)',
            boxShadow: '0 8px 24px rgba(16, 185, 129, 0.12)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 700, color: '#10b981' }}>
                <ArrowDownLeft size={16} />
                <span>YOU WILL RECEIVE</span>
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                Who borrowed from me ({receivables.count || 0} people)
              </div>
              <div style={{ fontSize: '28px', fontWeight: 800, marginTop: '8px', color: '#10b981' }}>
                ₹{(receivables.remainingAmount || 0).toLocaleString('en-IN')}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                Total Lent: ₹{(receivables.totalExpected || 0).toLocaleString('en-IN')} • Received: ₹{(receivables.totalPaid || 0).toLocaleString('en-IN')}
              </div>
            </div>
            <div style={{ padding: '10px', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.2)', color: '#10b981' }}>
              <ArrowDownLeft size={24} />
            </div>
          </div>
        </div>

        {/* 2. YOU WILL GIVE (I BORROWED) */}
        <div
          className="card card-interactive"
          onClick={() => onNavigateToTab('clients')}
          style={{
            background: 'linear-gradient(135deg, rgba(244, 63, 94, 0.12) 0%, rgba(136, 19, 55, 0.18) 100%)',
            border: '1px solid rgba(244, 63, 94, 0.35)',
            boxShadow: '0 8px 24px rgba(244, 63, 94, 0.12)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 700, color: '#f43f5e' }}>
                <ArrowUpRight size={16} />
                <span>YOU WILL GIVE</span>
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                Which I have borrowed ({payables.count || 0} people)
              </div>
              <div style={{ fontSize: '28px', fontWeight: 800, marginTop: '8px', color: '#f43f5e' }}>
                ₹{(payables.remainingAmount || 0).toLocaleString('en-IN')}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                Total Borrowed: ₹{(payables.totalExpected || 0).toLocaleString('en-IN')} • Repaid: ₹{(payables.totalPaid || 0).toLocaleString('en-IN')}
              </div>
            </div>
            <div style={{ padding: '10px', borderRadius: '10px', background: 'rgba(244, 63, 94, 0.2)', color: '#f43f5e' }}>
              <ArrowUpRight size={24} />
            </div>
          </div>
        </div>

        {/* 3. NET POSITION / BALANCE */}
        <div
          className="card"
          style={{
            background: netBalance >= 0
              ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(49, 46, 129, 0.2) 100%)'
              : 'linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(127, 29, 29, 0.2) 100%)',
            border: `1px solid ${netBalance >= 0 ? 'rgba(99, 102, 241, 0.4)' : 'rgba(239, 68, 68, 0.4)'}`,
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 700, color: netBalance >= 0 ? '#818cf8' : '#f87171' }}>
                <Scale size={16} />
                <span>NET POSITION</span>
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                {netBalance >= 0 ? 'Net Asset (In Your Favor)' : 'Net Liability (You Owe More)'}
              </div>
              <div
                style={{
                  fontSize: '28px',
                  fontWeight: 800,
                  marginTop: '8px',
                  color: netBalance >= 0 ? '#38bdf8' : '#f87171',
                }}
              >
                {netBalance >= 0 ? '+' : ''}₹{netBalance.toLocaleString('en-IN')}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                Receive (₹{(receivables.remainingAmount || 0).toLocaleString('en-IN')}) - Give (₹{(payables.remainingAmount || 0).toLocaleString('en-IN')})
              </div>
            </div>
            <div style={{ padding: '10px', borderRadius: '10px', background: 'rgba(255, 255, 255, 0.05)' }}>
              <Scale size={24} color={netBalance >= 0 ? '#818cf8' : '#f87171'} />
            </div>
          </div>
        </div>
      </div>

      {/* Top Level Metric Cards */}
      <div className="stat-grid">
        <StatCard
          title="Total People Registered"
          value={String(summary?.totalClients || 0)}
          subtext={`${receivables.count || 0} Borrowed From Me • ${payables.count || 0} I Borrowed`}
          icon={Users}
          color="indigo"
          onClick={() => onNavigateToTab('clients')}
        />

        <StatCard
          title="Total Cash Collected"
          value={`₹${(summary?.totalPaid || 0).toLocaleString('en-IN')}`}
          subtext={`${summary?.overallRecoveryPercentage || 0}% recovery rate`}
          icon={TrendingUp}
          color="green"
          trend={
            <div className="progress-container" style={{ marginTop: '6px' }}>
              <div
                className="progress-bar progress-bar-paid"
                style={{ width: `${summary?.overallRecoveryPercentage || 0}%` }}
              />
            </div>
          }
        />

        <StatCard
          title="Total Pending Dues"
          value={`₹${(summary?.totalRemaining || 0).toLocaleString('en-IN')}`}
          subtext={`${(summary?.counts?.partial || 0) + (summary?.counts?.pending || 0)} accounts with balance`}
          icon={Clock}
          color="amber"
          onClick={() => onNavigateToTab('clients')}
        />

        <StatCard
          title="Total Overdue Amount"
          value={`₹${(summary?.totalOverdueAmount || 0).toLocaleString('en-IN')}`}
          subtext={`${summary?.counts?.overdue || 0} accounts past scheduled due date`}
          icon={AlertOctagon}
          color="rose"
          onClick={() => onNavigateToTab('due_tracker')}
        />
      </div>

      {/* Status Breakdown Bar */}
      <div
        className="card"
        style={{
          marginBottom: '28px',
          padding: '18px 24px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '16px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ padding: '8px', borderRadius: '8px', background: 'var(--status-paid-bg)', color: 'var(--status-paid-text)' }}>
            <CheckCircle2 size={20} />
          </div>
          <div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Fully Paid</div>
            <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--status-paid-text)' }}>
              {summary?.counts?.paid || 0} clients
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ padding: '8px', borderRadius: '8px', background: 'var(--status-partial-bg)', color: 'var(--status-partial-text)' }}>
            <TrendingUp size={20} />
          </div>
          <div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Partially Paid</div>
            <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--status-partial-text)' }}>
              {summary?.counts?.partial || 0} clients
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ padding: '8px', borderRadius: '8px', background: 'var(--status-pending-bg)', color: 'var(--status-pending-text)' }}>
            <Clock size={20} />
          </div>
          <div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Pending / On-Time</div>
            <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--status-pending-text)' }}>
              {summary?.counts?.pending || 0} clients
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ padding: '8px', borderRadius: '8px', background: 'var(--status-overdue-bg)', color: 'var(--status-overdue-text)' }}>
            <AlertCircle size={20} />
          </div>
          <div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Overdue Accounts</div>
            <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--status-overdue-text)' }}>
              {summary?.counts?.overdue || 0} clients
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ padding: '8px', borderRadius: '8px', background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8' }}>
            <Clock size={20} />
          </div>
          <div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Due in 7 Days</div>
            <div style={{ fontSize: '18px', fontWeight: 800, color: '#818cf8' }}>
              {summary?.counts?.dueWithin7Days || 0} (₹{(summary?.amounts?.dueWithin7DaysAmount || 0).toLocaleString('en-IN')})
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Chart & Overdue Action Radar */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px', marginBottom: '28px' }}>
        {/* Monthly Collection Chart */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 700 }}>Monthly Cashflow Activity</h3>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                Cash transactions over the last 6 months
              </p>
            </div>
          </div>

          <div style={{ width: '100%', height: 260 }}>
            <ResponsiveContainer>
              <BarChart data={monthlyCollections}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="monthShort" stroke="#64748b" fontSize={12} tickLine={false} />
                <YAxis
                  stroke="#64748b"
                  fontSize={12}
                  tickLine={false}
                  tickFormatter={(val) => `₹${val >= 1000 ? `${val / 1000}k` : val}`}
                />
                <Tooltip
                  contentStyle={{
                    background: '#111827',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                  formatter={(val) => [`₹${Number(val).toLocaleString('en-IN')}`, 'Amount']}
                />
                <Bar dataKey="total" fill="url(#barGradient)" radius={[6, 6, 0, 0]} />
                <defs>
                  <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6366f1" stopOpacity={0.9} />
                    <stop offset="100%" stopColor="#a855f7" stopOpacity={0.6} />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Outstanding Balances */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 700 }}>Top Outstanding Balances</h3>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Highest pending balances</p>
            </div>
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => onNavigateToTab('clients')}
              style={{ fontSize: '11px', padding: '4px 8px' }}
            >
              All
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {topOutstanding.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)', fontSize: '13px' }}>
                🎉 No outstanding balances!
              </div>
            ) : (
              topOutstanding.map((client) => (
                <div
                  key={client._id}
                  onClick={() => onSelectClient(client)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 12px',
                    borderRadius: 'var(--radius-sm)',
                    background: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid var(--border-color)',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                  className="card-interactive"
                >
                  <div style={{ overflow: 'hidden' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontWeight: 700, fontSize: '13px' }}>{client.name}</span>
                      <span
                        style={{
                          fontSize: '10px',
                          padding: '1px 5px',
                          borderRadius: '4px',
                          background: client.ledgerType === 'PAYABLE' ? 'rgba(244, 63, 94, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                          color: client.ledgerType === 'PAYABLE' ? '#f43f5e' : '#10b981',
                          fontWeight: 700,
                        }}
                      >
                        {client.ledgerType === 'PAYABLE' ? 'I Borrowed' : 'They Borrowed'}
                      </span>
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                      Total: ₹{Number(client.totalExpected).toLocaleString('en-IN')}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 800, fontSize: '14px', color: client.ledgerType === 'PAYABLE' ? '#f43f5e' : '#f59e0b' }}>
                      ₹{Number(client.remainingAmount).toLocaleString('en-IN')}
                    </div>
                    <span className={`badge ${client.status === 'Overdue' ? 'badge-overdue' : 'badge-partial'}`} style={{ fontSize: '10px', padding: '2px 6px' }}>
                      {client.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Two Column Section: Overdue Action Queue & Recent Payments */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        {/* Urgent Overdue Clients Queue */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ background: 'var(--status-overdue-bg)', color: '#f43f5e', padding: '6px', borderRadius: '6px' }}>
                <AlertOctagon size={16} />
              </div>
              <h3 style={{ fontSize: '16px', fontWeight: 700 }}>Action Required: Overdue Follow-ups</h3>
            </div>
            <span className="badge badge-overdue" style={{ fontSize: '11px' }}>
              {overdueClients.length} Urgent
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {overdueClients.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '36px', color: 'var(--status-paid-text)', fontSize: '13px' }}>
                <CheckCircle2 size={28} style={{ margin: '0 auto 8px', display: 'block' }} />
                No overdue accounts. All payments are on schedule!
              </div>
            ) : (
              overdueClients.map((client) => (
                <div
                  key={client._id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 14px',
                    borderRadius: 'var(--radius-sm)',
                    background: 'rgba(244, 63, 94, 0.04)',
                    border: '1px solid rgba(244, 63, 94, 0.2)',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontWeight: 700, fontSize: '14px' }}>{client.name}</span>
                      <span
                        style={{
                          fontSize: '10px',
                          padding: '1px 5px',
                          borderRadius: '4px',
                          background: client.ledgerType === 'PAYABLE' ? 'rgba(244, 63, 94, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                          color: client.ledgerType === 'PAYABLE' ? '#f43f5e' : '#10b981',
                          fontWeight: 700,
                        }}
                      >
                        {client.ledgerType === 'PAYABLE' ? 'I Borrowed' : 'Borrowed From Me'}
                      </span>
                    </div>
                    <div style={{ fontSize: '12px', color: '#f43f5e', fontWeight: 600 }}>
                      ₹{Number(client.remainingAmount).toLocaleString('en-IN')} pending ({client.daysOverdue} days late)
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      className="btn btn-whatsapp btn-sm"
                      onClick={() => onOpenWhatsApp(client)}
                      title="Send WhatsApp Reminder / Update"
                    >
                      <Send size={14} />
                      WhatsApp
                    </button>
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => onOpenNewPayment(client)}
                      title="Record Payment"
                    >
                      <CreditCard size={14} />
                      Pay
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Payment Transactions Feed */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ background: 'var(--status-paid-bg)', color: '#10b981', padding: '6px', borderRadius: '6px' }}>
                <Receipt size={16} />
              </div>
              <h3 style={{ fontSize: '16px', fontWeight: 700 }}>Recent Transactions</h3>
            </div>
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => onNavigateToTab('payments')}
              style={{ fontSize: '11px' }}
            >
              Full Ledger <ChevronRight size={12} />
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {recentPayments.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '36px', color: 'var(--text-muted)', fontSize: '13px' }}>
                No transactions recorded yet. Click "Record Payment" to add one!
              </div>
            ) : (
              recentPayments.map((p) => (
                <div
                  key={p._id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 14px',
                    borderRadius: 'var(--radius-sm)',
                    background: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid var(--border-color)',
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '13px' }}>{p.clientId?.name || 'Client'}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                      {new Date(p.paymentDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} •{' '}
                      <span style={{ color: 'var(--accent-primary)', fontWeight: 600 }}>{p.paymentMethod}</span>
                      {p.referenceNumber && ` • Ref: ${p.referenceNumber}`}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ fontWeight: 800, fontSize: '15px', color: '#10b981' }}>
                      +₹{Number(p.amount).toLocaleString('en-IN')}
                    </div>
                    <button
                      className="btn btn-secondary btn-icon"
                      style={{ padding: '6px' }}
                      title="View Receipt"
                      onClick={() => onViewReceipt(p.clientId, p)}
                    >
                      <Receipt size={14} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
