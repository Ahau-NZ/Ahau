#!/bin/bash

INFO='\e[1;30m\e[46m';
WARN='\e[1;30m\e[41m';
RESET='\e[0m';

log () { echo -e "${INFO} $1 ${RESET}"; }

# Quit the entire script if there is any error
onFailure() {
  echo -e "${WARN} Unhandled script error $1 at ${BASH_SOURCE[0]}:${BASH_LINENO[0]}${RESET}" >&2
  exit 1
}
set -eEu -o pipefail
shopt -s extdebug
IFS=$'\n\t'
trap 'onFailure $?' ERR

BUILD_PLATFORM=$1

log "Moving from ./src to ./www ...";
$(npm bin)/cpy '**/*' '!node_modules' '../../www/nodejs-project/' --cwd='./src/nodejs-project/' --parents

# Write the file to toggle build of native modules
if [ -f ./www/NODEJS_MOBILE_BUILD_NATIVE_MODULES_VALUE.txt ]; then
  log "Build Native Modules already on";
else
  echo '1' >./www/NODEJS_MOBILE_BUILD_NATIVE_MODULES_VALUE.txt;
  log "Build Native Modules turned on";
fi

# Install node-gyp in order to Cordova to run `prepare`
log "Installing node-gyp in order to Cordova to run 'prepare'"
npm install node-gyp@9 --no-save

cd ./www/nodejs-project

# Write a env.json file to load process.env in the backend
log "Building the env.json file...";
../../scripts/build-env-json.js

# Install modules ignoring their install scripts
# This reduces the install time
log "Installing node_modules dependencies..." $(pwd);
npm ci --ignore-scripts --omit=optional

# Patch some file changes
log "Applying patches...";
$(npm bin)/patch-package
rm -rf ./patches ./node_modules/patch-package

if [ $BUILD_PLATFORM == "android" ]; then
  # XCode will build this by its own so iOS isn't necessary
  log "Installing and compiling sodium-native-nodejs-mobile...";
  cd ./node_modules/sodium-native-nodejs-mobile
  npm install --omit=optional --no-package-lock --silent
  cd ../..
fi

log "Removing unused files meant for macOS or Windows, etc...";
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

log "Deleting some definitely-not-necessary files from node_modules...";
find ./node_modules -empty -type d -delete;

# Remove sodium-native and other unnecessary modules of node_modules to prevent their build
log "Deleting sodium-native from node_modules of some dependencies...";
declare -a modules=(
  "envelope-js"
  "ssb-tribes"
)
for module in "${modules[@]}"
do
  rm -rf ./node_modules/$module/node_modules/sodium-native
done

declare -a modulesRoot=(
  "sodium-native"
  "sodium-browserify"
  "sodium-browserify-tweetnacl"
  "leveldown"
  "bufferutil"
  "systeminformation"
)
for module in "${modulesRoot[@]}"
do
  rm -rf ./node_modules/$module
done

cd ../..;

# Clean builded code in the Cordova platform
log "Cleaning Cordova files in the project...";
cordova clean $BUILD_PLATFORM > /dev/null 2>&1 || true;

# Build node.js native modules to Android.
# XCode does this to iOS by itself after
if [ $BUILD_PLATFORM == "android" ]; then
  log "Moving www into the Android path in order to build native modules...";

  # Copies www folder to the platform/android
  cordova prepare android;

  # Remove node-gyp to force using nodejs-mobile-gyp. PS.: Just setting the npm_config_node_gyp didn't work
  rm -rf ./node_modules/.bin/node-gyp ./node_modules/node-gyp

  ./scripts/android/build-native-modules.sh
fi

log "Babel-bundling some dependencies to support Node 12";
cd ./www/nodejs-project;

declare -a packagesToBabelify=(
  "@apollo/cache-control-types"
  "@envelop/core"
  "@envelop/validation-cache"
  "@graphql-yoga/logger"
  "@graphql-yoga/subscription"
  "@ssb-graphql/main"
  "@ssb-graphql/profile"
  "@ssb-graphql/submissions"
  "@ssb-graphql/whakapapa"
  "graphql-yoga"
  "secret-stack"
  "ssb-ahau"
  "ssb-profile"
  "ssb-serve-blobs"
  "ssb-whakapapa"
  "urlpattern-polyfill"
)
# TIP: to find module that need transpiling, run `npm run relsease:android`
# but comment out the "Build node.js native modules to Android" step, then
# try running `node mobile/www/nodejs-project/index.js` in node 12 and see errors
# NOTE: urlpattern-polyfill requires --keep-file-extension (as has .cjs file)

# We're bundling with Babel to convert JavaScript code to older version
# There're some packages that are using JavaScript code not supported by Node 12.x
for pkg in "${packagesToBabelify[@]}"
do
  echo $pkg;
  $(npm bin)/babel ./node_modules/$pkg \
    --ignore "test/**/*","**/*.test.js" \
    --keep-file-extension \
    --out-dir ./node_modules/$pkg \
    --presets=@babel/preset-env \
    --config-file=./babel.config.js;
done

rm ./babel.config.js;

log "Bundling with noderify...";
# Why some packages are filter'd or replaced:
#   Replaced:
#     - chloride: needs special compilation configs for android, and we'd like to
#        remove unused packages such as sodium-browserify etc
#     - sodium-native: needs special compilation configs for android
#
#   Filtered:
#     - cordova-bridge: this is not an npm package, it's from nodejs-mobile
#     - bl: we didn't use it, and bl@0.8.x has security vulnerabilities
#     - bufferutil: because we want nodejs-mobile to load its native bindings
#     - utf-8-validate: because we want nodejs-mobile to load its native bindings
#     - encoding: optional dependency within package node-fetch used by apollo-server // TODO rm?
#     - systeminformation: it provides APIs for desktop, not mobile

#     - async_hooks: native library, it's not added to noderify yet TODO
#     - stream/web: native libraby, it's not added to noderify yet TODO

$(npm bin)/noderify \
  --replace.bindings=bindings-noderify-nodejs-mobile \
  --replace.node-extend=xtend \
  --replace.non-private-ip=non-private-ip-android \
  --replace.leveldown=leveldown-nodejs-mobile \
  --replace.chloride=sodium-chloride-native-nodejs-mobile \
  --replace.sodium-native=sodium-native-nodejs-mobile \
  --replace.utp-native=utp-native-nodejs-mobile \
  --filter=cordova-bridge \
  --filter=bl \
  --filter=bufferutil \
  --filter=utf-8-validate \
  --filter=encoding \
  --filter=casual \
  --filter=systeminformation \
  --filter=async_hooks \
  --filter=stream/web \
  index.js > index.bundle.js;

rm index.js;
mv index.bundle.js index.js;
cd ../..;

if [ $BUILD_PLATFORM == "android" ]; then
  # Just to Android cause iOS will use the node_modules to build its native modules
  log "Moving Android dynamic native libs..."
  ./scripts/android/move-dynamic-native-libs.sh

  log "Removing node_modules folder and package-lock.json, just keeping ssb-ahau migrations...";
  cd ./www/nodejs-project/node_modules;
  ls | grep -xv "ssb-ahau" | xargs rm -rf;
  rm -rf .bin ssb-ahau/node_modules ssb-ahau/test;
  cd ../../..;
fi

rm ./www/nodejs-project/package-lock.json;
