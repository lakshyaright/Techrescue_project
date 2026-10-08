# TechRescue Database Architecture & Setup Guide

This directory contains the production PostgreSQL schema definitions, migration scripts, and seed fixtures for the **TechRescue Enterprise IT Support & Expert Marketplace Platform**.

---

## 1. Prerequisites
- **PostgreSQL**: Version 14 or higher (v16 recommended)
- **psql CLI** or graphical tool (pgAdmin, DBeaver)
- Alternatively: **Docker** & **Docker Compose**

---

## 2. Quickstart with Docker (Recommended)

Run PostgreSQL in a container:
```bash
docker run --name techrescue-postgres \
  -e POSTGRES_USER=techrescue_user \
  -e POSTGRES_PASSWORD=techrescue_pass \
  -e POSTGRES_DB=techrescue_db \
  -p 5432:5432 \
  -d postgres:16-alpine
```

---

## 3. Manual Local PostgreSQL Setup

### Step 1: Create Database and User
Log in to your local PostgreSQL instance:
```bash
psql -U postgres
```

Execute SQL commands:
```sql
CREATE DATABASE techrescue_db;
CREATE USER techrescue_user WITH ENCRYPTED PASSWORD 'techrescue_pass';
GRANT ALL PRIVILEGES ON DATABASE techrescue_db TO techrescue_user;
\q
```

### Step 2: Run Schema DDL
```bash
psql -U techrescue_user -d techrescue_db -h localhost -f database/schema.sql
```

### Step 3: Load Enterprise Seed Fixtures
```bash
psql -U techrescue_user -d techrescue_db -h localhost -f database/seed.sql
```

---

## 4. Key Relational Models & Integrity

| Table Name | Description | Key Foreign Keys |
| :--- | :--- | :--- |
| `users` | Multi-role user accounts (Client, Expert, Field Engineer, Admin) | Primary Key `id` |
| `user_skills` | Normalized technical skills per specialist | `user_id -> users(id)` |
| `queries` | Core incident tickets, severity, status, and SLA timers | `client_id`, `assigned_expert_id`, `assigned_engineer_id` |
| `work_logs` | Diagnostic hours and CLI traces recorded by specialists | `query_id -> queries(id)`, `author_id -> users(id)` |
| `chat_messages` | Real-time incident collaboration messages | `query_id -> queries(id)`, `sender_id -> users(id)` |
| `payments` | Cryptographic escrow transactions and GST tax invoices | `ticket_id -> queries(id)`, `client_id`, `payee_id` |
| `activity_logs` | Immutable audit trail for SOC 2 Type II compliance | `query_id`, `user_id` |

---

## 5. Concurrency & Ticket Locking Rationale

To prevent double assignments when two remote experts attempt to accept an open P1 incident concurrently:
```sql
BEGIN TRANSACTION;

-- Select ticket with row-level lock
SELECT id, status 
FROM queries 
WHERE id = 'tkt-10231' 
FOR UPDATE;

-- Backend checks: If status != 'OPEN', rollback and abort:
-- "Ticket already locked by another specialist"

-- If OPEN, claim exclusively:
UPDATE queries 
SET status = 'IN_PROGRESS', 
    assigned_expert_id = 'usr-expert-1',
    updated_at = NOW()
WHERE id = 'tkt-10231';

COMMIT;
```
This PostgreSQL row-level lock ensures guaranteed atomicity and zero race conditions.
