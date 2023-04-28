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

echo "Moving some shared dynamic native libraries to Android jniLibs...";
for entry in "${archs[@]}"
do
  IFS=";" read -r -a arr <<< "${entry}" # entry.split(';')
  arch="${arr[0]}"
  nodearch="${arr[1]}"

  mkdir -p platforms/android/app/src/main/jniLibs/$arch;

  # Copy libsodium.so because nodejs-mobile scripts only move .node files
  # NOTE version of sodium-native and sodium-native-nodejs-mobile must be the same (ignoring the -\n suffix)
  # cp ./www/nodejs-project/node_modules/sodium-native-nodejs-mobile/lib/android-$nodearch/libsodium.so \
  #   platforms/android/app/src/main/jniLibs/$arch/libsodium.so;
  # Commented this out as cannot find these files
  #   find . -name "libsodium.so"
  #   find . -name "libsodium.so" | rg lib/android-
done
