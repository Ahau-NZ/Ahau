<template>
  <v-app>
    <v-content>
      <router-view />
    </v-content>
  </v-app>
</template>

<script>
export default {
  name: 'App',
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
  components: {
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

/* //remove default vuetify dark theme background */
.v-application {
  background: none !important;
}

/* //custom backgrounds per route. see above 'watcher' */
body {
  --primary-background: #303030;

  &.page--login {
    // background: url(../../../ui/src/assets/niho.svg);
    background-color: var(--primary-background);
    background-repeat: no-repeat;
    background-size: cover;
    background-position-y: -110%;
  }
}
</style>
