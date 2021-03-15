<template>
  <div class="container">
    <div style='margin-bottom: 50px;'>
      <button v-for="item in files" :key="item.fileEncryptionKey"
        @click="handleClick(item)"
        style="background: grey; padding: 5px; margin: 5px;"
        >
        {{item.fileName}}
      </button>
    </div>

    <div id='appendTarget' v-once
      style='display: flex; flex-wrap: wrap;'
    />
  </div>

</template>

<script>
import Avatar from '@/components/Avatar'
import NewNodeDialog from '@/components/dialog/profile/NewNodeDialog.vue'
import { mapGetters, mapActions } from 'vuex'
import { savePerson } from '@/lib/person-helpers.js'

const render = require('render-media')
const http = require('stream-http')
const { Transform } = require('readable-stream')

const hostname = 'localhost'
const port = 1234

function requestOpts (item) {
  return {
    hostname,
    port,
    path: '/file/' + item.fileName + '/' + item.driveAddress + '/' + item.fileEncryptionKey + '/' + item.start + '/' + item.end,
    method: 'GET'
  }
}
function renderMediaOpts (item) {
  return {
    name: item.fileName,
    createReadStream: function (opts = {}) {
      item.start = opts.start || 0
      item.end = opts.end
      const transform = new Transform({
        transform (chunk, enc, callback) {
          this.push(chunk)
          callback()
        }
      })
      const req = http.request(requestOpts(item), (res) => {
        // console.log(`STATUS: ${res.statusCode}`)
        res.pipe(transform)
      })
      req.on('error', (e) => {
        console.error(`problem with request: ${e.message}`)
      })
      req.end()
      return transform
    }
  }
}

const karakia = `
---------------------------------
E te tangata
Whāia te māutauranga kai mārama
Kia whai take ngā mahi katoa
Tū māia, tū kaha
Aroha atu, aroha mai
Tātou i a tātou katoa

For this person
Seek knowledge for understanding
Have purpose in all that you do
Stand tall, be strong
Lets us all show respect
For each other
---------------------------------
`

export default {
  props: {
    mobileServerLoaded: { type: Boolean, default: false }
  },
  data () {
    return {
      isLoading: true,
      isSetup: false, // has profile set up
      dialog: false,
      files: [
        {
          driveAddress: 'e1c3f8e4c191babb3f926182e066b9d9994bb7d5f10ed16412251ffa7ff12798',
          fileEncryptionKey: 'da797f4b4e0da233e2d60c672c685308126baba757d454d9711cd79104ce3ec6',
          fileName: 'ira-mix-cradle.jpeg'
        },
        {
          driveAddress: 'e1c3f8e4c191babb3f926182e066b9d9994bb7d5f10ed16412251ffa7ff12798',
          fileEncryptionKey: '7a5edca403fee856b803b4f05c950337ebeba98870e2aa35d63f0803cf85a6f0',
          fileName: 'Sintel.mp4'
        },
        {
          driveAddress: 'acb9d995b172a035f61ec8c42419b72c31742d9a1c586a46a703f33433a36806',
          fileEncryptionKey: 'e630c26729207ce8489564341e0dd557db977f61558da1a1231ee500f463ed9d',
          fileName: 'NAEST 108 01 - Mavor 50 year history booklet 1931.pdf'
        }
      ]
    }
  },
  computed: {
    ...mapGetters(['whoami']),
    mobile () {
      return this.$vuetify.breakpoint.xs
    }
  },
  watch: {
    mobileServerLoaded: {
      handler (nextValue) {
        if (nextValue && process.env.VUE_APP_PLATFORM === 'cordova') {
          this.getCurrentIdentity()
        }
      },
      immediate: true
    }
  },
  mounted () {
    if (process.env.VUE_APP_PLATFORM !== 'cordova') {
      this.getCurrentIdentity()
    }
  },
  methods: {
    handleClick (item) {
      render.append(renderMediaOpts(item), '#appendTarget', function (err, elem) {
        if (err) return console.error(err.message)

        // elem.height = 600
        elem.style.minWidth = '400px'
        elem.style.minHeight = '400px'
        elem.style.maxHeight = '600px'
        elem.style.margin = '10px'
      })
    },
    ...mapActions(['setWhoami']),
    async getCurrentIdentity () {
      await this.setWhoami()
      this.proceed()
    },

    karakiaTūwhera () {
      console.log(karakia)
    },

    proceed () {
      if (this.$apollo.loading || !this.whoami.personal.profile.id) {
        console.log('waiting for apollo')
        setTimeout(this.proceed, 300)
        return
      }

      this.isSetup = Boolean(this.whoami.personal.profile.legalName) || Boolean(this.whoami.personal.profile.preferredName)
      // Shortcut in dev, that saves us from doing one click when testing

      // if (this.isSetup && process.env.NODE_ENV === 'development') {
      //   this.login()
      // }

      this.isLoading = false
    },

    login () {
      this.karakiaTūwhera()
      this.$router.push({
        name: 'person',
        params: {
          tribeId: this.whoami.personal.groupId,
          profileId: this.whoami.personal.profile.id
        }
      }).catch(() => {})
    },

    toggleNew () {
      this.dialog = !this.dialog
    },

    async save (input) {
      input = {
        id: this.whoami.personal.profile.id,
        ...input
      }

      const res = await this.$apollo.mutate(savePerson(input))

      if (res.errors) {
        console.error('failed to update profile', res)
        return
      }

      this.getCurrentIdentity()
    }
  },
  components: {
    Avatar,
    NewNodeDialog
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
h1 {
  text-transform: uppercase;
  letter-spacing: 0.5vw;
  text-align: center;
  padding-top: 15%;
}
.container {
  width: 100%;
  height: 90%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.splash {
  min-height: 20vh;
  width: 20vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}
.name {
  font-size: 1em;
  text-transform: uppercase;
  font-weight: 400;
  letter-spacing: 3px;
  color: white;
}
.body-width {
  max-width: 900px;
}
.button:hover {
  cursor: pointer;
}

 .headliner {
    font-size: 1.5em;
    text-transform: uppercase;
    font-weight: 400;
    letter-spacing: 5px;
  }

 .headliner2 {
    font-size: 1.5em;
    text-transform: uppercase;
    font-weight: 400;
    letter-spacing: 3px;
  }
</style>
