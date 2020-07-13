import gql from 'graphql-tag'
import pick from 'lodash.pick'

export const PERMITTED_FILE_INPUT = [
  'file',
  'encrypt'
]

export const UPLOAD_FILE = input => {
  input = pick(input, PERMITTED_FILE_INPUT)

  return {
    mutation: gql`
      mutation uploadFile($file: Upload!, $encrypt: Boolean) {
        uploadFile(file: $file, encrypt: $encrypt) {
          blobId: blob
          unbox
          mimeType
          uri
          size
        }
      }
    `,
    variables: input
  }
}
