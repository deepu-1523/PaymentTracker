import React, { useState, useEffect } from 'react';
import {
  Clock,
  AlertOctagon,
  Calendar,
  Send,
  CreditCard,
  Eye,
  CheckCircle2,
  AlertCircle,
  Filter,
} from 'lucide-react';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';

export const DueTrackerPage = ({
  onOpenNewPayment,
  onOpenWhatsApp,
  onSelectClient,
}) => {
  const { addToast } = useToast();
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('all_due'); // 'all_due', 'overdue', 'due_today', 'due_this_week'

  const fetchDueClients = async () => {
    try {
      setLoading(true);
      const res = await api.clients.getAll();
      // Filter clients that have outstanding balance
      const dueClients = (res.data || []).filter((c) => c.remainingAmount > 0);
      setClients(dueClients);
    } catch (err) {
      addToast(err.message || 'Failed to load due dates tracker', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDueClients();
  }, []);

  const overdueList = clients.filter((c) => c.status === 'Overdue');
  const dueTodayList = clients.filter((c) => c.isDueToday);
  const dueThisWeekList = clients.filter((c) => c.isDueWithin7Days && !c.isDueToday && !c.isOverdue);
  const dueLaterList = clients.filter((c) => !c.isOverdue && !c.isDueToday && !c.isDueWithin7Days);

  const displayedList =
    filterType === 'overdue'
      ? overdueList
      : filterType === 'due_today'
      ? dueTodayList
      : filterType === 'due_this_week'
      ? dueThisWeekList
      : clients;

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Due & Overdue Milestone Radar</h1>
          <p className="page-subtitle">
            Proactively monitor payment schedules, overdue penalties, and timely client follow-ups
          </p>
        </div>
      </div>

      {/* Metric Action Tabs */}
      <div className="stat-grid" style={{ marginBottom: '24px' }}>
        <div
          className={`card card-interactive ${filterType === 'all_due' ? 'active-radar-card' : ''}`}
          onClick={() => setFilterType('all_due')}
          style={{
            borderColor: filterType === 'all_due' ? 'var(--accent-primary)' : 'var(--border-color)',
            background: filterType === 'all_due' ? 'rgba(99, 102, 241, 0.15)' : 'var(--bg-card)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>All Active Dues</div>
              <div style={{ fontSize: '24px', fontWeight: 800, marginTop: '4px' }}>{clients.length} Clients</div>
              <div style={{ fontSize: '13px', color: '#818cf8', fontWeight: 600 }}>
                ₹{clients.reduce((s, c) => s + c.remainingAmount, 0).toLocaleString('en-IN')} Total
              </div>
            </div>
            <Clock size={28} color="#818cf8" />
          </div>
        </div>

        <div
          className={`card card-interactive ${filterType === 'overdue' ? 'active-radar-card' : ''}`}
          onClick={() => setFilterType('overdue')}
          style={{
            borderColor: filterType === 'overdue' ? '#f43f5e' : 'var(--border-color)',
            background: filterType === 'overdue' ? 'rgba(244, 63, 94, 0.15)' : 'var(--bg-card)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '12px', color: '#f43f5e', textTransform: 'uppercase', fontWeight: 700 }}>🚨 Overdue Accounts</div>
              <div style={{ fontSize: '24px', fontWeight: 800, marginTop: '4px', color: '#f43f5e' }}>
                {overdueList.length} Clients
              </div>
              <div style={{ fontSize: '13px', color: '#f43f5e', fontWeight: 600 }}>
                ₹{overdueList.reduce((s, c) => s + c.remainingAmount, 0).toLocaleString('en-IN')} Overdue
              </div>
            </div>
            <AlertOctagon size={28} color="#f43f5e" />
          </div>
        </div>

        <div
          className={`card card-interactive ${filterType === 'due_today' ? 'active-radar-card' : ''}`}
          onClick={() => setFilterType('due_today')}
          style={{
            borderColor: filterType === 'due_today' ? '#f59e0b' : 'var(--border-color)',
            background: filterType === 'due_today' ? 'rgba(245, 158, 11, 0.15)' : 'var(--bg-card)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '12px', color: '#f59e0b', textTransform: 'uppercase', fontWeight: 700 }}>⏰ Due Today</div>
              <div style={{ fontSize: '24px', fontWeight: 800, marginTop: '4px', color: '#f59e0b' }}>
                {dueTodayList.length} Clients
              </div>
              <div style={{ fontSize: '13px', color: '#f59e0b', fontWeight: 600 }}>
                ₹{dueTodayList.reduce((s, c) => s + c.remainingAmount, 0).toLocaleString('en-IN')} Due
              </div>
            </div>
            <Calendar size={28} color="#f59e0b" />
          </div>
        </div>

        <div
          className={`card card-interactive ${filterType === 'due_this_week' ? 'active-radar-card' : ''}`}
          onClick={() => setFilterType('due_this_week')}
          style={{
            borderColor: filterType === 'due_this_week' ? '#38bdf8' : 'var(--border-color)',
            background: filterType === 'due_this_week' ? 'rgba(14, 165, 233, 0.15)' : 'var(--bg-card)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '12px', color: '#38bdf8', textTransform: 'uppercase', fontWeight: 700 }}>📅 Due This Week</div>
              <div style={{ fontSize: '24px', fontWeight: 800, marginTop: '4px', color: '#38bdf8' }}>
                {dueThisWeekList.length} Clients
              </div>
              <div style={{ fontSize: '13px', color: '#38bdf8', fontWeight: 600 }}>
                ₹{dueThisWeekList.reduce((s, c) => s + c.remainingAmount, 0).toLocaleString('en-IN')} Due
              </div>
            </div>
            <Clock size={28} color="#38bdf8" />
          </div>
        </div>
      </div>

      {/* Radar Cards Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
          Scanning due milestones...
        </div>
      ) : displayedList.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '60px 20px' }}>
          <CheckCircle2 size={48} color="#10b981" style={{ margin: '0 auto 16px', display: 'block' }} />
          <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '8px' }}>No clients in this radar category!</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
            All accounts in this section are currently settled or clear.
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '20px' }}>
          {displayedList.map((client) => {
            const isOverdue = client.status === 'Overdue';
            const isDueToday = client.isDueToday;

            return (
              <div
                key={client._id}
                className="card card-interactive"
                style={{
                  borderLeft: `4px solid ${
                    isOverdue ? '#f43f5e' : isDueToday ? '#f59e0b' : '#38bdf8'
                  }`,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <div>
                    <h3 style={{ fontSize: '17px', fontWeight: 800 }}>{client.name}</h3>
                    {client.phone && <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>📞 {client.phone}</div>}
                  </div>
                  <span
                    className={`badge ${
                      isOverdue
                        ? 'badge-overdue'
                        : isDueToday
                        ? 'badge-partial'
                        : 'badge-pending'
                    }`}
                  >
                    {isOverdue ? `${client.daysOverdue}d Overdue` : isDueToday ? 'Due Today' : `Due in ${client.daysUntilDue}d`}
                  </span>
                </div>

                <div
                  style={{
                    background: 'rgba(255, 255, 255, 0.02)',
                    padding: '12px',
                    borderRadius: '8px',
                    marginBottom: '16px',
                    display: 'flex',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Total Agreed</div>
                    <div style={{ fontWeight: 700 }}>₹{Number(client.totalExpected).toLocaleString('en-IN')}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Paid So Far</div>
                    <div style={{ fontWeight: 700, color: '#10b981' }}>₹{Number(client.totalPaid).toLocaleString('en-IN')}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Remaining Due</div>
                    <div style={{ fontWeight: 800, color: isOverdue ? '#f43f5e' : '#f59e0b' }}>
                      ₹{Number(client.remainingAmount).toLocaleString('en-IN')}
                    </div>
                  </div>
                </div>

                {/* Progress */}
                <div style={{ marginBottom: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '4px' }}>
                    <span>Progress: {client.paymentPercentage}%</span>
                    <span>Due: {new Date(client.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
                  </div>
                  <div className="progress-container">
                    <div
                      className={`progress-bar ${isOverdue ? 'progress-bar-overdue' : 'progress-bar-partial'}`}
                      style={{ width: `${client.paymentPercentage}%` }}
                    />
                  </div>
                </div>

                {/* Card Actions */}
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    className="btn btn-whatsapp"
                    style={{ flex: 1, fontSize: '12px', padding: '8px 10px' }}
                    onClick={() => onOpenWhatsApp(client)}
                  >
                    <Send size={14} /> Send WhatsApp
                  </button>
                  <button
                    className="btn btn-primary"
                    style={{ flex: 1, fontSize: '12px', padding: '8px 10px' }}
                    onClick={() => onOpenNewPayment(client)}
                  >
                    <CreditCard size={14} /> Pay Now
                  </button>
                  <button
                    className="btn btn-secondary btn-icon"
                    onClick={() => onSelectClient(client)}
                    title="View Dossier"
                  >
                    <Eye size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
