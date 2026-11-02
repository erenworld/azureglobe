#!/usr/bin/env bash
# Creates one tiny public storage account per Azure region, used by the site
# to measure latency from the visitor's browser, and writes the list of
# endpoints to website/public/endpoints.json.
#
# Usage:  ./infra/deploy.sh            (needs `az login` first)
# Env:    RG=<resource group>  REGIONS="westeurope eastus ..."  JOBS=8
set -euo pipefail

cd "$(dirname "$0")/.."
RG=${RG:-azureglobe-latency}
JOBS=${JOBS:-8}
OUT=website/public/endpoints.json
CONTAINER=latency
BLOB=ping.txt

# Every region id known by the site (from website/app/azure-data.ts).
REGIONS=${REGIONS:-$(grep -o "id: '[a-z0-9]*'" website/app/azure-data.ts | cut -d"'" -f2)}

# Short, stable suffix so account names are globally unique per subscription.
SUB=$(az account show --query id -o tsv)
SUFFIX=$(printf '%s' "$SUB" | shasum | cut -c1-6)

echo "Subscription: $(az account show --query name -o tsv) ($SUB)"
echo "Resource group: $RG"
az group create --name "$RG" --location westeurope --output none

TMP=$(mktemp -d)
printf 'ok' > "$TMP/$BLOB"

deploy_steps() {
  local region=$1 name=$2 key
  az storage account create \
    --name "$name" --resource-group "$RG" --location "$region" \
    --sku Standard_LRS --kind StorageV2 --min-tls-version TLS1_2 \
    --allow-blob-public-access true --output none || return 1
  key=$(az storage account keys list -n "$name" -g "$RG" --query '[0].value' -o tsv) || return 1
  az storage cors clear --services b --account-name "$name" --account-key "$key" || return 1
  az storage cors add --services b --methods GET HEAD OPTIONS --origins '*' \
    --allowed-headers '*' --exposed-headers '*' --max-age 86400 \
    --account-name "$name" --account-key "$key" || return 1
  az storage container create --name "$CONTAINER" --public-access blob \
    --account-name "$name" --account-key "$key" --output none || return 1
  az storage blob upload --container-name "$CONTAINER" --name "$BLOB" \
    --file "$TMP/$BLOB" --content-type text/plain --overwrite \
    --content-cache-control 'no-store' \
    --account-name "$name" --account-key "$key" --output none || return 1
  echo "https://$name.blob.core.windows.net/$CONTAINER/$BLOB" > "$TMP/$region.url"
}

deploy_region() {
  local region=$1
  local name="azg${SUFFIX}$(printf '%s' "$region" | shasum | cut -c1-8)"
  if deploy_steps "$region" "$name" > "$TMP/$region.log" 2>&1; then
    echo "  ✓ $region"
  else
    echo "  ✗ $region (see $TMP/$region.log)"
  fi
}

echo "Deploying $(echo "$REGIONS" | wc -w | tr -d ' ') regions ($JOBS at a time)…"
export -f deploy_region deploy_steps
export RG SUFFIX TMP CONTAINER BLOB
# xargs -P works with the old bash shipped on macOS (no `wait -n` there).
printf '%s\n' $REGIONS | xargs -P "$JOBS" -I{} bash -c 'deploy_region "$1"' _ {}

# Write { "regionid": "https://…/ping.txt", … }
{
  echo "{"
  first=1
  for region in $REGIONS; do
    [ -f "$TMP/$region.url" ] || continue
    [ $first -eq 1 ] && first=0 || echo ","
    printf '  "%s": "%s"' "$region" "$(cat "$TMP/$region.url")"
  done
  echo
  echo "}"
} > "$OUT"

echo "Wrote $(grep -c 'https://' "$OUT") endpoints to $OUT"
echo "Regions that failed are usually restricted ones your subscription can't use."
