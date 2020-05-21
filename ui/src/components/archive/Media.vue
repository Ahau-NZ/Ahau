<template>
  <div :style="`width:${width};height:${height};background-color:black;`">
    <v-img
      v-if="artefact.type === 'photo'"
      :src="artefact.blob"
      :lazy-src="artefact.blob"
      class="grey lighten-2"
      :width="width"
      :height="height"
      @click="$emit('click')"
    >
      <template>
        <v-btn class="delete" @click.stop="$emit('delete')" icon small dark>
          <v-icon fab x-small>mdi-close</v-icon>
        </v-btn>
      </template>
      <template v-slot:placeholder>
        <v-row
          class="fill-height ma-0"
          align="center"
          justify="center"
        >
          <v-progress-circular indeterminate color="grey lighten-5"></v-progress-circular>
        </v-row>
      </template>
    </v-img>
    <video :style="`width:${width};height:${height};background-color:black;`" v-if="artefact.type === 'video'">
      <source :src="artefact.blob" :type="'video/' + artefact.format"/>
    </video>
  </div>
</template>

<script>
export default {
  name: 'Media',
  props: {
    artefact: Object,
    width: String,
    height: String
  }
}
</script>

<style scoped>
.fit {
  position: relative;
  object-fit: cover;
  width: 100%;
  height: 100%;
}

.delete {
  position: absolute;
  top: 0px;
  right: 0px;
  z-index: 100;
}
</style>
