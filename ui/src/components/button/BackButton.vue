<template>
  <div>
    <div v-if="isProfileShow && !showStory" fab :class="mobile ? 'ml-n4':'ms-10 pr-6 pb-1'">
      <v-btn @click="goWhakapapaShow()" text>
        <div v-if="mobile">
          <v-icon dark>mdi-arrow-left</v-icon>
        </div>
        <v-row v-else align="center">
          <v-icon large>mdi-chevron-left</v-icon>
          <Avatar
            size="45px"
            class="ma-0"
            :image="whakapapa.image ? whakapapa.image : null"
            :alt="whakapapa.name"
            :isView="!whakapapa.image"
            showLabel
            row

          />
          <span class="pl-2 caption">Back to {{ whakapapa.name }} whakapapa</span>
        </v-row>
      </v-btn>
    </div>
    <div v-else-if="$route.name === 'whakapapa/:whakapapaId'" fab :class="mobile ? 'ml-n4':'ms-10 pr-6 pb-1'">
      <v-btn @click="goWhakapapaIndex()" text>
        <div v-if="mobile">
          <v-icon dark>mdi-arrow-left</v-icon>
        </div>
        <v-row v-else align="center">
          <v-icon large>mdi-chevron-left</v-icon>
          <WhakapapaIcon size="small" color="white"/>
          <span class="pl-2 caption">Back to whakapapa records</span>
        </v-row>
      </v-btn>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import Avatar from '@/components/Avatar'
import WhakapapaIcon from '@/components/button/WhakapapaIcon.vue'

export default {
  components: {
    Avatar,
    WhakapapaIcon
  },
  data () {
    return {
      route: {}
    }
  },
  watch: {
    $route (to, from) {
      this.route = {
        to,
        from
      }
    }
  },
  computed: {
    ...mapGetters(['whakapapa', 'showStory']),
    mobile () {
      return this.$vuetify.breakpoint.xs || this.$vuetify.breakpoint.sm
    },
    isProfileShow () {
      // if the current route is profile and the previous one was whakapapa
      if (this.route.from) {
        return (
          this.route.from.name === 'whakapapa/:whakapapaId' &&
          this.route.to.name === 'profile'
        )
      }

      return false
    }
  },
  methods: {
    goWhakapapaShow () {
      this.$router.push({ path: this.route.from.fullPath })
    },
    goWhakapapaIndex () {
      this.$router.push({ name: 'whakapapa' }).catch(() => {})
    }
  }
}
</script>

<style lang="scss" scoped>
  .v-btn--active.no-active::before {
    opacity: 0 !important;
  }
</style>
