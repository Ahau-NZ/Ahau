<template>
  <div @click="$refs.fileInput.click()">
    <input v-show="false" ref="fileInput" type="file" accept="audio/*,video/*,image/*" multiple @change="processMediaFiles($event)" />
    <AddButton :dark="dark" :size="mobile ? '40px' : '60px'" icon="mdi-image-plus" />
    <p v-if="showLabel" class="add-label clickable" >Add artefacts</p>
  </div>
  <!-- <div class="mt-10 ml-10">
        <input v-show="false" ref="fileInput" type="file" accept="audio/*,video/*,image/*" multiple @change="processMediaFiles($event)" />
        <AddButton  class="right: 0;" @click="$refs.fileInput.click()" label=""/>
      </div> -->
</template>
<script>
import AddButton from '@/components/button/AddButton.vue'
import gql from 'graphql-tag'
const imageRegex = /^image\//
const audioRegex = /^audio\//
const videoRegex = /^video\//

export default {
  name: 'UploadArtefactButton',
  props: {
    dark: Boolean,
    showLabel: Boolean
  },
  components: {
    AddButton
  },
  computed: {
    mobile () {
      return this.$vuetify.breakpoint.xs || this.$vuetify.breakpoint.sm
    }
  },
  methods: {
    async processMediaFiles ($event) {
      this.index = this.formData.artefacts ? this.formData.artefacts.length : 0
      const { files } = $event.target

      this.formData.artefacts = await Promise.all(
        Array.from(files).map(async file => {
          var artefact = await this.uploadFile(file)
          return artefact
        })
      )

      this.newDialog = true
    },
    async uploadFile (file) {
      // upload the file to ssb
      try {
        const res = await this.$apollo.mutate({
          mutation: gql`
            mutation uploadFile($file: Upload!) {
              uploadFile(file:$file) {
                blob
                mimeType
                uri
              }
            }
          `,
          variables: {
            file
          }
        })

        if (res.errors) throw new Error('Error uploading file. ' + res.errors)

        // get the resulting blob
        var blobObject = res.data.uploadFile
        var artefact = {}

        // get artefact attributes from the file and blob
        const type = this.getFileType(file.type)
        const title = this.getFileName(file.name)
        const format = this.getFileFormat(file.type)
        const blob = blobObject.blob
        const uri = blobObject.uri
        const mimeType = blobObject.mimeType

        if (type === 'video' || type === 'audio') {
          artefact = {
            duration: null, // TODO: how to get the duration from the file....
            size: file.size,
            transcription: null
          }
        }

        artefact = {
          ...artefact,
          type,
          blob,
          uri,
          mimeType,
          title,
          description: null,
          format,
          identifier: null,
          language: null,
          licence: null,
          rights: null,
          source: null,
          translation: null,
          mentions: []
        }

        return artefact
      } catch (err) {
        throw err
      }
    },
    getFileType (type) {
      switch (true) {
        case imageRegex.test(type):
          return 'photo'
        case audioRegex.test(type):
          return 'audio'
        case videoRegex.test(type):
          return 'video'
        default:
          return ''
      }
    },
    getFileFormat (fileType) {
      return fileType.replace(/.*\//, '')
    },
    getFileName (fileName) {
      return fileName.replace(/\.[^/.]+$/, '')
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
