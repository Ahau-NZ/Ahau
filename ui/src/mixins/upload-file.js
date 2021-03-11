import gql from 'graphql-tag'
import { createNamespacedHelpers } from 'vuex'
const { mapMutations: mapAlertMutations } = createNamespacedHelpers('alerts')

export default {
  methods: {
    ...mapAlertMutations(['showAlert']),
    async uploadFile (input) {
      try {
        const res = await this.$apollo.mutate(
          uploadFile(input)
        )
        if (res.errors) throw res.errors

        return res.data.uploadFile
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

const mutation = gql`
  mutation uploadFile($file: Upload!, $size: Int!, $encrypt: Boolean) {
    uploadFile(file: $file, size: $size, encrypt: $encrypt) {
      store
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
