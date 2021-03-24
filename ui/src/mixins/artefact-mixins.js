import { DELETE_ARTEFACT } from '@/lib/artefact-helpers'
import { getObjectChanges } from '@/lib/get-object-changes.js'
import { setDefaultStory } from '@/lib/story-helpers.js'

export const methods = {
  updateArtefacts (artefacts) {
    this.formData.artefacts = artefacts.map((artefact, i) => {
      if (!artefact.id) return artefact

      Object.assign(this.formData.artefacts[i], artefact)
      return artefact
    })
  },
  removeItem (array, index) {
    array.splice(index, 1)
  },
  async deleteArtefact (id) {
    const res = await this.$apollo.mutate(DELETE_ARTEFACT(id, new Date()))

    if (res.errors) throw res.errors
  },
  removeArtefact (index) {
    console.log('removing artefact')
    console.log('index: ', index)
    // remove from the database
    var artefact = this.formData.artefacts[index]

    // remove from formData
    this.removeItem(this.formData.artefacts, index)

    // check it has an id
    if (artefact.id) {
      console.log('deleteing artefact')
      this.deleteArtefact(artefact.id)

      var output = {
        id: this.story.id,
        ...getObjectChanges(setDefaultStory(this.story), this.formData)
      }
      this.$emit('submit', output)
      if (this.formData.artefacts && this.formData.artefacts.length === 0) this.dialog = null
    }
  }
}

export const artefactMixin = {
  methods: {
    ...methods
  }
}
