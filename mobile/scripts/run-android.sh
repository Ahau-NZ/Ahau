#!/bin/bash

# Quit the entire script if there is any error
function onFailure() {
  echo "Unhandled script error $1 at ${BASH_SOURCE[0]}:${BASH_LINENO[0]}" >&2
  exit 1
}
set -eEu -o pipefail
shopt -s extdebug
IFS=$'\n\t'
trap 'onFailure $?' ERR

# Clean up the previous bundle
rm -rf ./www;

# Bundle the new frontend
cd ../ui;
cross-env PLATFORM=cordova \
$(npm bin)/vue-cli-service build --dest ../mobile/www;
cd ../mobile;

# Bundle the new backend
./scripts/build-nodejs-project.sh;

# Compile the mobile app
cordova prepare android;
NODEJS_MOBILE_BUILD_NATIVE_MODULES=1 cordova compile android;
cordova run android --nobuild;