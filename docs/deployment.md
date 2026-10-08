# TechRescue Deployment & DevOps Guide

This guide covers deploying TechRescue using **Docker Compose**, **Kubernetes / Cloud Run**, and setting up automated CI/CD pipelines.

---

## 1. Multi-Container Deployment via Docker Compose

Run the complete multi-tier stack locally or on a virtual machine:

```bash
docker-compose up --build -d
```

This launches:
1. `techrescue-db`: PostgreSQL 16 on port `5432` with automated schema initialization.
2. `techrescue-backend`: Node.js Express API on port `5000`.
3. `techrescue-frontend`: React Vite SPA on port `3000`.

To monitor runtime logs:
```bash
docker-compose logs -f
```

To stop all services:
```bash
docker-compose down -v
```

---

## 2. Environment Configuration

Ensure production environment secrets are injected via secure secret managers (e.g. AWS Secrets Manager, Google Secret Manager, Azure Key Vault):

| Variable | Description | Production Example |
| :--- | :--- | :--- |
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@db-cluster.internal:5432/techrescue_prod` |
| `JWT_SECRET` | 256-bit cryptographically random key | High-entropy random hex |
| `PORT` | API listen port | `5000` |
| `CORS_ORIGIN` | Allowed web domain | `https://app.techrescue.io` |

---

## 3. Production CI/CD Pipeline (GitHub Actions Example)

```yaml
name: TechRescue CI/CD

on:
  push:
    branches: [ main ]

jobs:
  build-and-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'

      - name: Install Frontend Dependencies
        run: npm ci

      - name: Lint & Typecheck
        run: npm run lint

      - name: Build Production Frontend
        run: npm run build

      - name: Build Docker Images
        run: |
          docker build -t techrescue-frontend:latest .
```
