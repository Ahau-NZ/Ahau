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

# Define supported architectures, "NDK_ARCH;NODEJS_ARCH"
declare -a archs=(
  "armeabi-v7a;arm"
  "arm64-v8a;arm64"
  # "x86;x86"
  # "x86_64;x64"
)

echo "Moving from ./src to ./www ...";
mkdir -p ./www/nodejs-project;
$(npm bin)/cpy './src/nodejs-project/*' './www/nodejs-project/';

echo "Installing node_modules dependencies...";
cd ./www/nodejs-project && npm install --no-optional --silent;

echo "Removing unused files meant for macOS or Windows, etc...";
find ./node_modules \
  -type d \
  \( \
    -name "darwin-x64" \
    -o -name "win32-ia32" \
    -o -name "win32-x64" \
  \) \
  -print0 | xargs -0 rm -rf; # delete everything in the list
find ./node_modules \
  -type f \
  \( \
    -name "electron-napi.node" \
  \) \
  -print0 | xargs -0 rm -rf; # delete everything in the list
cd ../..;

echo "Updating package-lock.json...";
cp ./www/nodejs-project/package-lock.json ./src/nodejs-project/package-lock.json;

echo "Deleting some definitely-not-necessary files from node_modules...";
find ./www/nodejs-project/node_modules -empty -type d -delete;

# Move www/nodejs-project into the Android project
echo "Cleaning Cordova files in the Android project...";
cordova clean || true;

echo "Moving www into the Android project...";
cordova prepare android;

# Build node.js native modules
cd platforms/android;
if [ -f ./gradlew ]
then
  GRADLE_EXEC="./gradlew"
else
  GRADLE_EXEC="gradle"
fi
for entry in "${archs[@]}"
do
  IFS=";" read -r -a arr <<< "${entry}" # entry.split(';')
  arch="${arr[0]}"

  echo "Building native modules for $arch...";
  NODEJS_MOBILE_BUILD_NATIVE_MODULES=1 $GRADLE_EXEC app:GenerateNodeNativeAssetsLists$arch
done
cd ../..;
echo "";

echo "Bundling with noderify...";
cd ./www/nodejs-project;
# Why some packages are filter'd or replaced:
#   chloride: needs special compilation configs for android, and we'd like to
#      remove unused packages such as sodium-browserify etc
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

echo "Moving some shared dynamic native libraries to android jniLibs...";
for entry in "${archs[@]}"
do
  IFS=";" read -r -a arr <<< "${entry}" # entry.split(';')
  arch="${arr[0]}"
  nodearch="${arr[1]}"

  mkdir -p platforms/android/app/src/main/jniLibs/$arch;

  # Copy libsodium.so because nodejs-mobile scripts only move .node files
  cp ./www/nodejs-project/node_modules/sodium-native-nodejs-mobile/lib/android-$nodearch/libsodium.so \
    platforms/android/app/src/main/jniLibs/$arch/libsodium.so;
done

echo "Removing node_modules folder and package-lock.json...";
rm -rf ./www/nodejs-project/node_modules;
rm ./www/nodejs-project/package-lock.json;
