# TechRescue — Enterprise IT Support & Expert Marketplace Platform

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen)](https://github.com/lakshyaright/Techrescue_project)
[![Node.js](https://img.shields.io/badge/node-v20+-blue)](https://nodejs.org/)
[![PostgreSQL](https://img.shields.io/badge/postgres-v16-blue)](https://www.postgresql.org/)
[![React](https://img.shields.io/badge/react-v19-61dafb)](https://react.dev/)
[![License](https://img.shields.io/badge/license-Apache--2.0-lightgrey)](LICENSE)

TechRescue is an enterprise IT support and expert marketplace platform that connects corporate clients with certified remote IT specialists and on-site field engineers for technical incidents under guaranteed SLAs and secure financial escrow protection.

---

## 📑 Table of Contents
1. [Platform Architecture](#-platform-architecture)
2. [User Roles & Workflows](#-user-roles--workflows)
3. [Repository Directory Structure](#-repository-directory-structure)
4. [Quickstart (Docker Compose)](#-quickstart-docker-compose)
5. [Local Development Setup](#-local-development-setup)
   - [Database Setup](#1-database-setup-postgresql)
   - [Backend API Setup](#2-backend-api-setup-nodejs--express)
   - [Frontend Web Setup](#3-frontend-client-setup-react--vite)
6. [Ticket Concurrency & Row-Lock Engine](#-ticket-concurrency--row-lock-engine)
7. [API Endpoints Overview](#-api-endpoints-overview)
8. [Documentation Links](#-documentation-links)

---

## 🏛 Platform Architecture

```
CLIENT (Corporate Buyer)
   │
   │ Technical Emergency
   ▼
RAISE QUERY WIZARD (3-Step Intake)
   │
   ▼
TECHRESCUE INCIDENT TICKET
   │
   ├───────────────────────────────┐
   ▼                               ▼
REMOTE EXPERT               FIELD ENGINEER
(Cloud, Network, Security)  (On-Site Datacenter, Cabling)
   │                               │
   └───────────────┬───────────────┘
                   ▼
         ATOMIC TRANSACTION LOCK
                   ▼
         DIAGNOSTICS & WORK LOGS
                   ▼
          CLIENT RESOLUTION APPROVAL
                   ▼
          ESCROW DISBURSEMENT (90/10)
```

---

## 👥 User Roles & Workflows

| Role | Key Capabilities | Demo Persona |
| :--- | :--- | :--- |
| **CLIENT** | Raise query (3-step wizard), track SLA, align remote experts, dispatch field engineers, live incident chat, approve resolution, release escrow. | **Sonu Patel** (VP Infrastructure, FinTech Global) |
| **EXPERT** | Browse open query pool, atomic ticket lock claim, log diagnostic hours/notes, submit root-cause summary, earnings ledger. | **Rahul Sharma** (Principal Cloud & Network Architect) |
| **ENGINEER** | Proximity dispatch alerts, site check-in (`TRAVELING` $\rightarrow$ `ON_SITE` $\rightarrow$ `IN_PROGRESS` $\rightarrow$ `RESOLVED`), Fluke OTDR testing, site sign-off. | **Rajesh Kumar** (Senior On-Site Hardware & Cabling Lead) |
| **ADMIN** | Executive KPI console (12,450 users, ₹25.4L GMV), supervisory incident override, SLA compliance matrix, immutable SOC 2 audit trail. | **Lakshya** (Operations Director & Super Admin) |

---

## 📁 Repository Directory Structure

```
Techrescue_project/
├── backend/
│   ├── src/
│   │   ├── config/             # PostgreSQL connection pool (pg)
│   │   ├── controllers/        # Auth, Query, Expert, Engineer, Payment controllers
│   │   ├── middleware/         # JWT verification, RBAC, error handling
│   │   └── routes/             # REST endpoints (/api/v1/*)
│   ├── .env.example
│   ├── Dockerfile
│   ├── package.json
│   ├── README.md               # Backend-specific setup guide
│   └── server.js               # Express application entry point
│
├── database/
│   ├── schema.sql              # Complete PostgreSQL DDL schemas & triggers
│   ├── seed.sql                # Production enterprise seed fixtures
│   └── README.md               # Database setup and migration guide
│
├── docs/
│   ├── manual.md               # Complete 4-role user & operations manual
│   ├── architecture.md         # Architecture diagrams & locking mechanics
│   ├── api.md                  # REST API reference documentation
│   ├── database.md             # Schema dictionaries & ER relationships
│   └── deployment.md           # Docker, Cloud Run & CI/CD guide
│
├── frontend/                   # Documentation for React client
│   └── README.md
│
├── src/                        # Complete React 19 + Vite frontend source
│   ├── components/
│   │   ├── charts/             # Responsive SVG trend & category charts
│   │   ├── common/             # Zero-pill Badges, Modals, Skeleton loaders
│   │   └── layout/             # TopBar, Sidebar, DemoBanner, Footer
│   ├── context/                # AuthContext, DataContext, NotificationContext
│   ├── data/                   # Enterprise mock seed fixtures
│   ├── pages/                  # Public, Auth, Client, Expert, Engineer, Admin views
│   ├── types/                  # Strict TypeScript definitions
│   ├── App.tsx                 # Routing configuration
│   └── main.tsx
│
├── docker-compose.yml          # Multi-container orchestration (DB, API, Web)
├── Dockerfile                  # Frontend container build definition
├── index.html                  # HTML entry point with Plus Jakarta Sans fonts
├── package.json
└── README.md                   # Master repository documentation
```

---

## 🚀 Quickstart (Docker Compose)

To spin up all 3 services (PostgreSQL, Express API, React Client) with a single command:

```bash
docker-compose up --build -d
```

- **Frontend Application**: `http://localhost:3000`
- **Backend REST API**: `http://localhost:5000` (Health Check: `http://localhost:5000/health`)
- **PostgreSQL Database**: `localhost:5432`

---

## 💻 Local Development Setup

### 1. Database Setup (PostgreSQL)

```bash
# Connect to your PostgreSQL instance
psql -U postgres

# Create database and user
CREATE DATABASE techrescue_db;
CREATE USER techrescue_user WITH ENCRYPTED PASSWORD 'techrescue_pass';
GRANT ALL PRIVILEGES ON DATABASE techrescue_db TO techrescue_user;
\q

# Apply schema & load seed fixtures
psql -U techrescue_user -d techrescue_db -f database/schema.sql
psql -U techrescue_user -d techrescue_db -f database/seed.sql
```

### 2. Backend API Setup (Node.js & Express)

```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

### 3. Frontend Client Setup (React & Vite)

```bash
# In the root repository
npm install
npm run dev
```
Open `http://localhost:3000` in your browser.

---

## 🔒 Ticket Concurrency & Row-Lock Engine

TechRescue prevents race conditions when multiple specialists attempt to claim the same urgent ticket using PostgreSQL transaction locks:

```sql
BEGIN TRANSACTION;

-- 1. Acquire exclusive row lock
SELECT id, status FROM queries WHERE id = 'tkt-10231' FOR UPDATE;

-- 2. Concurrency verification:
-- If status != 'OPEN': Rollback and return HTTP 409 Conflict

-- 3. Atomic transition
UPDATE queries 
SET status = 'IN_PROGRESS', assigned_expert_id = 'usr-expert-1', updated_at = NOW() 
WHERE id = 'tkt-10231';

COMMIT;
```

---

## 📖 Documentation Links

- [User Operations Manual](docs/manual.md)
- [System Architecture & SLA Engine](docs/architecture.md)
- [REST API Reference](docs/api.md)
- [Database Data Dictionary](docs/database.md)
- [DevOps & Deployment Guide](docs/deployment.md)

---

## 📄 License
Licensed under the Apache License, Version 2.0.
