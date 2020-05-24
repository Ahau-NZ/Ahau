<template>
  <div>
    <v-hover v-slot:default="{ hover }" class="pa-0">
      <v-card
        tile
        :elevation="hover ? 12 : 2"
        :class="{ 'on-hover': hover}"
        :style="{...dimensions, ...customStyle, overflow: 'hidden'}"
        @click="$emit('click')"
      >
        <v-img
          v-if="artefact.type === 'photo'"
          :src="artefact.blob"
          :style="dimensions"
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
          <video :src="artefact.blob" :style="dimensions" :controls="hover && controls"/>
        </v-card>
        <v-card v-if="artefact.type === 'audio'" class="container">
          <audio :src="artefact.blob" :style="dimensions"
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
        <v-btn v-show="controls && hover && !start" class="left white--text"
          icon small
          @click="$emit('previous')"
        >
          <v-icon>mdi-chevron-left</v-icon>
        </v-btn>
        <v-btn v-show="controls && hover && !end" class="right white--text"
          icon small
          @click="$emit('next')"
        >
          <v-icon>mdi-chevron-right</v-icon>
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
    start: { type: Boolean },
    end: { type: Boolean },
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
        height: this.height,
        marginRight: 'auto',
        marginLeft: 'auto'
      }
    },
    customStyle () {
      return {
        backgroundColor: '#121212',
        opacity: this.selected ? '1' : '0.6'
      }
    }
  }
}
</script>
<style scoped>
.container {
  position: relative;
  padding: 0;
  margin: 0 auto;
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

.left {
  position: absolute;
  top: 50%;
  left: 2px;
  /* transform: translate(-50%, -50%);
  -webkit-transform: translate(-50%, -50%); */
}

.right {
  position: absolute;
  top: 50%;
  right: 2px;
  /* transform: translate(-50%, -50%);
  -webkit-transform: translate(-50%, -50%); */
}
</style>
