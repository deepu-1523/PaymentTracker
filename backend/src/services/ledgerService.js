/**
 * Ledger Service - Core Calculation Engine
 * Strictly follows transaction-based ledger computation rules.
 */

export const calculateClientLedger = (client, payments = []) => {
  const clientObj = client.toObject ? client.toObject() : client;
  const totalExpected = Number(clientObj.totalAmount) || 0;
  
  // Sum of all payment transactions
  const totalPaid = payments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
  
  // Remaining Amount = Total Expected - Total Paid
  const remainingAmount = Math.max(0, totalExpected - totalPaid);
  
  // Payment percentage calculation
  const paymentPercentage = totalExpected > 0
    ? Math.min(100, Math.round((totalPaid / totalExpected) * 1000) / 10)
    : 100;

  // Date evaluations based on start of day
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const dueDate = new Date(client.dueDate);
  const dueDay = new Date(dueDate);
  dueDay.setHours(0, 0, 0, 0);

  const diffTime = dueDay.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  const isDuePassed = diffDays < 0;
  const isDueToday = diffDays === 0;
  const isDueWithin7Days = diffDays >= 0 && diffDays <= 7;

  // Dynamic Status Determination (PRD Section 6)
  let status = 'Pending';
  if (remainingAmount <= 0) {
    status = 'Paid';
  } else if (isDuePassed) {
    status = 'Overdue';
  } else if (totalPaid > 0 && remainingAmount > 0) {
    status = 'Partial';
  } else {
    status = 'Pending';
  }

  const daysOverdue = isDuePassed ? Math.abs(diffDays) : 0;
  const daysUntilDue = diffDays;

  return {
    ...clientObj,
    ledgerType: clientObj.ledgerType || 'RECEIVABLE',
    totalExpected,
    totalPaid,
    remainingAmount,
    paymentPercentage,
    status,
    isOverdue: isDuePassed && remainingAmount > 0,
    isDueToday: isDueToday && remainingAmount > 0,
    isDueWithin7Days: isDueWithin7Days && remainingAmount > 0,
    daysOverdue,
    daysUntilDue,
    paymentCount: payments.length,
  };
};

/**
 * Aggregates summary statistics for a list of processed clients with Receivables vs Payables breakdown
 */
export const calculateDashboardSummary = (clientsWithLedger) => {
  let totalExpected = 0;
  let totalPaid = 0;
  let totalRemaining = 0;
  let totalOverdueAmount = 0;

  // Receivables (Borrowed from me / They owe me)
  let receivableExpected = 0;
  let receivablePaid = 0;
  let receivableRemaining = 0;
  let receivableOverdue = 0;
  let receivableCount = 0;

  // Payables (I borrowed / I owe them)
  let payableExpected = 0;
  let payablePaid = 0;
  let payableRemaining = 0;
  let payableOverdue = 0;
  let payableCount = 0;

  let paidCount = 0;
  let partialCount = 0;
  let pendingCount = 0;
  let overdueCount = 0;

  let dueTodayCount = 0;
  let dueWithin7DaysCount = 0;
  let dueTodayAmount = 0;
  let dueWithin7DaysAmount = 0;

  for (const c of clientsWithLedger) {
    const isReceivable = (c.ledgerType || 'RECEIVABLE') === 'RECEIVABLE';

    totalExpected += c.totalExpected;
    totalPaid += c.totalPaid;
    totalRemaining += c.remainingAmount;

    if (isReceivable) {
      receivableCount++;
      receivableExpected += c.totalExpected;
      receivablePaid += c.totalPaid;
      receivableRemaining += c.remainingAmount;
      if (c.status === 'Overdue') {
        receivableOverdue += c.remainingAmount;
      }
    } else {
      payableCount++;
      payableExpected += c.totalExpected;
      payablePaid += c.totalPaid;
      payableRemaining += c.remainingAmount;
      if (c.status === 'Overdue') {
        payableOverdue += c.remainingAmount;
      }
    }

    if (c.status === 'Paid') {
      paidCount++;
    } else if (c.status === 'Partial') {
      partialCount++;
    } else if (c.status === 'Overdue') {
      overdueCount++;
      totalOverdueAmount += c.remainingAmount;
    } else if (c.status === 'Pending') {
      pendingCount++;
    }

    if (c.isDueToday) {
      dueTodayCount++;
      dueTodayAmount += c.remainingAmount;
    }
    if (c.isDueWithin7Days) {
      dueWithin7DaysCount++;
      dueWithin7DaysAmount += c.remainingAmount;
    }
  }

  const overallRecoveryPercentage = totalExpected > 0
    ? Math.round((totalPaid / totalExpected) * 1000) / 10
    : 0;

  const netBalance = receivableRemaining - payableRemaining;

  return {
    totalClients: clientsWithLedger.length,
    totalExpected,
    totalPaid,
    totalRemaining,
    totalOverdueAmount,
    overallRecoveryPercentage,
    netBalance, // Positive = You will receive more; Negative = You owe more
    receivables: {
      count: receivableCount,
      totalExpected: receivableExpected,
      totalPaid: receivablePaid,
      remainingAmount: receivableRemaining,
      overdueAmount: receivableOverdue,
    },
    payables: {
      count: payableCount,
      totalExpected: payableExpected,
      totalPaid: payablePaid,
      remainingAmount: payableRemaining,
      overdueAmount: payableOverdue,
    },
    counts: {
      paid: paidCount,
      partial: partialCount,
      pending: pendingCount,
      overdue: overdueCount,
      dueToday: dueTodayCount,
      dueWithin7Days: dueWithin7DaysCount,
    },
    amounts: {
      dueTodayAmount,
      dueWithin7DaysAmount,
      overdueAmount: totalOverdueAmount,
    },
  };
};
