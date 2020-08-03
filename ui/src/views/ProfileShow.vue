<template>
  <v-container fluid class="body-width pa-0 niho-bg">
    <v-overlay dark :value="showArtefact" z-index="6" opacity="1" color="rgba(30,30,30)">
    </v-overlay>
    <!-- Header and Title -->
    <Header v-if="activeComponent === 'profile'"
      :profile="currentProfile"
      @setupProfile="setupProfile($event)"
    />
    <v-row v-if="activeComponent === 'profile'">
      <v-col cols="12" offset-md="2" md="8" sm="12" :class="!mobile ? 'pl-12' : '' " :align="mobile ? 'center' : 'start'" :order="mobile ? '3' : '1'">
        <h1 class="primary--text" :style="mobile ? length : ''">{{ currentProfile.legalName ? currentProfile.legalName : currentProfile.preferredName }}</h1>
      </v-col>
      <!-- <v-col v-if="currentProfile.canEdit" :order="mobile ? '1' : '2'" :align="mobile ? 'start' : isCommunity ? 'start':'center'" cols="6" md="1" sm="6"  class="px-5">
        <EditRegistrationButton @click="setDialog('edit-registration')" />
      </v-col> -->
      <v-col v-if="currentProfile.canEdit" :order="mobile ? '2' : '3'" :align="mobile || tablet ? 'end' : isCommunity ? 'start':'center'" cols="12" :md="isCommunity ? 1:2" class="px-5">
        <EditProfileButton v-if="currentProfile.canEdit" @click="currentProfile.type === 'person' ? setDialog('edit-node', 'this', 'this') : setDialog('edit-community')" />
      </v-col>
    </v-row>
    <v-row>
      <!-- SideNav -->
      <v-col  v-if="!hideNav" cols="12" xs="12" sm="12" md="2" lg="20p" :class="!mobile ? 'pr-0' : 'px-5 py-0'">
        <SideNavMenu :profile="currentProfile" />
      </v-col>
      <!-- Content -->
      <v-col cols="12" xs="12" sm="12" md="10" lg="80p" :class="mobile ? 'px-6 py-0' : 'pl-0 py-0'">
        <transition
          name="fade"
          mode="out-in"
       >
        <!-- <Community v-if="activeComponent === 'profile'" :profile="currentProfile" :setupProfile="setupProfile"/> -->
        <Profile v-if="activeComponent === 'profile'" :profile="currentProfile" :setupProfile="setupProfile"/>
        <Archive v-if="activeComponent === 'archive'" :profile="{...currentProfile, type: 'person'}"/>
        <Timeline v-if="activeComponent === 'timeline'" :profile="currentProfile"/>
        <WhakapapaIndex v-if="activeComponent === 'whakapapa'"/>
      </transition>
      </v-col>
    </v-row>
    <v-spacer v-if="!mobile" style="height:200px"></v-spacer>
  </v-container>
</template>

<script>
import SideNavMenu from '@/components/menu/SideNavMenu.vue'
import Profile from '@/components/profile/Profile.vue'
import Archive from '@/components/archive/Archive'
import Timeline from '@/components/story/Timeline.vue'
import Header from '@/components/profile/Header.vue'
import EditProfileButton from '@/components/button/EditProfileButton.vue'
// import EditRegistrationButton from '@/components/button/EditRegistrationButton.vue'
import WhakapapaIndex from '@/views/WhakapapaIndex.vue'

import {
  mapActions,
  mapGetters
} from 'vuex'

export default {
  name: 'ProfileShow',
  components: {
    SideNavMenu,
    Profile,
    Archive,
    Timeline,
    Header,
    EditProfileButton,
    // EditRegistrationButton,
    WhakapapaIndex
  },
  data () {
    return {
      prevHeight: 0,
      loaded: false
    }
  },
  beforeMount () {
    this.getAllStories()
    this.getTribes()
  },
  computed: {
    ...mapGetters(['currentProfile', 'activeComponent', 'showStory', 'showArtefact', 'currentTribe']),
    mobile () {
      return this.$vuetify.breakpoint.xs || this.$vuetify.breakpoint.sm
    },
    tablet () {
      return this.$vuetify.breakpoint.md
    },
    isCommunity () {
      // TODO - only viewable by kaitiaki
      return this.currentProfile.type === 'community'
    },
    length () {
      var name = ''
      if (this.currentProfile.legalName) name = this.currentProfile.legalName
      else if (this.currentProfile.preferredName) name = this.currentProfile.preferredName
      if (name.length > 30) return 'font-size:6vw'
      if (name.length > 25) return 'font-size:7vw'
      if (name.length > 20) return 'font-size:8vw'
      else return 'font-size: 10vw'
    },
    hideNav () {
      if (this.mobile && this.showStory) return true
      else return false
    }
  },
  methods: {
    ...mapActions(['getAllStories', 'setProfileById', 'setWhoami', 'setShowArtefact', 'setDialog', 'getTribes']),
    async setupProfile (id) {
      this.setProfileById({ id })
    }
  }
}
</script>

<style lang="scss">
@media (min-width: 1264px) and (max-width: 1903px) {
  .col-lg-20p {
    width: 20%;
    max-width: 20%;
    flex-basis: 20%;
  }
  .col-lg-60p {
    width: 60%;
    max-width: 60%;
    flex-basis: 60%;
  }
  .col-lg-80p {
    width: 80%;
    max-width: 80%;
    flex-basis: 80%;
  }
}

.body-width {
  max-width: 100vw;
}

.niho-bg {
  background: linear-gradient(to bottom,rgba(255, 255, 255, 0.99),
  rgba(255, 255, 255, 0.8)), url(../assets/niho.svg);
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
