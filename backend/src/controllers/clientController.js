import { Client } from '../models/Client.js';
import { Payment } from '../models/Payment.js';
import { Reminder } from '../models/Reminder.js';
import { calculateClientLedger } from '../services/ledgerService.js';
import { generateWhatsAppReminder } from '../services/reminderTemplateService.js';

export const getClients = async (req, res) => {
  try {
    const {
      search,
      status,
      ledgerType, // 'RECEIVABLE' (borrowed from me) | 'PAYABLE' (i borrowed)
      sortBy = 'dueDate',
      sortOrder = 'asc',
      dueFilter, // 'due_today', 'due_this_week', 'overdue'
    } = req.query;

    const query = { userId: req.user.id, isArchived: false };

    if (ledgerType && ledgerType !== 'ALL') {
      query.ledgerType = ledgerType;
    }

    if (search) {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { name: searchRegex },
        { phone: searchRegex },
        { email: searchRegex },
        { clientRefId: searchRegex },
      ];
    }

    // Fetch clients
    const clients = await Client.find(query).lean();

    if (clients.length === 0) {
      return res.status(200).json({
        success: true,
        count: 0,
        data: [],
      });
    }

    // Fetch all payments for these clients in one query
    const clientIds = clients.map((c) => c._id);
    const payments = await Payment.find({
      userId: req.user.id,
      clientId: { $in: clientIds },
    })
      .sort({ paymentDate: -1 })
      .lean();

    // Group payments by clientId
    const paymentsByClient = {};
    for (const p of payments) {
      const cId = p.clientId.toString();
      if (!paymentsByClient[cId]) {
        paymentsByClient[cId] = [];
      }
      paymentsByClient[cId].push(p);
    }

    // Calculate dynamic ledger for each client
    let clientsWithLedger = clients.map((client) => {
      const clientPayments = paymentsByClient[client._id.toString()] || [];
      return calculateClientLedger(client, clientPayments);
    });

    // Apply status filter
    if (status && status !== 'All') {
      clientsWithLedger = clientsWithLedger.filter(
        (c) => c.status.toLowerCase() === status.toLowerCase()
      );
    }

    // Apply specific due filters if requested
    if (dueFilter === 'due_today') {
      clientsWithLedger = clientsWithLedger.filter((c) => c.isDueToday);
    } else if (dueFilter === 'due_this_week') {
      clientsWithLedger = clientsWithLedger.filter((c) => c.isDueWithin7Days);
    } else if (dueFilter === 'overdue') {
      clientsWithLedger = clientsWithLedger.filter((c) => c.isOverdue);
    }

    // Sorting
    clientsWithLedger.sort((a, b) => {
      let multiplier = sortOrder === 'desc' ? -1 : 1;

      switch (sortBy) {
        case 'highest_balance':
        case 'remainingAmount':
          return (b.remainingAmount - a.remainingAmount) * (sortOrder === 'asc' ? -1 : 1);
        case 'oldest_overdue':
          return (b.daysOverdue - a.daysOverdue);
        case 'name':
          return multiplier * a.name.localeCompare(b.name);
        case 'totalAmount':
          return multiplier * (a.totalAmount - b.totalAmount);
        case 'dueDate':
        default:
          return multiplier * (new Date(a.dueDate) - new Date(b.dueDate));
      }
    });

    res.status(200).json({
      success: true,
      count: clientsWithLedger.length,
      data: clientsWithLedger,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error retrieving clients',
    });
  }
};

export const getClientById = async (req, res) => {
  try {
    const client = await Client.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Client not found',
      });
    }

    const payments = await Payment.find({
      userId: req.user.id,
      clientId: client._id,
    }).sort({ paymentDate: -1 });

    const ledger = calculateClientLedger(client, payments);

    res.status(200).json({
      success: true,
      data: {
        ...ledger,
        payments,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error retrieving client details',
    });
  }
};

export const createClient = async (req, res) => {
  try {
    const { name, phone, email, address, clientRefId, totalAmount, dueDate, notes, tags, ledgerType } = req.body;

    if (!name || totalAmount === undefined || !dueDate) {
      return res.status(400).json({
        success: false,
        message: 'Please provide client name, total agreed amount, and due date',
      });
    }

    const client = await Client.create({
      userId: req.user.id,
      name: name.trim(),
      phone: phone?.trim() || '',
      email: email?.trim() || '',
      address: address?.trim() || '',
      clientRefId: clientRefId?.trim() || '',
      totalAmount: Number(totalAmount),
      dueDate: new Date(dueDate),
      notes: notes?.trim() || '',
      tags: Array.isArray(tags) ? tags : [],
      ledgerType: ledgerType === 'PAYABLE' ? 'PAYABLE' : 'RECEIVABLE',
    });

    const ledger = calculateClientLedger(client, []);

    res.status(201).json({
      success: true,
      message: 'Client created successfully',
      data: ledger,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error creating client',
    });
  }
};

export const updateClient = async (req, res) => {
  try {
    const { name, phone, email, address, clientRefId, totalAmount, dueDate, notes, tags, isArchived, ledgerType } = req.body;

    let client = await Client.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Client not found',
      });
    }

    if (name !== undefined) client.name = name.trim();
    if (phone !== undefined) client.phone = phone.trim();
    if (email !== undefined) client.email = email.trim();
    if (address !== undefined) client.address = address.trim();
    if (clientRefId !== undefined) client.clientRefId = clientRefId.trim();
    if (totalAmount !== undefined) client.totalAmount = Number(totalAmount);
    if (dueDate !== undefined) client.dueDate = new Date(dueDate);
    if (notes !== undefined) client.notes = notes.trim();
    if (tags !== undefined) client.tags = Array.isArray(tags) ? tags : [];
    if (isArchived !== undefined) client.isArchived = Boolean(isArchived);
    if (ledgerType !== undefined) client.ledgerType = ledgerType === 'PAYABLE' ? 'PAYABLE' : 'RECEIVABLE';

    await client.save();

    const payments = await Payment.find({
      userId: req.user.id,
      clientId: client._id,
    }).sort({ paymentDate: -1 });

    const ledger = calculateClientLedger(client, payments);

    res.status(200).json({
      success: true,
      message: 'Client updated successfully',
      data: ledger,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error updating client',
    });
  }
};

export const deleteClient = async (req, res) => {
  try {
    const client = await Client.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Client not found',
      });
    }

    // Cascade delete associated payments & reminders
    await Payment.deleteMany({ userId: req.user.id, clientId: client._id });
    await Reminder.deleteMany({ userId: req.user.id, clientId: client._id });
    await client.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Client and all associated payment records deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error deleting client',
    });
  }
};

export const getWhatsAppReminder = async (req, res) => {
  try {
    const { templateType = 'standard' } = req.query;
    const client = await Client.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Client not found',
      });
    }

    const payments = await Payment.find({
      userId: req.user.id,
      clientId: client._id,
    });

    const ledger = calculateClientLedger(client, payments);

    const reminderPayload = generateWhatsAppReminder({
      clientName: client.name,
      phone: client.phone,
      remainingAmount: ledger.remainingAmount,
      totalAmount: ledger.totalExpected,
      dueDate: client.dueDate,
      daysOverdue: ledger.daysOverdue,
      upiId: req.user.upiId || '',
      businessName: req.user.businessName || 'DueLedger Account',
      templateType,
      ledgerType: client.ledgerType || 'RECEIVABLE',
    });

    res.status(200).json({
      success: true,
      data: reminderPayload,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error generating reminder',
    });
  }
};
