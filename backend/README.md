# TechRescue Backend API Service

Production REST API service for TechRescue written in Node.js and Express, connected to PostgreSQL with JSON Web Token (JWT) authentication, role-based access control (RBAC), and atomic ticket locking.

---

## 1. Tech Stack
- **Runtime**: Node.js (v18+)
- **Framework**: Express.js
- **Database**: PostgreSQL (via `pg` connection pool)
- **Authentication**: JWT & `bcryptjs`
- **Validation**: Schema-level sanitization

---

## 2. Directory Structure

```
backend/
├── src/
│   ├── config/
│   │   └── db.js                 # PostgreSQL connection pool
│   ├── controllers/
│   │   ├── authController.js     # User registration, login & JWT
│   │   ├── queryController.js    # Tickets & atomic row-level lock
│   │   ├── expertController.js   # Specialist roster & availability
│   │   ├── engineerController.js # Field technician matching
│   │   ├── messageController.js  # Incident chat & attachments
│   │   └── paymentController.js  # Escrow release & accounting
│   ├── middleware/
│   │   ├── auth.js               # JWT verification & RBAC
│   │   └── errorHandler.js       # Central error reporting
│   └── routes/
│       ├── authRoutes.js
│       ├── queryRoutes.js
│       ├── expertRoutes.js
│       ├── engineerRoutes.js
│       ├── messageRoutes.js
│       └── paymentRoutes.js
├── .env.example
├── package.json
└── server.js
```

---

## 3. Local Installation & Setup

### Step 1: Install Dependencies
```bash
cd backend
npm install
```

### Step 2: Configure Environment
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Update database connection string if necessary:
```env
PORT=5000
DATABASE_URL=postgresql://techrescue_user:techrescue_pass@localhost:5432/techrescue_db
JWT_SECRET=your_jwt_secret_key_here
```

### Step 3: Run the API
```bash
# Development (with hot-reload via nodemon)
npm run dev

# Production
npm start
```
The API server will listen on `http://localhost:5000`.

---

## 4. Key REST API Endpoints

### Authentication (`/api/v1/auth`)
- `POST /register`: Register new Client, Expert, or Engineer
- `POST /login`: Authenticate and receive signed JWT
- `GET /me`: Fetch authenticated user profile

### Incidents & Queries (`/api/v1/queries`)
- `GET /`: List queries (filterable by `status`, `priority`, `category`)
- `GET /:id`: Fetch query details with associated work logs
- `POST /`: Raise new 3-step technical query
- `POST /:id/accept`: **Atomic Transaction Lock** for remote experts (`SELECT ... FOR UPDATE`)
- `PATCH /:id/status`: Transition status (`TRAVELING`, `ON_SITE`, `RESOLVED`, `CLOSED`)

### Marketplace Roster (`/api/v1/experts`, `/api/v1/engineers`)
- `GET /experts`: List vetted cloud & security specialists
- `GET /engineers`: Search on-site field technicians by metro location

### Incident Communications (`/api/v1/messages`)
- `GET /:queryId`: Stream all messages for an incident
- `POST /:queryId`: Send message / file log attachment

### Escrow & Billing (`/api/v1/payments`)
- `GET /`: Retrieve escrow ledger
- `POST /:id/release`: Release escrow funds to specialist upon client sign-off
