<template>
  <v-container fluid class="body-width pa-0 niho-bg white">
    <v-overlay dark :value="showArtefact" z-index="6" opacity="1" color="rgba(30,30,30)">
    </v-overlay>
    <!-- Header and Title -->
    <Header v-if="activeComponent === 'profile'"
      :profile="selectedProfile"
      @setupProfile="setupProfile($event)"
    />
    <v-row v-if="activeComponent === 'profile'">
      <v-col cols="12" offset-md="2" md="8" sm="12" :class="!mobile ? 'pl-12' : '' " :align="mobile ? 'center' : 'start'">
        <h1 class="primary--text" >{{ selectedProfile.legalName ? selectedProfile.legalName : selectedProfile.preferredName }}</h1>
      </v-col>
      <v-col :order="mobile ? 'first' : 'last'" :align="mobile ? 'end' : 'center'" cols="12" md="2" sm="12"  class="px-5">
        <EditProfileButton @click="updateDialog('edit-node')" />
      </v-col>
    </v-row>
    <v-row>
      <!-- SideNav -->
        <v-col  v-if="!hideNav" cols="12" xs="12" sm="12" md="2" :class="!mobile ? 'pr-0' : 'px-5 py-0'">
          <SideNavMenu :profile="selectedProfile" />
        </v-col>
      <!-- Content -->
      <v-col cols="12" xs="12" sm="12" md="10" :class="mobile ? 'px-6 py-0' : 'pl-0 py-0'">
        <transition
          name="fade"
          mode="out-in"
       >
        <Profile v-if="activeComponent === 'profile'" :profile="selectedProfile" :setupProfile="setupProfile"/>
        <Archive v-if="activeComponent === 'archive'" :profile="{...selectedProfile, type: 'person'}"/>
        <Timeline v-if="activeComponent === 'timeline'" :profile="selectedProfile"/>
      </transition>
      </v-col>
    </v-row>
    <v-spacer style="height:200px"></v-spacer>

    <DialogHandler
      :dialog.sync="dialog.active"
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
import EditProfileButton from '@/components/button/EditProfileButton.vue'

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
    Header,
    EditProfileButton
  },
  data () {
    return {
      prevHeight: 0,
      loaded: false,
      dialog: {
        active: null,
        type: null
      }
    }
  },
  mounted () {
    this.setupProfile(this.$route.params.id)
  },
  computed: {
    ...mapGetters(['selectedProfile', 'whoami', 'activeComponent', 'showStory', 'showArtefact']),
    mobile () {
      return this.$vuetify.breakpoint.xs
    },
    hideNav () {
      if (this.mobile && this.showStory) return true
      else return false
    }
  },
  methods: {
    ...mapActions(['setProfileById', 'setProfile', 'setWhoami', 'setShowArtefact']),
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
  // padding-bottom: 500px;
  // background: white;
  // margin-bottom: 200px;
}

.niho-bg {
  background: linear-gradient(rgba(255, 255, 255, 0.99),
  rgba(255, 255, 255, 0.7)), url(../assets/niho.svg);
  background-position-x: 100px;
  background-attachment: fixed;
  background-repeat: no-repeat;
}

.fade-enter-active,
.fade-leave-active {
  transition-duration: 0.2;
  transition-property: top;
  transition-timing-function: ease-in-out;
 }

</style>
