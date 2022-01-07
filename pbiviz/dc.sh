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
  echo "ERROR: Certs path not found: ${CERTS_PATH}"
  exit 1
fi

CERTS_PATH="${CERTS_PATH}" \
PYTHONPATH="${PYTHONPATH}" \
APP_BUILD_TAG=`cat VERSION` \
VERSION=`cat VERSION` \
docker-compose \
  -f docker-compose.yml \
  $@


