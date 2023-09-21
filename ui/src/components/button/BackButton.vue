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
            :image="lastWhakapapaView.image ? lastWhakapapaView.image : null"
            :alt="lastWhakapapaView.name"
            :isView="!lastWhakapapaView.image"
            showLabel
            row

          />
          <span class="pl-2 caption">Back to {{ lastWhakapapaView.name }} whakapapa</span>
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
          <span class="pl-2 caption">{{ t('backToWhakapapa') }}</span>
        </v-row>
      </v-btn>
    </div>

    <div v-else-if="isCollectionShow" fab :class="mobile ? 'ml-n4':'ms-10 pr-6 pb-1'">
      <v-btn @click="goBack()" text>
        <div v-if="mobile">
          <v-icon dark>mdi-arrow-left</v-icon>
        </div>
        <v-row v-else align="center">
          <v-icon large>mdi-chevron-left</v-icon>
          <ArchiveIcon size="small" color="white"/>
          <span class="pl-2 caption">Back to archive</span>
        </v-row>
      </v-btn>
    </div>
    <div v-else-if="isFromPersonIndex" fab :class="mobile ? 'ml-n4':'ms-10 pr-6 pb-1'">
      <v-btn @click="goPersonIndex()" text>
        <div v-if="mobile">
          <v-icon dark>mdi-arrow-left</v-icon>
        </div>
        <v-row v-else align="center">
          <v-icon large>mdi-chevron-left</v-icon>
          <PersonListIcon size="small" color="white"/>
          <span class="pl-2 caption">Back to People</span>
        </v-row>
      </v-btn>
    </div>
    <div v-else-if="mobile && showStory" class="ml-n4">
      <v-btn @click="toggleShowStory()" text>
        <v-icon dark>mdi-arrow-left</v-icon>
      </v-btn>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions, mapMutations } from 'vuex'

import Avatar from '@/components/Avatar.vue'
import WhakapapaIcon from '@/components/button/WhakapapaIcon.vue'
import ArchiveIcon from '@/components/button/ArchiveIcon.vue'
import PersonListIcon from '@/components/button/PersonListIcon.vue'

import mapProfileMixins from '@/mixins/profile-mixins'

export default {
  components: {
    Avatar,
    WhakapapaIcon,
    ArchiveIcon,
    PersonListIcon
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
      history: null,
      whakapapaRoute: null
    }
  },

  watch: {
    $route (to, from) {
      this.route = {
        to,
        // from
        from: to.params.keepAlive ? this.route.from : from
      }
    },
    profile: {
      deep: true,
      immediate: true,
      handler (newProfile, oldProfile) {
        this.history = {
          prev: oldProfile && oldProfile.id ? oldProfile : null, // stop it from setting the prev to an empty object
          next: newProfile
        }
      }
    },
    mobileBackButton (newVal) {
      this.$emit('isMobileBackButton', newVal)
    },
    isFromWhakapapaShow (newVal) {
      if (newVal) this.whakapapaRoute = this.route.from.fullPath
    }
  },
  computed: {
    ...mapGetters('archive', ['showStory', 'isFromWhakapapaShow', 'isFromPersonIndex']),
    ...mapGetters('tribe', ['tribes']),
    ...mapGetters('whakapapa', ['lastWhakapapaView']),
    hasPreviousRoute () {
      return !!this.route.from
    },
    previous () {
      // extract the type of route from the name
      if (this.route.from.name === 'tribe') return

      const [, routeName] = this.route.from.name.split('/')
      // also get the profile...?

      if (this.history.prev) {
        return { routeName, title: this.history.prev.preferredName, image: this.history.prev.avatarImage }
      }

      return { routeName, title: this.history.next.preferredName, image: this.history.next.avatarImage }
    },
    mobile () {
      return this.$vuetify.breakpoint.xs || this.$vuetify.breakpoint.sm
    },

    // if the we are on WhakapapaShow from Whakapapaindex?
    isWhakapapaShow () {
      return (
        this.$route.name === 'person/whakapapa/:whakapapaId' ||
        this.$route.name === 'community/whakapapa/:whakapapaId'
      )
    },
    // if we are on CollectionShow from Archive
    isCollectionShow () {
      return (
        this.$route.name === 'person/collection' ||
        this.$route.name === 'community/collection'
      )
    },
    // if we are showing the mobile BackButton: hide logo
    mobileBackButton () {
      return (
        this.mobile && (this.isCollectionShow || this.isWhakapapaShow || this.isFromWhakapapaShow || this.showStory)
      )
    }
  },
  methods: {
    ...mapActions('archive', ['toggleShowStory']),
    ...mapMutations('archive', ['setIsFromWhakapapaShow', 'setIsFromPersonIndex']),
    goWhakapapaShow () {
      this.setIsFromWhakapapaShow(false)
      this.$router.push({ path: this.whakapapaRoute }).catch(() => {})
    },
    goPersonIndex () {
      this.setIsFromPersonIndex(false)
      this.goBack()
    },
    goWhakapapaIndex () {
      // check the group we are going to is an admin one
      // TODO: replace with parentGroup vuex getter
      const parentGroup = this.tribes.find(tribe => tribe.admin && tribe.admin.id === this.$route.params.tribeId)
      const type = this.$route.name.split('/whakapapa')[0]

      if (parentGroup) {
        // navigate to the parent group instead if we found this group has one
        this.$router.push({ name: type + '/whakapapa', params: { tribeId: parentGroup.id, profileId: this.$route.params.profileId } }).catch(() => {})
      } else {
        this.$router.push({ name: type + '/whakapapa' }).catch(() => {})
      }
    },
    goBack () {
      this.$router.push({ path: this.route.from.fullPath })
    },
    t (key, vars) {
      return this.$t('whakapapaIndex.' + key, vars)
    }
  }
}
</script>

<style lang="scss" scoped>
  .v-btn--active.no-active::before {
    opacity: 0 !important;
  }
</style>
