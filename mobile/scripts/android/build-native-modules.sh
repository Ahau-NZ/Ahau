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

cd platforms/android;
if [ -f ./gradlew ]; then
  GRADLE_EXEC="./gradlew"
else
  GRADLE_EXEC="gradle"
fi

for entry in "${archs[@]}"
do
  IFS=";" read -r -a arr <<< "${entry}" # entry.split(';')
  arch="${arr[0]}"

  echo "Building Android native modules for $arch ...";
  NODEJS_MOBILE_BUILD_NATIVE_MODULES=1 $GRADLE_EXEC app:GenerateNodeNativeAssetsLists$arch
done
cd ../..;
