#!/bin/bash

# Usage: ./dc.sh build pbi && ./bin/package.sh
# Generates dist/???


APP_BUILD_TAG=`cat VERSION`

mkdir -p dist
docker run \
    --rm -it \
    -v "$(pwd)/dist:/opt/graphbi/pbiviz/dist" \
    --entrypoint=/bin/bash \
    graphistry/pbi:${APP_BUILD_TAG} \
    -c "npm run package && ls dist"
