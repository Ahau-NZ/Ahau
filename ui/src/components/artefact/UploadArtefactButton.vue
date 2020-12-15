<template>
  <div @click="$refs.fileInput.click()">
    <input v-show="false" ref="fileInput" type="file" :accept="acceptedFileTypes"  multiple @change="processMediaFiles($event)" />
    <AddButton :dark="dark" :size="mobile ? '40px' : '60px'" icon="mdi-image-plus" />
    <p v-if="showLabel" class="add-label clickable" >Add artefacts</p>
  </div>
</template>
<script>
import uploadFile from '@/mixins/upload-file.js'
import { ARTEFACT_FILE_TYPES } from '@/lib/artefact-helpers.js'
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
  mixins: [uploadFile],
  data () {
    return {
      artefacts: []
    }
  },
  computed: {
    mobile () {
      return this.$vuetify.breakpoint.xs || this.$vuetify.breakpoint.sm
    },
    acceptedFileTypes () {
      return ARTEFACT_FILE_TYPES
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
      // upload the file to ssb
      const blob = await this.uploadFile({ file, encrypt: true })
      var [ type ] = file.type.split('/')
      const [ name ] = file.name.split('.')

      if (type === 'image') type = 'photo'
      else if (type === 'application' || type === 'text') type = 'document'

      // TODO: HACK until mimeType: Hello World gets solved
      if (!blob.mimeType || blob.mimeType === 'Hello World') blob.mimeType = file.type

      if (blob.__typename) delete blob.__typename

      var createdAt = ''
      if (file.lastModified) {
        createdAt = new Date(file.lastModified).toISOString().slice(0, 10)
      } else {
        createdAt = Date.now().toISOString().slice(0, 10)
      }

      var artefact = {
        type,
        blob,
        title: name,
        createdAt
      }

      return artefact
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
