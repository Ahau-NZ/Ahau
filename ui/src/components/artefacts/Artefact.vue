<template>
  <v-sheet @click="showArtefact">
    <video v-if="artefact.__typename === 'Video'" :class="mobile ? 'mobileVideo':'video'" controls >
      <source src="@/assets/buildCSV.mp4" type="video/mp4">
    </video>
    <audio v-if="artefact.__typename === 'Audio'" :class="mobile ? 'mobileAudio':'audio'" controls>
        <source src="@/assets/ignore/audio.mp3" type="audio/mpeg"/>
    </audio>
    <v-img v-if="artefact.__typename === 'Photo'" :src="artefact.blob"></v-img>
  </v-sheet>
</template>

<script>

export default {
  name: 'Artefact',
  props: {
    artefact: Object
  },
  methods: {
    showArtefact () {
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
  // background-color: #383838;
  // background-size: 400px;
}

.mobileAudio {
  position:absolute;
  top:30%;
  left:25%;
  width:400px;
  // background-color: #383838;
  // background-size: 400px;
}

.center {
  justify-items: center;
  align-items: center;
}

</style>