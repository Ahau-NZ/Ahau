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
        <v-img
          v-if="artefact.type === 'photo'"
          :src="artefact.blob.uri"
          :contain='controls'
          class="media"
          tile
          flat
        >
        </v-img>
        <div v-if="artefact.type === 'video' && !showPreview">
          <video ref="video" :src="artefact.blob.uri" :controls="hover && controls" class="video"/>
        </div>
        <div v-if="artefact.type === 'audio'" class="media">
          <audio :src="artefact.blob.uri"
            :controls="controls" class="px-12" style="width:100%;height:80%;"
          />
          <v-icon size="50" class="center">mdi-music</v-icon>
        </div>
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
        <img v-if="artefact.type === 'video' && showPreview"
          :src="poster"
          ref="photo"
          class="media"
          contain
        />
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
      </template>
    </v-card>
  </v-hover>
</template>

<script>
import { ARTEFACT_ICON } from '@/lib/artefact-helpers.js'
const renderMedia = require('render-media')
const http = require('stream-http')
const captureFrame = require('capture-frame')
const { Transform } = require('readable-stream')

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
      this.getVideoPoster()
    }
  },
  computed: {
    useRenderMedia () {
      if (this.showPreview) return false

      return (
        this.artefact.blob.__typename === 'BlobHyper' &&
        this.artefact.type !== 'document' // NOTE this is here because pdf rendering in electron is patchy
      )
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
    getVideoPoster () {
      var component = this
      const video = document.createElement('video')
      video.addEventListener('canplay', onCanPlay)

      video.volume = 0
      video.autoplay = true
      video.muted = true // most browsers block autoplay unless muted
      video.setAttribute('crossOrigin', 'anonymous') // optional, when cross-domain
      video.src = this.artefact.blob.uri

      function onCanPlay () {
        video.removeEventListener('canplay', onCanPlay)
        video.addEventListener('seeked', onSeeked)

        video.currentTime = 2 // seek 2 seconds into the video
      }

      function onSeeked () {
        video.removeEventListener('seeked', onSeeked)

        const frame = captureFrame(video)

        // unload video element, to prevent memory leaks
        video.pause()
        video.src = ''
        video.load()

        component.poster = URL.createObjectURL(
          new Blob([frame.image], { type: 'image/png' })
        )
      }
    },
    buildRequest (uri, opts = {}) {
      const url = new URL(uri)
      // if (typeof opts.start === 'number') url.searchParams.append('start', opts.start)
      // if (typeof opts.end === 'number') url.searchParams.append('end', opts.end)

      const req = {
        method: 'GET',
        hostname: url.hostname,
        port: url.port,
        path: url.pathname + url.search
      }

      if (typeof opts.start === 'number') {
        req.headers = {
          Range: `bytes=${opts.start}-${opts.end || ''}`
        }
      }

      return req
    },
    renderHyperBlob () {
      const { title, blob } = this.artefact
      const { buildRequest } = this
      const file = {
        name: `${title}.${blob.mimeType.split('/')[1]}`, // TODO see if there's a better way to tell render-media the mimeType
        createReadStream (opts = {}) {
          const transform = new Transform({
            transform (chunk, enc, callback) {
              this.push(chunk)
              callback()
            }
          })
          const requestOpts = buildRequest(blob.uri, { start: opts.start || 0, end: opts.end })
          console.log(requestOpts)
          const req = http.request(requestOpts, (res) => {
            // console.log(`STATUS: ${res.statusCode}`)
            res.pipe(transform)
          })
          req.on('error', (e) => {
            console.error(`problem with request: ${e.message}`)
          })
          req.end()
          return transform
        },
        length: blob.size,
        maxBlobLength: 200 * 1024 * 1024,
        controls: true
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

</style>
