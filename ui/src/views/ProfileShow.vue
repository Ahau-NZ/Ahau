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
      <v-col cols="12" offset-md="2" md="8" sm="12" :class="!mobile ? 'pl-12' : '' " :align="mobile ? 'center' : 'start'">
        <h1 ref="title" class="primary--text" :style="mobile ? length: ''">{{ currentProfile.legalName ? currentProfile.legalName : currentProfile.preferredName }}</h1>
      </v-col>
      <v-col :order="mobile ? 'first' : 'last'" :align="mobile ? 'end' : 'center'" cols="12" md="2" sm="12"  class="px-5">
        <EditProfileButton @click="setDialog('edit-node')" />
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
    WhakapapaIndex
  },
  data () {
    return {
      prevHeight: 0,
      loaded: false
    }
  },
  mounted () {
    this.setupProfile(this.$route.params.id)
    this.getAllStories()
  },
  computed: {
    ...mapGetters(['currentProfile', 'activeComponent', 'showStory', 'showArtefact']),
    mobile () {
      return this.$vuetify.breakpoint.xs
    },
    length () {
      if (this.currentProfile.legalName) {
        if (this.currentProfile.legalName.length > 30) return 'font-size:6vw'
        if (this.currentProfile.legalName.length > 25) return 'font-size:7vw'
        if (this.currentProfile.legalName.length > 20) return 'font-size:8vw'
        else return 'font-size: 10vw'
      } else return 'font-size: 10vw'
    },
    hideNav () {
      if (this.mobile && this.showStory) return true
      else return false
    }
  },
  watch: {
    // update profile information routing to profileShow with new Id
    '$route.params.id': function (id) {
      this.setProfileById({ id })
    }
  },
  methods: {
    ...mapActions(['getAllStories', 'setProfileById', 'setWhoami', 'setShowArtefact', 'setDialog']),
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
