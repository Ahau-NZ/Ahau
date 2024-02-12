#!/bin/bash

. ~/.nvm/nvm.sh

# Bundle the new frontend
nvm use 18;
cd ../ui;
cross-env PLATFORM=cordova \
npm run build:mobile;
cd ../mobile;
nvm use 12;
