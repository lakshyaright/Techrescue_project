# TechRescue Database Dictionary & Relationships

```
┌──────────────┐          ┌──────────────────────┐          ┌────────────────────┐
│    users     │ 1──────* │       queries        │ 1──────* │     work_logs      │
│  (Clients,   │          │ (Incidents, Status,  │          │ (Diagnostics, Hrs) │
│   Experts,   │          │  SLA Deadline, Cost) │          └────────────────────┘
│   Engineers) │          └──────────┬───────────┘
└──────┬───────┘                     │
       │                             │ 1
       │ 1                           │
       │                             ▼ *
       │ *                ┌──────────────────────┐
       └─────────────────►│       payments       │
                          │   (Escrow Vault,     │
                          │   Invoice Receipts)  │
                          └──────────────────────┘
```

## Schema Entities

### 1. `users`
- Stores all account credentials and specialist capabilities.
- Primary Key: `id` (VARCHAR)
- Unique: `email`
- Role values: `CLIENT`, `EXPERT`, `ENGINEER`, `ADMIN`

### 2. `queries`
- Core incident ticket repository.
- Primary Key: `id` (VARCHAR)
- Unique: `ticket_number` (e.g. `INC-20261008-0001`)
- Foreign Keys:
  - `client_id` -> `users(id)`
  - `assigned_expert_id` -> `users(id)`
  - `assigned_engineer_id` -> `users(id)`
- Indexes: `status`, `client_id`, `assigned_expert_id`, `assigned_engineer_id`

### 3. `work_logs`
- Specialist hours and technical diagnostics.
- Foreign Key: `query_id` -> `queries(id)` ON DELETE CASCADE

### 4. `payments`
- Escrow records with gross amount, platform margin, and net payout.
- Status values: `ESCROW_HELD`, `RELEASED`, `REFUNDED`

### 5. `activity_logs`
- Immutable system timeline supporting SOC 2 compliance.
