<template>
  <div>
    <v-app-bar v-if="mobile || enableMenu" :app="mobile && app" :class="classObject" flat color="#303030" fixed>
      <template v-if="!isGoBack">
        <NotificationPanel/>
      </template>
      <BackButton v-if="!isWhakapapaIndex" />
      <v-spacer />

      <!-- Desktop doesn't use a drawer, it has the links directly in the app bar -->
      <template v-if="!mobile">
        <v-btn text active-class="no-active" :to="{ name: 'tribe' }" class="white--text text-uppercase ms-10">Tribes</v-btn>
        <v-btn active-class="no-active" text :to="go('archive')" class="white--text text-uppercase ms-10">Archive</v-btn>

        <!-- <v-btn active-class="no-active" text @click.native="resetWindow" to="/whakapapa" class="white--text text-uppercase ms-10">whakapapa</v-btn> -->
        <v-btn active-class="no-active" text :to="go('whakapapa')" class="white--text text-uppercase ms-10">whakapapa</v-btn>
        <v-btn active-class="no-active" fab :to="go('profile')" class="pr-12 mr-4 ml-10">
          <Avatar
            v-if="!mobile"
            size="45px"
            class="ms-12"
            :image="whoami.personal.profile.avatarImage"
            :alt="whoami.personal.profile.preferredName"
            :gender="whoami.personal.profile.gender"
            :aliveInterval="whoami.personal.profile.aliveInterval"
          />
        </v-btn>

      </template>

      <template v-if="mobile">
        <v-app-bar-nav-icon color="white" v-if="enableMenu" @click.stop="toggleDrawer" />
        <v-btn v-else icon disabled>
          <v-icon>mdi-menu</v-icon>
        </v-btn>
      </template>
      <v-progress-linear
        v-if="syncing"
        :active="syncing"
        :indeterminate="syncing"
        absolute
        bottom
        color="#B71C1C"
        height='5'
      />

    </v-app-bar>

    <!-- The drawer shows only on mobile -->
    <v-navigation-drawer v-if="mobile && enableMenu" v-model="drawer" app dark right width="60%">
      <v-list nav class="text-uppercase">
        <v-list-item active-class="no-active" :to="go('profile')">
          <Avatar
            size="80px"
            :image="whoami.personal.profile.avatarImage"
            :alt="whoami.personal.profile.preferredName"
            :gender="whoami.personal.profile.gender"
            :aliveInterval="whoami.personal.profile.aliveInterval"
          />
        </v-list-item>
        <v-list-item active-class="no-active" link :to="go('whakapapa')" class="white--text">
          <v-list-item-title>whakapapa</v-list-item-title>
        </v-list-item>
        <v-list-item active-class="no-active" link :to="go('archive')">
          <v-list-item-title class="white--text" >Archive</v-list-item-title>
        </v-list-item>
        <v-list-item active-class="no-active" link :to="{ name: 'tribe' }">
          <v-list-item-title class="white--text">Tribes</v-list-item-title>
        </v-list-item>
        <v-list-item class="pt-12">
          <FeedbackButton />
        </v-list-item>
      </v-list>
    </v-navigation-drawer>
    <v-progress-linear
      v-if="syncing"
      :active="syncing"
      :indeterminate="syncing"
      absolute
      bottom
      color="#B71C1C"
      height='5'
    />
  </div>
</template>

<script>
import Avatar from '@/components/Avatar'
import NotificationPanel from '@/components/menu/NotificationPanel'
import FeedbackButton from '@/components/button/FeedbackButton'
import { mapGetters, mapActions } from 'vuex'
import BackButton from '@/components/button/BackButton'

const karakia = `
---------------------------------
Kia whakairia te tapu
Kia wātea ai te ara
Kia turuki whakataha ai
Kia turuki whakataha ai
Haumi e. Hui e. Tāiki e!

Restrictions are moved aside
So the pathway is clear
To return to everyday activities
---------------------------------
`

export default {
  name: 'Appbar',
  props: {
    enableMenu: { type: Boolean, default: true },
    app: { type: Boolean, default: false },
    sideMenu: { type: Boolean, default: false }
  },
  data () {
    return {
      drawer: false,
      dialog: false,
      loading: true
    }
  },
  created () {
    this.getNotifications()
  },
  beforeDestroy () {
    clearInterval(this.polling)
  },
  computed: {
    ...mapGetters(['whoami', 'whakapapa', 'showStory', 'storeDialog', 'currentProfile', 'syncing', 'activeComponent']),
    isWhakapapaIndex () {
      return this.$route.name === 'whakapapa'
    },
    classObject: function () {
      return {
        'mobile': this.mobile,
        'desktop': !this.mobile,
        'sideMenuAppBarStyle': this.sideMenu
      }
    },
    mobile () {
      return this.$vuetify.breakpoint.xs || this.$vuetify.breakpoint.sm
    },
    isGoBack () {
      if (this.mobile) {
        if (this.$route.name === 'whakapapa') return true
        else if (this.showStory) return true
        else if (this.r$oute.from.name === 'whakapapa' && this.$route.name === 'profileShow' && this.activeComponent !== 'whakapapa') return true
      }
      return false
    }
  },
  mounted () {
    this.getAllNotifications()
    if (process.env.VUE_APP_PLATFORM !== 'cordova') {
      this.getCurrentIdentity()
    }
  },
  methods: {
    ...mapActions(['setWhoami', 'setProfileById', 'setComponent', 'setShowStory', 'setDialog', 'getAllNotifications']),
    go (path) {
      return {
        name: path,
        params: {
          tribeId: this.whoami.personal.groupId,
          profileId: this.whoami.personal.profile.id,
          profile: this.whoami.personal.profile
        }
      }
    },
    resetWindow () {
      window.scrollTo(0, 0)
    },
    getNotifications () {
      this.polling = setInterval(() => {
        this.getAllNotifications()
      }, 5e3)
    },
    async getCurrentIdentity () {
      await this.setWhoami()
    },
    karakiaWhakamutunga () {
      console.log(karakia)
    },
    toggleDrawer () {
      this.drawer = !this.drawer
    },
    goBack () {
      if (this.$route.name === 'whakapapaShow') return this.$router.push({ path: this.$route.from.fullPath })
      else if (this.showStory) return this.setShowStory()
    }
  },
  components: {
    Avatar,
    FeedbackButton,
    NotificationPanel,
    BackButton
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">

  .sideMenuAppBarStyle {
    margin-top: -56px !important;
  }

  .v-btn--active.no-active::before {
    opacity: 0 !important;
  }

  .v-list-item--active.no-active::before {
    opacity: 0 !important;
  }

  /* ---- badge notification bounce animation ---- */
  @-webkit-keyframes bounce {
    0% {
      transform: translateY(-5px)
    }
    50% {
      transform: translateY(5px)
    }
    100% {
      transform: translateY(-5px)
    }
  }

  @keyframes bounce {
    0% {
      transform: translateY(-5px)
    }
    50% {
      transform: translateY(5px)
    }
    100% {
      transform: translateY(-5px)
    }
  }

</style>
