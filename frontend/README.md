# TechRescue Frontend Client (Azure VM Nginx Deployment)

High-density, enterprise-grade React 19 + Vite web client configured for **Azure VM hosting with Nginx**, and **Azure Application Gateway** public delivery.

---

## 1. Architecture on Azure VM

On the Frontend Virtual Machine (`techrescue-vm-frontend`):
- **Web Server**: Nginx serves the built static production assets from `/var/www/techrescue/frontend/dist`.
- **SPA Routing**: HTML5 pushState fallback (`try_files $uri $uri/ /index.html;`) ensures direct URLs to `/client/dashboard`, `/expert/jobs`, etc., resolve properly.
- **API Routing**:
  - In direct mode: Nginx proxy-passes `/api/` traffic to the Backend VM private IP (`proxy_pass http://10.0.2.4:5000;`).
  - In Gateway mode: Azure Application Gateway routes `/api/*` directly to the Backend VM pool.
- **Probe Handler**: Nginx serves `location = /health { return 200 "OK\n"; }` for Azure Application Gateway probes.

---

## 2. Automated VM Setup

On your Ubuntu 22.04 LTS Frontend VM:
```bash
sudo bash deploy/scripts/setup-frontend-vm.sh
```

This script:
1. Installs Node.js 20 LTS and Nginx.
2. Clones/pulls the repository into `/var/www/techrescue`.
3. Runs `npm install && npm run build`.
4. Copies `deploy/nginx/techrescue-frontend.conf` to `/etc/nginx/sites-available/`.
5. Enables the site and restarts Nginx.
