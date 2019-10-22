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
  components: {
    Appbar
  },
  data () {
    return {
      displayAppbar: false
    }
  },
  beforeMount () {
    if (this.$route.name !== 'profiles' && this.$route.name !== 'home') {
      this.displayAppbar = true
    }
  }
}
</script>

<style lang="scss">
  a {
    text-decoration:  none;
  }
</style>
