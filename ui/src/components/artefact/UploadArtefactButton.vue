<template>
  <div @click="handleClick">
    <input v-show="false" ref="fileInput" type="file" :accept="acceptedFileTypes"  multiple @change="processMediaFiles($event)" />
    <AddButton
      :dark="dark"
      :size="mobile ? '40px' : '60px'"
      :icon="processing ? 'mdi-loading mdi-spin' : 'mdi-image-plus'"
      />
    <p v-if="showLabel" class="add-label clickable" >Add artefacts</p>
  </div>
</template>

<script>
import uploadFile from '@/mixins/upload-hyper-file.js'
import { ARTEFACT_FILE_TYPES } from '@/lib/artefact-helpers.js'
import AddButton from '@/components/button/AddButton.vue'

export default {
  name: 'UploadArtefactButton',
  props: {
    dark: Boolean,
    showLabel: Boolean,
    acceptedFileTypes: {
      default: ARTEFACT_FILE_TYPES
    }
  },
  components: {
    AddButton
  },
  mixins: [uploadFile],
  data () {
    return {
      processing: 0 // TODO do something with this - spinner?
    }
  },
  computed: {
    mobile () {
      return this.$vuetify.breakpoint.xs || this.$vuetify.breakpoint.sm
    }
  },
  methods: {
    handleClick () {
      if (!this.processing) this.$refs.fileInput.click()
    },
    async processMediaFiles ($event) {
      const files = Array.from($event.target.files)
      this.processing = files.length

      const artefacts = await Promise.all(
        files.map(async file => {
          var artefact = await this.processArtefact(file)
          this.processing = this.processing - 1
          return artefact
        })
      )

      this.$emit('artefacts', artefacts.filter(Boolean))
    },
    async processArtefact (file) {
      let [ type ] = file.type.split('/')
      if (type === 'image') type = 'photo'
      else if (type === 'application' || type === 'text') type = 'document'

      const blob = await this.uploadFile({ file })
      if (blob === null) return null // means there was an error

      return {
        type,
        blob,
        title: file.name.split('.')[0],
        createdAt: file.lastModified
          ? new Date(file.lastModified).toISOString().slice(0, 10)
          : Date.now().toISOString().slice(0, 10)

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
