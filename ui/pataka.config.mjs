import Env from 'ahau-env'

const pataka = {
  dev: {
    id: '%AvTMz4IckBBGXaAetQLbXfM6yx3KB+9ldXGie8HUogQ=.sha256',
    code: '203.94.33.149:8068:@Tip7Sl2c76UAoQQ84+z7QXj80r/9kyYp286BzzQIgbY=.ed25519~pUzBcC8JBIa9bNEQARgRtZZQiYNCRjjTnmOR+DHQgPM='
  },
  prod: {
    id: '%BypHtE1Mz2evI2a27yuNPa/2AyUP7FWANYOKXa4KLQQ=.sha256',
    code: 'devpataka.ahau.io:8088:@rdb7tKErhISZAk7lxKpI7dqXwg+LlrJxkoxL//nbWnU=.ed25519~hIVRITBGdSjItd0sL/42KMDSmGHd0DhAzlIvYQVpetc='
  }
}

export default Env().isDevelopment
  ? pataka.dev
  : pataka.prod
