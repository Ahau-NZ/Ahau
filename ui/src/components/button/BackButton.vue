<template>
  <div>
    <div v-if="isFromWhakapapaShow && !showStory" fab :class="mobile ? 'ml-n4':'ms-10 pr-6 pb-1'">
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
    <div v-else-if="isWhakapapaShow" fab :class="mobile ? 'ml-n4':'ms-10 pr-6 pb-1'">
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
import mapProfileMixins from '@/mixins/profile-mixins.js'

export default {
  components: {
    Avatar,
    WhakapapaIcon
  },
  mixins: [
    mapProfileMixins({
      mapApollo: ['profile']
    })
  ],
  data () {
    return {
      route: {},
      profile: {},
      history: null
    }
  },
  watch: {
    $route (to, from) {
      this.route = {
        to,
        from
      }
    },
    profile: {
      deep: true,
      immediate: true,
      handler (newProfile, oldProfile) {
        console.log(newProfile, oldProfile)

        this.history = {
          prev: oldProfile && oldProfile.id ? oldProfile : null, // stop it from setting the prev to an empty object
          next: newProfile
        }
      }
    }
  },
  computed: {
    ...mapGetters(['whakapapa', 'showStory']),
    hasPreviousRoute () {
      return !!this.route.from
    },
    previous () {
      // extract the type of route from the name
      if (this.route.from.name === 'tribe') return

      const [type, routeName] = this.route.from.name.split('/')
      // also get the profile...?

      if (this.history.prev) {
        return { routeName, title: this.history.prev.preferredName, image: this.history.prev.avatarImage }
      }

      return { routeName, title: this.history.next.preferredName, image: this.history.next.avatarImage }
    },
    mobile () {
      return this.$vuetify.breakpoint.xs || this.$vuetify.breakpoint.sm
    },
    /*
      if the route we came from was whakapapaShow
    */
    isFromWhakapapaShow () {
      // if the current route is profile and the previous one was whakapapa
      if (this.route.from) {
        return (
          // if the prev routes is one of the whakapapaShow options
          (
            this.route.from.name === 'person/whakapapa/:whakapapaId' ||
            this.route.from.name === 'community/whakapapa/:whakapapaId'
          ) &&
          (
          // AND the route we are going to isnt the tribes one
            this.route.to.name !== 'tribe' &&
            this.route.to.name !== 'person/whakapapa' &&
            this.route.to.name !== 'community/whakapapa'
          )
        )
      }

      return false
    },
    /*
      if the we are on WhakapapaShow from Whakapapaindex?
    */
    isWhakapapaShow () {
      return (
        this.$route.name === 'person/whakapapa/:whakapapaId' ||
        this.$route.name === 'community/whakapapa/:whakapapaId'
      )
    }
  },
  methods: {
    goWhakapapaShow () {
      this.$router.push({ path: this.route.from.fullPath }).catch(() => {})
    },
    goWhakapapaIndex () {
      var type = this.$route.name.split('/whakapapa')[0]
      this.$router.push({ name: type + '/whakapapa' }).catch(() => {})
    },
    goBack () {
      this.$router.push({ path: this.route.from.fullPath })
    }
  }
}
</script>

<style lang="scss" scoped>
  .v-btn--active.no-active::before {
    opacity: 0 !important;
  }
</style>
