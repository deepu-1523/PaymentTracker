# DueLedger REST API Documentation

Base URL: `http://localhost:5000/api`

All protected routes require an `Authorization: Bearer <JWT_TOKEN>` header.

---

## 1. Authentication Endpoints

### Register New Admin
- **URL**: `POST /api/auth/register`
- **Body**:
```json
{
  "name": "Saurabh Sharma",
  "email": "admin@dueledger.com",
  "password": "SecretPassword123",
  "businessName": "DueLedger Admin",
  "upiId": "saurabh@upi"
}
```
- **Response (201)**:
```json
{
  "success": true,
  "token": "eyJhbGciOi...",
  "user": { "id": "...", "name": "...", "email": "...", "upiId": "..." }
}
```

### Login Admin
- **URL**: `POST /api/auth/login`
- **Body**:
```json
{
  "email": "admin@dueledger.com",
  "password": "SecretPassword123"
}
```

### Get Current Profile
- **URL**: `GET /api/auth/me`
- **Headers**: `Authorization: Bearer <TOKEN>`

### Update Profile & UPI ID
- **URL**: `PUT /api/auth/profile`
- **Body**:
```json
{
  "name": "Saurabh",
  "businessName": "Saurabh Tech Services",
  "upiId": "saurabh@oksbi"
}
```

---

## 2. Client Management Endpoints

### Get All Clients (with Ledger Calculations)
- **URL**: `GET /api/clients`
- **Query Parameters**:
  - `search` (string): Filter by name, phone, email, clientRefId
  - `status` (string): `All`, `Paid`, `Partial`, `Pending`, `Overdue`
  - `dueFilter` (string): `due_today`, `due_this_week`, `overdue`
  - `sortBy` (string): `dueDate`, `highest_balance`, `oldest_overdue`, `name`, `totalAmount`
- **Response (200)**:
```json
{
  "success": true,
  "count": 4,
  "data": [
    {
      "_id": "66bc...",
      "name": "Rahul",
      "phone": "9876543210",
      "totalExpected": 50000,
      "totalPaid": 30000,
      "remainingAmount": 20000,
      "paymentPercentage": 60,
      "status": "Partial",
      "dueDate": "2026-08-25T00:00:00.000Z",
      "daysOverdue": 0,
      "daysUntilDue": 11,
      "paymentCount": 2
    }
  ]
}
```

### Get Client by ID (with Full Payment History)
- **URL**: `GET /api/clients/:id`

### Create Client
- **URL**: `POST /api/clients`
- **Body**:
```json
{
  "name": "Rahul",
  "phone": "9876543210",
  "email": "rahul@example.com",
  "totalAmount": 50000,
  "dueDate": "2026-08-25",
  "clientRefId": "CLI-101",
  "notes": "50% advance milestone"
}
```

### Update Client
- **URL**: `PUT /api/clients/:id`

### Delete Client (Cascades to all payments)
- **URL**: `DELETE /api/clients/:id`

### Generate WhatsApp Reminder
- **URL**: `GET /api/clients/:id/whatsapp-reminder?templateType=standard|friendly|formal|urgent`
- **Response (200)**:
```json
{
  "success": true,
  "data": {
    "message": "Hello Rahul...",
    "cleanPhone": "919876543210",
    "directWhatsAppUrl": "https://wa.me/919876543210?text=..."
  }
}
```

---

## 3. Payment Transactions Endpoints

### Record Payment
- **URL**: `POST /api/payments`
- **Body**:
```json
{
  "clientId": "66bc...",
  "amount": 15000,
  "paymentDate": "2026-08-14",
  "paymentMethod": "UPI",
  "referenceNumber": "UPI-48293819283",
  "notes": "First partial instalment"
}
```
- **Response (201)**: Returns the saved payment record and the updated client ledger calculation.

### Get All Payments
- **URL**: `GET /api/payments`
- **Query Parameters**: `clientId`, `startDate`, `endDate`, `limit`

### Update Payment
- **URL**: `PUT /api/payments/:id`

### Delete Payment
- **URL**: `DELETE /api/payments/:id`

---

## 4. Dashboard & Reports Endpoints

### Get Executive Dashboard Summary
- **URL**: `GET /api/dashboard/summary`
- **Response**: Aggregated total expected, total paid, total remaining, total overdue, due counts, recent payments, upcoming dues, top outstanding debtors, monthly collections.

### Get Financial Reports
- **URL**: `GET /api/reports`
- **Response**: Today/Week/Month/All-Time collected metrics, payment method distributions, full client ledger statement data.
