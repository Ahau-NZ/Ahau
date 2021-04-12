import { createNamespacedHelpers } from 'vuex'
const { ahau: env } = require('ahau-env')
const axios = require('axios')
const { v4: uuid } = require('uuid')

const url = `http://localhost:${(env.hyperBlobs && env.hyperBlobs.port) || 26836}/blob` // TODO add hyperBlobs.port to ahau-env
// readKey
// blobId // should make one with uuid

const { mapMutations: mapAlertMutations } = createNamespacedHelpers('alerts')
const hexTo64 = str => Buffer.from(str, 'hex').toString('base64')

const MB = 1024 * 1024
const MAX_FILE_SIZE = 150 * MB

export default {
  methods: {
    ...mapAlertMutations(['showAlert']),
    async uploadFile ({ file }) {
      try {
        if (file && file.size > MAX_FILE_SIZE) {
          throw new Error('Please check the file size is less than 150MB')
        }

        const res = await axios(url, {
          method: 'post',
          data: {
            localFilePath: file.path,
            blobId: uuid()
          }
        })
        // NOTE! file.path will only be accessible in electron UI, not in browser

        if (res.errors) {
          console.error(res.errors)
          throw new Error('Something went wrong while uploading a file')
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
