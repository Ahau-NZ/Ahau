<template>
  <v-sheet @click="toggleArtefact" class="container pa-0">
    <div v-if="artefact.type === 'video'" :style="showArtefact ? mobile ? 'height:300px' : 'height:500px' : 'height:auto'" >
    <!-- <div v-if="artefact.__typename === 'Video'" :style="showArtefact ? mobile ? 'height:300px' : 'height:500px;' : 'height:auto'" > -->
      <v-hover v-slot:default="{ hover }">
        <video ref="video" :src="artefact.blob.uri" :controls="hover" class="video"/>
      </v-hover>
    </div>
    <div v-if="artefact.type === 'audio'" :style="showArtefact ? 'height:300px': mobile ? 'height:300px' : 'height:500px'">
    <!-- <div v-if="artefact.__typename === 'Audio'" :style="showArtefact ? 'height:300px': mobile ? 'background-color:dimgray;height:300px' : 'background-color:dimgray;height:500px'"> -->
      <audio :src="artefact.blob.uri" class="px-12" style="width:100%;height:80%;"/>
    </div>
    <v-img ref="photo" v-if="artefact.type === 'photo'" class="media center" :src="artefact.blob.uri" contain></v-img>
    <pdf v-if="artefact.type === 'document'" :src="artefact.blob.uri"/>
    <!-- <pdf v-if="artefact.type === 'text'" :src="artefact.blob.uri"/> -->
  </v-sheet>
</template>

<script>
import { mapGetters } from 'vuex'
import pdf from 'vue-pdf'

export default {
  name: 'Artefact',
  props: {
    artefact: Object,
    model: { type: Number, default: -1 },
    index: Number
  },
  components: {
    pdf
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
  display: block;
}

.video {
  position:absolute;
  top:10%;
  left:0%;
  width:100%;
}

.media {
  width: 100%;
  height: 100%;
  background-color: #1E1E1E;

}

.center {
  justify-items: center;
  align-items: center;
}

.container {
  width: 100%;
  height: 100%;
}

</style>
