# TechRescue System Architecture & Technical Specifications

```
                     ┌────────────────────────────────────────┐
                     │          TechRescue Web Client         │
                     │  (React 19 + Vite + Tailwind CSS)     │
                     └───────────────────┬────────────────────┘
                                         │
                                         ▼ HTTPS / REST
                     ┌────────────────────────────────────────┐
                     │           Node.js Express API          │
                     │  - JWT Authentication & RBAC           │
                     │  - Concurrency Lock Engine             │
                     │  - SLA Countdown Calculators           │
                     └───────────────────┬────────────────────┘
                                         │
                                         ▼ TCP / pg Pool
                     ┌────────────────────────────────────────┐
                     │          PostgreSQL 16 Engine          │
                     │  - Row-Level Locking (FOR UPDATE)      │
                     │  - Relational Schemas & Indexes        │
                     │  - Immutable Audit Trails              │
                     └────────────────────────────────────────┘
```

---

## 1. Concurrency Lock & Race Condition Architecture

In enterprise IT marketplaces, multiple specialists may attempt to claim an urgent high-paying ticket simultaneously. Informal email or uncoordinated systems suffer from double assignments and customer confusion.

TechRescue resolves this with a **Database Transaction Row Lock**:

```sql
-- Step 1: Open Transaction
BEGIN TRANSACTION;

-- Step 2: Acquire exclusive row lock
SELECT id, status 
FROM queries 
WHERE id = $ticket_id 
FOR UPDATE;

-- Step 3: Evaluate invariant
-- If status != 'OPEN': Rollback and return HTTP 409 Conflict

-- Step 4: Atomically update ownership
UPDATE queries 
SET status = 'IN_PROGRESS', 
    assigned_expert_id = $expert_id, 
    updated_at = NOW() 
WHERE id = $ticket_id;

-- Step 5: Commit transaction & release row lock
COMMIT;
```

---

## 2. Dynamic Priority & SLA Calculation Matrix

| Impact | Urgency | Priority Tier | Target SLA | Base Escrow |
| :--- | :--- | :--- | :--- | :--- |
| **ENTERPRISE** | Any | **CRITICAL (P1)** | **2 Hours** | ₹6,500 |
| Any | **EMERGENCY** | **CRITICAL (P1)** | **2 Hours** | ₹6,500 |
| **HIGH** | **HIGH** | **HIGH (P2)** | **4 Hours** | ₹4,500 |
| **HIGH** | Medium/Low | **HIGH (P2)** | **4 Hours** | ₹4,500 |
| **MEDIUM** | **MEDIUM** | **MEDIUM (P3)** | **12 Hours** | ₹3,500 |
| **LOW** | **LOW** | **LOW (P4)** | **24 Hours** | ₹2,000 |

---

## 3. Financial Escrow Architecture

1. **Intake Authorization**: Client authorizes hold of estimated funds upon submitting incident.
2. **Custody**: Funds held in TechRescue Escrow Vault (`status = ESCROW_HELD`).
3. **Execution**: Specialist investigates, uploads diagnostics, and provides fix.
4. **Sign-off**: Client verifies production services and rates work (1–5 stars).
5. **Split Disbursal**:
   - 90% credited to Specialist (`status = RELEASED`).
   - 10% retained as TechRescue platform fee.
   - Formal GST tax invoice generated for accounting records.
