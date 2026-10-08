#!/usr/bin/env bash
# ==============================================================================
# TECHRESCUE FRONTEND VM PROVISIONING SCRIPT (UBUNTU 22.04 / 24.04 LTS)
# Run as root or with sudo: sudo bash setup-frontend-vm.sh
# ==============================================================================

set -e

echo ">>> [1/6] Updating system packages..."
apt-get update && apt-get upgrade -y
apt-get install -y curl git nginx ufw

echo ">>> [2/6] Installing Node.js 20.x LTS for building assets..."
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs

echo ">>> [3/6] Setting up web root directory..."
mkdir -p /var/www/techrescue/frontend
chown -R azureuser:azureuser /var/www/techrescue

echo ">>> [4/6] Cloning / pulling latest repository..."
cd /var/www/techrescue
if [ ! -d "/var/www/techrescue/.git" ]; then
    git clone https://github.com/lakshyaright/Techrescue_project.git .
fi

git pull origin main

echo ">>> [5/6] Building production React bundle..."
cd /var/www/techrescue/frontend
npm install
npm run build

echo ">>> [6/6] Configuring Nginx web server..."
cp /var/www/techrescue/deploy/nginx/techrescue-frontend.conf /etc/nginx/sites-available/techrescue-frontend
ln -sf /etc/nginx/sites-available/techrescue-frontend /etc/nginx/sites-enabled/default

# Test Nginx configuration syntax
nginx -t
systemctl restart nginx

# Configure firewall for HTTP/HTTPS & SSH
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable

echo "========================================================================"
echo "TECHRESCUE FRONTEND NGINX SERVICE RUNNING!"
echo "Check Nginx: sudo systemctl status nginx"
echo "Check Site: curl -I http://localhost/"
echo "========================================================================"
