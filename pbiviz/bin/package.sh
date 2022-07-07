#!/bin/bash
set -ex
# Usage: ./dc.sh build pbi && ./bin/package.sh
# Generates dist/???


APP_BUILD_TAG=${APP_BUILD_TAG:-$(./bin/print-tag.sh)}
RELEASE_VERSION=${RELEASE_VERSION:-$APP_BUILD_TAG}

mkdir -p dist
docker run \
    --rm \
    -v "$(pwd)/dist:/opt/graphbi/pbiviz/dist" \
    -e "RELEASE_VERSION=${RELEASE_VERSION}" \
    --entrypoint=/bin/bash \
    graphistry/pbi:${APP_BUILD_TAG} \
    -c "npm run version:update && npm run package --verbose && ls dist | grep pbiviz || (echo 'Failed to package' && exit 1)"
