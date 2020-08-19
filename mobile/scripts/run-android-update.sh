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

# Clean up the previous bundle (frontend files only)
rm -rf ./www/js;
rm -rf ./www/fonts;
rm -rf ./www/index.html;

# Bundle the new frontend
cd ../ui;
cross-env PLATFORM=cordova \
$(npm bin)/vue-cli-service build --no-clean --dest ../mobile/www;
cd ../mobile;

# Don't update the backend, but since build-nodejs-project.sh would remove
# these, we want to make sure they will not be shipped into the mobile app
rm -rf ./www/nodejs-project/node_modules;
rm -f ./www/nodejs-project/package-lock.json;

# Compile the mobile app
cordova prepare android;
NODEJS_MOBILE_BUILD_NATIVE_MODULES=1 cordova compile android;
cordova run android --nobuild;