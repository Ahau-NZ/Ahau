<template>
  <v-app :style="appStyle">
    <Appbar v-if="displayAppbar" :enableMenu="enableMenu" app />

    <!-- Sizes your content based upon application components -->
    <v-main v-if="!mobile || mobile && !storeDialog" :class="{ mobileWhakapapaTitleStyle: mobile }">
      <!-- Provides the application the proper gutter -->
      <v-container fluid class="pa-0">
        <transition name="fade" mode="out-in">
          <router-view :mobileServerLoaded="mobileServerLoaded" />
        </transition>
        <Spinner />
      </v-container>
    </v-main>

    <div v-if="!mobile" class='version'>
      <span>version</span> {{version}}
    </div>

    <AlertMessage
      :show="alertSettings.show"
      :message="alertSettings.message"
      :color="alertSettings.color"
    />

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
import { getIndexes } from '@/store/modules/settings/apollo-helpers'

import { mapGetters, mapActions } from 'vuex'
const { version } = require('../../desktop/package.json')
// TODO - this is only useful for the desktop installer,
// this will need to change when we build mobile again

export default {
  name: 'App',
  data () {
    return {
      mobileServerLoaded: false,
      version,
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
  apollo: {
    indexes: {
      ...getIndexes,
      pollInterval () {
        return this.indexPollingInterval
      }
    }
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

    if (process.env.VUE_APP_PLATFORM === 'cordova') {
      this.mobileServerLoaded = true
    }
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
    indexes: {
      deep: true,
      handler (data) {
        // if (this.$route.name === 'community/whakapapa/:whakapapaId' || this.$route.name === 'person/whakapapa/:whakapapaId') return

        this.setIndexingData(data)
      }
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
    ...mapGetters(['isKaitiaki']),
    ...mapGetters('tribe', ['currentTribe', 'tribeSettings', 'isPersonalTribe']),
    ...mapGetters(['storeDialog', 'loadingState']),
    ...mapGetters('alerts', ['alertSettings']),
    mobile () {
      return this.$vuetify.breakpoint.xs || this.$vuetify.breakpoint.sm
    },
    indexPollingInterval () {
      if (typeof this.loadingState === 'boolean') return 4000
      else return 500
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
    ...mapActions(['setWhoami', 'setIndexingData', 'setLoading']),
    ...mapActions('tribe', ['loadTribe', 'resetCurrentTribe']),
    ...mapActions('analytics', ['appUsed']),
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
  width: 10px;
}
</style>

<style lang="scss" scoped>
.mobileWhakapapaTitleStyle {
  padding-top: 56px !important;
  overflow-x: hidden;
}

.version {
  color: #999;
  position: fixed;
  bottom: 5px;
  right: 10px;
  font-size: .8rem;
  transition: all .3s ease-in;

  span {
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

    span {
      color: #555;
    }
  }
}
</style>
