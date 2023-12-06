#!/bin/bash

HEADING='\e[1;30m\e[45m';
INFO='\e[1;30m\e[46m';
WARN='\e[1;30m\e[41m';
RESET='\e[0m';

section () { echo -e "${HEADING} $1 ${RESET}"; }
log () { echo -e "${INFO} $1 ${RESET}"; }
warn () { echo -e "${WARN} $1 ${RESET}"; }

# Quit the entire script if there is any error
onFailure() {
  echo -e "${WARN} Unhandled script error $1 at ${BASH_SOURCE[0]}:${BASH_LINENO[0]} ${RESET}" >&2
  exit 1
}

# source nvm
. ~/.nvm/nvm.sh
nvm use 12

set -eEu -o pipefail
shopt -s extdebug
IFS=$'\n\t'
trap 'onFailure $?' ERR

RUN_PLATFORM=$1

section "Starting to build to $RUN_PLATFORM..."

# Clean up the previous bundle
rm -rf ./www;

# Bundle the new frontend
section "Bundling UI"
./scripts/build-ui.sh;

# Bundle the new backend
section "Bundling Backend"
./scripts/build-nodejs-project.sh $RUN_PLATFORM;

# Compile the mobile app
cordova prepare $RUN_PLATFORM;

if [ $NODE_ENV == "production" ]; then
  section "Compiling App to production release...";

  if [ ! -f "./build.json" ]; then
    warn "build.json file not found! It should be in the ./mobile folder";
    exit 1;
  fi

  if [ $RUN_PLATFORM == "android" ] && [ ! -f "./ahau-android-upload-key.keystore" ]; then
    warn "Keystore file not found! It should be in the ./mobile folder";
    exit 1;
  fi

  # for some reason cordova-set-version is gettting removed before here, so npm i to restore
  npm i cordova-set-version@11;
  sleep 1;
  $(npm bin)/cordova-set-version;

  # warn "UNDO: --debug";
  # NODEJS_MOBILE_BUILD_NATIVE_MODULES=1 cordova build $RUN_PLATFORM --debug --device \
  #   --buildConfig=./build.json;
  NODEJS_MOBILE_BUILD_NATIVE_MODULES=1 cordova build $RUN_PLATFORM --release --device \
    --buildConfig=./build.json;
else
  log "Compiling App for local development...";

  NODEJS_MOBILE_BUILD_NATIVE_MODULES=1 cordova compile $RUN_PLATFORM --debug --device \
    --buildConfig=./build.json;
  cordova run $RUN_PLATFORM --nobuild --device;
fi

log "DONE!"
nvm use 18
