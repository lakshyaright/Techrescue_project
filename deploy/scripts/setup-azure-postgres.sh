#!/usr/bin/env bash
# ==============================================================================
# AZURE DATABASE FOR POSTGRESQL FLEXIBLE SERVER PROVISIONING
# ==============================================================================

set -e

RG="TechRescue-RG"
LOCATION="centralindia"
SERVER_NAME="techrescue-psql-prod-$RANDOM"
ADMIN_USER="techrescue_admin"
ADMIN_PASSWORD="YourSecurePassword123!"
DB_NAME="techrescue_db"

echo ">>> Creating Azure Resource Group..."
az group create --name $RG --location $LOCATION

echo ">>> Provisioning Azure Database for PostgreSQL Flexible Server..."
az postgres flexible-server create \
  --resource-group $RG \
  --name $SERVER_NAME \
  --location $LOCATION \
  --admin-user $ADMIN_USER \
  --admin-password $ADMIN_PASSWORD \
  --sku-name Standard_B1ms \
  --tier Burstable \
  --storage-size 32 \
  --version 16 \
  --database-name $DB_NAME \
  --yes

echo ">>> Configuring Firewall to allow Azure internal resources & VMs..."
az postgres flexible-server firewall-rule create \
  --resource-group $RG \
  --name $SERVER_NAME \
  --rule-name AllowAllAzureServicesAndVMs \
  --start-ip-address 0.0.0.0 \
  --end-ip-address 0.0.0.0

echo ">>> Server Host: ${SERVER_NAME}.postgres.database.azure.com"
echo ">>> Connection String:"
echo "postgresql://${ADMIN_USER}:${ADMIN_PASSWORD}@${SERVER_NAME}.postgres.database.azure.com:5432/${DB_NAME}?sslmode=require"

echo ">>> Applying Schema and Seed Data..."
psql "postgresql://${ADMIN_USER}:${ADMIN_PASSWORD}@${SERVER_NAME}.postgres.database.azure.com:5432/${DB_NAME}?sslmode=require" -f ../../database/schema.sql
psql "postgresql://${ADMIN_USER}:${ADMIN_PASSWORD}@${SERVER_NAME}.postgres.database.azure.com:5432/${DB_NAME}?sslmode=require" -f ../../database/seed.sql

echo "PostgreSQL initialization complete!"
