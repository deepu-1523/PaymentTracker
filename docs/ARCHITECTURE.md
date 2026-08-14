# System Architecture & Technical Specifications

**DueLedger** is a transaction-based Personal Payment & Client Due Management System engineered for individual business owners, freelancers, and personal accounts to track receivables, multiple partial collections, overdue accounts, and scheduled due dates.

---

## 1. High-Level Architecture

```
+-------------------------------------------------------------+
|                  React + Vite Frontend (SPA)                |
|  - Executive Dashboard (KPIs, Recharts Trends, Action Radar)|
|  - Client Dossier & Ledger Timeline                         |
|  - Partial Payment Modal & Live Calculation Preview         |
|  - WhatsApp Reminder Generator (wa.me click-to-chat)        |
|  - PDF Statement & CSV Export Engine (jsPDF & PapaParse)    |
+------------------------------+------------------------------+
                               | (REST API / Bearer JWT)
+------------------------------v------------------------------+
|                   Node.js & Express API Server              |
|  - JWT Authentication & BCrypt Password Encryption         |
|  - Rate Limiting & Ownership Scoping Middleware             |
|  - Dynamic Ledger Calculation Engine (ledgerService.js)     |
|  - RESTful Endpoints (/api/clients, /api/payments, etc.)    |
+------------------------------+------------------------------+
                               |
+------------------------------v------------------------------+
|                     MongoDB Database Engine                 |
|  - Users Collection (Scoped ownership & UPI configuration)   |
|  - Clients Collection (Agreed amounts & due milestones)     |
|  - Payments Collection (Audit transactions ledger)          |
|  - Reminders Collection (Scheduled / Sent follow-ups)       |
+-------------------------------------------------------------+
```

---

## 2. Dynamic Transaction-Based Ledger Principle

Traditional naive payment apps store a static `remainingBalance` field directly on the client document. That creates severe data corruption issues whenever partial payments are modified, deleted, or entered out of sequence.

In **DueLedger**, remaining balance is **strictly dynamic and derived**:

$$\text{Remaining Amount} = \max\left(0, \text{Total Agreed Expected} - \sum_{i=1}^{n} \text{Payment}_i\right)$$

$$\text{Payment Percentage} = \left(\frac{\sum \text{Payment}_i}{\text{Total Agreed Expected}}\right) \times 100$$

### Dynamic Status State Machine:

| Condition | Evaluated Status | Color Code | Action Required |
| :--- | :--- | :--- | :--- |
| $\text{Remaining} = 0$ | **Paid** | Emerald Green | Settled / Closed |
| $\text{Paid} > 0 \land \text{Remaining} > 0 \land \text{Due Date} \ge \text{Today}$ | **Partial** | Amber / Yellow | Monitor schedule |
| $\text{Paid} = 0 \land \text{Due Date} \ge \text{Today}$ | **Pending** | Sky Blue | Awaiting payment |
| $\text{Remaining} > 0 \land \text{Due Date} < \text{Today}$ | **Overdue** | Coral Red | Urgent WhatsApp Follow-up |

---

## 3. Data Models Schema (Mongoose)

### 3.1 `User`
- `_id`: ObjectId
- `name`: String (required)
- `email`: String (required, unique)
- `password`: String (bcrypt hashed)
- `businessName`: String (e.g. "DueLedger Admin")
- `upiId`: String (e.g. "saurabh@upi")
- `currency`: String (Default: "INR")
- `createdAt`, `updatedAt`: Timestamps

### 3.2 `Client`
- `_id`: ObjectId
- `userId`: ObjectId (ref: User, indexed)
- `clientRefId`: String (optional ID, e.g. "CLI-101")
- `name`: String (required)
- `phone`: String (e.g. "9876543210")
- `email`: String
- `address`: String
- `totalAmount`: Number (total agreed receivable)
- `dueDate`: Date (scheduled settlement date)
- `notes`: String
- `tags`: Array of Strings
- `isArchived`: Boolean (default: false)
- `createdAt`, `updatedAt`: Timestamps

### 3.3 `Payment`
- `_id`: ObjectId
- `userId`: ObjectId (ref: User, indexed)
- `clientId`: ObjectId (ref: Client, indexed)
- `amount`: Number (required, > 0)
- `paymentDate`: Date (default: Date.now)
- `paymentMethod`: Enum ("Cash", "UPI", "Bank Transfer", "Card", "Other")
- `referenceNumber`: String (UTR / transaction receipt)
- `notes`: String
- `createdAt`, `updatedAt`: Timestamps

---

## 4. Security & Privacy Architecture

1. **User Scoping**: Every query (`Client.find`, `Payment.find`, `Payment.create`) explicitly incorporates `userId: req.user.id`. Users can never access or tamper with another account's financial ledger.
2. **Password Protection**: Passwords are encrypted with `bcryptjs` (salt rounds: 10) and excluded by default in schema queries (`select: false`).
3. **Rate Limiting**: Brute-force protection on authentication endpoints via `express-rate-limit`.
4. **CORS & Environment Variables**: Secure cross-origin sharing and environment-isolated secret management.
