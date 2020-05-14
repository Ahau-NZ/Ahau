<template>
  <v-container fluid class="body-width pa-0 niho-bg white">
    <!-- Header and Title -->
    <Header v-if="pageComponents.profile"
      :profile="selectedProfile"
      @setupProfile="setupProfile($event)"
    />
    <v-row v-if="pageComponents.profile">
      <v-col cols="12" offset-md="2" md="8" sm="12" :class="!mobile ? 'pl-12' : '' " :align="mobile ? 'center' : 'start'">
        <h1 class="primary--text" >{{ selectedProfile.legalName ? selectedProfile.legalName : selectedProfile.preferredName }}</h1>
      </v-col>
      <v-col :order="mobile ? 'first' : 'last'" :align="mobile ? 'end' : 'center'" cols="12" md="2" sm="12"  class="px-5">
        <v-tooltip left>
          <template v-slot:activator="{ on }">
              <v-btn v-on="on" x-small class="my-2" fab color="white" @click="updateDialog('edit-node')">
                <v-icon small class="black--text">mdi-pencil</v-icon>
              </v-btn>
          </template>
          <span>Edit profile</span>
        </v-tooltip>
      </v-col>
    </v-row>
    <v-row>
      <!-- SideNav -->
        <v-col cols="12" xs="12" sm="12" md="2" :class="!mobile ? 'pr-0' : 'px-5 py-0'">
          <SideNavMenu :profile="selectedProfile" @setPageComponent="setPageComponent($event)" />
        </v-col>
      <!-- Content -->
      <v-col cols="12" xs="12" sm="12" md="10" :class="mobile ? 'px-6 py-0' : 'pl-0 py-0'">
        <transition
          name="fade"
          mode="out-in"
       >
        <Profile v-if="pageComponents.profile" :profile="selectedProfile" :setupProfile="setupProfile"/>
        <Archive v-if="pageComponents.archive" :profile="{...selectedProfile, type: 'person'}"/>
        <Timeline v-if="pageComponents.timeline" :profile="selectedProfile"/>
      </transition>
      </v-col>
    </v-row>

    <DialogHandler
      :dialog.sync="dialog.active"
      :selectedProfile="selectedProfile"
      @setupProfile="setupProfile($event)"
    />
  </v-container>
</template>

<script>
import DialogHandler from '@/components/dialog/DialogHandler.vue'
import SideNavMenu from '@/components/menu/SideNavMenu.vue'
import Profile from '@/components/profile/Profile.vue'
import Archive from '@/components/archive/Archive'
import Timeline from '@/components/story/Timeline.vue'
import Header from '@/components/profile/Header.vue'

import {
  mapActions,
  mapGetters
} from 'vuex'

export default {
  name: 'ProfileShow',
  // props: ['selectedProfile'],
  components: {
    DialogHandler,
    SideNavMenu,
    Profile,
    Archive,
    Timeline,
    Header
  },
  data () {
    return {
      prevHeight: 0,
      loaded: false,
      dialog: {
        active: null,
        type: null
      },
      pageComponents: {
        profile: true,
        archive: false,
        timeline: false
      }
    }
  },
  mounted () {
    this.setupProfile(this.$route.params.id)
  },
  computed: {
    ...mapGetters(['selectedProfile', 'whoami']),
    mobile () {
      return this.$vuetify.breakpoint.xs
    }
  },
  methods: {
    ...mapActions(['setProfileById', 'setProfile', 'setWhoami']),

    setPageComponent (component) {
      // set all to false
      this.pageComponents.profile = false
      this.pageComponents.archive = false
      this.pageComponents.timeline = false

      switch (component) {
        case 'Profile':
          this.pageComponents.profile = true
          break
        case 'Archive':
          this.pageComponents.archive = true
          break
        case 'Timeline':
          this.pageComponents.timeline = true
          break
        default:
          this.pageComponents.profile = true
      }
    },
    async setupProfile (id) {
      this.setProfileById(id)
      if (this.dialog.active) this.dialog.active = null
      if (id === this.whoami.profile.id) await this.setWhoami()
    },

    updateDialog (dialogObj) {
      this.dialog.active = dialogObj
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss">
.body-width {
  /* min-width: $formWidth; */
  max-width: 100vw;
  min-height: 100vh;
  background: white;
}

.niho-bg {
  background: linear-gradient(rgba(255, 255, 255, 0.99),
  rgba(255, 255, 255, 0.7)), url(../assets/niho.svg);
  background-position-x: 400px;
  background-attachment: fixed;
  background-repeat: no-repeat;
}

.fade-enter-active,
.fade-leave-active {
  transition-duration: 0.2;
  transition-property: opacity;
  transition-timing-function: ease;
 }

</style>
