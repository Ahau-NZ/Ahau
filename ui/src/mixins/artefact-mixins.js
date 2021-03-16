import { DELETE_ARTEFACT } from '@/lib/artefact-helpers'

export const methods = {
  async updateArtefacts (artefacts) {
    this.formData.artefacts = await Promise.all(artefacts.map(async (artefact, i) => {
      if (this.editing) {
        if (artefact.id) {
          var oldArtefact = this.formData.artefacts[i]
          Object.assign(oldArtefact, artefact)
          return artefact
        }
      }
      return artefact
    }))
  },
  removeItem (array, index) {
    array.splice(index, 1)
  },
  async deleteArtefact (id) {
    const res = await this.$apollo.mutate(DELETE_ARTEFACT(id, new Date()))

    if (res.errors) {
      throw res.errors
    }
  },
  async removeArtefact (index) {
    if (this.editing) {
      // remove from the database
      var artefact = this.formData.artefacts[this.index]

      // check it has an id
      if (artefact.id) {
        await this.deleteArtefact(artefact.id)
      }
    }
    // remove from formData
    this.removeItem(this.formData.artefacts, this.index)
    if (this.formData.artefacts && this.formData.artefacts.length === 0) this.dialog = null
  }
}

export const artefactMixin = {
  methods: {
    ...methods
  }
}
