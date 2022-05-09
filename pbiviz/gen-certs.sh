#!/bin/bash

### See full instructions at https://docs.microsoft.com/en-us/power-bi/developer/visuals/create-ssl-certificate

set -ex

which openssl
which certutil

npm i powerbi-visuals-tools

PBIVIZ_CERTS="`pwd`/node_modules/powerbi-visuals-tools/certs"

openssl req -x509 -nodes -new -sha256 -days 1024 -newkey rsa:2048 -keyout /tmp/local-root-ca.key -out /tmp/local-root-ca.pem -subj "/C=US/CN=Local Root CA/O=Local Root CA"
openssl x509 -outform pem -in /tmp/local-root-ca.pem -out /tmp/local-root-ca.crt


openssl req -new -nodes -newkey rsa:2048 -keyout $PBIVIZ_CERTS/PowerBIVisualTest_private.key -out $PBIVIZ_CERTS/PowerBIVisualTest.csr -subj "/C=US/O=PowerBI Visuals/CN=localhost"
openssl x509 -req -sha256 -days 1024 -in $PBIVIZ_CERTS/PowerBIVisualTest.csr -CA /tmp/local-root-ca.pem -CAkey /tmp/local-root-ca.key -CAcreateserial -extfile /tmp/openssl.cnf -out $PBIVIZ_CERTS/PowerBIVisualTest_public.crt

#chrome
certutil -A -n "Local Root CA" -t "CT,C,C" -i /tmp/local-root-ca.pem -d sql:$HOME/.pki/nssdb

#ffox
for certDB in $(find $HOME/.mozilla* -name "cert*.db")
do
certDir=$(dirname ${certDB});
certutil -A -n "Local Root CA" -t "CT,C,C" -i /tmp/local-root-ca.pem -d sql:${certDir}
done

#root certs
sudo cp /tmp/local-root-ca.pem /usr/local/share/ca-certificates/
sudo update-ca-certificates


echo "Installed certs into: $PBIVIZ_CERTS"
