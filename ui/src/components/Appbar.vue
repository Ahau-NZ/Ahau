<template>
  <div>
    <v-app-bar v-if="mobile || enableMenu" :app="mobile && app" :absolute="mobile" :class="classObject" :flat="!mobile"
      color="#303030" fixed>
      <v-btn v-if="goBack && mobile" @click="goBack" icon dark>
        <v-icon>mdi-arrow-left</v-icon>
      </v-btn>
      <template v-else>
        <router-link to="/" v-if="enableMenu" class="logo-link"  @click.native="karakiaWhakamutunga()">
          <img src="@/assets/logo_red.svg" class="logo" />
        </router-link>
      </template>
      <v-spacer />
      <!-- TODO this takes you back to previous view -->
      <!-- <v-btn v-if="!mobile" @click="$router.go(-1)" icon dark>
        <v-icon>mdi-arrow-left</v-icon>
      </v-btn> -->

      <!-- Desktop doesn't use a drawer, it has the links directly in the app bar -->
      <template v-if="!mobile">
        <!--  WIP links -->
        <v-btn text @click.stop="dialog = true" class="red--text text-uppercase ms-10">Archive</v-btn>
        <v-btn text @click.stop="dialog = true" class="red--text text-uppercase ms-10">Tribes</v-btn>

        <v-btn text to="/whakapapa" class="white--text text-uppercase ms-10">whakapapa</v-btn>
        <router-link :to="{ name: 'profileShow', params: { id: profile.id } }">
          <Avatar
            v-if="!mobile"
            size="50px"
            class="ms-10"
            :image="profile.avatarImage"
            :alt="profile.preferredName"
            :gender="profile.gender"
            :bornAt="profile.bornAt"
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
        <!--  WIP links -->
        <v-list-item :to="{ name: 'profileShow', params: { id: profile.id } }" >
          <Avatar
            size="80px"
            :image="profile.avatarImage"
            :alt="profile.preferredName"
            :gender="profile.gender"
            :bornAt="profile.bornAt"
          />
        </v-list-item>
        <v-list-item link @click.stop="dialog = true">
          <v-list-item-title class="red--text">Archive</v-list-item-title>
        </v-list-item>

        <v-list-item link @click.stop="dialog = true">
          <v-list-item-title class="red--text">Tribes</v-list-item-title>
        </v-list-item>

        <v-list-item link to="/whakapapa" class="white--text">
          <v-list-item-title>whakapapa</v-list-item-title>
        </v-list-item>
        <!-- using click.native to handle event when there is also a router link -->
        <v-list-item link @click.native="karakiaWhakamutunga()" to="/login" class="white--text">
          <v-list-item-title>sign out</v-list-item-title>
        </v-list-item>
        <v-list-item class="pt-12">
          <FeedbackButton />
        </v-list-item>
      </v-list>
    </v-navigation-drawer>

    <!-- coming soon dialog  -->
    <v-dialog v-model="dialog" max-width="450">
      <v-card>
        <v-card-title class="headline">Aroha mai</v-card-title>
        <v-card-text>
          These features are still under construction, but we can't wait to
          share this mahi with you soon in upcoming releases
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="red darken-1" text @click="dialog = false">Ka pai</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import gql from 'graphql-tag'
import Avatar from '@/components/Avatar'
import FeedbackButton from '@/components/button/FeedbackButton'
import { mapGetters } from 'vuex'

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
    sideMenu: { type: Boolean, default: false },
    goBack: { type: Function }
  },
  data () {
    return {
      drawer: false,
      dialog: false,
      profile: {
        id: null,
        avatarImage: null
      }
    }
  },
  computed: {
    classObject: function () {
      return {
        'mobile': this.mobile,
        'desktop': !this.mobile,
        'sideMenuAppBarStyle': this.sideMenu
      }
    },
    mobile () {
      return this.$vuetify.breakpoint.xs
    }
  },
  beforeMount () {
    this.getCurrentIdentity()
  },
  methods: {
    karakiaWhakamutunga () {
      console.log(karakia)
    },
    async getCurrentIdentity () {
      const result = await this.$apollo.query({
        query: gql`
          {
            whoami {
              profile {
                id
                preferredName
                avatarImage {
                  uri
                }
              }
            }
          }
        `,
        fetchPolicy: 'no-cache'
      })

      if (result.errors) throw result.errors

      this.profile = result.data.whoami.profile
    },
    toggleDrawer () {
      this.drawer = !this.drawer
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
</style>
