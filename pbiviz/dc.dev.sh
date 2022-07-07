#!/bin/bash
set -ex

#############
#
# Helper for running docker compose commands in dev
# ex: follow logs -    ./dc.dev.sh logs -f
#
#############

export CERTS_PATH="$(npm list -g --silent | head -1)/node_modules/powerbi-visuals-tools/certs"
echo "Running with host CERTS_PATH: ${CERTS_PATH}"
if [ ! -d "${CERTS_PATH}" ]; then
  echo "ERROR: Certs path not found: ${CERTS_PATH}"
  exit 1
fi

VERSION=$(./bin/print-tag.sh)
echo "using base version ${VERSION} (dev: ...-dev)"

CERTS_PATH="${CERTS_PATH}" \
PYTHONPATH="${PYTHONPATH}" \
APP_BUILD_TAG="${VERSION}-dev" \
RELEASE_VERSION=$VERSION \
docker-compose \
  -f docker-compose.dev.yml \
  $@


