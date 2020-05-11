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
        <SideNavMenu v-if="!pageComponents.profile" :profile="selectedProfile" @setPageComponent="setPageComponent($event)" :show-avatar="true"/>
      </template>
    </Archive>

    <!-- Timeline Page -->
    <Timeline v-if="pageComponents.timeline" :profile="selectedProfile">
      <template v-slot:nav>
        <SideNavMenu v-if="!pageComponents.profile" :profile="selectedProfile" @setPageComponent="setPageComponent($event)" :show-avatar="true"/>
      </template>
    </Timeline>

    <DialogHandler
      :dialog.sync="dialog.active"
      :selectedProfile="selectedProfile"
      @setupProfile="setupProfile($event)"
    />
  </div>
</template>

<script>
import DialogHandler from '@/components/dialog/DialogHandler.vue'
import SideNavMenu from '@/components/menu/SideNavMenu.vue'
import Profile from '@/components/Profile'
import Archive from '@/components/archive/Archive'
import Timeline from '@/components/story/Timeline.vue'

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
  timeline: false
}

export default {
  name: 'ProfileShow',
  // props: ['selectedProfile'],
  components: {
    DialogHandler,
    SideNavMenu,
    Profile,
    Archive,
    Timeline
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
        timeline: false
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
      this.pageComponents.timeline = false

      this.header = false
      this.bigAvatar = false
      console.log(component)

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
          this.pageComponents.timeline = true
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
<style lang="scss">
.wrapper {
  color: black;
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
.top-padding {
  margin-top: 64px;
}
</style>
