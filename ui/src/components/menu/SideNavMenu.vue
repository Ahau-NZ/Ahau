<template>
  <v-row ref="sideNav" :class="position" v-scroll="onScroll">
    <v-col cols="12" md="2">
      <v-col align="center" v-if="!mobile" class="pa-2 ml-5" cols="12">
        <v-row cols="12" xs="12" sm="12">
          <v-btn @click="setActive('Profile')" light text style="height: auto;">
            <Avatar :image="profile.avatarImage" :alt="profile.preferredName" :size="this.active.user ? '12vw' : '12vw'" />
          </v-btn>
        </v-row>
      </v-col>
      <v-row :class="mobile ? 'rounded-border' : 'ml-5'" >
        <v-col align="center" :class="mobile ? 'py-0 px-0' : 'py-1'">
          <v-btn @click="setActive('Profile')" light :fab="mobile" text>
            <v-col class="pa-0" :cols="mobile ? '12' : '2'">
              <UserIcon size="medium" :color="active.user ? 'red' : scroll ? 'white' : 'black'"/>
            </v-col>
            <v-col class="py-0" v-if="!mobile && !isOverflowing">
              <span ref="text" :style="active.user ? 'color:#B02425;' : ''" class="ml-2 nav-label subtitle-1">
                Profile
              </span>
            </v-col>
          </v-btn>
        </v-col>
        <v-col :class="mobile ? 'py-0 px-0' : 'py-1'">
          <v-btn @click="setActive('Activity')" light :fab="mobile" text>
            <v-col class="pa-0" :cols="mobile ? '12' : '2'">
              <ActivityIcon size="medium" :color="active.activity ? 'red' : scroll ? 'white' : 'black'"/>
            </v-col>
            <v-col class="py-0" v-if="!mobile && !isOverflowing">
              <span ref="text" :style="active.activity ? 'color:#B02425;' : ''" class="ml-2 nav-label subtitle-1">
                Activity
              </span>
            </v-col>
          </v-btn>
        </v-col>
        <v-col :class="mobile ? 'py-0 px-0' : 'py-1'">
          <v-btn @click="setActive('Archive')" light :fab="mobile" text>
            <v-col class="pa-0" :cols="mobile ? '12' : '2'">
              <ArchiveIcon :size="mobile ? 'large' : 'medium'" :color="active.archive ? 'red' : scroll ? 'white' : 'black'" />
            </v-col>
            <v-col class="py-0" v-if="!mobile && !isOverflowing">
              <span ref="text" :style="active.archive ? 'color:#B02425;' : ''" class="ml-2 nav-label subtitle-1">
                Archive
              </span>
            </v-col>
          </v-btn>
        </v-col>
        <v-col :class="mobile ? 'py-0 px-0' : 'py-1'">
          <v-btn @click="setActive('Timeline')" light :fab="mobile" text>
            <v-col class="pa-0" :cols="mobile ? '12' : '2'">
              <TimelineIcon size="medium" :color="active.timeline ? 'red' : scroll ? 'white' : 'black'"/>
            </v-col>
            <v-col class="py-0" v-if="!mobile && !isOverflowing">
              <span ref="text" :style="active.timeline ? 'color:#B02425;' : ''" class="ml-2 nav-label subtitle-1">
                Timeline
              </span>
            </v-col>
          </v-btn>
        </v-col>
        <v-col :class="mobile ? 'py-0 px-0' : 'py-1'">
          <v-btn @click="setActive('Whakapapa')" light :fab="mobile" text>
            <v-col class="pa-0" :cols="mobile ? '12' : '2'">
              <WhakapapaIcon :size="mobile ? 'large' : 'medium'" :color="active.whakapapa ? 'red' : scroll ? 'white' : 'black'"/>
            </v-col>
            <v-col class="py-0" v-if="!mobile && !isOverflowing">
              <span ref="text" :style="active.whakapapa ? 'color:#B02425;' : ''" class="ml-2 subtitle-1">
                Whakapapa
              </span>
            </v-col>
          </v-btn>
        </v-col>
      </v-row>
    </v-col>
  </v-row>
</template>

<script>

import ArchiveIcon from '@/components/button/ArchiveIcon.vue'
import ActivityIcon from '@/components/button/ActivityIcon.vue'
import WhakapapaIcon from '@/components/button/WhakapapaIcon.vue'
import UserIcon from '@/components/button/UserIcon.vue'
import TimelineIcon from '@/components/button/TimelineIcon.vue'

import Avatar from '@/components/Avatar.vue'

export default {
  name: 'SideNavMenu',
  props: {
    profile: {
      type: Object
    },
    // component: {
    //   type: String,
    //   default: "profile"
    // }
  },
  data () {
    return {
      offset: 0,
      scroll: false, 
      componentLoaded: false,
      active: {
        user: true,
        activity: false,
        archive: false,
        timeline: false,
        whakapapa: false,
      },
    }
  },
  mounted () {
    this.componentLoaded = true
    this.offset = this.$refs.sideNav.offsetTop - 40
  },
  computed: {
    mobile () {
      return this.$vuetify.breakpoint.xs || this.$vuetify.breakpoint.sm
    },
    isOverflowing () {
      if (!this.componentLoaded) return false
      var element = this.$refs.text
      return (element.offsetHeight < element.scrollHeight || element.offsetWidth < element.scrollWidth)
    },
    position () {
      return {
        high: !this.mobile && !this.sticky && this.active.user
      }
    }

  },
  methods : {
    setActive (component) {
      console.log("set active: ", component )
      // set all to false
      this.active.user = false
      this.active.activity = false
      this.active.archive = false
      this.active.timeline = false
      this.active.whakapapa = false

      switch (component) {
        case 'Profile':
          this.active.user = true
          break
        case 'Archive':
          this.active.archive = true
          break
        case 'Timeline':
          this.active.timeline = true
          break
        case 'Activity':
          this.active.activity = true
          break
        case 'Whakapapa':
          this.active.whakapapa = true
          break
      }
      // this.$emit("setPageComponent", component)
    },
    onScroll () {
      var scroll = window.pageYOffset
      var sideNav = this.$refs.sideNav 
      if (!this.mobile) {
        if (scroll > this.offset) {
          sideNav.classList.add("sticky");
          sideNav.classList.remove("high");
        } else {
          sideNav.classList.remove("sticky")
          sideNav.classList.add("high")
        }
      }
    }
  },
  components: {
    ArchiveIcon,
    ActivityIcon,
    WhakapapaIcon,
    UserIcon,
    TimelineIcon,
    Avatar
  }
}
</script>

<style lang="scss" scoped>
  .icon-bar {
    border: 0.5px solid rgba(0, 0, 0, 0.2);
    border-radius: 10px;
  }

  .border {
    border-style: 1px solid lightgrey;
  }

  .side-padding {
    padding-left: 10px;
    padding-right: 10px;
    background-color: white;
  }
  .w {
    height: 80px;
  }
  .rounded-border {
    border: 0.5px solid rgba(0,0,0,0.12);
    border-radius: 10px;
    background-color: white;
    margin-left: 3px;
    margin-right: 3px;
  }
  
  .avatar-desktop {
    margin-top: 7vw;
    margin-left: 1vw
  }

  .sticky {
    position: fixed; /* Allocates space for the element, but moves it with you when you scroll */
    top: 40px
  }

  .high {
    position: absolute;
    top: 150px
  }


</style>
