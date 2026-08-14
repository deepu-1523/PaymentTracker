# DueLedger — Development Execution Log

This document records the engineering progression, architecture decisions, and verification milestones completed during the development of DueLedger.

---

## Milestone 1: Requirements Analysis & Specification
- Reviewed PRD requirements for Personal Payment & Client Due Management System.
- Formulated the core dynamic ledger principle: calculations must be transaction-driven (`Remaining = Total - Sum(Payments)`) rather than static fields to prevent ledger drift.
- Planned responsive React frontend + Express REST backend + MongoDB data models + comprehensive documentation.

---

## Milestone 2: Backend Architecture & REST APIs
- **Database Connection (`backend/src/config/db.js`)**: Connected Mongoose to MongoDB with embedded memory fallback for 100% fail-safe standalone local execution.
- **Data Models**:
  - `User.js`: User schema with BCrypt password hashing, JWT helper methods, and custom UPI/business preferences.
  - `Client.js`: Client schema for agreed receivables, scheduled due date, contact info, notes, user scoping, and `ledgerType` (`RECEIVABLE` vs `PAYABLE`).
  - `Payment.js`: Transaction schema storing payment date, amount, method, reference/UTR #, and audit timestamps.
  - `Reminder.js`: Reminder schema for tracking WhatsApp communication history.
- **Calculation & Ledger Engine (`backend/src/services/ledgerService.js`)**:
  - Auto-calculates remaining balances, payment completion percentages, overdue days, due milestones.
  - Computes two-way financial position: **You Will Receive (Receivables)**, **You Will Give (Payables)**, and **Net Position** ($\text{Receivables} - \text{Payables}$).
  - Resolves dynamic statuses: `Paid`, `Partial`, `Pending`, `Overdue`.
  - Aggregates executive dashboard metrics (total expected, collected, balance, overdue, recovery %).
- **WhatsApp Generator Service (`backend/src/services/reminderTemplateService.js`)**:
  - Dynamic template builder (Standard, Friendly, Formal, Urgent) supporting both debtor reminders and creditor payment notes with `wa.me` direct links.
- **Controllers & Routes**:
  - Full CRUD for Clients (`/api/clients`) with two-way `ledgerType` filter, search, and sorting.
  - Full CRUD for Payments (`/api/payments`) with live balance recalculation.
  - Executive Dashboard summary (`/api/dashboard/summary`).
  - Reports & Analytics breakdown (`/api/reports`).
  - Auth protection with JWT & rate limiting (`/api/auth`).

---

## Milestone 3: Two-Way Ledger UI & Glassmorphic Dashboard
- **Design System (`frontend/src/styles/index.css`)**:
  - Dark glassmorphic theme with glowing accents, status badges (emerald, amber, rose, sky blue), custom scrollbars, and fluid responsive grid.
- **Two-Way Primary Hero Cards (`DashboardPage.jsx`)**:
  - 🟢 **YOU WILL RECEIVE**: Total pending to collect from people who borrowed from you.
  - 🔴 **YOU WILL GIVE**: Total pending to repay to people you borrowed from.
  - ⚖️ **NET POSITION**: Real-time asset/liability balance (Green for surplus, Red for liability).
- **Core Components & Modals**:
  - `ClientModal.jsx`: Segmented switch between **"They Borrowed From Me (To Receive)"** and **"I Borrowed (To Give)"**.
  - `PaymentModal.jsx`: Context-aware modal for recording received payments vs repayments made.
  - `WhatsAppModal.jsx`: Generates tailored debtor reminders or creditor updates.
  - `ClientsPage.jsx`: Filter tabs for All, Borrowed From Me, and I Borrowed with directional tags (`↓ They Borrowed` vs `↑ I Borrowed`).
  - `ClientDetailPage.jsx`: Dossier with type badge, customized balance cards, and PDF statement export.

---

## Milestone 4: Verification & Automated Test Results
- **Backend Test Suite (`backend/src/tests/api.test.js`)**:
  - 7 unit and integration tests executed:
    1. Rahul test (Receivable ₹50k/30k partial) $\rightarrow$ `PASS`
    2. Amit test (Receivable ₹25k/25k paid) $\rightarrow$ `PASS`
    3. Priya test (Receivable ₹40k overdue) $\rightarrow$ `PASS`
    4. Payable test (I Borrowed ₹80k, Repaid ₹30k $\rightarrow$ ₹50k remaining) $\rightarrow$ `PASS`
    5. Vikram multi-partial payments $\rightarrow$ `PASS`
    6. Dual ledger aggregator & Net Position (+₹10k) $\rightarrow$ `PASS`
    7. WhatsApp generator for both Receivable & Payable modes $\rightarrow$ `PASS`
