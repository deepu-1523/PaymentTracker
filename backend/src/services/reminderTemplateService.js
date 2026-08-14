/**
 * WhatsApp Reminder Message Generator
 */

export const generateWhatsAppReminder = ({
  clientName,
  phone,
  remainingAmount,
  totalAmount,
  dueDate,
  daysOverdue = 0,
  upiId = '',
  businessName = 'DueLedger Account',
  templateType = 'standard',
  ledgerType = 'RECEIVABLE',
}) => {
  const formattedAmount = `₹${Number(remainingAmount).toLocaleString('en-IN')}`;
  const formattedDueDate = new Date(dueDate).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  let message = '';

  if (ledgerType === 'PAYABLE') {
    // When I borrowed money from them
    switch (templateType) {
      case 'friendly':
        message = `Hi ${clientName}, hope you are doing well!\n\nJust wanted to confirm regarding the balance of *${formattedAmount}* I owe you. I am scheduling this to be cleared by *${formattedDueDate}*.\n\nThank you for your patience! 🙏`;
        break;
      case 'formal':
        message = `Dear ${clientName},\n\nThis is an acknowledgment regarding the outstanding payable balance of *${formattedAmount}*.\n\nTarget Settlement Date: *${formattedDueDate}*.\n\nRegards,\n${businessName}`;
        break;
      case 'urgent':
        message = `Hi ${clientName}, this is regarding the payment of *${formattedAmount}* due on *${formattedDueDate}*. I am processing this at the earliest priority. Thank you!`;
        break;
      case 'standard':
      default:
        message = `Hello ${clientName},\n\nThis is a note regarding the amount of *${formattedAmount}* scheduled to be paid to you by *${formattedDueDate}*.\n\nThank you!\n${businessName}`;
        break;
    }
  } else {
    // When they borrowed from me
    switch (templateType) {
      case 'friendly':
        message = `Hi ${clientName}, hope you are doing well!\n\nJust a gentle reminder regarding the pending balance of *${formattedAmount}* for your account with ${businessName}.\n\n📅 Due Date: *${formattedDueDate}*${
          upiId ? `\n💳 UPI ID: *${upiId}*` : ''
        }\n\nPlease let me know once processed. Thank you! 🙏`;
        break;

      case 'formal':
        message = `Dear ${clientName},\n\nThis is a formal payment notification regarding your account balance of *${formattedAmount}* (Total: ₹${Number(
          totalAmount
        ).toLocaleString('en-IN')}).\n\nScheduled Due Date: *${formattedDueDate}*${
          upiId ? `\nPayment UPI / Details: *${upiId}*` : ''
        }\n\nKindly arrange for the transfer at your earliest convenience.\n\nRegards,\n${businessName}`;
        break;

      case 'urgent':
        message = `URGENT PAYMENT REMINDER: Hi ${clientName}, your payment of *${formattedAmount}* was due on *${formattedDueDate}* and is currently *${daysOverdue} days overdue*.\n\nPlease clear the outstanding balance today.${
          upiId ? `\nUPI Payment ID: *${upiId}*` : ''
        }\n\nIf you have already transferred the amount, please share the transaction reference.`;
        break;

      case 'standard':
      default:
        message = `Hello ${clientName},\n\nThis is a reminder that your payment of *${formattedAmount}* is scheduled for *${formattedDueDate}*.${
          daysOverdue > 0 ? ` (Overdue by ${daysOverdue} days)` : ''
        }${upiId ? `\n\nYou can pay directly via UPI: *${upiId}*` : ''}\n\nThank you!\n${businessName}`;
        break;
    }
  }

  // Sanitize phone number (strip whitespace, +, -, (), etc.)
  let cleanPhone = (phone || '').replace(/[^\d]/g, '');
  // If Indian number without country code, add 91
  if (cleanPhone.length === 10) {
    cleanPhone = `91${cleanPhone}`;
  }

  const encodedMessage = encodeURIComponent(message);
  const directWhatsAppUrl = cleanPhone
    ? `https://wa.me/${cleanPhone}?text=${encodedMessage}`
    : `https://api.whatsapp.com/send?text=${encodedMessage}`;

  return {
    message,
    cleanPhone,
    directWhatsAppUrl,
  };
};
