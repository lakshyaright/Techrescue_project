# Azure Application Gateway Configuration Guide for TechRescue

This guide describes configuring an **Azure Application Gateway (Standard_v2 / WAF_v2)** with **Path-Based URL Routing** to securely expose the TechRescue Frontend and Backend VMs to the public internet.

---

## 1. Network Topology

```
                  PUBLIC INTERNET
                         │
                         ▼ (HTTPS :443 / HTTP :80)
          ┌──────────────────────────────┐
          │  Azure Application Gateway   │
          │  Public IP: 20.x.x.x         │
          └──────────────┬───────────────┘
                         │
      ┌──────────────────┴──────────────────┐
      │ Path: /*                            │ Path: /api/*
      ▼                                     ▼
┌─────────────────────────┐           ┌─────────────────────────┐
│     Frontend VM         │           │       Backend VM        │
│  Private IP: 10.0.1.4   │           │  Private IP: 10.0.2.4   │
│  Port: 80 (Nginx)       │           │  Port: 5000 (Node.js)   │
└─────────────────────────┘           └────────────┬────────────┘
                                                   │
                                                   ▼ SSL :5432
                                      ┌─────────────────────────┐
                                      │ Azure Database for      │
                                      │ PostgreSQL Flexible     │
                                      │ Private Endpoint / VNet │
                                      └─────────────────────────┘
```

---

## 2. Step-by-Step Azure Portal Configuration

### Step 1: Create Backend Pools
Navigate to your **Application Gateway** $\rightarrow$ **Backend pools** $\rightarrow$ **+ Add**:

1. **Frontend Pool**:
   - Name: `techrescue-frontend-pool`
   - Target type: `IP address or FQDN`
   - Target: `<Private_IP_of_Frontend_VM>` (e.g. `10.0.1.4`)
2. **Backend Pool**:
   - Name: `techrescue-backend-pool`
   - Target type: `IP address or FQDN`
   - Target: `<Private_IP_of_Backend_VM>` (e.g. `10.0.2.4`)

---

### Step 2: Configure Health Probes
Navigate to **Health probes** $\rightarrow$ **+ Add**:

1. **Frontend Probe**:
   - Name: `probe-frontend`
   - Protocol: `HTTP`
   - Path: `/health` (or `/`)
   - Interval: `30` seconds
   - Timeout: `30` seconds
   - Unhealthy threshold: `3`
2. **Backend API Probe**:
   - Name: `probe-backend-api`
   - Protocol: `HTTP`
   - Path: `/health`
   - Interval: `30` seconds
   - Timeout: `30` seconds
   - Unhealthy threshold: `3`
   - Match HTTP status codes: `200-399`

---

### Step 3: Configure HTTP Settings (Backend Settings)
Navigate to **Backend settings** $\rightarrow$ **+ Add**:

1. **Frontend HTTP Settings**:
   - Name: `setting-frontend-http`
   - Backend port: `80`
   - Protocol: `HTTP`
   - Custom probe: `probe-frontend`
2. **Backend API HTTP Settings**:
   - Name: `setting-backend-http`
   - Backend port: `5000`
   - Protocol: `HTTP`
   - Request timeout: `60` seconds
   - Custom probe: `probe-backend-api`

---

### Step 4: Configure Path-Based Routing Rule
Navigate to **Routing rules** $\rightarrow$ **+ Add a routing rule**:

1. **Rule Name**: `rule-techrescue-path-routing`
2. **Listener**:
   - Listener name: `listener-public-http` (or `listener-public-https`)
   - Frontend IP: `Public`
   - Protocol: `HTTP` (Port `80`) or `HTTPS` (Port `443` with SSL Certificate)
3. **Backend Targets**:
   - Target type: **Path-based**
   - **Default target**:
     - Backend target: `techrescue-frontend-pool`
     - Backend settings: `setting-frontend-http`
   - **Path-based rules (+ Add path rule)**:
     - Name: `rule-api-traffic`
     - Paths: `/api/*`
     - Backend target: `techrescue-backend-pool`
     - Backend settings: `setting-backend-http`

---

## 3. Azure CLI Deployment Commands (Fast Automation)

```bash
# Variables
RG="TechRescue-RG"
APP_GW="TechRescue-AppGateway"
VNET="TechRescue-VNet"
FRONTEND_IP="10.0.1.4"
BACKEND_IP="10.0.2.4"

# 1. Add Backend Pools
az network application-gateway address-pool create \
  -g $RG --gateway-name $APP_GW \
  -n techrescue-frontend-pool \
  --servers $FRONTEND_IP

az network application-gateway address-pool create \
  -g $RG --gateway-name $APP_GW \
  -n techrescue-backend-pool \
  --servers $BACKEND_IP

# 2. Add Health Probes
az network application-gateway probe create \
  -g $RG --gateway-name $APP_GW \
  -n probe-frontend \
  --protocol Http --path /health --host 127.0.0.1

az network application-gateway probe create \
  -g $RG --gateway-name $APP_GW \
  -n probe-backend \
  --protocol Http --path /health --host 127.0.0.1

# 3. Add Backend HTTP Settings
az network application-gateway http-settings create \
  -g $RG --gateway-name $APP_GW \
  -n setting-frontend \
  --port 80 --protocol Http --probe probe-frontend

az network application-gateway http-settings create \
  -g $RG --gateway-name $APP_GW \
  -n setting-backend \
  --port 5000 --protocol Http --probe probe-backend

# 4. Add Path-Based URL Map Rule
az network application-gateway url-path-map create \
  -g $RG --gateway-name $APP_GW \
  -n path-map-techrescue \
  --rule-name api-rule \
  --paths "/api/*" \
  --address-pool techrescue-backend-pool \
  --http-settings setting-backend \
  --default-address-pool techrescue-frontend-pool \
  --default-http-settings setting-frontend
```

---

## 4. Verification

After creating the rules and probes:
1. Check **Application Gateway $\rightarrow$ Backend health**:
   - `techrescue-frontend-pool`: Status should show **Healthy** (200 OK from `/health`).
   - `techrescue-backend-pool`: Status should show **Healthy** (200 OK from `/health`).
2. Test Public IP in browser:
   - `http://<APP_GW_PUBLIC_IP>/`: Displays TechRescue React web application.
   - `http://<APP_GW_PUBLIC_IP>/health`: Returns frontend health.
   - `http://<APP_GW_PUBLIC_IP>/api/health`: Returns JSON `{"status":"OK","service":"techrescue-backend-api","database":"connected"}`.
