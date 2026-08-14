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
2. **Two-Way Ledger Support**:
   - 🟢 **Who Borrowed From Me (Receivables)**: Money you will receive.
   - 🔴 **Which I Have Borrowed (Payables)**: Money you need to repay.
   - ⚖️ **Net Position**: Real-time Surplus/Deficit.
3. **Executive Admin Dashboard**:
   - Single-screen master view with live cashflow ribbon and split-screen dossier.
   - KPI Stat cards with Indian Rupee (`₹`) formatting.
   - Action Radar for Due Today, Due within 7 Days, and Urgent Overdue follow-ups.
4. **Client Dossier & Ledger Timeline**:
   - Complete contact card, payment progress bar, notes, and full payment history.
5. **Instant WhatsApp Reminder Generator**:
   - 4 customized tones (Standard, Friendly, Formal, Urgent).
   - Dynamic placeholders for client name, amount, due date, days overdue, and UPI ID.
   - One-click `wa.me` chat launcher.
6. **Financial Reports & Exports**:
   - Daily, Weekly, Monthly, and All-Time collection analytics.
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

## 🌐 Production Deployment Guide

For full instructions on deploying the Backend (e.g. Render / Railway) and Frontend (e.g. Vercel / Netlify) without login errors, refer to:
📖 **[Production Deployment Guide](file:///c:/Users/chaur/Desktop/PAYMENT/docs/DEPLOYMENT_GUIDE.md)**

---

## 🧪 Running Automated Tests

Run the test suite verifying all calculation rules, two-way ledger balances, and WhatsApp message formatting:
```bash
cd backend
npm test
```

---

## 📚 Documentation Links
- [Production Deployment Guide](file:///c:/Users/chaur/Desktop/PAYMENT/docs/DEPLOYMENT_GUIDE.md)
- [System Architecture](file:///c:/Users/chaur/Desktop/PAYMENT/docs/ARCHITECTURE.md)
- [REST API Documentation](file:///c:/Users/chaur/Desktop/PAYMENT/docs/API_DOCUMENTATION.md)
- [User Guide](file:///c:/Users/chaur/Desktop/PAYMENT/docs/USER_GUIDE.md)
- [Project Execution Log](file:///c:/Users/chaur/Desktop/PAYMENT/docs/PROJECT_LOG.md)
