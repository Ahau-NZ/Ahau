<template>
  <v-app>
    <Appbar v-if="displayAppbar" :enableMenu="enableMenu" app />
    <v-content>
      <router-view :mobileServerLoaded="mobileServerLoaded" />
    </v-content>
  </v-app>
</template>

<script>
import Appbar from '@/components/Appbar.vue'
import nodejsClient from '@/plugins/cordova-nodejs-client.js'

export default {
  name: 'App',
  data: function () {
    return {
      mobileServerLoaded: false
    }
  },
  computed: {
    displayAppbar () {
      if (this.$route.name === 'login') return false
      else return true
    },
    enableMenu () {
      if (
        this.$route.name === 'personEdit' &&
        this.$route.query.setup === true
      ) {
        return false
      } else return true
    }
  },
  mounted () {
    if (process.env.VUE_APP_PLATFORM === 'cordova') {
      nodejsClient.hasStarted(() => {
        this.mobileServerLoaded = true
      })
    }
  },
  components: {
    Appbar
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
// global styles
a {
  text-decoration: none;
}

//remove default vuetify dark theme background
.v-application {
  background: none !important;
}

//custom backgrounds per route. see above 'watcher'
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
    // background-size: cover;
  }
  &.page--whakapapashow {
    background: url(./assets/niho.svg);
    background-color: var(--primary-background);
    background-position-x: -300px;
    // background-repeat: no-repeat;
    // background-size: cover;
  }
  &.page--personshow {
    background-color: #303030;
  }
}
</style>
