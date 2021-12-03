import { mapActions } from 'vuex'
import { isCordova } from '../lib/cordova-helpers'

const { ahau: env } = require('ahau-env')()
const axios = require('axios')
const { v4: uuid } = require('uuid')

const url = `http://localhost:${(env.hyperBlobs && env.hyperBlobs.port) || 26836}/blob`
// readKey
// blobId

const hexTo64 = str => Buffer.from(str, 'hex').toString('base64')

const MB = 1024 * 1024
const MAX_FILE_SIZE = 150 * MB

function uploadArtefact (file) {
  const blobId = uuid()

  if (isCordova()) {
    const formData = new FormData() // eslint-disable-line
    formData.append('files', file)
    formData.append('blobId', blobId)

    return axios.post(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  }

  return axios(url, {
    method: 'post',
    data: {
      // NOTE! file.path will only be accessible in electron UI, not in browser or cordova
      localFilePath: file.path,
      blobId
    }
  })
}

export default {
  methods: {
    ...mapActions('alerts', ['showAlert']),
    async uploadFile ({ file }) {
      try {
        if (file && file.size > MAX_FILE_SIZE) {
          throw new Error('Please check the file size is less than 150MB')
        }

        const res = await uploadArtefact(file)

        if (res.error) {
          console.error(res.error)
          alert(res.error) // eslint-disable-line
          throw new Error(res.error)
        }

        const { driveAddress, blobId, readKey, href } = res.data

        return {
          type: 'hyper',
          mimeType: file.type,
          blobId,
          driveAddress: hexTo64(driveAddress),
          readKey: hexTo64(readKey),
          size: file.size,
          uri: href
        }
      } catch (err) {
        this.showAlert({ message: err.message, delay: 5000, color: 'red' })
        return null
      }
    }
  }
}
