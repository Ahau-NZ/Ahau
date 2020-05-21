<template>
  <v-sheet @click="toggleArtefact">
    <div v-if="artefact.__typename === 'Video'" :style="showArtefact ? mobile ? 'height:300px' : 'height:500px' : 'background-color:white;height:auto'" >
      <video ref="video" class="video" controls>
        <source src="@/assets/buildCSV.mp4" type="video/mp4">
      </video>
    </div>
    <div v-if="artefact.__typename === 'Audio'" :style="showArtefact ? 'height:300px': mobile ? 'background-color:white;height:300px' : 'background-color:white;height:500px'">
      <audio ref="audio" class="audio" controls>
          <source src="@/assets/ignore/audio.mp3" type="audio/mpeg"/>
      </audio>
    </div>
    <v-img v-if="artefact.__typename === 'Photo'" :src="artefact.blob"></v-img>
  </v-sheet>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'Artefact',
  props: {
    artefact: Object,
    model: { type: Number, default: -1 },
    index: Number
  },
  computed: {
    ...mapGetters(['showArtefact']),
    mobile () {
      return this.$vuetify.breakpoint.xs || this.$vuetify.breakpoint.sm
    }
  },
  watch: {
    model (newVal) {
      if (this.showArtefact) {
        if (newVal === this.index) {
          if (this.artefact.__typename === 'Audio') {
            this.$refs.audio.play()
          } else if (this.artefact.__typename === 'Video') {
            this.$refs.video.play()
          }
        } else if (newVal !== this.index) {
          if (this.artefact.__typename === 'Audio') {
            if (this.$refs.audio.play) { this.$refs.audio.pause() }
          } else if (this.artefact.__typename === 'Video') {
            if (this.$refs.video.play) { this.$refs.video.pause() }
          }
        }
      } else if (newVal !== this.index) {
        if (this.artefact.__typename === 'Audio') {
          if (this.$refs.audio.play) { this.$refs.audio.pause() }
        } else if (this.artefact.__typename === 'Video') {
          if (this.$refs.video.play) { this.$refs.video.pause() }
        }
      }
    }
  },
  methods: {
    toggleArtefact () {
      this.$emit('showArtefact', this.artefact)
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
}

.video {
  position:absolute;
  top:10%;
  left:0%;
  width:100%;
}

.center {
  justify-items: center;
  align-items: center;
}
</style>
