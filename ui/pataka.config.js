const env = require('ahau-env')()

const pataka = {
  dev: {
    id: '%3PJOD7S8fUcCA2B2m58czDqIcf2Wn8btHXpkkqLSvGI=.sha256',
    code: 'devpataka.ahau.io:8068:@10wXMFBhxDycNWjgdx2Ql/YUz59wtUh0wJSTv3MB7rs=.ed25519~3hTHR84WMwrebtNZKM+rzRTziT8Q/KCpnjAQbuzuuug='
  },
  prod: {
    id: '%BypHtE1Mz2evI2a27yuNPa/2AyUP7FWANYOKXa4KLQQ=.sha256',
    code: 'devpataka.ahau.io:8088:@rdb7tKErhISZAk7lxKpI7dqXwg+LlrJxkoxL//nbWnU=.ed25519~hIVRITBGdSjItd0sL/42KMDSmGHd0DhAzlIvYQVpetc='
  }
}

module.exports = env.isDevelopment
  ? pataka.dev
  : pataka.prod
