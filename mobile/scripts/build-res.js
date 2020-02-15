#! /usr/bin/env node

const path = require('path')
const sharp = require('sharp')

const sharpOpts = { failOnError: true, sequentialRead: true }
const resFolder = path.resolve(__dirname, '../res')
const resSrcFolder = path.resolve(__dirname, '../res-src')

const androidSplashConfigs = [
  [242, 'ldpi'],
  [322, 'mdpi'],
  [482, 'hdpi'],
  [642, 'xhdpi'],
  [962, 'xxhdpi'],
  [1282, 'xxxhdpi']
]

const androidAppIconConfigs = [
  [36, 'ldpi'],
  [48, 'mdpi'],
  [72, 'hdpi'],
  [96, 'xhdpi'],
  [144, 'xxhdpi'],
  [192, 'xxxhdpi']
]

const iosAppIconConfigs = [
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

Promise.all(androidAppIconConfigs.map(makeAndroidIcon))
Promise.all(androidSplashConfigs.map(makeAndroidSplashScreen))
Promise.all(iosAppIconConfigs.map(makeIOSIcon))

sharp(path.join(resSrcFolder, 'app-icon-android.svg'), { ...sharpOpts, density: 512 })
  .resize(512, 512)
  .png()
  .toFile(path.resolve(resFolder, 'icon/android/playstore-icon.png'))

sharp(path.join(resSrcFolder, 'splash-screen.svg'), { ...sharpOpts, density: 1024 })
  .resize(2732, 2732)
  .png()
  .toFile(path.resolve(resFolder, 'screen/ios/Default@2x~universal~anyany.png'))

function makeAndroidIcon ([size, sizeName]) {
  const mipmapFolder = `mipmap-${sizeName}`
  const filename = 'ic_launcher.png'
  const absPath = path.resolve(resFolder, 'icon/android', mipmapFolder, filename)
  return sharp(path.join(resSrcFolder, 'app-icon-android.svg'), { ...sharpOpts, density: size })
    .resize(size, size)
    .png()
    .toFile(absPath)
}

function makeAndroidSplashScreen ([size, sizeName]) {
  const drawableFolder = `drawable-${sizeName}`
  const filename = 'screen.png'
  const absPath = path.resolve(resFolder, 'screen/android', drawableFolder, filename)
  return sharp(path.join(resSrcFolder, 'splash-screen.svg'), { ...sharpOpts, density: size })
    .resize(size, size)
    .png()
    .toFile(absPath)
}

function makeIOSIcon ([size, zoom]) {
  const filename = `icon-${size}x${size}@${zoom}x.png`
  const absPath = path.resolve(resFolder, 'icon/ios', filename)
  const density = size * zoom
  return sharp(path.join(resSrcFolder, 'app-icon-ios.svg'), { ...sharpOpts, density })
    .resize(size * zoom, size * zoom)
    .png()
    .toFile(absPath)
}
