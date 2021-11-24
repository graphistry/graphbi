#!/bin/bash
set -ex

# #####
#
# ./bootstrap_host.dev.sh
#
# Installs powerbi devtools globally + generates a global cert in global node_modules
# When in dev mode (docker compose up), local devserver will use that cert for `https://localhost:8080/...`
# https://app.powerbi.com/groups/me/reports/... in dev mode will load custom visuals that communicate with localhost through it
#
# Ex: After running, docker-compose.yml expects something like:
#
# $ cd "$(npm list -g --silent | head -1)/node_modules/powerbi-visuals-tools/certs" && pwd && ls
#
# /usr/local/lib/node_modules/powerbi-visuals-tools/certs
# PowerBICustomVisualTest_private.key	PowerBICustomVisualTest_public.crt	blank
#
#
# If this script doesn't work (ex: interactive), manually run these commands
#
# #####

npm i -g powerbi-visuals-tools

pbiviz --install-cert


