const DEVELOPMENT = 'development'
const STAGING = 'staging'
const PRODUCTION = 'production'

const env = process.env.NODE_ENV || PRODUCTION

let caps
let shortName

switch (env) {
  case DEVELOPMENT:
    shortName = 'dev'
    caps = {
      shs: 'BHjvWx+Z2GiHMPKxUXQn+AYCXPLsYkSVCoDfldJA9Fc=',
      sign: 'tk6lgL0VpIhBotkcAlfyw+me4ysxY3bItUVwvIdiByI='
    }
    break

  case STAGING:
    caps = {
      shs: 'WPP7e6UeR6ur6bt/qxd1dPKGyXn1dqv2bDAeVTNXDuI=',
      sign: 'zIHQqbxSpYeFEGnIWz2JaEHLpbHz2xd7if7f9fyOMJA='
    }
    break

  case PRODUCTION:
    caps = {
      shs: 'PW7NiFTuMDjzsNqZaWQ5gDUQdi8mHK2JcbZLx4HCyv8=',
      sign: 'Peoj4NUl0I8EXp62EpKPcEcK28QGQ7tjk/vmyUOpzbY='
    }
    break

  default:
    throw new Error(`Invalid NODE_ENV: "${env}"`)
}

module.exports = {
  name: env,
  shortName,
  caps,

  isDevelopment: env === DEVELOPMENT,
  isStaging: env === STAGING,
  isProduction: env === PRODUCTION
}
