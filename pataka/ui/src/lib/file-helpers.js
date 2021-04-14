import gql from 'graphql-tag'
const pick = require('lodash.pick')

export const PERMITTED_FILE_INPUT = ['file', 'encrypt']

export const UPLOAD_FILE = input => {
  return {
    mutation: gql`
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
    `,
    variables: {
      ...pick(input, PERMITTED_FILE_INPUT),
      size: input.file.size
    }
  }
}
