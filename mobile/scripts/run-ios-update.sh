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
cross-env NODE_ENV=production \
$(npm bin)/vue-cli-service build --no-clean --dest ../mobile/www;
cd ../mobile;

# Compile the mobile app
echo "Cleaning Cordova files in the project...";
cordova clean ios > /dev/null 2>&1 || true;

echo "Preparing Cordova files to build...";
cordova prepare ios;
# NODEJS_MOBILE_BUILD_NATIVE_MODULES=1 cordova compile ios --debug --device \
#   --buildConfig=./build.json;
# cordova run ios --nobuild --device;
