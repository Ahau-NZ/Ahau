<template>
  <div>
    <v-app-bar  v-if="mobile || enableMenu" :app="mobile && app" :class="classObject" flat color="#303030" fixed>
      <v-btn v-if="isgoBack" @click="goBack" icon dark>
        <v-icon>mdi-arrow-left</v-icon>
      </v-btn>
      <!-- <v-btn v-if="showStory && mobile" @click="setShowStory" icon dark>
        <v-icon>mdi-arrow-left</v-icon>
      </v-btn> -->
      <template v-else>
        <router-link to="/" v-if="enableMenu" class="logo-link"  @click.native="karakiaWhakamutunga()">
          <img src="@/assets/logo_red.svg" class="logo" />
        </router-link>
      </template>
      <v-btn v-if="isgoWhakapapa && !showStory" text @click="goWhakapapa" class="ms-10">
        <v-row>
          <v-icon large>mdi-chevron-left</v-icon>
          <Avatar
            size="50px"
            class="ma-0"
            :image="whakapapa.image ? whakapapa.image : null"
            :alt="whakapapa.name"
            :isView="!whakapapa.image"
          />
        </v-row>
      </v-btn>
      <v-spacer />
      <!-- TODO this takes you back to previous view -->

      <!-- Desktop doesn't use a drawer, it has the links directly in the app bar -->
      <template v-if="!mobile">
        <!--  WIP links -->
        <v-btn text @click.stop="setDialog('coming-soon')" active-class="no-active" class="red--text text-uppercase ms-10">Tribes</v-btn>
        <v-btn active-class="no-active" text @click.native="setComponent('archive')" :to="{ name: 'profileShow', params: { id: whoami.profile.id } }" class="white--text text-uppercase ms-10">Archive</v-btn>

        <v-btn active-class="no-active" text @click.native="resetWindow" to="/whakapapa" class="white--text text-uppercase ms-10">whakapapa</v-btn>
        <router-link @click.native="goProfile()" :to="{ name: 'profileShow', params: { id: whoami.profile.id } }">
          <Avatar
            v-if="!mobile"
            size="50px"
            class="ms-10"
            :image="whoami.profile.avatarImage"
            :alt="whoami.profile.preferredName"
            :gender="whoami.profile.gender"
            :bornAt="whoami.profile.bornAt"
          />
        </router-link>

      </template>

      <template v-if="mobile">
        <v-app-bar-nav-icon color="white" v-if="enableMenu" @click.stop="toggleDrawer" />
        <v-btn v-else icon disabled>
          <v-icon>mdi-menu</v-icon>
        </v-btn>
      </template>

    </v-app-bar>

    <!-- The drawer shows only on mobile -->
    <v-navigation-drawer v-if="mobile && enableMenu" v-model="drawer" app dark right>
      <v-list nav class="text-uppercase">
        <v-list-item active-class="no-active" @click.native="goProfile()" :to="{ name: 'profileShow', params: { id: whoami.profile.id } }" >
          <Avatar
            size="80px"
            :image="whoami.profile.avatarImage"
            :alt="whoami.profile.preferredName"
            :gender="whoami.profile.gender"
            :bornAt="whoami.profile.bornAt"
          />
        </v-list-item>
        <v-list-item active-class="no-active" link to="/whakapapa" class="white--text">
          <v-list-item-title>whakapapa</v-list-item-title>
        </v-list-item>
        <v-list-item active-class="no-active" link @click.native="goArchive()" :to="{ name: 'profileShow', params: { id: whoami.profile.id } }" >
          <v-list-item-title class="white--text" >Archive</v-list-item-title>
        </v-list-item>
        <v-list-item active-class="no-active" link @click.stop="setDialog('coming-soon')">
          <v-list-item-title class="red--text">Tribes</v-list-item-title>
        </v-list-item>
        <v-list-item class="pt-12">
          <FeedbackButton />
        </v-list-item>
      </v-list>
    </v-navigation-drawer>
  </div>
</template>

<script>
import gql from 'graphql-tag'
import Avatar from '@/components/Avatar'
import FeedbackButton from '@/components/button/FeedbackButton'
import { mapGetters, mapActions } from 'vuex'

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
    // goBack: { type: Function }
  },
  data () {
    return {
      drawer: false,
      dialog: false
    }
  },
  computed: {
    ...mapGetters(['whoami', 'whakapapa', 'route', 'showStory', 'storeDialog']),
    classObject: function () {
      return {
        'mobile': this.mobile,
        'desktop': !this.mobile,
        'sideMenuAppBarStyle': this.sideMenu
      }
    },
    mobile () {
      return this.$vuetify.breakpoint.xs
    },
    isgoWhakapapa () {
      if (this.route.from) {
        return this.route.from.name === 'whakapapaShow' && this.route.name === 'profileShow'
      }
      return false
    },
    isgoBack () {
      if (this.mobile) {
        if (this.route.name === 'whakapapaShow') return true
        else if (this.showStory) return true
      } return false
    }
  },
  watch: {
    route (newVal) {
      if (this.storeDialog) this.setDialog(null)
    }
  },
  mounted () {
    if (process.env.VUE_APP_PLATFORM !== 'cordova') {
      this.getCurrentIdentity()
    }
  },
  methods: {
    ...mapActions(['setWhoami', 'setProfileById', 'setComponent', 'setShowStory', 'setDialog']),
    resetWindow () {
      window.scrollTo(0, 0)
    },
    async getCurrentIdentity () {
      await this.setWhoami()
    },
    goProfile () {
      this.setComponent('profile')
      // this.setProfileById(this.profile.id)
      if (this.drawer) this.drawer = false
    },
    goArchive () {
      this.setComponent('archive')
      if (this.drawer) this.drawer = false
    },
    karakiaWhakamutunga () {
      console.log(karakia)
    },
    toggleDrawer () {
      this.drawer = !this.drawer
    },
    goBack () {
      if (this.route.name === 'whakapapaShow') return this.$router.push({ name: 'whakapapaIndex' })
      else if (this.showStory) return this.setShowStory()
    },
    goWhakapapa () {
      this.$router.push({ path: this.route.from.fullPath })
    }

  },
  components: {
    Avatar,
    FeedbackButton
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
  .mobile {

    .logo,
    .logo-link {
      height: 35px;
    }
  }

  .desktop {
    .logo {
      height: 45px;
      padding: 0 25px;
    }
  }

  .sideMenuAppBarStyle {
    margin-top: -56px !important;
  }

  .v-btn--active.no-active::before {
  opacity: 0 !important;
  }

  .v-list-item--active.no-active::before {
  opacity: 0 !important;
  }

</style>
