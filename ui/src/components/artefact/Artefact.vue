<template>
  <v-sheet @click="toggleArtefact($event)" class="container pa-0">
    <div v-if="artefact.type === 'video'" :style="mobile ? 'height:300px' : 'height:auto'" >
      <v-hover v-slot:default="{ hover }">
        <video ref="video" :src="artefact.blob.uri" :controls="hover" class="video"/>
      </v-hover>
    </div>
    <div v-if="artefact.type === 'audio'" :style="showArtefact ? 'height:300px': mobile ? 'height:300px' : 'height:500px'">
      <audio ref="audio" :src="artefact.blob.uri" class="px-12" :controls="controls" style="width:100%;height:80%;"/>
      <v-icon size="50" class="center">mdi-music</v-icon>
    </div>
    <v-img ref="photo" v-if="artefact.type === 'photo'" class="media" :src="artefact.blob.uri" contain></v-img>
    <div v-else-if="artefact.type === 'document'" class="media" style="margin-top:15%;">
      <div class="text-center">
        <v-icon size="100px">{{ artefactIcon }}</v-icon><br>
        <v-btn text @click.prevent="downloadFile()">
          Download file
        </v-btn>
      </div>
    </div>
  </v-sheet>
</template>

<script>
import { mapGetters } from 'vuex'
import { ARTEFACT_ICON } from '@/lib/artefact-helpers.js'

export default {
  name: 'Artefact',
  props: {
    artefact: Object,
    model: { type: Number, default: -1 },
    index: Number,
    controls: Boolean
  },
  components: {
  },
  computed: {
    ...mapGetters(['showArtefact']),
    mobile () {
      return this.$vuetify.breakpoint.xs || this.$vuetify.breakpoint.sm
    },
    artefactIcon () {
      return ARTEFACT_ICON(this.artefact.blob.mimeType)
    }
  },
  watch: {
    model (newVal) {
      if (this.showArtefact) {
        if (newVal === this.index) {
          if (this.artefact.type === 'audio') {
            this.$refs.audio.play()
          } else if (this.artefact.type === 'video') {
            this.$refs.video.play()
          }
        } else if (newVal !== this.index) {
          if (this.artefact.type === 'audio') {
            if (this.$refs.audio.play) { this.$refs.audio.pause() }
          } else if (this.artefact.type === 'video') {
            if (this.$refs.video.play) { this.$refs.video.pause() }
          }
        }
      } else if (newVal !== this.index) {
        if (this.artefact.type === 'audio') {
          if (this.$refs.audio.play) { this.$refs.audio.pause() }
        } else if (this.artefact.type === 'video') {
          if (this.$refs.video.play) { this.$refs.video.pause() }
        }
      }
    }
  },
  methods: {
    toggleArtefact (e) {
      this.$emit('showArtefact', this.artefact)
    },
    downloadFile () {
      var hiddenElement = document.createElement('a')
      hiddenElement.href = this.artefact.blob.uri
      hiddenElement.target = '_blank'
      hiddenElement.download = this.artefact.title
      hiddenElement.click()
    }
  }
}

</script>
<style lang="scss">

.audio {
  position:absolute;
  top:40%;
  left:10%;
  width:80%;
  display: block;
}

.media {
  width: 100%;
  height: 100%;
  background-color: #1E1E1E;
  object-fit: cover;
}

.video {
  width: 100%;
  height: 100%;
  background-color: #1E1E1E;
  // display:content;
}

.center {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  -webkit-transform: translate(-50%, -50%);
  color: white;
  opacity: 0.6;
}

.container {
  width: 100%;
  height: 100%;
}

</style>
