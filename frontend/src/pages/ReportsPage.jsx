import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  Download,
  Calendar,
  DollarSign,
  TrendingUp,
  CreditCard,
  PieChart as PieIcon,
  FileSpreadsheet,
} from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import { api } from '../services/api';
import { exportClientsCSV, exportPaymentsCSV } from '../services/exportService';
import { useToast } from '../context/ToastContext';

export const ReportsPage = () => {
  const { addToast } = useToast();
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const res = await api.reports.getReports();
      setReportData(res.data);
    } catch (err) {
      addToast(err.message || 'Failed to generate financial reports', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleExportFullClients = () => {
    if (reportData?.clients) {
      exportClientsCSV(reportData.clients, `Full_Client_Ledger_Report_${new Date().toISOString().split('T')[0]}.csv`);
      addToast('Client receivables CSV exported!', 'success');
    }
  };

  const handleExportFullPayments = () => {
    if (reportData?.allPayments) {
      exportPaymentsCSV(reportData.allPayments, `Full_Payment_Audit_Report_${new Date().toISOString().split('T')[0]}.csv`);
      addToast('Payment audit CSV exported!', 'success');
    }
  };

  if (loading && !reportData) {
    return (
      <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)' }}>
        Generating financial intelligence reports...
      </div>
    );
  }

  const { metrics, paymentMethodsBreakdown = {}, clients = [] } = reportData || {};

  // Pie chart data for payment methods
  const methodColors = {
    UPI: '#6366f1',
    Cash: '#10b981',
    'Bank Transfer': '#38bdf8',
    Card: '#f59e0b',
    Other: '#a855f7',
  };

  const pieData = Object.entries(paymentMethodsBreakdown)
    .filter(([_, val]) => val > 0)
    .map(([key, val]) => ({
      name: key,
      value: val,
      color: methodColors[key] || '#94a3b8',
    }));

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Financial Intelligence & Analytics</h1>
          <p className="page-subtitle">
            Time-based collection performance, payment channel breakdown, and exportable statements
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn btn-secondary" onClick={handleExportFullClients}>
            <FileSpreadsheet size={16} />
            Export Clients CSV
          </button>
          <button className="btn btn-primary" onClick={handleExportFullPayments}>
            <Download size={16} />
            Export Payments CSV
          </button>
        </div>
      </div>

      {/* Time-Based Collection Metrics */}
      <div className="stat-grid" style={{ marginBottom: '28px' }}>
        <div className="card">
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Today Collected</div>
          <div style={{ fontSize: '24px', fontWeight: 800, marginTop: '6px', color: '#10b981' }}>
            ₹{Number(metrics?.todayCollected || 0).toLocaleString('en-IN')}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
            Collected today
          </div>
        </div>

        <div className="card">
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>This Week Collected</div>
          <div style={{ fontSize: '24px', fontWeight: 800, marginTop: '6px', color: '#38bdf8' }}>
            ₹{Number(metrics?.weekCollected || 0).toLocaleString('en-IN')}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
            Past 7 days
          </div>
        </div>

        <div className="card">
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>This Month Collected</div>
          <div style={{ fontSize: '24px', fontWeight: 800, marginTop: '6px', color: '#818cf8' }}>
            ₹{Number(metrics?.monthCollected || 0).toLocaleString('en-IN')}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
            Current month to date
          </div>
        </div>

        <div className="card">
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>All-Time Outstanding</div>
          <div style={{ fontSize: '24px', fontWeight: 800, marginTop: '6px', color: '#f43f5e' }}>
            ₹{Number(metrics?.totalOutstandingAllTime || 0).toLocaleString('en-IN')}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
            Total pending debt
          </div>
        </div>
      </div>

      {/* Grid: Payment Method Breakdown & Client Balance Breakdown */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '24px', marginBottom: '28px' }}>
        {/* Payment Methods Pie Chart */}
        <div className="card">
          <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '4px' }}>Collections by Method</h3>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '16px' }}>
            Preferred client payment channels
          </p>

          {pieData.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 10px', color: 'var(--text-muted)', fontSize: '13px' }}>
              No payments recorded yet to display chart
            </div>
          ) : (
            <div style={{ width: '100%', height: 240 }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: '#111827',
                      border: '1px solid var(--border-color)',
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                    formatter={(val) => [`₹${Number(val).toLocaleString('en-IN')}`, 'Amount']}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Client-wise Outstanding Summary Table */}
        <div className="card">
          <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '4px' }}>Client-wise Receivables Summary</h3>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '16px' }}>
            Breakdown of agreed, collected, and remaining balances
          </p>

          <div className="table-container" style={{ maxHeight: '300px', overflowY: 'auto' }}>
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Client</th>
                  <th>Agreed (₹)</th>
                  <th>Collected (₹)</th>
                  <th>Balance Due (₹)</th>
                  <th>Recovery %</th>
                </tr>
              </thead>
              <tbody>
                {clients.map((c) => (
                  <tr key={c._id}>
                    <td style={{ fontWeight: 700 }}>{c.name}</td>
                    <td>₹{Number(c.totalExpected).toLocaleString('en-IN')}</td>
                    <td style={{ color: '#10b981', fontWeight: 600 }}>
                      ₹{Number(c.totalPaid).toLocaleString('en-IN')}
                    </td>
                    <td style={{ color: c.remainingAmount > 0 ? '#f43f5e' : '#10b981', fontWeight: 700 }}>
                      ₹{Number(c.remainingAmount).toLocaleString('en-IN')}
                    </td>
                    <td>
                      <span className={`badge ${c.paymentPercentage === 100 ? 'badge-paid' : 'badge-partial'}`} style={{ fontSize: '11px' }}>
                        {c.paymentPercentage}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
