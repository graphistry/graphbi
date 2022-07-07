#!/bin/bash
set -ex

#############
#
# Helper for running docker compose commands in dev
# ex: follow logs -    ./dc.sh logs -f
#
#############

if [[ -z "${CERTS_PATH}" ]]; then
  export CERTS_PATH="$(npm list -g --silent | head -1)/node_modules/powerbi-visuals-tools/certs"
  echo "Running with host CERTS_PATH: ${CERTS_PATH}"
fi

if [ ! -d "${CERTS_PATH}" ]; then
  echo "Trying as local"
  export CERTS_PATH="`pwd`/node_modules/powerbi-visuals-tools/certs"
fi

if [ ! -d "${CERTS_PATH}" ]; then
  echo "ERROR: Certs path not found: ${CERTS_PATH}"
  exit 1
fi

VERSION=$(./bin/print-tag.sh)
echo "using version ${VERSION}"

CERTS_PATH="${CERTS_PATH}" \
PYTHONPATH="${PYTHONPATH}" \
APP_BUILD_TAG=$VERSION \
RELEASE_VERSION=$VERSION \
COMPOSE_DOCKER_CLI_BUILD=1 \
DOCKER_BUILDKIT=1 \
docker-compose \
  -f docker-compose.yml \
  $@


