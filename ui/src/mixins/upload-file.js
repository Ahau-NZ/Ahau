import { uploadFile } from '@/lib/file-helpers.js'
import { mapMutations } from 'vuex'

const methods = {
  ...mapMutations(['confirmationAlert']),
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
      this.confirmationAlert({ message, delay: 5000 })
      return null
    }
  }
}

export default {
  methods
}
