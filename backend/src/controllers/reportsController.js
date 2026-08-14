import { Client } from '../models/Client.js';
import { Payment } from '../models/Payment.js';
import { calculateClientLedger } from '../services/ledgerService.js';

export const getReports = async (req, res) => {
  try {
    const { timeRange = 'all' } = req.query;

    const clients = await Client.find({ userId: req.user.id, isArchived: false }).lean();
    const payments = await Payment.find({ userId: req.user.id })
      .populate('clientId', 'name phone email totalAmount dueDate')
      .sort({ paymentDate: -1 })
      .lean();

    // Group payments by client
    const paymentsByClient = {};
    for (const p of payments) {
      if (!p.clientId) continue;
      const cId = p.clientId._id ? p.clientId._id.toString() : p.clientId.toString();
      if (!paymentsByClient[cId]) {
        paymentsByClient[cId] = [];
      }
      paymentsByClient[cId].push(p);
    }

    const clientsWithLedger = clients.map((c) => {
      const cPayments = paymentsByClient[c._id.toString()] || [];
      return calculateClientLedger(c, cPayments);
    });

    // Time calculations
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const todayCollected = payments
      .filter((p) => new Date(p.paymentDate) >= startOfToday)
      .reduce((sum, p) => sum + (p.amount || 0), 0);

    const weekCollected = payments
      .filter((p) => new Date(p.paymentDate) >= startOfWeek)
      .reduce((sum, p) => sum + (p.amount || 0), 0);

    const monthCollected = payments
      .filter((p) => new Date(p.paymentDate) >= startOfMonth)
      .reduce((sum, p) => sum + (p.amount || 0), 0);

    const totalCollectedAllTime = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
    const totalExpectedAllTime = clients.reduce((sum, c) => sum + (c.totalAmount || 0), 0);
    const totalOutstandingAllTime = Math.max(0, totalExpectedAllTime - totalCollectedAllTime);

    // Method breakdown
    const paymentMethodsBreakdown = {
      UPI: 0,
      Cash: 0,
      'Bank Transfer': 0,
      Card: 0,
      Other: 0,
    };

    payments.forEach((p) => {
      const method = p.paymentMethod || 'Other';
      paymentMethodsBreakdown[method] = (paymentMethodsBreakdown[method] || 0) + (p.amount || 0);
    });

    res.status(200).json({
      success: true,
      data: {
        metrics: {
          todayCollected,
          weekCollected,
          monthCollected,
          totalCollectedAllTime,
          totalExpectedAllTime,
          totalOutstandingAllTime,
        },
        paymentMethodsBreakdown,
        clients: clientsWithLedger,
        allPayments: payments,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error generating reports',
    });
  }
};
