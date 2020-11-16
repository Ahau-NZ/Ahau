<template>
  <!-- <v-app>
    
    <v-main v-if="!mobile || mobile && !storeDialog" :class="{ 'mobileWhakapapaTitleStyle': mobile }">
      <transition name="fade" mode="out-in">
        <router-view :mobileServerLoaded="mobileServerLoaded" />
      </transition>
      <Spinner />
    </v-main>
    <div v-if="!mobile" class='version'>
      <span>version</span> {{version}}
    </div>
    <DialogHandler />
  </v-app> -->

<v-app>
  <!-- <v-navigation-drawer app> -->
    <!-- -->
  <!-- </v-navigation-drawer> -->

  <!-- <v-app-bar app> -->
    <!-- -->
  <Appbar :enableMenu="enableMenu" app />
  <!-- </v-app-bar> -->

  <!-- Sizes your content based upon application components -->
  <v-main v-if="!mobile || mobile && !storeDialog" :class="{ 'mobileWhakapapaTitleStyle': mobile }">

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
  <DialogHandler />

  <!-- <v-footer app> -->
    <!-- -->
  <!-- </v-footer> -->
</v-app>
</template>

<script>
import Appbar from '@/components/menu/Appbar.vue'
import nodejsClient from '@/plugins/cordova-nodejs-client.js'
import Spinner from '@/components/Spinner.vue'
import { mapGetters, mapActions } from 'vuex'
import DialogHandler from '@/components/dialog/DialogHandler.vue'

const { version } = require('../../desktop/package.json')
// TODO - this is only useful for the desktop installer,
// this will need to change when we build mobile again

export default {
  name: 'App',
  data () {
    return {
      mobileServerLoaded: false,
      version
    }
  },

  computed: {
    ...mapGetters(['selectedProfile', 'storeDialog']),
    mobile () {
      return this.$vuetify.breakpoint.xs || this.$vuetify.breakpoint.sm
    },
    enableMenu () {
      if (
        this.$route.name === 'profileEdit' &&
        this.$route.query.setup === true
      ) {
        return false
      } else return true
    }
  },
  mounted () {
    this.setWhoami()

    if (process.env.VUE_APP_PLATFORM === 'cordova') {
      navigator.splashscreen.hide()
      nodejsClient.start({
        onReady: () => {
          console.log('nodejs-mobile and GraphQL server are fully ready')
          this.mobileServerLoaded = true
        }
      })
    }
  },
  methods: {
    ...mapActions(['setWhoami'])
  },
  components: {
    Appbar,
    Spinner,
    DialogHandler
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
      },
      immediate: true
    }
  }
}
</script>

<style lang="scss">
/* // global styles */
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
    background-position-y: -110%;
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
}

.v-timeline--dense .v-timeline-item__opposite {
  display: inline-block !important;
  flex:none
}

.stop-scroll {
  max-height: 100vh !important;
  overflow: hidden !important;
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
