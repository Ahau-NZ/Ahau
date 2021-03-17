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

BUILD_PLATFORM=$1

echo "Moving from ./src to ./www ...";
$(npm bin)/cpy '**/*' '../../www/nodejs-project/' --cwd='./src/nodejs-project/' --parents

# Write the file to toggle build of native modules
if [ -f ./www/NODEJS_MOBILE_BUILD_NATIVE_MODULES_VALUE.txt ]; then
  echo "Build Native Modules already on";
else
  echo '1' >./www/NODEJS_MOBILE_BUILD_NATIVE_MODULES_VALUE.txt;
  echo "Build Native Modules turned on";
fi

cd ./www/nodejs-project

# Write a env.json file to load process.env in the backend
echo "Building the env.json file...";
../../scripts/build-env-json.js

# Install modules ignoring their install scripts
# This reduces the install time
echo "Installing node_modules dependencies...";
npm install --ignore-scripts --no-optional --silent

if [ $BUILD_PLATFORM == "android" ]; then
  # Install/build just sodium-native-nodejs-mobile to Android
  # XCode will build this by its own after
  cd ./node_modules/sodium-native-nodejs-mobile && npm install --no-optional --silent;
  cd ../..
fi

# Patch some file changes
$(npm bin)/patch-package

echo "Removing unused files meant for macOS or Windows, etc...";
find ./node_modules \
  -type d \
  \( \
    -name "darwin-x64" \
    -o -name "win32-ia32" \
    -o -name "win32-x64" \
    -o -name "obj.target" \
    -o -name "prebuilds" \
  \) \
  -print0 | xargs -0 rm -rf; # delete everything in the list
find ./node_modules \
  -type f \
  \( \
    -name "electron-napi.node" \
  \) \
  -print0 | xargs -0 rm -rf; # delete everything in the list

echo "Deleting some definitely-not-necessary files from node_modules...";
find ./node_modules -empty -type d -delete;

# Remove sodium-native and other unnecessary modules of node_modules to prevent their build
declare -a modules=(
  "envelope-js"
  "ssb-tribes"
)
for module in "${modules[@]}"
do
  rm -rf ./node_modules/$module/node_modules/sodium-native
done
rm -rf ./node_modules/sodium-native

cd ../..;

# Clean builded code in the Cordova platform
echo "Cleaning Cordova files in the project...";
cordova clean $BUILD_PLATFORM > /dev/null 2>&1 || true;

# Build node.js native modules to Android.
# XCode does this to iOS by itself after
if [ $BUILD_PLATFORM == "android" ]; then
  echo "Moving www into the Android path in order to build native modules...";

  # Copies www folder to the platform/android
  cordova prepare android;

  ./scripts/android/build-native-modules.sh
fi

echo "Bundling with noderify...";
cd ./www/nodejs-project;
# Why some packages are filter'd or replaced:
#   chloride: needs special compilation configs for android, and we'd like to
#      remove unused packages such as sodium-browserify etc
#   sodium-native: needs special compilation configs for android
#   cordova-bridge: this is not an npm package, it's from nodejs-mobile
#   bl: we didn't use it, and bl@0.8.x has security vulnerabilities
#   bufferutil: because we want nodejs-mobile to load its native bindings
#   supports-color: optional dependency within package `debug`
#   utf-8-validate: because we want nodejs-mobile to load its native bindings
#   encoding: optional dependency within package node-fetch used by apollo-server
$(npm bin)/noderify \
  --replace.bindings=bindings-noderify-nodejs-mobile \
  --replace.node-extend=xtend \
  --replace.non-private-ip=non-private-ip-android \
  --replace.leveldown=leveldown-nodejs-mobile \
  --replace.chloride=sodium-chloride-native-nodejs-mobile \
  --replace.sodium-native=sodium-native-nodejs-mobile \
  --filter=cordova-bridge \
  --filter=bl \
  --filter=bufferutil \
  --filter=supports-color \
  --filter=utf-8-validate \
  --filter=encoding \
  --filter=casual \
  index.js > _index.js;
rm index.js; mv _index.js index.js;
cd ../..;

if [ $BUILD_PLATFORM == "android" ]; then
  echo "Moving Android dynamic native libs..."
  ./scripts/android/move-dynamic-native-libs.sh

  echo "Removing node_modules folder and package-lock.json...";
  # Just to Android cause iOS will use the node_modules to build its native modules
  rm -rf ./www/nodejs-project/node_modules;
fi

rm ./www/nodejs-project/package-lock.json;
rm -rf ./www/nodejs-project/patches;
