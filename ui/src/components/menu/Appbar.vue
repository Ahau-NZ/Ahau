<template>
  <div>
    <v-app-bar v-if="mobile || enableMenu" :app="mobile && app" :class="classObject" flat color="#303030" fixed>
      <template v-if="!isMobileBackButton">
        <NotificationPanel/>
      </template>
      <BackButton @go-back="goBack()" @isMobileBackButton="showMobileBackButton($event)"/>
      <v-spacer />

      <!-- Desktop doesn't use a drawer, it has the links directly in the app bar -->
      <template v-if="!mobile">
        <v-tooltip  bottom nudge-bottom="-12" open-delay="300">
          <template v-slot:activator="{ on }">
            <v-btn v-on="on" text active-class="no-active" to="/tribe" class="white--text text-uppercase ms-10">
              <span class="font-weight-light" style="font-size:2em">+</span>
            </v-btn>
          </template>
          <span>Add tribes</span>
        </v-tooltip>
        <div
          v-for="tribe in connectedTribes"
          :item="tribe"
          :key="tribe.id"
          justify-self="start"
        >
          <v-tooltip  bottom nudge-bottom="-12" open-delay="300">
            <template v-slot:activator="{ on }">
              <v-btn
                v-on="on"
                active-class="no-active"
                fab
                @click.native="goTribeProfile(tribe)"
                class="mr-3 red--text"
                :outlined="isOutlinedTribe(tribe)"
              >
                <Avatar
                  v-if="!mobile"
                  size="46px"
                  :image="tribe.private[0].avatarImage"
                  :alt="tribe.private[0].preferredName"
                  :isView="!tribe.private[0].avatarImage"
                />
              </v-btn>
            </template>
            <span>{{tribe.private[0].preferredName}}</span>
          </v-tooltip>
        </div>
        <v-divider
          inset
          vertical
          class="ml-6"
        ></v-divider>
        <v-btn active-class="no-active" fab :outlined="isMyProfile" @click.native="goMyProfile()" class="mr-6 ml-12">
          <Avatar
            v-if="!mobile"
            size="46px"
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
        <v-row align="center" class="ml-2 mt-6">
          <v-btn active-class="no-active" fab :outlined="isMyProfile" @click.native="goMyProfile()" class="mr-3" small>
            <Avatar
              size="45px"
              :image="whoami.personal.profile.avatarImage"
              :alt="whoami.personal.profile.preferredName"
              :gender="whoami.personal.profile.gender"
              :aliveInterval="whoami.personal.profile.aliveInterval"
            />
          </v-btn>
            <span class="font-weight-light">{{whoami.personal.profile.preferredName}}</span>
        </v-row>
        <v-divider v-if="connectedTribes.length" class="ma-6 mt-3" />
        <div v-if="connectedTribes.length" class="sub-headliner ml-6 mb-2">tribes</div>
        <v-row
          v-for="tribe in connectedTribes"
          :item="tribe"
          :key="tribe.id"
          justify-self="start"
        >
          <v-col cols=3 class="py-0">
            <v-btn
              active-class="no-active"
              fab
              @click.native="goTribeProfile(tribe)"
              class="ml-1 mr-3 red--text my-1"
              :outlined="isOutlinedTribe(tribe)"
              small
            >
              <Avatar
                size="35px"
                :image="tribe.private[0].avatarImage"
                :alt="tribe.private[0].preferredName"
                :isView="!tribe.private[0].avatarImage"
              />
            </v-btn>
          </v-col>
          <v-col cols="9" align-self="center" class="pr-4">
            <span @click="goTribeProfile(tribe)" class="font-weight-light">{{tribe.private[0].preferredName}}</span>
          </v-col>
        </v-row>
        <v-divider class="ma-6"/>
        <v-btn text active-class="no-active" to="/tribe" class="white--text text-uppercase ml-3">
          <p class="font-weight-light" style="font-size: 0.8em;">+ add tribe</p>
        </v-btn>
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
import { mapGetters, mapActions } from 'vuex'
import BackButton from '@/components/button/BackButton'

import { getTribes } from '../../store/modules/tribe/apollo-helpers'

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
  name: 'AppBar',
  props: {
    enableMenu: { type: Boolean, default: true },
    app: { type: Boolean, default: false },
    sideMenu: { type: Boolean, default: false }
  },
  components: {
    Avatar,
    NotificationPanel,
    BackButton
  },
  data () {
    return {
      drawer: false,
      dialog: false,
      loading: true,
      route: {},
      isMobileBackButton: false,
      tribes: []
    }
  },
  apollo: {
    tribes: {
      ...getTribes,
      pollInterval: 10e3
    }
  },
  created () {
    this.getNotifications()
  },
  beforeDestroy () {
    clearInterval(this.polling)
  },
  watch: {
    $route (to, from) {
      this.route = { to, from }
    },
    tribes: {
      deep: true,
      handler (tribes) {
        this.updateTribes(tribes)
      }
    }
  },
  computed: {
    ...mapGetters(['whoami', 'storeDialog', 'syncing', 'navComponent']),
    ...mapGetters('archive', ['showStory']),
    // mix (T_T) why is the navComponent in the archive store??
    connectedTribes () {
      return this.tribes.filter(tribe => tribe.private.length > 0)
    },
    isMyProfile () {
      return this.$route.params.profileId === this.whoami.personal.profile.id
    },
    classObject: function () {
      return {
        mobile: this.mobile,
        desktop: !this.mobile,
        sideMenuAppBarStyle: this.sideMenu
      }
    },
    mobile () {
      return this.$vuetify.breakpoint.xs || this.$vuetify.breakpoint.sm
    }
  },
  mounted () {
    this.getAllNotifications()
    if (process.env.VUE_APP_PLATFORM !== 'cordova') {
      this.getCurrentIdentity()
    }
  },
  methods: {
    ...mapActions('tribe', ['updateTribes']),
    ...mapActions(['setWhoami', 'setDialog']),
    ...mapActions('archive', ['toggleShowStory']),
    ...mapActions('notifications', ['getAllNotifications']),
    showMobileBackButton ($event) {
      this.isMobileBackButton = $event
    },
    isOutlinedTribe (tribe) {
      return this.$route.params.tribeId === tribe.id
    },
    getNotifications () {
      this.polling = setInterval(this.getAllNotifications, 7e3)
    },
    async getCurrentIdentity () {
      await this.setWhoami()
    },
    goMyProfile () {
      if (this.mobile && this.showStory) this.toggleShowStory()
      this.$router.push({
        name: this.navComponent === 'person' ? 'personIndex' : ('person/' + this.navComponent),
        params: {
          tribeId: this.whoami.personal.groupId,
          profileId: this.whoami.personal.profile.id
        }
      }).catch(() => {})
      this.toggleDrawer()
    },
    goTribeProfile (tribe) {
      if (this.mobile && this.showStory) this.toggleShowStory()
      this.$router.push({
        name: this.navComponent === 'person' ? 'personIndex' : ('community/' + this.navComponent),
        // name: this.$router.name, // would need to check if is in an index page, if not, fall back to index?
        params: {
          tribeId: tribe.id,
          profileId: tribe.private[0].id
        }
      }).catch(() => {})
      this.toggleDrawer()
    },
    karakiaWhakamutunga () {
      console.log(karakia)
    },
    toggleDrawer () {
      this.drawer = !this.drawer
    },
    goBack () {
      if (this.$route.name === 'whakapapa') return this.$router.push({ path: this.$route.from.fullPath }).catch(() => {})
      else if (this.showStory) return this.toggleShowStory()
    },
    t (key, vars) {
      return this.$t('appBarMenu.' + key, vars)
    }
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
  .sub-headliner {
    font-size: 0.6em;
    text-transform: uppercase;
    font-weight: 400;
    letter-spacing: 5px;
  }

</style>
