<template>
  <v-app>
    <Appbar v-if="displayAppbar" />
    <v-content>
      <router-view />
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
      else return true
    }
  },
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
  },
  components: {
    Appbar
  }
}
</script>

<style lang="scss">
/* // global styles */
a {
  text-decoration: none;
}

/* //remove default vuetify dark theme background */
.v-application {
  background: none !important;
}

body {
  --primary-background: #303030;

  &.page--login {
    background: url(./assets/niho.svg);
    background-color: var(--primary-background);
    background-repeat: no-repeat;
    background-size: cover;
    background-position-y: -110%;
  }
  &.page--dashboard {
    background: url(./assets/niho.svg);
    background-color: var(--primary-background);
    background-repeat: no-repeat;
    background-size: 100vh;
    background-position: 60vw 15vh;
  }
}
</style>
