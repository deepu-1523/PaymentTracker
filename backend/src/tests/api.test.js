/**
 * Comprehensive Automated Tests for DueLedger Backend
 * Tests calculation rules, partial payments, status transitions, two-way ledger (Receivables vs Payables), and WhatsApp messages.
 */

import assert from 'node:assert';
import { calculateClientLedger, calculateDashboardSummary } from '../services/ledgerService.js';
import { generateWhatsAppReminder } from '../services/reminderTemplateService.js';

console.log('🧪 Starting DueLedger Calculation Engine & Ledger Tests...\n');

// 1. Test PRD Section 7 Example: Rahul (Total ₹50,000; Paid ₹30,000; Remaining ₹20,000 -> Partial)
{
  const rahulClient = {
    _id: 'c1',
    name: 'Rahul',
    ledgerType: 'RECEIVABLE',
    totalAmount: 50000,
    dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days in future
  };
  const rahulPayments = [
    { amount: 10000, paymentDate: new Date() },
    { amount: 20000, paymentDate: new Date() },
  ];

  const ledger = calculateClientLedger(rahulClient, rahulPayments);

  assert.strictEqual(ledger.totalExpected, 50000, 'Total expected should be 50,000');
  assert.strictEqual(ledger.totalPaid, 30000, 'Total paid should be 30,000');
  assert.strictEqual(ledger.remainingAmount, 20000, 'Remaining should be 20,000');
  assert.strictEqual(ledger.paymentPercentage, 60, 'Payment % should be 60%');
  assert.strictEqual(ledger.status, 'Partial', 'Status should be Partial');
  assert.strictEqual(ledger.ledgerType, 'RECEIVABLE');
  console.log('✅ PASS: Rahul test (Total ₹50k, Paid ₹30k, Remaining ₹20k -> Partial)');
}

// 2. Test PRD Section 7 Example: Amit (Total ₹25,000; Paid ₹25,000; Remaining ₹0 -> Paid)
{
  const amitClient = {
    _id: 'c2',
    name: 'Amit',
    ledgerType: 'RECEIVABLE',
    totalAmount: 25000,
    dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
  };
  const amitPayments = [
    { amount: 25000, paymentDate: new Date() },
  ];

  const ledger = calculateClientLedger(amitClient, amitPayments);

  assert.strictEqual(ledger.totalPaid, 25000, 'Total paid should be 25,000');
  assert.strictEqual(ledger.remainingAmount, 0, 'Remaining should be 0');
  assert.strictEqual(ledger.paymentPercentage, 100, 'Payment % should be 100%');
  assert.strictEqual(ledger.status, 'Paid', 'Status should be Paid');
  console.log('✅ PASS: Amit test (Total ₹25k, Paid ₹25k, Remaining ₹0 -> Paid)');
}

// 3. Test PRD Section 7 Example: Priya (Total ₹40,000; Paid ₹0; Due date passed -> Overdue)
{
  const priyaClient = {
    _id: 'c3',
    name: 'Priya',
    ledgerType: 'RECEIVABLE',
    totalAmount: 40000,
    dueDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days past due
  };
  const priyaPayments = [];

  const ledger = calculateClientLedger(priyaClient, priyaPayments);

  assert.strictEqual(ledger.totalPaid, 0, 'Total paid should be 0');
  assert.strictEqual(ledger.remainingAmount, 40000, 'Remaining should be 40,000');
  assert.strictEqual(ledger.paymentPercentage, 0, 'Payment % should be 0%');
  assert.strictEqual(ledger.status, 'Overdue', 'Status should be Overdue');
  assert.strictEqual(ledger.isOverdue, true, 'isOverdue flag should be true');
  assert.ok(ledger.daysOverdue >= 4, 'Days overdue should be >= 4');
  console.log('✅ PASS: Priya test (Total ₹40k, Paid ₹0, Due passed -> Overdue)');
}

// 4. Test PAYABLE Ledger Type (Which I Have Borrowed)
{
  const borrowedClient = {
    _id: 'c_pay_1',
    name: 'Karan Lender',
    ledgerType: 'PAYABLE',
    totalAmount: 80000,
    dueDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
  };
  const paymentsToKaran = [
    { amount: 30000 },
  ];

  const ledger = calculateClientLedger(borrowedClient, paymentsToKaran);

  assert.strictEqual(ledger.ledgerType, 'PAYABLE');
  assert.strictEqual(ledger.totalExpected, 80000);
  assert.strictEqual(ledger.totalPaid, 30000);
  assert.strictEqual(ledger.remainingAmount, 50000);
  assert.strictEqual(ledger.status, 'Partial');
  console.log('✅ PASS: PAYABLE test (Borrowed ₹80k, Repaid ₹30k, Remaining to pay ₹50k -> Partial)');
}

// 5. Test Multiple Partial Payments Accumulation
{
  const multiPayClient = {
    _id: 'c5',
    name: 'Vikram',
    totalAmount: 100000,
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  };
  const payments = [
    { amount: 15000 },
    { amount: 25000 },
    { amount: 10000 },
    { amount: 50000 },
  ];

  const ledger = calculateClientLedger(multiPayClient, payments);
  assert.strictEqual(ledger.totalPaid, 100000);
  assert.strictEqual(ledger.remainingAmount, 0);
  assert.strictEqual(ledger.status, 'Paid');
  console.log('✅ PASS: Vikram multiple partial payments accumulation (15k+25k+10k+50k -> 100k Paid)');
}

// 6. Test Two-Way Dashboard Summary Aggregator & Net Position
{
  // People who borrowed from me (Receivables)
  const rahul = calculateClientLedger({ ledgerType: 'RECEIVABLE', totalAmount: 50000, dueDate: new Date(Date.now() + 10 * 86400000) }, [{ amount: 30000 }]); // rem: 20k
  const priya = calculateClientLedger({ ledgerType: 'RECEIVABLE', totalAmount: 40000, dueDate: new Date(Date.now() - 5 * 86400000) }, []); // rem: 40k

  // People I borrowed from (Payables)
  const karan = calculateClientLedger({ ledgerType: 'PAYABLE', totalAmount: 80000, dueDate: new Date(Date.now() + 20 * 86400000) }, [{ amount: 30000 }]); // rem: 50k

  const summary = calculateDashboardSummary([rahul, priya, karan]);

  assert.strictEqual(summary.totalClients, 3);
  assert.strictEqual(summary.receivables.remainingAmount, 60000); // 20k + 40k
  assert.strictEqual(summary.payables.remainingAmount, 50000); // 50k
  assert.strictEqual(summary.netBalance, 10000); // 60k - 50k = +10k in your favor
  console.log('✅ PASS: Dual Ledger Aggregator & Net Position (Receive: ₹60k, Give: ₹50k -> Net Balance: +₹10k)');
}

// 7. Test WhatsApp Reminder Generator for both RECEIVABLE and PAYABLE
{
  const recReminder = generateWhatsAppReminder({
    clientName: 'Priya Verma',
    phone: '9876543210',
    remainingAmount: 40000,
    totalAmount: 40000,
    dueDate: new Date('2026-08-01'),
    daysOverdue: 13,
    upiId: 'saurabh@upi',
    templateType: 'urgent',
    ledgerType: 'RECEIVABLE',
  });
  assert.ok(recReminder.message.includes('URGENT PAYMENT REMINDER'));
  assert.ok(recReminder.message.includes('₹40,000'));

  const payReminder = generateWhatsAppReminder({
    clientName: 'Karan Lender',
    phone: '9876543210',
    remainingAmount: 50000,
    totalAmount: 80000,
    dueDate: new Date('2026-08-25'),
    templateType: 'friendly',
    ledgerType: 'PAYABLE',
  });
  assert.ok(payReminder.message.includes('I owe you'));
  assert.ok(payReminder.message.includes('₹50,000'));

  console.log('✅ PASS: WhatsApp Generator for both RECEIVABLE and PAYABLE modes');
}

console.log('\n🎉 ALL 7 CALCULATION ENGINE & BUSINESS LOGIC TESTS PASSED SUCCESSFULLY!\n');
