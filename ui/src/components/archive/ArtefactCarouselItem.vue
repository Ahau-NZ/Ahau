<template>
  <div>
    <v-hover v-slot:default="{ hover }" class="pa-0">
      <v-card
        :elevation="hover ? 12 : 2"
        :class="{ 'on-hover': hover, 'mr-2': !end}"
        :style="customStyle"
        class="mt-2"
        @click="$emit('click')"
      >
        <v-img
          v-if="artefact.type === 'photo'"
          :src="artefact.blob"
          :style="customStyle"
          contain
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
        <v-card v-if="artefact.type === 'video'" class="container">
          <video :src="artefact.blob" :style="customStyle" :controls="hover && controls"/>
        </v-card>
        <v-card v-if="artefact.type === 'audio'" class="container">
          <audio :src="artefact.blob" :style="customStyle"
            :controls="hover && controls"
          />
          <v-icon  :style="hover ? 'opacity: 0.1' : ''" size="50" class="center">mdi-music</v-icon>
        </v-card>
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
  </div>
</template>

<script>
export default {
  name: 'ArtefactCarouselItem',
  props: {
    artefact: Object,
    width: { type: String, default: '100px' },
    height: { type: String, default: '100px' },
    controls: { type: Boolean },
    end: { type: Boolean }
  },
  data () {
    return {
      hover: false
    }
  },
  computed: {
    customStyle () {
      return {
        width: this.width,
        height: this.height,
        backgroundColor: '#121212'
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
  background-color: #121212;
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
  /* transform: translate(-50%, -50%);
  -webkit-transform: translate(-50%, -50%); */
}

.edit {
  position: absolute;
  top: 2px;
  right: 40px;
  /* transform: translate(-50%, -50%);
  -webkit-transform: translate(-50%, -50%); */
}
</style>
