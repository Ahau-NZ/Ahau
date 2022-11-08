const env = require('ahau-env')()

const pataka = {
  dev: {
    id: '%AvTMz4IckBBGXaAetQLbXfM6yx3KB+9ldXGie8HUogQ=.sha256',
    code: 'devcloud.ahau.io:8068:@zKG25OpT1uKlc8rt4FDYLEHPUDLC8dCkRqJKGyhZdmg=.ed25519~fM9cF3DUcaZvGBQwQDvzTLdLEJIAKwy/tLbbrO0qKwg='
  },
  prod: {
    id: '%BypHtE1Mz2evI2a27yuNPa/2AyUP7FWANYOKXa4KLQQ=.sha256',
    code: 'devpataka.ahau.io:8088:@rdb7tKErhISZAk7lxKpI7dqXwg+LlrJxkoxL//nbWnU=.ed25519~hIVRITBGdSjItd0sL/42KMDSmGHd0DhAzlIvYQVpetc='
  }
}

module.exports = env.isDevelopment
  ? pataka.dev
  : pataka.prod
