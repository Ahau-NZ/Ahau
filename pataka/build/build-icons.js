const fs = require('fs')
const path = require('path')
const sharp = require('sharp')
const toIco = require('to-ico')
const { convert: icnsConvert } = require('@fiahfy/icns-convert')

const image = sharp(path.resolve(__dirname, 'icon.svg'))
const sizes = [16, 24, 32, 48, 64, 96, 128, 256]

Promise.all(sizes.map(makeIcon))
  .then((bufs) => {
    createIco(bufs)
    createIcns(bufs)
  })

function makeIcon (size) {
  return image
    .resize(size, size)
    .png()
    .toBuffer()
}

function createIco (bufs) {
  toIco(bufs)
    .then(buf => {
      fs.writeFileSync(path.join(__dirname, 'win/icon.ico'), buf)
    })
}

function createIcns (bufs) {
  icnsConvert(bufs)
    .then(data => {
      fs.writeFileSync(path.join(__dirname, 'mac/icon.icns'), data)
    })
}
