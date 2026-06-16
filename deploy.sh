#!/usr/bin/env bash
set -euo pipefail

REMOTE_USER="root"
REMOTE_HOST="212.147.236.48"
REMOTE_DIR="/var/www/portfolio"
DEPLOY_KEY="$HOME/.ssh/id_ed25519_deploy"

echo "==> Building..."
npm run build -- --configuration production

echo "==> Deploying to ${REMOTE_HOST}..."
ssh -i "${DEPLOY_KEY}" "${REMOTE_USER}@${REMOTE_HOST}" "mkdir -p ${REMOTE_DIR}"
rsync -az --delete -e "ssh -i ${DEPLOY_KEY}" dist/portfolio/browser/ "${REMOTE_USER}@${REMOTE_HOST}:${REMOTE_DIR}/"

echo "==> Done. Site live at https://kenro.tech"
