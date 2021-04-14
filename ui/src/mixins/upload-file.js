import gql from 'graphql-tag'
import { createNamespacedHelpers } from 'vuex'
const { mapMutations: mapAlertMutations } = createNamespacedHelpers('alerts')

const MB = 1024 * 1024
const MAX_FILE_SIZE = 5 * MB

export default {
  methods: {
    ...mapAlertMutations(['showAlert']),
    async uploadFile (input) {
      try {
        if (input.file && input.file.size > MAX_FILE_SIZE) {
          throw new Error('Please check the file size is less than 5MB')
        }

        const res = await this.$apollo.mutate(
          uploadFile(input)
        )
        if (res.errors) {
          console.error(res.errors)
          throw new Error('Something went wrong while uploading a file')
        }
        return res.data.uploadFile
      } catch (err) {
        this.showAlert({ message: err.message, delay: 5000, color: 'red' })
        return null
      }
    }
  }
}

const mutation = gql`
  mutation uploadFile($file: Upload!, $size: Int!, $encrypt: Boolean) {
    uploadFile(file: $file, size: $size, encrypt: $encrypt) {
      type
      blobId
      mimeType
      uri
      size

      ...on BlobScuttlebutt {
        unbox
      }

      ...on BlobHyper {
        driveAddress
        readKey
      }
    }
  }
`

function uploadFile (input) {
  return {
    mutation,
    variables: {
      file: input.file,
      size: input.file.size,
      encrypt: input.encrypt
    }
  }
}
