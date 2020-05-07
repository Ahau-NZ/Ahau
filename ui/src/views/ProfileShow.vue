<template>
  <div>
    <!-- Profile Page -->
    <Profile v-if="pageComponents.profile" :profile="selectedProfile" :setupProfile="setupProfile">
      <template v-slot:nav>
        <SideNavMenu :profile="selectedProfile" @setPageComponent="setPageComponent($event)"/>
      </template>
    </Profile>

    <!-- Archive Page -->
    <Archive v-if="pageComponents.archive" :profile="{...selectedProfile, type: 'person'}">
      <template v-slot:nav>
        <SideNavMenu :profile="selectedProfile" @setPageComponent="setPageComponent($event)" :show-avatar="true" />
      </template>
    </Archive>

    <!-- Timeline Page -->
    <StoryTimeline v-if="pageComponents.storyTimeline" :profile="selectedProfile"/>

    <DialogHandler
      :dialog.sync="dialog.active"
      :selectedProfile="selectedProfile"
      @setupProfile="setupProfile($event)"
    />
  </div>
</template>

<script>
import DialogHandler from '@/components/dialog/DialogHandler.vue'
import SideNavMenu from '@/components/SideNavMenu.vue'
import Profile from '@/components/Profile'
import Archive from '@/components/Archive'
import StoryTimeline from '@/views/StoryShow'

import {
  getProfile
} from '@/lib/profile-helpers'
import {
  mapActions,
  mapGetters
} from 'vuex'

const NULL_PAGE_COMPONENTS = {
  profile: false,
  archive: false,
  storyTimeline: false
}

export default {
  name: 'ProfileShow',
  // props: ['selectedProfile'],
  components: {
    DialogHandler,
    SideNavMenu,
    Profile,
    Archive,
    StoryTimeline
  },
  data () {
    return {
      loaded: false,
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
        case 'Profile':
          this.header = true
          this.bigAvatar = true
          this.pageComponents.profile = true
          break
        case 'Archive':
          this.pageComponents.archive = true
          break
        case 'Timeline':
          this.pageComponents.storyTimeline = true
          break
        default:
          this.pageComponents.profile = true
      }
    },
    async setupProfile (id) {
      this.setProfileById(id)
      if (this.dialog.active) this.dialog.active = null
      // if (id === this.whoami.profile.id) await this.setWhoami()
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
.content-top-margin {
  margin-top: 5vw;
}

.wrapper {
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
}
</style>
