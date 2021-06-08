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

RUN_PLATFORM=$1

echo "Starting to build to $RUN_PLATFORM..."

# Clean up the previous bundle
rm -rf ./www;

# Bundle the new frontend
cd ../ui;
cross-env PLATFORM=cordova \
npm run build:mobile;
cd ../mobile;

# Bundle the new backend
./scripts/build-nodejs-project.sh $RUN_PLATFORM;

# Compile the mobile app
cordova prepare $RUN_PLATFORM;

if [ $NODE_ENV == "production" ]; then
  echo "Compiling App to production release...";

  if [ ! -f "./build.json" ]; then
    echo "build.json file not found! It should be in the ./mobile folder";
    exit 1;
  fi

  if [ $RUN_PLATFORM == "android" ] && [ ! -f "./ahau-android-upload-key.keystore" ]; then
    echo "Keystore file not found! It should be in the ./mobile folder";
    exit 1;
  fi

  $(npm bin)/cordova-set-version;

  NODEJS_MOBILE_BUILD_NATIVE_MODULES=1 cordova build $RUN_PLATFORM --release --device \
    --buildConfig=./build.json;
else
  echo "Compiling App for local development...";

  NODEJS_MOBILE_BUILD_NATIVE_MODULES=1 cordova compile $RUN_PLATFORM --debug --device \
    --buildConfig=./build.json;
  cordova run $RUN_PLATFORM --nobuild --device;
fi
