FROM node:16.13.0-slim as base
WORKDIR /opt/graphbi/pbiviz

RUN --mount=type=cache,target=/var/cache/apt --mount=type=cache,target=/var/lib/apt  \
    apt-get update \
	&& apt-get install -y \
        curl \
        openssl
#	&& rm -rf /var/lib/apt/lists/* \
#	&& rm -rf /var/cache/apt/*

COPY package.json package-lock.json /opt/graphbi/pbiviz/
RUN --mount=type=cache,target=/usr/src/app/.npm \
    npm set cache /usr/src/app/.npm \
    && echo "=== Installing build tools ===" \
    && npm install

COPY \
    capabilities.json pbiviz.json TestDataModel.pbix tsconfig.json \
    /opt/graphbi/pbiviz/
COPY assets/ /opt/graphbi/pbiviz/assets/
COPY src/ /opt/graphbi/pbiviz/src/
COPY style/ /opt/graphbi/pbiviz/style/ 

FROM base as base-test
WORKDIR /opt/graphbi/pbiviz

COPY tslint.json /opt/graphbi/pbiviz/
RUN --mount=type=cache,target=/usr/src/app/.npm \
    npm run lint \
    npm run test

FROM base as component
WORKDIR /opt/graphbi/pbiviz