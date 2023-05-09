#!/bin/bash

cordova --version && \
cordova prepare && \
cordova clean && \
cordova plugin add nodejs-mobile-cordova --nosave
# The custom scripts to nodejs-mobile are added to the xcode build phases just in `plugin add` hook
