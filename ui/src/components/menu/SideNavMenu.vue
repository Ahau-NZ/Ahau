<template>
  <v-row ref="sideNav" class="sideNav" :class="position"  v-scroll="onScroll">
    <v-col cols="12" md="2" :class="mobile ? 'px-6': tablet ? 'pt-12':''">
      <v-col align="center" v-if="!mobile" class="pa-2 ml-8" cols="12">
        <v-row cols="12" xs="12" sm="12">
          <v-btn :class="tablet ? 'pl-2':''" @click="setActive('profile')" light text style="height: auto;">
            <Avatar :image="profile.avatarImage" :gender="profile.gender" :alt="profile.preferredName" :size="tablet ? '110px':'170px'" :isView="profile.type === 'community'" />
          </v-btn>
        </v-row>
      </v-col>
      <v-row :class="mobile ? 'rounded-border' : 'ml-8'" >
        <v-col align="center" :class="mobile ? 'py-0 px-0' : tablet ? 'py-4 px-0' : 'py-1'">
          <v-btn @click="setActive('profile')" light :fab="mobile" text>
            <v-col class="pa-0" :cols="mobile ? '12' : '2'">
              <Avatar v-if="mobile && activeComponent !=='profile'" :image="profile.avatarImage" size="40px"/>
              <UserIcon v-else :size="tablet ? 'x-large':'medium'" :color="activeComponent === 'profile' ? 'red' : 'black'"/>
            </v-col>
            <v-col class="py-0" v-if="!mobile && !isOverflowing">
              <span ref="text" :style="activeComponent === 'profile' ? 'color:#B02425;' : ''" class="ml-2 nav-label subtitle-1">
                Profile
              </span>
            </v-col>
          </v-btn>
        </v-col>
        <!-- <v-col :class="mobile ? 'py-0 px-0' : 'py-1'">
          <v-btn @click="setActive('Activity')" light :fab="mobile" text>
            <v-col class="pa-0" :cols="mobile ? '12' : '2'">
              <ActivityIcon size="medium" :color="activeComponent === 'activity' ? 'red' : 'black'"/>
            </v-col>
            <v-col class="py-0" v-if="!mobile && !isOverflowing">
              <span ref="text" :style="activeComponent === 'activity' ? 'color:#B02425;' : ''" class="ml-2 nav-label subtitle-1">
                Activity
              </span>
            </v-col>
          </v-btn>
        </v-col> -->
        <v-col :class="mobile ? 'py-0 px-0' : tablet ? 'py-4 px-0' : 'py-1'">
          <v-btn @click="goArchive()" light :fab="mobile" text>
            <v-col class="pa-0" :cols="mobile ? '12' : '2'">
              <ArchiveIcon v-if="!showStory" :size="mobile ? 'large' : tablet ? 'x-large' : 'medium'" :color="activeComponent === 'archive' ? 'red' : 'black'" />
              <v-icon v-else color="#B02425">mdi-arrow-left</v-icon>
            </v-col>
            <v-col class="py-0" v-if="!mobile && !isOverflowing">
              <span ref="text" :style="activeComponent === 'archive' ? 'color:#B02425;' : ''" class="ml-2 nav-label subtitle-1">
                Archive
              </span>
            </v-col>
          </v-btn>
        </v-col>
        <v-col :class="mobile ? 'py-0 px-0' : tablet ? 'py-4 px-0' : 'py-1'">
          <!-- TODO: connect timeline -->
          <!-- <v-btn @click="setActive('timeline')" light :fab="mobile" text> -->
          <v-btn @click="setDialog('coming-soon')" light :fab="mobile" text>
            <v-col class="pa-0" :cols="mobile ? '12' : '2'">
              <TimelineIcon :size="tablet ? 'x-large' : 'medium'" :color="activeComponent === 'timeline' ? 'red' : 'disabled'"/>
            </v-col>
            <v-col class="py-0" v-if="!mobile && !isOverflowing">
              <span ref="text" :style="activeComponent === 'timeline' ? 'color:#B02425;' : 'black'" class="ml-2 nav-label subtitle-1">
                Timeline
              </span>
            </v-col>
          </v-btn>
        </v-col>
        <v-col :class="mobile ? 'py-0 px-0' : tablet ? 'py-4 px-0' : 'py-1'">
          <!-- TODO: connect whakapapa -->
          <v-btn @click="setActive('whakapapa')" light :fab="mobile" text>
          <!-- <v-btn @click="setDialog('coming-soon')" light :fab="mobile" text> -->
            <v-col class="pa-0" :cols="mobile ? '12' : '2'">
              <WhakapapaIcon :size="mobile ? 'large' : tablet ? 'x-large' : 'medium'" :color="activeComponent === 'whakapapa' ? 'red' : 'black'"/>
            </v-col>
            <v-col class="py-0" v-if="!mobile && !isOverflowing">
              <span ref="text" :style="activeComponent === 'whakapapa' ? 'color:#B02425;' : 'black'" class="ml-2 subtitle-1">
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
// import ActivityIcon from '@/components/button/ActivityIcon.vue'
import WhakapapaIcon from '@/components/button/WhakapapaIcon.vue'
import UserIcon from '@/components/button/UserIcon.vue'
import TimelineIcon from '@/components/button/TimelineIcon.vue'

import Avatar from '@/components/Avatar.vue'
import { mapGetters, mapActions } from 'vuex'

export default {
  name: 'SideNavMenu',
  props: {
    profile: {
      type: Object
    }
  },
  data () {
    return {
      offset: 0,
      componentLoaded: false,
      stickyMobile: false,
      prevScroll: 0,
      scroll: 0,
      storyPosition: null
    }
  },
  mounted () {
    this.componentLoaded = true
    this.offset = this.$refs.sideNav.offsetTop - 50
  },
  computed: {
    ...mapGetters(['activeComponent', 'showStory', 'storeDialog']),
    mobile () {
      return this.$vuetify.breakpoint.xs || this.$vuetify.breakpoint.sm
    },
    tablet () {
      return this.$vuetify.breakpoint.md
    },
    isOverflowing () {
      if (!this.componentLoaded) return false
      else if (this.tablet) return true
      return false
    },
    position () {
      return {
        user: !this.mobile && this.activeComponent === 'profile',
        sticky: !this.mobile && this.activeComponent !== 'profile',
        userMobile: this.mobile && this.activeComponent === 'profile',
        archiveMobile: this.mobile && this.activeComponent !== 'profile',
        sideNav: this.activeComponent !== 'profile'
      }
    }
  },
  watch: {
    activeComponent (newVal) {
      if (newVal === 'profile' && this.mobile) this.offset = 290
      else if (newVal === 'profile') this.offset = 100
    }
  },
  methods: {
    ...mapActions(['setComponent', 'setShowStory', 'setDialog']),
    goProfile () {
      this.setActive('profile')
      this.$router.push({ name: 'profileShow', params: { id: this.profile.id } })
    },
    goArchive () {
      if (this.showStory) {
        this.setShowStory()
        this.setDialog(null)
      } else this.setActive('archive')
    },
    setActive (component) {
      if (this.showStory) this.setShowStory()
      // if (this.storeDialog) this.setDialog(null)
      this.setComponent(component)
      window.scrollTo(0, 0)
    },
    onScroll () {
      this.scroll = window.pageYOffset
      var sideNav = this.$refs.sideNav
      if (!this.mobile && this.activeComponent === 'profile') {
        if (this.scroll > this.offset) {
          sideNav.classList.add('sticky')
          sideNav.classList.remove('user')
          sideNav.classList.remove('sideNav')
        } else {
          sideNav.classList.remove('sticky')
          sideNav.classList.add('user')
        }
      } else if (this.mobile && this.activeComponent === 'profile') {
        if (this.scroll > this.offset + 100) {
          sideNav.classList.remove('userMobile')
          sideNav.classList.remove('sideNav')
          sideNav.classList.add('hideStickyMobile')
          if (this.scroll < this.prevScroll) {
            sideNav.classList.remove('hideStickyMobile')
            sideNav.classList.add('stickyMobile')
            sideNav.classList.add('sideNav')
          }
        } else if (this.scroll < this.offset + 50) {
          sideNav.classList.remove('hideStickyMobile')
          sideNav.classList.remove('stickyMobile')
          sideNav.classList.remove('sideNav')
          sideNav.classList.add('userMobile')
        }
      } else if (this.mobile && this.activeComponent !== 'profile') {
        if (this.scroll > 60) {
          sideNav.classList.remove('archiveMobile')
          sideNav.classList.add('hideStickyMobile')
          sideNav.classList.remove('sideNav')
          if (this.scroll < this.prevScroll) {
            sideNav.classList.remove('hideStickyMobile')
            sideNav.classList.add('stickyMobile')
            sideNav.classList.add('sideNav')
          }
        } else if (this.scroll < 8) {
          sideNav.classList.remove('stickyMobile')
          sideNav.classList.add('archiveMobile')
          sideNav.classList.remove('sideNav')
        }
      }
      this.prevScroll = this.scroll
    }
  },
  components: {
    ArchiveIcon,
    // ActivityIcon,
    WhakapapaIcon,
    UserIcon,
    TimelineIcon,
    Avatar
  }
}
</script>

<style lang="scss" scoped>
  .icon-bar {
    border: 0.5px solid rgba(0, 0, 0, 0.3);
    border-radius: 10px;
  }

  .border {
    border-style: 0.5px solid rgba(0,0,0,0.3);
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
    border: 0.5px solid rgba(0,0,0,0.3);
    border-radius: 10px;
    background-color: white ;
  }

  .sideNav {
    transition: top 0.2s ease;
  }

  .sticky {
    position: fixed; /* Allocates space for the element, but moves it with you when you scroll */
    top: 50px
  }

  .user {
    position: absolute;
    top: 150px
  }

  .userMobile {
    position: absolute;
    top: 330px;
    width: 101.5%;
  }
  .archiveMobile {
    position: absolute;
    top: 0px;
    width: 101.5%
  }
  .stickyMobile {
    position: fixed; /* Allocates space for the element, but moves it with you when you scroll */
    top: 50px;
    width: 101.5%;
    z-index: 1;
    background: linear-gradient(rgba(255, 255, 255, 0.9),rgba(255, 255, 255, 0.02) );
  }

  .hideStickyMobile {
    position: fixed; /* Allocates space for the element, but moves it with you when you scroll */
    width: 102%;
    z-index: 1;
    top : -50px
  }

  .v-btn::before {
  opacity: 0 !important;
  }

</style>
