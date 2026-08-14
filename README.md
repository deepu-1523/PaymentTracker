# DueLedger — Personal Payment & Client Due Management System

[![Node.js](https://img.shields.io/badge/Node.js-v20+-green.svg)](https://nodejs.org)
[![React](https://img.shields.io/badge/React-v18-blue.svg)](https://reactjs.org)
[![Database](https://img.shields.io/badge/Database-MongoDB-emerald.svg)](https://www.mongodb.com/)
[![License](https://img.shields.io/badge/License-MIT-purple.svg)](LICENSE)

A private, transaction-based web application and Admin command center for tracking money owed by clients, recording single and multiple partial payments, auto-calculating real-time balances, monitoring due dates, generating WhatsApp payment reminders, and exporting audit statements.

---

## 🌟 Key Features

1. **Transaction-Based Balance Calculation Engine**:
   - Dynamic formula: $\text{Remaining} = \text{Agreed Amount} - \sum(\text{Transactions})$.
   - Never manual or out-of-sync: edits and deletions reactively recompute balances.
2. **Automatic Dynamic Status State Machine**:
   - `Paid` (100% recovered)
   - `Partial` (Partial payments received, before due date)
   - `Pending` (Awaiting initial payment, before due date)
   - `Overdue` (Balance pending past scheduled due date)
3. **Executive Admin Dashboard**:
   - KPI Stat cards with Indian Rupee (`₹`) formatting.
   - Monthly Collection Trend bar chart.
   - Action Radar for Due Today, Due within 7 Days, and Urgent Overdue follow-ups.
   - Top 5 Outstanding Debtors leaderboard.
4. **Client Dossier & Ledger Timeline**:
   - Complete contact card, payment progress bar, notes, and full payment history.
5. **Instant WhatsApp Reminder Generator**:
   - 4 customized tones (Standard, Friendly, Formal, Urgent).
   - Dynamic placeholders for client name, amount, due date, days overdue, and UPI ID.
   - One-click `wa.me` chat launcher.
6. **Financial Reports & Exports**:
   - Daily, Weekly, Monthly, and All-Time collection analytics.
   - Payment method distribution chart (UPI vs Cash vs Bank Transfer vs Card).
   - 1-Click CSV Exports for Client Ledger and Payment Audit Log.
   - 1-Click PDF Statement Generator and printable Payment Receipts.

---

## 🚀 Quickstart Guide

### 1. Prerequisites
- **Node.js** (v18 or newer)
- **MongoDB** (Local instance or MongoDB Atlas URI, or automatically runs embedded fallback in dev)

### 2. Installation
Clone the repository and install all dependencies:
```bash
# In the root project directory:
npm run install:all
```
*(Or navigate into `backend` and `frontend` separately and run `npm install`)*

### 3. Running Locally
Start both backend and frontend concurrently or in separate terminals:

**Terminal 1 (Backend API):**
```bash
cd backend
npm run dev
```
*Backend runs on `http://localhost:5000`*

**Terminal 2 (Frontend UI):**
```bash
cd frontend
npm run dev
```
*Frontend runs on `http://localhost:3000`*

---

## 🧪 Running Automated Tests

Run the test suite verifying all calculation rules, partial payment accumulations, and WhatsApp message formatting:
```bash
cd backend
npm test
```

---

## 📁 Repository Structure

```
PAYMENT/
├── backend/
│   ├── src/
│   │   ├── config/          # MongoDB connection & memory fallback
│   │   ├── controllers/     # Auth, Clients, Payments, Dashboard, Reports
│   │   ├── middleware/      # JWT auth guard & rate limiting
│   │   ├── models/          # User, Client, Payment, Reminder schemas
│   │   ├── routes/          # Express route definitions
│   │   ├── services/        # Ledger calculation & WhatsApp template engine
│   │   ├── tests/           # Unit & calculation test suite
│   │   └── server.js        # Server entrypoint
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/      # Sidebar, Navbar, StatCard, Modals (Payment, Client, WhatsApp, Receipt)
│   │   ├── context/         # AuthContext & ToastContext
│   │   ├── pages/           # Dashboard, Clients, ClientDetail, Payments, DueTracker, Reports, Settings, Auth
│   │   ├── services/        # API client & CSV/PDF Export helpers
│   │   ├── styles/          # Responsive Glassmorphic Dark UI
│   │   ├── App.jsx          # App root orchestrator
│   │   └── main.jsx         # React DOM entrypoint
│   └── vite.config.js
├── docs/
│   ├── ARCHITECTURE.md      # System design, data schema & calculation rules
│   ├── API_DOCUMENTATION.md # REST API endpoint specifications
│   ├── USER_GUIDE.md        # Admin operator manual
│   └── PROJECT_LOG.md       # Development progress and milestone log
└── README.md
```

---

## 📚 Documentation Links
- [System Architecture](file:///c:/Users/chaur/Desktop/PAYMENT/docs/ARCHITECTURE.md)
- [REST API Documentation](file:///c:/Users/chaur/Desktop/PAYMENT/docs/API_DOCUMENTATION.md)
- [User Guide](file:///c:/Users/chaur/Desktop/PAYMENT/docs/USER_GUIDE.md)
- [Project Execution Log](file:///c:/Users/chaur/Desktop/PAYMENT/docs/PROJECT_LOG.md)
