<template>
  <v-hover v-slot:default="{ hover }" class="pa-0 ma-0">
    <v-card
      tile
      flat
      :class="{ 'on-hover': hover, 'highlight': selected }"
      @click="click"
      class="container"
      :ripple="!showArtefact"
    >
      <!-- large files render here: video + photo -->
      <div v-if="useRenderMedia"
        ref="renderTarget"
        class="media vertical-center"
        v-once
      />

      <template v-else>
        <template v-if="artefact.type === 'video'">
          <!-- video "viewing"-->
          <div v-if="!showPreview && !editing" class="media vertical-center">
            <video ref="video" :src="artefact.blob.uri" :controls="hover && controls"/>
          </div>
          <!-- video "preview" -->
          <div v-else-if="showPreview || editing" class="media vertical-center">
            <v-img :src="poster" contain class="photo">
              <v-icon size="50" class="center">mdi-video</v-icon>
            </v-img>
          </div>
        </template>

        <!-- photo -->
        <template v-if="artefact.type === 'photo'">
          <v-zoomer
            v-if="showArtefact"
            :zoomed.sync="zoomed"
            style="height:100%"
            :limitTranslation="!zoomed"
          >
            <v-img :src="artefact.blob.uri" cover/>
          </v-zoomer>
          <v-img
            v-else
            :src="artefact.blob.uri"
            :contain="!icon"
            :cover="icon"
            class="media"
          />
  ``
        </template>

        <!-- document -->
        <div v-if="artefact.type === 'document'" class="media">
          <div v-if="controls" class="text-center" style="padding-top:15%;">
            <v-icon size="100px">{{ artefactIcon }}</v-icon><br>
            <v-btn text @click.prevent="downloadFile()">
              Download File
            </v-btn>
          </div>
          <div v-else class="text-center" style="padding-top:15%;">
            <v-icon :size="icon ? '60px':'160px'">{{ artefactIcon }}</v-icon>
          </div>
        </div>

        <!-- audio -->
        <div v-if="artefact.type === 'audio'" class="media">
          <audio :src="artefact.blob.uri"
            :controls="controls" class="px-12" style="width:100%;height:80%;"
          />
          <v-icon size="50" class="center">mdi-music</v-icon>
        </div>

        <!-- controls -->
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
import { mapGetters } from 'vuex'
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
    showPreview: Boolean,
    icon: Boolean
  },
  components: {
  },
  data () {
    return {
      hover: false,
      poster: null,
      zoomed: false
    }
  },
  mounted () {
    if (this.useRenderMedia) this.renderHyperBlob()
    // WIP extract and fix this up mix

    if (this.artefact && this.artefact.type === 'video' && (this.showPreview || this.editing)) {
      getVideoPoster(this.artefact.blob.uri)
        .then(src => { this.poster = src })
    }
  },
  computed: {
    ...mapGetters(['showArtefact']),
    mobile () {
      return this.$vuetify.breakpoint.xs || this.$vuetify.breakpoint.sm
    },
    useRenderMedia () {
      // ensure we only use render media if we are "viewing"
      if (this.showPreview || this.editing) return false

      if (this.artefact.blob.__typename !== 'BlobHyper') return false
      if (this.artefact.type === 'photo') return false
      if (this.artefact.type === 'document') return false // NOTE this is here because pdf rendering in electron is patchy

      return true
    },
    artefactIcon () {
      return ARTEFACT_ICON(this.artefact.blob.mimeType)
    },
    playableArtefact () {
      const playable = (
        (this.$refs.renderTarget && this.$refs.renderTarget.firstChild) ||
        this.$refs.audio ||
        this.$refs.video
      )
      if (!playable) return
      if (typeof playable.play !== 'function') return

      return playable
    },
    classObj () {
      const type = this.showPreview
        ? 'photo'
        : this.artefact.type

      return {
        [type]: true,
        '-mobile': this.mobile,
        '-show': this.showArtefact
      }
    }
  },
  methods: {
    click () {
      if (this.showArtefact) return
      this.$emit('click')
    },
    downloadFile () {
      var hiddenElement = document.createElement('a')
      hiddenElement.href = this.artefact.blob.uri
      hiddenElement.target = '_blank'
      // TODO cherese 21-04-21 to download, it needs to have the file extension appended to the title (which i think can be derived from the mimeType)
      // hiddenElement.download = this.artefact.title + getExtFromMimeType(this.artefact.blob.mimeType)
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

<style lang="scss">
/* set to parent dimensions */
.media {
  background-color: #1E1E1E;
  width: 100%;
  height: 100%;

  img {
    width: 100%;
    object-fit: contain;
  }

  video {
    width: 100%;
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
  width: 100%;
  height: 100%;
  background-color: #1E1E1E;
}

.photo {
  width: 100%;
  height: 100%;
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

.vertical-center {
  margin: 0;
  position: absolute;
  top: 50%;
  -ms-transform: translateY(-50%);
  transform: translateY(-50%);
}
</style>
