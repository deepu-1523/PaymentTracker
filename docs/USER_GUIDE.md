# DueLedger — User Guide & Operator Manual

Welcome to **DueLedger**, your personal and private command center for tracking money owed to you, client receivables, partial payments, and upcoming due milestones.

---

## 1. Quick Start & Instant Demo Access

1. Open the application in your browser (typically `http://localhost:3000`).
2. On the login screen, click **"1-Click Instant Demo Login"** to automatically initialize an Admin session, or register with your email and password.

---

## 2. Managing Clients & Agreed Receivables

### Adding a New Client
1. Click the **"Add Client"** button in the sidebar or top navbar.
2. Enter:
   - **Client / Person Name**: e.g., `Rahul Sharma`
   - **Total Agreed Amount**: The total expected payment, e.g., `50000`
   - **Payment Due Date**: The date when this amount should be settled.
   - **Phone / WhatsApp**: e.g., `9876543210` (used for WhatsApp reminders).
   - Optional Email, Address, Reference ID, and internal notes.
3. Click **"Create Client"**.
4. The client immediately appears with dynamic status (`Pending` if before due date, `Overdue` if past due date).

---

## 3. Recording Partial & Full Payments

> [!TIP]
> **Never calculate balances by hand.** The system calculates the exact remaining balance and progress percentage dynamically from your payment entries.

1. Click **"Record Payment"** in the sidebar or the `+` icon on any client card.
2. Select the client name.
3. The modal shows the agreed amount, amount paid so far, and the current balance due.
4. Enter the **Payment Amount** (or click **"Full Due"** / **"50% Due"** quick buttons).
5. Notice the **Live Calculation Preview**: it shows the exact new balance and new status (`PAID` or `PARTIAL`) before you even hit save!
6. Select the **Payment Method** (`UPI`, `Cash`, `Bank Transfer`, `Card`, `Other`), enter optional UTR / Ref #, and click **"Confirm & Save Payment"**.

---

## 4. WhatsApp Payment Reminders

1. Find any client with a pending balance and click the **"WhatsApp"** button.
2. Choose from 4 tailored message tones:
   - **Standard**: Clean, polite reminder with date and balance.
   - **Friendly**: Warm, conversational tone.
   - **Formal**: Professional invoice statement format.
   - **Urgent**: Emphasizes overdue days and requests immediate settlement.
3. The message automatically includes the client's name, balance due, due date, days overdue, and your configured UPI handle.
4. Click **"Launch WhatsApp Chat"** to open `https://wa.me/` with the pre-filled message ready to send!

---

## 5. Generating Printable Receipts & PDF Statements

1. **Payment Receipts**:
   - In any payment row, click the **Receipt icon**.
   - A clean, verified payment slip appears with the transaction amount, date, payment method, and business name.
   - Click **"Print Receipt"** or **"Download Statement PDF"**.
2. **Client PDF Statement**:
   - Open a client's dossier and click **"Statement PDF"**.
   - A branded statement with all partial payments listed in a structured table is automatically saved to your downloads.

---

## 6. Financial Intelligence & CSV Exports

1. Go to the **Financial Analytics / Reports** tab.
2. Review collections by time: Today, This Week, This Month, and All-Time.
3. View the **Collections by Method** pie chart to see your primary payment channels (UPI, Cash, Bank Transfer).
4. Click **"Export Clients CSV"** or **"Export Payments CSV"** for complete spreadsheet backups.
