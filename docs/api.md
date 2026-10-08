# TechRescue REST API Reference

All requests must include `Content-Type: application/json`. Protected endpoints require `Authorization: Bearer <jwt_token>`.

---

## 1. Authentication Endpoints

### `POST /api/v1/auth/register`
Register a new client, remote expert, or field engineer.

**Request Body:**
```json
{
  "name": "Sonu Patel",
  "email": "sonu.patel@fintechglobal.com",
  "password": "SecurePassword123!",
  "role": "CLIENT",
  "company": "FinTech Global Systems",
  "phone": "+91 98201 44521",
  "location": "Gurgaon, Haryana",
  "title": "Director of IT"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "usr-1728364800000",
    "name": "Sonu Patel",
    "email": "sonu.patel@fintechglobal.com",
    "role": "CLIENT"
  }
}
```

---

### `POST /api/v1/auth/login`
Authenticate existing user and obtain session token.

**Request Body:**
```json
{
  "email": "rahul.sharma@cloudarchitects.io",
  "password": "SecurePassword123!"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "usr-expert-1",
    "name": "Rahul Sharma",
    "role": "EXPERT"
  }
}
```

---

## 2. Queries & Incidents

### `POST /api/v1/queries`
Raise an enterprise incident query.

**Headers:** `Authorization: Bearer <token>` (Role: `CLIENT`, `ADMIN`)

**Request Body:**
```json
{
  "title": "Azure VM Connectivity & ExpressRoute Gateway Packet Drop",
  "category": "Cloud Infrastructure",
  "subcategory": "Virtual Network & Peering",
  "impact": "HIGH",
  "urgency": "HIGH",
  "shortDescription": "Production API worker nodes losing route packets.",
  "detailedDescription": "Ping drop rate is ~18% through ExpressRoute circuit...",
  "environment": "Azure Cloud",
  "assignmentGroup": "Cloud Operations",
  "estimatedCost": 4500.00
}
```

---

### `POST /api/v1/queries/:id/accept`
**Atomic Concurrency Lock Claim.**

**Headers:** `Authorization: Bearer <token>` (Role: `EXPERT`, `ADMIN`)

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Successfully secured atomic lock on INC-20261008-0001",
  "data": {
    "id": "tkt-10231",
    "status": "IN_PROGRESS",
    "assigned_expert_id": "usr-expert-1"
  }
}
```

**Error Response (409 Conflict):**
```json
{
  "success": false,
  "error": "Lock Collision: Ticket INC-20261008-0001 is already claimed by another specialist (Status: IN_PROGRESS)."
}
```
