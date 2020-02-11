#/bin/bash

$(npm bin)/patch-package && \
mkdir -p ./www/nodejs-project && \
cp ./src/nodejs-project/package.json ./www/nodejs-project/ && \
cp ./src/nodejs-project/main.js ./www/nodejs-project/;