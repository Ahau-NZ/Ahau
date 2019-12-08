<template>
  <v-app>
    <Appbar v-if="displayAppbar" />
    <v-content>
      <router-view/>
    </v-content>
  </v-app>
</template>

<script>
import Appbar from '@/components/Appbar.vue'

export default {
  name: 'App',
  computed: {
    displayAppbar () {
      if (this.$route.name === 'login') return false
      if (this.$route.name === 'personEdit' && this.$route.query.setup === true) return false

      return true
    }
  },
  components: {
    Appbar
  },
  // this watch add class to body depending on the route clicked. used for changing body backgrounds, unique to each route.
  watch: {
    $route: {
      handler (to, from) {
        const body = document.getElementsByTagName('body')[0]
        if (from !== undefined) {
          body.classList.remove('page--' + from.name.toLowerCase())
        }
        body.classList.add('page--' + to.name.toLowerCase())
      },
      immediate: true
    }
  }
}
</script>

<style lang="scss">
  a {
    text-decoration:  none;
  }

  //remove default vuetify dark theme background
  .v-application {
    background: none !important;
  }

  //custom backgrounds per route. see above 'watcher'
  .page--login {
    background: url(./assets/niho.svg);
    background-color: #303030;
    background-repeat: no-repeat;
    background-size: cover;
    background-position-y: -110%;
  }
  .page--whakapapaindex {
    background: url(./assets/niho.svg);
    background-color: #303030;
    background-repeat: no-repeat;
    background-position-x: 150%;
    // background-size: cover;
  }
  .page--whakapapashow {
    background: url(./assets/niho.svg);
    background-color: #303030;
    background-position-x: -300px;
    // background-repeat: no-repeat;
    // background-size: cover;
  }
  .page--personshow {background-color: pink;}

</style>
