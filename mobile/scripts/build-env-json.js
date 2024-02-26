#! /usr/bin/env node

const fs = require('fs')
const path = require('path')

const envFilepath = path.join(process.cwd(), 'env.json')
const envVars = {
  PLATFORM: 'cordova',
  NODE_ENV: process.env.AHAU_ENV || process.env.NODE_ENV
  // MEDIATOR_DID // could put this in here?
}

fs.writeFileSync(envFilepath, JSON.stringify(envVars), {
  encoding: 'utf-8'
})
