<template>
  <v-hover v-slot:default="{ hover }" class="pa-0 ma-0">
    <v-card
      tile
      flat
      :class="{ 'on-hover': hover, 'highlight': selected }"
      @click="$emit('click')"
      class="container"
    >
      <div v-if="useRenderMedia"
        ref='renderTarget'
        class="media"

        v-once
        >
      </div>
      <template v-else>
        <!-- TODO: see if can dedeplicate with Artefact.vue -->

        <!-- video -->
        <div v-if="artefact.type === 'video' && !showPreview">
          <video ref="video" :src="artefact.blob.uri" :controls="hover && controls" class="video"/>
        </div>
        <v-img v-if="artefact.type === 'video' && showPreview"
          :src="poster"
          ref="photo"
          class="media"
          contain
        />

        <!-- photo -->
        <v-img
          v-if="artefact.type === 'photo'"
          :src="artefact.blob.uri"
          :contain='controls'
          class="media"
          tile
          flat
        />

        <!-- document -->
        <div v-if="artefact.type === 'document'" class="media">
          <div>
            <div v-if="controls" class="text-center" style="padding-top:15%;">
              <v-icon size="100px">{{ artefactIcon }}</v-icon><br>
              <v-btn text @click.prevent="downloadFile()">
                Download File
              </v-btn>
            </div>
            <div v-else class="pt-4 px-5">
              <v-icon size="60px">{{ artefactIcon }}</v-icon>
            </div>
          </div>
        </div>

        <!-- audio -->
        <div v-if="artefact.type === 'audio'" class="media">
          <audio :src="artefact.blob.uri"
            :controls="controls" class="px-12" style="width:100%;height:80%;"
          />
          <v-icon size="50" class="center">mdi-music</v-icon>
        </div>

        <v-btn v-if="controls && editing" class="edit mr-2 mt-2"
          fab x-small
          @click="$emit('update')"
        >
          <v-icon>mdi-pencil</v-icon>
        </v-btn>
        <v-btn v-if="controls && editing" class="close mr-2 mt-2"
          fab x-small
          @click="$emit('delete')"
        >
          <v-icon>mdi-delete</v-icon>
        </v-btn>
        <v-fade-transition>
          <v-overlay :absolute="true" opacity="0.6" :value="!selected && !controls"/>
        </v-fade-transition>
      </template>
    </v-card>
  </v-hover>
</template>

<script>
import { ARTEFACT_ICON } from '@/lib/artefact-helpers.js'
import FileStream from '@/lib/hyper-file-stream'
import getVideoPoster from '@/lib/get-video-poster'

const renderMedia = require('render-media')

export default {
  name: 'ArtefactCarouselItem',
  props: {
    artefact: Object,
    width: { type: String, default: '100px' },
    height: { type: String, default: '100px' },
    controls: { type: Boolean },
    selected: { type: Boolean, default: false },
    selectedIndex: { type: Number, default: 0 },
    editing: { type: Boolean },
    showPreview: Boolean
  },
  components: {
  },
  data () {
    return {
      hover: false,
      poster: null
    }
  },
  mounted () {
    if (this.useRenderMedia) this.renderHyperBlob()
    // WIP extract and fix this up mix

    if (this.artefact && this.artefact.type === 'video' && this.showPreview) {
      getVideoPoster(this.artefact.blob.uri)
        .then(src => { this.poster = src })
    }
  },
  computed: {
    useRenderMedia () {
      if (this.showPoster) return false

      if (this.artefact.blob.__typename !== 'BlobHyper') return false
      if (this.artefact.type === 'photo') return false
      if (this.artefact.type === 'document') return false // NOTE this is here because pdf rendering in electron is patchy

      return true
    },
    artefactIcon () {
      return ARTEFACT_ICON(this.artefact.blob.mimeType)
    }
  },
  methods: {
    match (i) {
      if (this.selectedIndex === i) {
        return true
      }
    },
    downloadFile () {
      var hiddenElement = document.createElement('a')
      hiddenElement.href = this.artefact.blob.uri
      hiddenElement.target = '_blank'
      hiddenElement.click()
    },
    renderHyperBlob () {
      const { title, blob } = this.artefact
      const file = {
        name: `${title}.${blob.mimeType.split('/')[1]}`, // TODO see if there's a better way to tell render-media the mimeType
        length: blob.size,
        createReadStream (opts = {}) {
          const stream = new FileStream(blob, opts)

          return stream
        }
      }
      renderMedia.append(file, this.$refs.renderTarget, function (err, elem) {
        if (err) return console.error(err)

        // HACK to get initial frame to load
        if (elem.play && elem.pause) elem.play().then(() => elem.pause())
      })
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
  object-fit: contain;

  img {
    object-fit: contain;
    max-width: 100%;
    height: 100%;
  }
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
  position: absolute;
  top: 10%;
  left: 0%;
  width: 100%;
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

</style>
