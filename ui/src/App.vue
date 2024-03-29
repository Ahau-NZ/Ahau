<template>
  <v-app :style="appStyle">
    <Appbar v-if="displayAppbar" :enableMenu="enableMenu" app />

    <!-- Sizes your content based upon application components -->
    <v-main
      v-if="!isMobile || isMobile && !storeDialog"
      :class="{ main: true, isMobile }"
    >
      <!-- Provides the application the proper gutter -->
      <v-container fluid class="pa-0">
        <transition name="fade" mode="out-in">
          <router-view :mobileServerLoaded="mobileServerLoaded" />
        </transition>
        <Spinner />
      </v-container>
    </v-main>

    <div class='version' :style="isMobile ? 'left: 0; right: initial;' : ''">
      <span>version</span> {{version}}
    </div>

    <AlertMessage />
    <DialogHandler /> <!-- TODO: find out what uses this? -->
    <ErrorSnackDialog />
  </v-app>
</template>

<script>
import Appbar from '@/components/menu/Appbar.vue'
import ErrorSnackDialog from '@/components/ErrorSnackDialog.vue'
import Spinner from '@/components/Spinner.vue'

import DialogHandler from '@/components/dialog/DialogHandler.vue'
import AlertMessage from './components/dialog/AlertMessage.vue'

import { mapGetters, mapActions } from 'vuex'
import pkg from '../../desktop/package.json'
// TODO - this is only useful for the desktop installer,
// this will need to change when we build mobile again

export default {
  name: 'App',
  data () {
    return {
      mobileServerLoaded: false,
      version: pkg.version,
      indexes: null
    }
  },
  components: {
    Appbar,
    ErrorSnackDialog,
    Spinner,
    DialogHandler,
    AlertMessage
  },
  created () {
    // try to be smart when picking the default language

    const browserLang = navigator.languages.find((lang) =>
      this.$i18n.availableLocales.includes(lang)
    )

    // default to what the user had last time, if anything
    // otherwise get a language that the browser says the user prefers
    // if we don't have a language like that, fall back to english
    this.$i18n.locale = localStorage.getItem('locale') || browserLang || 'en'
  },
  async mounted () {
    await this.setWhoami()

    // this is for the case of when the route is reloaded to
    // the same tribeId
    if (!this.currentTribe && this.$route.params.tribeId) {
      await this.loadTribe(this.$route.params.tribeId)
    }

    if (import.meta.env.VITE_APP_PLATFORM === 'cordova') {
      this.mobileServerLoaded = true
    }

    this.startIndexingPoll()
  },
  // this watch add class to body depending on the route clicked.
  // used for changing body backgrounds, unique to each .route.
  watch: {
    '$route.name': {
      handler (to, from) {
        this.setLoading(false)

        if (from !== undefined) {
          document.body.classList.remove('page--' + from.toLowerCase())
        }
        document.body.classList.add('page--' + to.toLowerCase())

        this.appUsed() // analytics logging some usage
      },
      immediate: true
    },
    async '$route.params.tribeId' (id) {
      if (id) {
        await this.loadTribe(id)

        this.validateRoute()

        // make sure the personal tribe is loaded
        await this.setWhoami()
      } else {
        // clear the current tribe
        this.resetCurrentTribe()
      }
      // NOTE: id is null when on the tribes discovery page
    }
  },
  computed: {
    ...mapGetters(['isKaitiaki', 'storeDialog']),
    ...mapGetters('tribe', ['currentTribe', 'tribeSettings', 'isPersonalTribe']),
    isMobile () {
      return this.$vuetify.breakpoint.xs || this.$vuetify.breakpoint.sm
    },
    enableMenu () {
      if (
        this.$route.name === 'profileEdit' &&
        this.$route.query.setup === true
      ) {
        return false
      } else return true
    },
    displayAppbar () {
      if (this.$route.name === 'login') return false
      else return true
    },
    appStyle () {
      if (this.$route.name === 'personIndex') return 'overflow-y: clip'
      return ''
    }
  },
  methods: {
    ...mapActions(['setWhoami']),
    ...mapActions('tribe', ['loadTribe', 'resetCurrentTribe']),
    ...mapActions('analytics', ['appUsed']),
    ...mapActions('loading', ['setLoading', 'startIndexingPoll']),
    validateRoute () {
      if (this.isPersonalTribe) return

      // we need to check if we're allowed on the route we are on
      const name = this.$route.name
      if (name === 'community/profile' || name === 'person/profile') return

      const [type, component] = name.split('/')

      if (type === 'personIndex' && this.isKaitiaki && this.tribeSettings.allowPersonsList) return
      if (component === 'whakapapa' && this.tribeSettings.allowWhakapapaViews) return
      if ((component === 'archive') && this.tribeSettings.allowStories) return

      // not allowed on this route, so we redirect it to the profile
      this.$router.push({
        name: type === 'personIndex' ? 'community/profile' : type + '/profile',
        params: {
          tribeId: this.currentTribe.id,
          profileId: this.currentTribe.private[0].id
        }
      }).catch(() => {})
    }
  }
}
</script>

<style lang="scss">
/* // global styles */

.v-carousel__item {
  .v-image__image--cover {
    background-size: contain !important;
  }
}

.ahauRed {
  color: #B12526;
}

a {
  text-decoration: none;
}

.fade-enter-active,
.fade-leave-active {
  transition-duration: 0.15s;
  transition-property: opacity;
  transition-timing-function: ease;
}

.fade-enter,
.fade-leave-active {
  opacity: 0
}

/* //remove default vuetify dark theme background */
.v-application {
  background: none !important;
  max-height: 100vh;

  .v-main {
    max-height: 100vh;
  }
}

/* //custom backgrounds per route. see above 'watcher' */
body {
  --primary-background: #303030;

  &.page--login {
    background: url(@/assets/niho.svg);
    background-color: var(--primary-background);
    background-repeat: no-repeat;
    background-size: cover;
    background-position-y: 10vh;
  }
  &.page--whakapapaindex {
    background: url(@/assets/niho.svg);
    background-color: var(--primary-background);
    background-repeat: no-repeat;
    background-position-x: 150%;
  }
}

.v-timeline--dense .v-timeline-item__opposite {
  display: inline-block !important;
  flex:none
}

// .v-image__image--cover {
//     background-size: contain !important;
// }

// see https://css-tricks.com/custom-scrollbars-in-webkit/
::-webkit-scrollbar {
  width: 10px
}
</style>

<style lang="scss" scoped>
.main {
  &::-webkit-scrollbar {
    width: 10px;
  }

  &.isMobile {
    padding-top: 56px !important;
    overflow-x: hidden;

    &::-webkit-scrollbar {
      width: 0px;
    }
  }
}

.version {
  z-index: 2;
  color: #999;
  position: fixed;
  bottom: 5px;
  right: 10px;
  font-size: .8rem;
  transition: color, font-size .3s ease-in;

  span {
    display: inline-block;
    width: 6px;
    font-size: .8rem;
    color: rgba(0,0,0,0);
    transition: all .3s ease-in;
  }

  &:hover {
    color: #555;
    font-size: 1.2rem;

    background-color: #fff;
    padding: 0 4px;
    border: 1px solid #444;
    border-radius: 4px;

    margin-left: 6px;

    span {
      width: initial;
      color: #555;
    }
  }
}
</style>
