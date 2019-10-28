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
  }
}
</script>

<style lang="scss">
  a {
    text-decoration:  none;
  }
</style>
