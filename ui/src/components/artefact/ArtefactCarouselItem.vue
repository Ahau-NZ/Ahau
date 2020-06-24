<template>
  <v-hover v-slot:default="{ hover }" class="pa-0 ma-0">
    <v-card
      tile
      flat
      :class="{ 'on-hover': hover, 'highlight': selected }"
      @click="$emit('click')"
      class="container"
    >
      <v-img
        v-if="artefact.type === 'photo'"
        :src="artefact.blob"
        :contain='controls'
        class="media"
        tile
        flat
      >
        <!-- <template v-slot:placeholder>
          <v-row
            class="fill-height ma-0"
            align="center"
            justify="center"
          >
            <v-progress-circular indeterminate color="secondary"></v-progress-circular>
          </v-row>
        </template> -->
      </v-img>
      <div v-if="artefact.type === 'video'">
        <video ref="video" :src="artefact.blob" :controls="hover && controls" class="video"/>
      </div>
      <div v-if="artefact.type === 'audio'" class="media" >
        <audio :src="artefact.blob"
          :controls="controls" class="px-12" style="width:100%;height:80%;"
        />
        <v-icon size="50" class="center">mdi-music</v-icon>
      </div>
      <v-btn v-if="controls && hover && editing" class="edit mr-2 mt-2"
        fab x-small
        @click="$emit('update')"
      >
        <v-icon>mdi-pencil</v-icon>
      </v-btn>
      <v-btn v-if="controls && hover && editing" class="close mr-2 mt-2"
        fab x-small
        @click="$emit('delete')"
      >
        <v-icon>mdi-delete</v-icon>
      </v-btn>
      <v-fade-transition>
        <v-overlay :absolute="true" opacity="0.6" :value="!selected && !controls"/>
      </v-fade-transition>
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
    selected: { type: Boolean, default: false },
    selectedIndex: { type: Number, default: 0 },
    editing: { type: Boolean }
  },
  data () {
    return {
      hover: false
    }
  },
  methods: {
    match (i) {
      if (this.selectedIndex === i) {
        return true
      }
    }
  }
}
</script>
<style scoped lang="scss">
/* set to parent dimensions */
.media {
  width: 100%;
  height: 100%;
  background-color: #1E1E1E;
  object-fit: cover;
}
.container {
  width: 100%;
  height: 100%;
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

.video {
  position:absolute;
  top:10%;
  left:0%;
  width:100%;
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

// .highlight {
//   overflow: hidden;
//   border: 5px solid rgba(0, 0, 0, 0.5)
// }
</style>
