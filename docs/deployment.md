# TechRescue Production Deployment Guide: Azure 2-VM Monolithic Architecture

This document describes deploying TechRescue on **two Azure Virtual Machines (Frontend VM + Backend VM)**, an **Azure Database for PostgreSQL Flexible Server**, and an **Azure Application Gateway** with path-based routing.

---

## 1. Architectural Overview

```
                      INTERNET
                         │
                         ▼ HTTPS (443) / HTTP (80)
            ┌──────────────────────────────┐
            │  Azure Application Gateway   │
            │  Public IP: 20.x.x.x         │
            └──────────────┬───────────────┘
                           │
       ┌───────────────────┴───────────────────┐
       │ Path: /*                              │ Path: /api/*
       ▼                                       ▼
┌─────────────────────────────┐         ┌─────────────────────────────┐
│    VM 1: Frontend VM        │         │     VM 2: Backend VM        │
│  - Ubuntu 22.04 LTS         │         │  - Ubuntu 22.04 LTS         │
│  - IP: 10.0.1.4             │         │  - IP: 10.0.2.4             │
│  - Nginx web server (:80)   │         │  - Node.js API (:5000)      │
│  - React Production Bundle  │         │  - systemd service          │
└─────────────────────────────┘         └──────────────┬──────────────┘
                                                       │
                                                       ▼ SSL (:5432)
                                        ┌─────────────────────────────┐
                                        │ Azure Database for          │
                                        │ PostgreSQL Flexible Server  │
                                        │ (techrescue_db)             │
                                        └─────────────────────────────┘
```

---

## 2. Resource Provisioning Plan

| Azure Resource | Purpose | Recommended SKU / Sizing | Subnet / Placement |
| :--- | :--- | :--- | :--- |
| **Virtual Network** | Isolated private network | `10.0.0.0/16` | Region: Central India / East US |
| **Application Gateway** | SSL Termination & Path Routing | `Standard_v2` (Auto-scaling 1-5) | `AppGatewaySubnet` (`10.0.0.0/24`) |
| **Frontend VM** | Nginx static server | `Standard_B2s` (2 vCPU, 4GB RAM) | `FrontendSubnet` (`10.0.1.0/24`) |
| **Backend VM** | Node.js Express API | `Standard_B2ms` (2 vCPU, 8GB RAM) | `BackendSubnet` (`10.0.2.0/24`) |
| **PostgreSQL Flexible** | Persistent relational data | `Standard_B1ms` or `Standard_D2ds_v5` | `DatabaseSubnet` (`10.0.3.0/24`) |

---

## 3. Azure Application Gateway Configuration

Path-based routing rules redirect traffic seamlessly:
1. **Frontend Rule (`/*`)**: Routes to `techrescue-frontend-pool` (`10.0.1.4:80`).
2. **Backend API Rule (`/api/*`)**: Routes to `techrescue-backend-pool` (`10.0.2.4:5000`).

Both pools are configured with active **Health Probes** querying `/health`:
- Frontend Probe: `http://10.0.1.4/health` returns `200 OK`.
- Backend Probe: `http://10.0.2.4:5000/health` returns `200 OK` with database connection telemetry.

For detailed portal and Azure CLI setup commands, refer to [`deploy/azure-application-gateway.md`](../deploy/azure-application-gateway.md).

---

## 4. Automation Scripts Included

- **Frontend VM Script**: [`deploy/scripts/setup-frontend-vm.sh`](../deploy/scripts/setup-frontend-vm.sh)
- **Backend VM Script**: [`deploy/scripts/setup-backend-vm.sh`](../deploy/scripts/setup-backend-vm.sh)
- **Azure PostgreSQL Script**: [`deploy/scripts/setup-azure-postgres.sh`](../deploy/scripts/setup-azure-postgres.sh)
- **Nginx Configuration**: [`deploy/nginx/techrescue-frontend.conf`](../deploy/nginx/techrescue-frontend.conf)
- **Systemd Service**: [`deploy/systemd/techrescue-backend.service`](../deploy/systemd/techrescue-backend.service)
