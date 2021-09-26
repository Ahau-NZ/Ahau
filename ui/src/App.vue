<template>
  <v-app>
    <Appbar v-if="displayAppbar" :enableMenu="enableMenu" app />

    <!-- Sizes your content based upon application components -->
    <v-main v-if="!mobile || mobile && !storeDialog" :class="{ 'mobileWhakapapaTitleStyle': mobile}">

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
  </v-app>
</template>

<script>
import Appbar from '@/components/menu/Appbar.vue'
import Spinner from '@/components/Spinner.vue'

import DialogHandler from '@/components/dialog/DialogHandler.vue'
import AlertMessage from './components/dialog/AlertMessage.vue'
import { getIndexes } from '@/store/modules/settings/apollo-helpers'

import { createNamespacedHelpers, mapGetters, mapActions } from 'vuex'
const { mapGetters: mapAlertGetters } = createNamespacedHelpers('alerts')
const { mapActions: mapAnalyticsActions } = createNamespacedHelpers('analytics')

const { version } = require('../../desktop/package.json')
// TODO - this is only useful for the desktop installer,
// this will need to change when we build mobile again

export default {
  name: 'App',
  data () {
    return {
      mobileServerLoaded: false,
      version,
      indexes: null,
      isRebuilding: false,
      isLoading: false
    }
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
  computed: {
    ...mapGetters(['storeDialog', 'loadingState']),
    ...mapAlertGetters(['alertSettings']),
    mobile () {
      return this.$vuetify.breakpoint.xs || this.$vuetify.breakpoint.sm
    },
    indexPollingInterval () {
      if (!this.progess || !this.progress.isIndexing) return 1000

      return 500
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
    }
  },
  mounted () {
    this.setWhoami()

    if (process.env.VUE_APP_PLATFORM === 'cordova') {
      this.mobileServerLoaded = true
    }
  },
  methods: {
    ...mapActions(['setWhoami', 'setLoading']),
    ...mapAnalyticsActions(['appUsed'])
  },
  components: {
    Appbar,
    Spinner,
    DialogHandler,
    AlertMessage
  },
  // this watch add class to body depending on the route clicked.
  // used for changing body backgrounds, unique to each .route.
  watch: {
    '$route.name': {
      handler (to, from) {
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
      handler (progress) {
        if (this.$route.name === 'community/whakapapa/:whakapapaId' || this.$route.name === 'person/whakapapa/:whakapapaId') return

        if (progress.isIndexing) {
          this.setLoading(progress.percentageIndexed)
        } else if (!progress.isIndexing && this.loadingState) {
          if (this.isLoading) return

          this.isLoading = true
          this.setLoading(100)

          setTimeout(() => {
            this.setLoading(false)
            this.isLoading = false
          }, 2000) // delay the stop by a couple of seconds
        }
      }
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
    background: url(./assets/niho.svg);
    background-color: var(--primary-background);
    background-repeat: no-repeat;
    background-size: cover;
    background-position-y: 10vh;
  }
  &.page--whakapapaindex {
    background: url(./assets/niho.svg);
    background-color: var(--primary-background);
    background-repeat: no-repeat;
    background-position-x: 150%;
  }
}

.mobileWhakapapaTitleStyle {
  padding-top: 56px !important;
  overflow-x: hidden;
}

.v-timeline--dense .v-timeline-item__opposite {
  display: inline-block !important;
  flex:none
}

// .v-image__image--cover {
//     background-size: contain !important;
// }

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
