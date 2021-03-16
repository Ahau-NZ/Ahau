#/bin/bash

cordova prepare && \
cordova clean && \

# The custom scripts to nodejs-mobile are added to the xcode build phases just in `plugin add` hook
cordova plugin add nodejs-mobile-cordova --nosave