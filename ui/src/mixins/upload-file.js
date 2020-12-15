import { uploadFile } from '@/lib/file-helpers.js'

const methods = {
  async uploadFile (input) {
    try {
      const res = await this.$apollo.mutate(
        uploadFile(input)
      )
      if (res.errors) throw res.errors

      return res.data.uploadFile
    } catch (err) {
      console.error('Something went wrong while uploading a file')
      console.error(err)
    }
  }
}

export default {
  methods
}
