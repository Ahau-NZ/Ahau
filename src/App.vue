<template>
  <v-app>
    <Appbar />
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
  }
}
</script>

<style lang="scss">
  a {
    text-decoration:  none;
  }
</style>
