#! /usr/bin/env node

const path = require('path')
const sharp = require('sharp')

const androidAppIcon = sharp(path.resolve(__dirname, '../res-src/app-icon-android.svg'), { density: 512 })
const androidConfigs = [
  [36, 'ldpi'],
  [48, 'mdpi'],
  [72, 'hdpi'],
  [96, 'xhdpi'],
  [144, 'xxhdpi'],
  [192, 'xxxhdpi']
]

const iosAppIcon = sharp(path.resolve(__dirname, '../res-src/app-icon-ios.svg'), { density: 1024 })
const iosConfigs = [
  [20, 1],
  [20, 2],
  [20, 3],
  [29, 1],
  [29, 2],
  [29, 3],
  [40, 1],
  [40, 2],
  [40, 3],
  [50, 1],
  [50, 2],
  [57, 1],
  [57, 2],
  [60, 1],
  [60, 2],
  [60, 3],
  [72, 1],
  [72, 2],
  [76, 1],
  [76, 2],
  [76, 3],
  [83.5, 2],
  [512, 1],
  [512, 2]
]

Promise.all(androidConfigs.map(makeAndroidIcon))
Promise.all(iosConfigs.map(makeIOSIcon))

androidAppIcon
  .resize(512, 512)
  .png()
  .toFile(path.resolve(__dirname, '..', 'res/icon/android', 'playstore-icon.png'))

function makeAndroidIcon ([size, sizeName]) {
  const folder = `res/icon/android/mipmap-${sizeName}`
  const filename = 'ic_launcher.png'
  const absPath = path.resolve(__dirname, '..', folder, filename)
  return androidAppIcon
    .resize(size, size)
    .png()
    .toFile(absPath)
}

function makeIOSIcon ([size, zoom]) {
  const folder = 'res/icon/ios'
  const filename = `icon-${size}x${size}@${zoom}x.png`
  const absPath = path.resolve(__dirname, '..', folder, filename)
  return iosAppIcon
    .resize(size * zoom, size * zoom)
    .png()
    .toFile(absPath)
}
