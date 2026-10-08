# TechRescue — Enterprise IT Support & Expert Marketplace Platform

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen)](https://github.com/lakshyaright/Techrescue_project)
[![Node.js](https://img.shields.io/badge/node-v20+-blue)](https://nodejs.org/)
[![PostgreSQL](https://img.shields.io/badge/Azure%20PostgreSQL-Flexible%20Server-0078D4)](https://azure.microsoft.com/)
[![React](https://img.shields.io/badge/react-v19-61dafb)](https://react.dev/)
[![Azure App Gateway](https://img.shields.io/badge/Azure-Application%20Gateway-0078D4)](https://azure.microsoft.com/)

TechRescue is an enterprise IT support and expert marketplace platform that connects corporate infrastructure teams with certified remote IT specialists and rapid-dispatch field engineers under guaranteed SLAs and cryptographic escrow protection.

---

## 🏛 2-VM Azure Monolithic Deployment Architecture

For phase-1 production deployment, the platform is structured across **two dedicated Linux Virtual Machines (Ubuntu 22.04 LTS)**, managed by an **Azure Application Gateway** for public access and SSL termination, backed by an **Azure Database for PostgreSQL Flexible Server**.

```
                           PUBLIC INTERNET
                                  │
                                  ▼ (HTTPS :443 / HTTP :80)
            ┌──────────────────────────────────────────┐
            │        Azure Application Gateway         │
            │          (Public IP: 20.x.x.x)           │
            └─────────────────────┬────────────────────┘
                                  │
         ┌────────────────────────┴────────────────────────┐
         │ Path: /*                                        │ Path: /api/*
         ▼                                                 ▼
┌──────────────────────────────┐              ┌──────────────────────────────┐
│       VM 1: Frontend         │              │        VM 2: Backend         │
│  - Ubuntu 22.04 LTS          │              │  - Ubuntu 22.04 LTS          │
│  - Private IP: 10.0.1.4      │              │  - Private IP: 10.0.2.4      │
│  - Nginx Reverse Proxy (:80) │              │  - Node.js Express (:5000)   │
│  - React Production Bundle   │              │  - Systemd Service Manager   │
└──────────────────────────────┘              └──────────────┬───────────────┘
                                                             │
                                                             ▼ SSL :5432 (sslmode=require)
                                              ┌──────────────────────────────┐
                                              │   Azure Database for         │
                                              │   PostgreSQL Flexible Server │
                                              │   (Private Endpoint / VNet)  │
                                              └──────────────────────────────┘
```

---

## 📋 Prerequisites & Azure Sizing Requirements

### 1. Azure Virtual Network (VNet) Topology
- **VNet Address Space**: `10.0.0.0/16`
  - **Subnet 1: `AppGatewaySubnet`** (`10.0.0.0/24`) $\rightarrow$ Dedicated exclusively for Azure Application Gateway.
  - **Subnet 2: `FrontendSubnet`** (`10.0.1.0/24`) $\rightarrow$ Contains Frontend VM.
  - **Subnet 3: `BackendSubnet`** (`10.0.2.0/24`) $\rightarrow$ Contains Backend VM.
  - **Subnet 4: `DatabaseSubnet`** (`10.0.3.0/24`) $\rightarrow$ Delegated to `Microsoft.DBforPostgreSQL/flexibleServers`.

### 2. Virtual Machine Sizing & OS
- **Frontend VM (`techrescue-vm-frontend`)**:
  - **Size**: `Standard_B2s` (2 vCPUs, 4 GiB RAM)
  - **OS**: Ubuntu 22.04 LTS
  - **Network Security Group (NSG)**: Inbound Port 80 (from `AppGatewaySubnet`), Inbound Port 22 (SSH).
- **Backend VM (`techrescue-vm-backend`)**:
  - **Size**: `Standard_B2ms` (2 vCPUs, 8 GiB RAM)
  - **OS**: Ubuntu 22.04 LTS
  - **Network Security Group (NSG)**: Inbound Port 5000 (from `AppGatewaySubnet` and `FrontendSubnet`), Inbound Port 22 (SSH).

### 3. Managed Services
- **Database**: Azure Database for PostgreSQL Flexible Server (`Standard_B1ms` or `Standard_D2ds_v5` with SSL enabled).
- **Gateway**: Azure Application Gateway (Tier: `Standard_v2` or `WAF_v2`, Public IP SKU: `Standard`).

---

## 🚀 Step-by-Step Deployment Guide

### Step 1: Provision Azure Database for PostgreSQL

1. In the Azure Portal or Azure CLI, create a **PostgreSQL Flexible Server**:
   ```bash
   az postgres flexible-server create \
     --resource-group TechRescue-RG \
     --name techrescue-psql-prod \
     --location centralindia \
     --admin-user techrescue_admin \
     --admin-password "YourStrongPassword123!" \
     --sku-name Standard_B1ms \
     --tier Burstable \
     --version 16 \
     --database-name techrescue_db
   ```
2. Enable firewall rule to allow internal Azure VM connections:
   ```bash
   az postgres flexible-server firewall-rule create \
     --resource-group TechRescue-RG \
     --name techrescue-psql-prod \
     --rule-name AllowAzureVMs \
     --start-ip-address 0.0.0.0 --end-ip-address 0.0.0.0
   ```
3. Load the database schema and seed fixtures:
   ```bash
   psql "postgresql://techrescue_admin:YourStrongPassword123!@techrescue-psql-prod.postgres.database.azure.com:5432/techrescue_db?sslmode=require" -f database/schema.sql
   psql "postgresql://techrescue_admin:YourStrongPassword123!@techrescue-psql-prod.postgres.database.azure.com:5432/techrescue_db?sslmode=require" -f database/seed.sql
   ```

---

### Step 2: Configure VM 2 (Backend VM)

1. SSH into the Backend VM:
   ```bash
   ssh azureuser@<BACKEND_VM_PUBLIC_OR_BASTION_IP>
   ```
2. Run the automated provisioning script:
   ```bash
   git clone https://github.com/lakshyaright/Techrescue_project.git /var/www/techrescue
   cd /var/www/techrescue
   sudo bash deploy/scripts/setup-backend-vm.sh
   ```
3. Configure the database environment file `/var/www/techrescue/backend/.env`:
   ```env
   PORT=5000
   NODE_ENV=production
   DATABASE_URL=postgresql://techrescue_admin:YourStrongPassword123!@techrescue-psql-prod.postgres.database.azure.com:5432/techrescue_db?sslmode=require
   JWT_SECRET=production_enterprise_jwt_secret_token_2026
   CORS_ORIGIN=*
   ```
4. Restart and verify the systemd service:
   ```bash
   sudo systemctl restart techrescue-backend
   sudo systemctl status techrescue-backend
   curl -i http://localhost:5000/health
   ```

---

### Step 3: Configure VM 1 (Frontend VM)

1. SSH into the Frontend VM:
   ```bash
   ssh azureuser@<FRONTEND_VM_PUBLIC_OR_BASTION_IP>
   ```
2. Run the automated provisioning script:
   ```bash
   git clone https://github.com/lakshyaright/Techrescue_project.git /var/www/techrescue
   cd /var/www/techrescue
   sudo bash deploy/scripts/setup-frontend-vm.sh
   ```
3. Update `/etc/nginx/sites-available/techrescue-frontend` with your Backend VM internal private IP (e.g. `10.0.2.4`) and reload Nginx:
   ```bash
   sudo nginx -t
   sudo systemctl reload nginx
   curl -I http://localhost/health
   ```

---

### Step 4: Configure Azure Application Gateway (Path-Based Routing)

Follow our complete [Azure Application Gateway Setup Guide](deploy/azure-application-gateway.md):

1. **Backend Pools**:
   - `techrescue-frontend-pool` $\rightarrow$ Target IP: `10.0.1.4` (Frontend VM)
   - `techrescue-backend-pool` $\rightarrow$ Target IP: `10.0.2.4` (Backend VM)
2. **Health Probes**:
   - `probe-frontend`: Path `/health`, Status `200`
   - `probe-backend`: Path `/health`, Status `200`
3. **Backend HTTP Settings**:
   - `setting-frontend`: Port `80`, Protocol `HTTP`, Probe: `probe-frontend`
   - `setting-backend`: Port `5000`, Protocol `HTTP`, Probe: `probe-backend`
4. **Routing Rule (Path-Based)**:
   - Default Target (`/*`) $\rightarrow$ `techrescue-frontend-pool`
   - Path Rule (`/api/*`) $\rightarrow$ `techrescue-backend-pool`

---

## 👥 User Roles & Platform Features

| Role | Key Capabilities | Demo Persona |
| :--- | :--- | :--- |
| **CLIENT** | Raise query (3-step wizard), track SLA countdown, align experts, dispatch field technicians, live chat, approve resolution, release escrow. | **Sonu Patel** (VP Infrastructure, FinTech Global) |
| **EXPERT** | Browse open query pool, atomic ticket lock claim, log diagnostic hours/CLI notes, submit root-cause summary, earnings ledger. | **Rahul Sharma** (Principal Cloud & Network Architect) |
| **ENGINEER** | Proximity dispatch alerts, site check-in (`TRAVELING` $\rightarrow$ `ON_SITE` $\rightarrow$ `IN_PROGRESS` $\rightarrow$ `RESOLVED`), Fluke OTDR testing, site sign-off. | **Rajesh Kumar** (Senior On-Site Hardware & Cabling Lead) |
| **ADMIN** | Executive KPI console (12,450 users, ₹25.4L GMV), supervisory incident override, SLA compliance matrix, immutable SOC 2 audit trail. | **Lakshya** (Operations Director & Super Admin) |

---

## 🔒 Ticket Concurrency & Row-Lock Engine

TechRescue prevents duplicate assignments when multiple specialists claim an urgent incident using PostgreSQL transaction locks:

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

## 📁 Repository Directory Structure

```
Techrescue_project/
├── backend/                    # Node.js Express API
│   ├── src/
│   │   ├── config/db.js        # Azure PostgreSQL Flexible Server SSL pool
│   │   ├── controllers/        # Concurrency lock, Auth, Query, Payment
│   │   ├── middleware/         # JWT verification, RBAC, trust proxy
│   │   └── routes/             # REST endpoints (/api/v1/*)
│   ├── .env.example            # Azure PostgreSQL connection string templates
│   ├── package.json
│   └── server.js               # Trust proxy & health probe endpoints
│
├── frontend/                   # React 19 + Vite + Tailwind CSS SPA
│   ├── src/                    # Components, pages, context, services
│   ├── index.html
│   ├── package.json
│   ├── Dockerfile
│   └── README.md
│
├── database/                   # Database Schemas & Migrations
│   ├── schema.sql              # DDL schema definition
│   ├── seed.sql                # Production seed fixtures
│   └── README.md
│
├── deploy/                     # Azure VM & Gateway Deployment Assets
│   ├── azure-application-gateway.md # App Gateway Path-Based routing guide
│   ├── nginx/
│   │   └── techrescue-frontend.conf # Production Nginx SPA & reverse proxy config
│   ├── systemd/
│   │   └── techrescue-backend.service # Systemd unit file for Node.js API
│   └── scripts/
│       ├── setup-backend-vm.sh      # Automated Backend VM script
│       ├── setup-frontend-vm.sh     # Automated Frontend VM script
│       └── setup-azure-postgres.sh  # Azure CLI PostgreSQL setup script
│
├── docs/                       # Operations manuals & architecture
│   ├── manual.md               # Complete 4-role user manual
│   ├── architecture.md         # Architecture diagrams & locking mechanics
│   ├── api.md                  # REST API reference documentation
│   ├── database.md             # Schema dictionary
│   └── deployment.md           # Multi-VM deployment guide
│
├── docker-compose.yml          # Local container orchestration
└── README.md                   # Master Azure deployment documentation
```

---

## 📖 Extended Documentation Links

- [Azure Application Gateway Setup Guide](deploy/azure-application-gateway.md)
- [4-Role Operations & User Manual](docs/manual.md)
- [System Architecture & Concurrency Lock](docs/architecture.md)
- [REST API Reference](docs/api.md)
- [Database Data Dictionary](docs/database.md)

---

## 📄 License
Licensed under the Apache License, Version 2.0.
