import { Payment } from '../models/Payment.js';
import { Client } from '../models/Client.js';
import { calculateClientLedger } from '../services/ledgerService.js';

export const recordPayment = async (req, res) => {
  try {
    const { clientId, amount, paymentDate, paymentMethod, referenceNumber, notes } = req.body;

    if (!clientId || amount === undefined || Number(amount) <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid client ID and a positive payment amount',
      });
    }

    const client = await Client.findOne({
      _id: clientId,
      userId: req.user.id,
    });

    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Client not found',
      });
    }

    const payment = await Payment.create({
      userId: req.user.id,
      clientId: client._id,
      amount: Number(amount),
      paymentDate: paymentDate ? new Date(paymentDate) : new Date(),
      paymentMethod: paymentMethod || 'UPI',
      referenceNumber: referenceNumber?.trim() || '',
      notes: notes?.trim() || '',
    });

    // Fetch all payments to compute updated ledger
    const allPayments = await Payment.find({
      userId: req.user.id,
      clientId: client._id,
    }).sort({ paymentDate: -1 });

    const updatedLedger = calculateClientLedger(client, allPayments);

    res.status(201).json({
      success: true,
      message: 'Payment recorded successfully',
      data: {
        payment,
        clientLedger: updatedLedger,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error recording payment',
    });
  }
};

export const getPayments = async (req, res) => {
  try {
    const { clientId, startDate, endDate, limit = 50 } = req.query;

    const query = { userId: req.user.id };

    if (clientId) {
      query.clientId = clientId;
    }

    if (startDate || endDate) {
      query.paymentDate = {};
      if (startDate) query.paymentDate.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.paymentDate.$lte = end;
      }
    }

    const payments = await Payment.find(query)
      .populate('clientId', 'name phone email totalAmount')
      .sort({ paymentDate: -1 })
      .limit(Number(limit));

    res.status(200).json({
      success: true,
      count: payments.length,
      data: payments,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error retrieving payments',
    });
  }
};

export const updatePayment = async (req, res) => {
  try {
    const { amount, paymentDate, paymentMethod, referenceNumber, notes } = req.body;

    const payment = await Payment.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment record not found',
      });
    }

    if (amount !== undefined) {
      if (Number(amount) <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Payment amount must be greater than 0',
        });
      }
      payment.amount = Number(amount);
    }

    if (paymentDate !== undefined) payment.paymentDate = new Date(paymentDate);
    if (paymentMethod !== undefined) payment.paymentMethod = paymentMethod;
    if (referenceNumber !== undefined) payment.referenceNumber = referenceNumber.trim();
    if (notes !== undefined) payment.notes = notes.trim();

    await payment.save();

    const client = await Client.findById(payment.clientId);
    const allPayments = await Payment.find({
      userId: req.user.id,
      clientId: payment.clientId,
    });

    const updatedLedger = client ? calculateClientLedger(client, allPayments) : null;

    res.status(200).json({
      success: true,
      message: 'Payment record updated successfully',
      data: {
        payment,
        clientLedger: updatedLedger,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error updating payment',
    });
  }
};

export const deletePayment = async (req, res) => {
  try {
    const payment = await Payment.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment record not found',
      });
    }

    const clientId = payment.clientId;
    await payment.deleteOne();

    const client = await Client.findById(clientId);
    const allPayments = await Payment.find({
      userId: req.user.id,
      clientId: clientId,
    });

    const updatedLedger = client ? calculateClientLedger(client, allPayments) : null;

    res.status(200).json({
      success: true,
      message: 'Payment record deleted successfully',
      data: {
        clientLedger: updatedLedger,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error deleting payment',
    });
  }
};
