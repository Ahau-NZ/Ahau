import { getWhakapapaViews } from '@/lib/whakapapa-helpers.js'

export default function mapWhakapapaMixins ({ mapMethods }) {
  var customMixin = {}
  if (mapMethods) {
    customMixin.methods = {}

    mapMethods.forEach(m => {
      if (methods[m]) customMixin.methods[m] = methods[m]
    })
  }

  return customMixin
}

const methods = {
  async getWhakapapaViews () {
    if (!this.showAlert) console.error('getWhakapapaViews function needs the mutation showAlert')
    try {
      const res = await this.$apollo.query(
        getWhakapapaViews()
      )

      if (res.errors) {
        console.error(res.errors)
        throw new Error('Something went wrong while trying to get the list of whakapapa records')
      }

      return res.data.whakapapaViews
    } catch (err) {
      this.showAlert({ message: err.message, delay: 5000, color: 'red' })
      return []
    }
  }
}
