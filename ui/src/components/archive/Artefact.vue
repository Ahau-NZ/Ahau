<template>
  <v-sheet>
    <video v-if="aretfact.type === 'video'" src=""></video>
    <audio v-if="artefact.type === 'audio'" src=""></audio>
    <v-img v-if="artefact.type === 'image'" src=""></v-img>
  </v-sheet>
</template>

<script>
export default {
  name: 'Artefact',
  props: {
    artefact: Object
  }
}

</script>
