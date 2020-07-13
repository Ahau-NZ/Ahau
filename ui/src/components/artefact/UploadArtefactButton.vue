<template>
  <div @click="$refs.fileInput.click()">
    <input v-show="false" ref="fileInput" type="file" accept="audio/*,video/*,image/*,application/pdf,text/plain" multiple @change="processMediaFiles($event)" />
    <AddButton :dark="dark" :size="mobile ? '40px' : '60px'" icon="mdi-image-plus" />
    <p v-if="showLabel" class="add-label clickable" >Add artefacts</p>
  </div>
</template>
<script>
import { UPLOAD_FILE } from '@/lib/file-helpers.js'
import AddButton from '@/components/button/AddButton.vue'

export default {
  name: 'UploadArtefactButton',
  props: {
    dark: Boolean,
    showLabel: Boolean
  },
  components: {
    AddButton
  },
  data () {
    return {
      artefacts: []
    }
  },
  computed: {
    mobile () {
      return this.$vuetify.breakpoint.xs || this.$vuetify.breakpoint.sm
    }
  },
  methods: {
    async processMediaFiles ($event) {
      const { files } = $event.target

      this.artefacts = await Promise.all(
        Array.from(files).map(async file => {
          var artefact = await this.processArtefact(file)
          return artefact
        })
      )

      this.$emit('artefacts', this.artefacts)
    },
    async processArtefact (file) {
      try {
        // upload the file to ssb
        const res = await this.$apollo.mutate(UPLOAD_FILE({ file, encrypt: true }))

        if (res.errors) throw new Error('Error uploading file. ' + res.errors)

        // get the resulting blob
        var blob = res.data.uploadFile
        var [ type ] = file.type.split('/')
        const [ name ] = file.name.split('.')

        if (type === 'image') type = 'photo'
        else if (file.type === 'application/pdf' || file.type === 'text/plain') type = 'document'

        if (!blob.mimeType) blob.mimeType = file.type

        delete blob.__typename

        var artefact = {
          type,
          blob,
          title: name
        }

        console.log(artefact)

        return artefact
      } catch (err) {
        throw err
      }
    }
  }
}
</script>
<style scoped>
.add-label {
  text-align: center;
  font-size: 0.8em;
  color: rgba(0, 0, 0, 0.6);
  padding-top: 4px;
}
</style>
