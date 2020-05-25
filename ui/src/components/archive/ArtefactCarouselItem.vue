<template>
  <v-hover v-slot:default="{ hover }" class="pa-0 ma-0">
    <v-card
      tile
      :class="{ 'on-hover': hover, 'highlight': selected }"
      :style="{...dimensions }"
      @click="$emit('click')"
      :outlined="selected"
    >
      <v-img
        v-if="artefact.type === 'photo'"
        :src="artefact.blob"
        :style="dimensions"
        contain
        flat
        class="container"
      >
        <template v-slot:placeholder>
          <v-row
            class="fill-height ma-0"
            align="center"
            justify="center"
          >
            <v-progress-circular indeterminate color="secondary"></v-progress-circular>
          </v-row>
        </template>
      </v-img>
      <div v-if="artefact.type === 'video'" class="container">
        <video :src="artefact.blob" :style="dimensions" :controls="hover && controls"/>
      </div>
      <div v-if="artefact.type === 'audio'" class="container">
        <audio :src="artefact.blob" :style="dimensions"
          :controls="hover && controls"
        />
        <v-icon size="50" class="center">mdi-music</v-icon>
      </div>
      <v-btn v-if="controls && hover" class="edit mr-2 mt-2"
        fab x-small
        @click="$emit('update')"
      >
        <v-icon>mdi-pencil</v-icon>
      </v-btn>
      <v-btn v-if="controls && hover" class="close mr-2 mt-2"
        fab x-small
        @click="$emit('delete')"
      >
        <v-icon>mdi-delete</v-icon>
      </v-btn>
    </v-card>
  </v-hover>
</template>

<script>
export default {
  name: 'ArtefactCarouselItem',
  props: {
    artefact: Object,
    width: { type: String, default: '100px' },
    height: { type: String, default: '100px' },
    controls: { type: Boolean },
    selected: { type: Boolean, default: false }
  },
  data () {
    return {
      hover: false
    }
  },
  computed: {
    dimensions () {
      return {
        width: this.width,
        height: this.height
      }
    }
  }
}
</script>
<style scoped>
.container {
  position: relative;
  padding: 0;
  margin: 0;
  height: 100%;
  width: 100%;
  background-color: #1E1E1E;
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

.close {
  position: absolute;
  top: 2px;
  right: 2px;
}

.edit {
  position: absolute;
  top: 2px;
  right: 40px;
}

.left {
  position: absolute;
  top: 50%;
  left: 2px;
}

.right {
  position: absolute;
  top: 50%;
  right: 2px;
}

.highlight {
  overflow: hidden;
  border: 5px solid rgba(0, 0, 0, 0.5)

}
</style>
