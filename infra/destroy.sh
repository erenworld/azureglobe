#!/usr/bin/env bash
# Deletes every latency endpoint created by deploy.sh.
set -euo pipefail
cd "$(dirname "$0")/.."
RG=${RG:-azureglobe-latency}
az group delete --name "$RG" --yes --no-wait
rm -f website/public/endpoints.json
echo "Deleting resource group $RG (runs in the background on Azure)."
