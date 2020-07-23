<template>
  <v-app>
    <Appbar v-if="displayAppbar" :enableMenu="enableMenu" app />
    <v-main v-if="!mobile || mobile && !storeDialog" :class="{ 'mobileWhakapapaTitleStyle': mobile }">
      <transition name="fade" mode="out-in">
        <router-view :mobileServerLoaded="mobileServerLoaded" />
      </transition>
      <Spinner />
    </v-main>
    <DialogHandler />
  </v-app>
</template>

<script>
import Appbar from '@/components/menu/Appbar.vue'
import nodejsClient from '@/plugins/cordova-nodejs-client.js'
import Spinner from '@/components/Spinner.vue'
import { mapGetters, mapActions } from 'vuex'
import DialogHandler from '@/components/dialog/DialogHandler.vue'

export default {
  name: 'App',
  data: function () {
    return {
      mobileServerLoaded: false
    }
  },

  computed: {
    ...mapGetters(['selectedProfile', 'storeDialog']),
    mobile () {
      return this.$vuetify.breakpoint.xs || this.$vuetify.breakpoint.sm
    },
    displayAppbar () {
      if (this.$route.name === 'login') return false
      else return true
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
  // used for changing body backgrounds, unique to each route.
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

</style>
