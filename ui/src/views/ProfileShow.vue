<template>
  <div class="wrapper">
    <!-- Header for Profile page only -->
    <Header v-if="header" :preferredName="selectedProfile.preferredName"
      :headerImage="selectedProfile.headerImage" :avatarImage="selectedProfile.avatarImage" :headerHeight="headerHeight" />

    <v-container :fluid="true" class="body-width white px-6 niho-bg">

      <v-row :justify="mobile ? 'center' : 'start'">
        <h1 class="primary--text" :style="[ mobile ? { marginTop: '120px' } : { marginLeft: '210px' }]">{{ selectedProfile.legalName }}</h1>
      </v-row>
      <v-row class="content-top-margin">
        <v-col cols="12" xs="12" sm="2" md="2">
          <SideNavMenu :profile="selectedProfile" />
        </v-col>
        <v-col cols="12" sx="12" sm="8" md="8">
          <Profile :profile="selectedProfile"/>
        </v-col>
        <v-col cols="12" sx="12" sm="2" md="2" :class="mobile ? 'pl-0 pr-0' : ''">
          <Kaitiaki
            title="Kaitiaki"
            subtitle="These are the people who have administrative rights on this profile"
            :profiles="selectedProfile.tiaki"
          />
          <Kaitiaki
            class="mt-3"
            title="Communities"
            subtitle="These are the communities connected to this profile"
            :profiles="selectedProfile.tiaki"
          />
        </v-col>
      </v-row>
      <!-- <v-row>
        <v-col v-if="mobile" cols="12">
          <v-row justify="center">
            <v-col>
              <div v-if="bigAvatar" style="margin-top: 100px;">
                
                <SideNavMenu :profile:="selectedProfile" :noAvatar="true"
                  @setPageComponent="setPageComponent($event)"/>
              </div>
              <SideNavMenu v-else :profile="selectedProfile" @setPageComponent="setPageComponent($event)"/>
            </v-col>
          </v-row>
        </v-col>

        <v-col v-else cols="2">
          <v-row justify="center">
            <SideNavMenu v-if="bigAvatar" :profile:="selectedProfile" :noAvatar="true"
              @setPageComponent="setPageComponent($event)"  style="margin-top: 100px;"/>
            <SideNavMenu v-else :profile="selectedProfile" @setPageComponent="setPageComponent($event)" />
          </v-row>
        </v-col>

        <v-col>
          <Profile v-if="pageComponents.profile"
            :profile="selectedProfile"
            :type="'person'"
            @setDialog="setDialog($event)"
            @setupProfile="setupProfile($event)"
          />
          <Archive v-if="pageComponents.archive" :profile="selectedProfile" :type="'person'"/>
          <StoryTimeline v-if="pageComponents.storyTimeline" :profile="selectedProfile"/>
        </v-col>

      </v-row> -->
    </v-container>

    <DialogHandler
      :dialog.sync="dialog.active"
      :selectedProfile="selectedProfile"
      @setupProfile="setupProfile($event)"
    />
  </div>
</template>

<script>
import DialogHandler from '@/components/dialog/DialogHandler.vue'
import Header from '@/components/profile/Header.vue'
import Avatar from '@/components/Avatar.vue'
import SideNavMenu from '@/components/SideNavMenu.vue'
import Profile from '@/components/Profile'
import Archive from '@/components/Archive'
import StoryTimeline from '@/views/StoryShow'
import Kaitiaki from '@/components/profile/Kaitiaki.vue'

import ProfileInfoCard from '@/components/profile/ProfileInfoCard'

import {
  getProfile
} from '@/lib/profile-helpers'
// import {
//   mapActions,
//   mapGetters
// } from 'vuex'

const NULL_PAGE_COMPONENTS = {
  profile: false,
  archive: false,
  storyTimeline: false
}

export default {
  name: 'ProfileShow',
  props: ['selectedProfile'],
  components: {
    DialogHandler,
    Header,
    Avatar,
    SideNavMenu,
    Profile,
    Archive,
    StoryTimeline,
    ProfileInfoCard,
    Kaitiaki
  },
  data () {
    return {
      dialog: {
        active: null,
        type: null
      },
      pageComponents: {
        profile: true,
        archive: false,
        storyTimeline: false
      },
      header: true,
      bigAvatar: true
    }
  },
  mounted () {
    if (this.$route) {
      this.setupProfile(this.$route.params.id)
    }
  },
  computed: {
    // ...mapGetters(['selectedProfile', 'whoami']),
    mobile () {
      return this.$vuetify.breakpoint.xs
    },
    headerHeight () {
      switch (this.$vuetify.breakpoint.name) {
        case 'xs': return '150px'
        case 'sm': return '150px'
        case 'md': return '250px'
        case 'lg': return '250px'
        case 'xl': return '250px'
        default:
          return '250px'
      }
    }
  },
  methods: {
    // ...mapActions(['setProfileById', 'setProfile', 'setWhoami',]),
    setDialog (dialog) {
      this.dialog.active = dialog
    },
    setPageComponent (component) {
      // set all to false
      this.pageComponents.profile = false
      this.pageComponents.archive = false
      this.pageComponents.storyTimeline = false

      this.header = false
      this.bigAvatar = false

      switch (component) {
        case 'profile':
          this.header = true
          this.bigAvatar = true
          this.pageComponents.profile = true
          break
        case 'archive':
          this.pageComponents.archive = true
          break
        case 'storyTimeline':
          this.pageComponents.storyTimeline = true
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
      this.dialog.type = dialogObj.type
      this.dialog.active = dialogObj.dialog
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">

  $avatarSize: 25vh;
  $ratio: 5.33333;
  $headerHeight: 100vw / $ratio;
  $maxHeaderWidth: 1400px;
  $formWidth: 600px;

  * {
    color: black;
  }

  .border {
    border-style: 1px solid lightgrey;
  }

  .wrapper {
    display: flex;
    flex-direction: column;
    align-items: center; // background: linear-gradient(to right, grey 0%,grey 50%,#000000 50%,white 50%,white 100%);

    .body-width {
      /* min-width: $formWidth; */
      max-width: 100vw;
      min-height: 100vh;
      background: white;
    }

    .niho-bg {
      background: linear-gradient(rgba(255, 255, 255, 0.7),
          rgba(255, 255, 255, 0.7)), url(../assets/niho.svg);
      background-position-x: 800px;
      background-attachment: fixed;
      background-repeat: no-repeat;

    }

    .avatar-row {
      position: relative;
      width: 100%;
      /* height: 20%; */
      margin: auto;

      .avatar-box {
        position: absolute;
        /* left: calc(-100vw / 3 + 3 * #{$avatarSize}); */
        top: -$avatarSize/1.5;
        width: 100%;
      }
    }
  }

.desktopContainer {
  margin-top: 64px;
  border: 3px solid red;
}

.mobileContainer {
  padding: 0px;
}

.content-top-margin {
  margin-top: 5vw;
}
</style>
