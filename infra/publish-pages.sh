#!/usr/bin/env bash
# Builds the static site and publishes it to Codeberg Pages (branch `pages`),
# served at https://azure.erenkad.com (domain listed in website/public/.domains).
#
# Usage:  ./infra/publish-pages.sh
# Env:    CODEBERG_REMOTE=git@codeberg.org:<user>/<repo>.git
#
# The `pages` branch only holds the build output and is overwritten each time.
set -euo pipefail

cd "$(dirname "$0")/.."
REMOTE=${CODEBERG_REMOTE:-git@codeberg.org:erenturkoglu/azureglobal.git}
OUT=website/out
COMMIT=$(git rev-parse --short HEAD)

if [ ! -f website/public/endpoints.json ]; then
  echo "Warning: website/public/endpoints.json is missing, the live test will be disabled." >&2
  echo "         Run ./infra/deploy.sh first to enable it." >&2
fi

# The subdomain serves the site from its root, so no base path.
env -u NEXT_PUBLIC_BASE_PATH pnpm build

TMP=$(mktemp -d)
trap 'rm -rf "$TMP"' EXIT
cp -R "$OUT"/. "$TMP"

cd "$TMP"
git init -q -b pages
git add -A
git commit -q -m "Publish $COMMIT"
git push -f "$REMOTE" pages

echo "Published $COMMIT to $REMOTE (branch pages) -> https://azure.erenkad.com"
