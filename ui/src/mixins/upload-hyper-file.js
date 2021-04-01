import { createNamespacedHelpers } from 'vuex'
const { ahau: env } = require('ahau-env')
const axios = require('axios')
const { v4: uuid } = require('uuid')

const url = `http://localhost:${(env.hyperBlobs && env.hyperBlobs.port) || 26836}/blob` // TODO add hyperBlobs.port to ahau-env
// readKey
// blobId // should make one with uuid

const { mapMutations: mapAlertMutations } = createNamespacedHelpers('alerts')
const hexTo64 = str => Buffer.from(str, 'hex').toString('base64')

export default {
  methods: {
    ...mapAlertMutations(['showAlert']),
    async uploadFile ({ file }) {
      try {
        const res = await axios(url, {
          method: 'post',
          data: {
            localFilePath: file.path,
            blobId: uuid()
          }
        })
        // NOTE! file.path will only be accessible in electron UI, not in browser

        if (res.errors) throw res.errors // WIP how axios returns errors
        // WIP figure out why preview isn't loading for upload - could be file is not ready...

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
        const message = 'Something went wrong while upload a file. Please check the file size is less the 5MB'
        console.error(message)
        console.error(err)
        this.showAlert({ message, delay: 5000, color: 'red' })

        return null
      }
    }
  }
}
