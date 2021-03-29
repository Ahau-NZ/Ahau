<template>
  <v-sheet @click="toggleArtefact($event)" class="container pa-0">
    <div v-if='useRenderMedia'
      ref='renderTarget'
      :class='classObj'

      v-once
      >
    </div>

    <template v-else>
      <div v-if="artefact.type === 'video'" :class="classObj">
        <v-icon v-if="hideVideo" size="50" class="center white--text">mdi-video</v-icon>
        <v-hover v-else v-slot:default="{ hover }">
          <video ref="video" :src="artefact.blob.uri" :controls="hover" class="video"/>
        </v-hover>
      </div>

      <div v-if="artefact.type === 'audio'" :class="classObj">
        <audio ref="audio" :src="artefact.blob.uri" class="px-12" :controls="controls"/>
        <v-icon size="50" class="center">mdi-music</v-icon>
      </div>

      <v-img v-if="artefact.type === 'photo'"
        ref='photo'
        :class="classObj"
        :src="artefact.blob.uri"
        contain
      />

      <div v-if="artefact.type === 'document'" ref='document' :class="classObj">
        <div class="text-center">
          <v-icon size="100px" class="white--text">{{ artefactIcon }}</v-icon><br>
          <v-btn text @click.prevent="downloadFile()">
            Download file
          </v-btn>
        </div>
      </div>
    </template>
  </v-sheet>
</template>

<script>
import { mapGetters } from 'vuex'
import { ARTEFACT_ICON } from '@/lib/artefact-helpers.js'

const renderMedia = require('render-media')
const http = require('stream-http')
const { Transform } = require('readable-stream')

export default {
  name: 'Artefact',
  props: {
    artefact: Object,
    model: { type: Number, default: -1 },
    index: Number,
    controls: Boolean,
    hideVideo: Boolean
  },
  computed: {
    ...mapGetters(['showArtefact']),
    useRenderMedia () {
      if (this.hideVideo) return false
      return (
        this.artefact.blob.__typename === 'BlobHyper' &&
        this.artefact.type !== 'document' // NOTE this is here because pdf rendering in electron is patchy
      )
    },
    classObj () {
      return {
        [this.artefact.type]: true,
        '-mobile': this.$vuetify.breakpoint.xs || this.$vuetify.breakpoint.sm,
        '-show': this.showArtefact
      }
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
    }
  },
  watch: {
    model (newVal) {
      if (this.showArtefact) {
        if (newVal === this.index && this.playableArtefact) {
          this.playableArtefact.play()
        } else {
          this.playableArtefact.pause()
        }
      } else if (newVal !== this.index && this.playableArtefact) {
        this.playableArtefact.pause()
      }
    }
  },
  mounted () {
    if (this.useRenderMedia) this.renderHyperBlob()
    // TODO check if this is best place for this
  },
  methods: {
    buildRequest (uri, opts = {}) {
      const url = new URL(uri)
      if (typeof opts.start === 'number') url.searchParams.append('start', opts.start)
      if (typeof opts.end === 'number') url.searchParams.append('end', opts.end)

      return {
        method: 'GET',
        hostname: url.hostname,
        port: url.port,
        path: url.pathname + url.search
      }
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
      console.log(file)
      renderMedia.append(file, this.$refs.renderTarget, function (err, elem) {
        if (err) return console.error(err)

        // HACK to get initial frame to load
        if (elem.play && elem.pause) elem.play().then(() => elem.pause())
      })
    },
    toggleArtefact (e) {
      this.$emit('showArtefact', this.artefact)
    },
    downloadFile () {
      var hiddenElement = document.createElement('a')
      hiddenElement.href = this.artefact.blob.uri
      hiddenElement.target = '_blank'
      hiddenElement.download = this.artefact.title
      hiddenElement.click()
    }
  }
}

</script>
<style lang="scss">

.audio {
  // old logic.. which I have changed... I think for the better?
  // :style="showArtefact ? 'height:300px': mobile ? 'height:300px' : 'height:500px'"

  height: 500px;
  background-color: #1E1E1E;

  &.-mobile {
    height: 300px;
  }

  audio {
    width: 100%;
    height:80%;
    background-color: #1E1E1E;
  }
}

.photo, .document {
  width: 100%;
  height: 100%;

  img {
    min-height: 500px;
  }

  object {
    min-height: 500px;
    width: 100%;
  }

  background-color: #1E1E1E;
  object-fit: cover;
}

.document {
  display: grid;
  align-content: center;
}

.video {
  height: 500px;
  background-color: #1E1E1E;

  &.-mobile {
    height: 300px;
  }

  video {
    width: 100%;
    height: 100%;
    background-color: #1E1E1E;
    // display:content;
  }
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

.container {
  width: 100%;
  height: 100%;
}

</style>
