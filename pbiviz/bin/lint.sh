#!/bin/bash

# Usage: ./dc.sh build pbi && ./bin/package.sh
# Generates dist/???


APP_BUILD_TAG=`cat VERSION`

docker run \
    --rm \
    --entrypoint=/bin/bash \
    graphistry/pbi:${APP_BUILD_TAG} \
    -c "npm run lint"
