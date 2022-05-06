FROM node:16.13.0-slim as base
WORKDIR /opt/graphbi/pbiviz
RUN npm config set fund false

RUN --mount=type=cache,target=/var/cache/apt --mount=type=cache,target=/var/lib/apt  \
    apt-get update \
	&& apt-get install -y \
        curl \
        openssl
#	&& rm -rf /var/lib/apt/lists/* \
#	&& rm -rf /var/cache/apt/*

COPY package.json package-lock.json /opt/graphbi/pbiviz/
COPY  extends stylelint-config-standard
RUN --mount=type=cache,target=/usr/src/app/.npm \
    npm set cache /usr/src/app/.npm \
    && echo "=== Installing build tools ===" \
    && npm install --legacy-peer-deps

COPY \
    .eslintrc.json .prettierrc \
    tsconfig.json tslint.json \
    capabilities.json pbiviz.json TestDataModel.pbix \
    /opt/graphbi/pbiviz/
COPY assets/ /opt/graphbi/pbiviz/assets/
COPY src/ /opt/graphbi/pbiviz/src/
COPY style/ /opt/graphbi/pbiviz/style/
