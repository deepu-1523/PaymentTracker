import { Client } from '../models/Client.js';
import { Payment } from '../models/Payment.js';
import { calculateClientLedger, calculateDashboardSummary } from '../services/ledgerService.js';

export const getDashboardSummary = async (req, res) => {
  try {
    const clients = await Client.find({
      userId: req.user.id,
      isArchived: false,
    }).lean();

    const clientIds = clients.map((c) => c._id);
    const payments = await Payment.find({
      userId: req.user.id,
    })
      .sort({ paymentDate: -1 })
      .lean();

    // Map payments by client
    const paymentsByClient = {};
    for (const p of payments) {
      const cId = p.clientId.toString();
      if (!paymentsByClient[cId]) {
        paymentsByClient[cId] = [];
      }
      paymentsByClient[cId].push(p);
    }

    // Process ledger for every client
    const clientsWithLedger = clients.map((c) => {
      const cPayments = paymentsByClient[c._id.toString()] || [];
      return calculateClientLedger(c, cPayments);
    });

    const summary = calculateDashboardSummary(clientsWithLedger);

    // Recent payments (latest 8)
    const recentPayments = await Payment.find({ userId: req.user.id })
      .populate('clientId', 'name phone email')
      .sort({ paymentDate: -1 })
      .limit(8)
      .lean();

    // Upcoming due payments (due in the next 14 days, not fully paid)
    const upcomingDue = clientsWithLedger
      .filter((c) => c.status !== 'Paid' && c.daysUntilDue >= 0 && c.daysUntilDue <= 14)
      .sort((a, b) => a.daysUntilDue - b.daysUntilDue)
      .slice(0, 8);

    // Overdue clients list
    const overdueClients = clientsWithLedger
      .filter((c) => c.status === 'Overdue')
      .sort((a, b) => b.daysOverdue - a.daysOverdue)
      .slice(0, 8);

    // Top outstanding clients by remaining amount
    const topOutstanding = clientsWithLedger
      .filter((c) => c.remainingAmount > 0)
      .sort((a, b) => b.remainingAmount - a.remainingAmount)
      .slice(0, 5);

    // Monthly collection trend for the last 6 months
    const monthlyCollections = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthName = d.toLocaleString('en-US', { month: 'short' });
      const year = d.getFullYear();
      const nextMonth = new Date(d.getFullYear(), d.getMonth() + 1, 1);

      const monthPayments = payments.filter((p) => {
        const pDate = new Date(p.paymentDate);
        return pDate >= d && pDate < nextMonth;
      });

      const totalCollected = monthPayments.reduce((sum, p) => sum + (p.amount || 0), 0);

      monthlyCollections.push({
        month: `${monthName} ${year}`,
        monthShort: monthName,
        total: totalCollected,
        transactionCount: monthPayments.length,
      });
    }

    res.status(200).json({
      success: true,
      data: {
        summary,
        recentPayments,
        upcomingDue,
        overdueClients,
        topOutstanding,
        monthlyCollections,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error compiling dashboard summary',
    });
  }
};
