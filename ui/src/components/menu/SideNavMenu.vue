<template>
  <v-row ref="sideNav" class="sideNav" :class="position" v-scroll="onScroll">
    <v-col :class="nonMember ? 'px-3 pt-3' : mobile ? 'px-6': tablet ? 'pt-12':''">
      <v-row
        justify-center
        v-if="!mobile"
        :class="tablet ? 'pa-2 pt-5 ml-6':'pa-2 ml-12'"
        cols="12"
      >
          <v-btn
            :class="tablet ? 'pl-2':''"
            @click="setActive('profile')"
            light
            text
            style="height: auto;"
          >
            <Avatar
              :image="profile.avatarImage"
              :gender="profile.gender"
              :aliveInterval="profile.aliveInterval"
              :alt="profile.preferredName"
              :size="tablet ? '110px':'170px'"
              :isView="isView"
            />
          </v-btn>
      </v-row>
      <RegisterButton v-if="nonMember" :text="buttonText" @click="$emit('new-registration')" />
      <v-row v-else :class="mobile ? 'rounded-border box-shadow' : tablet ? 'ml-10' : 'ml-12 px-4'">
        <v-col cols="3" md="12" v-if="showWhakapapa" :class="mobile ? 'py-0 px-0' : tablet ? 'py-4 px-0' : 'py-1'">
          <v-btn @click="setActive('profile')" light :fab="mobile" text>
            <v-col class="pa-0" :cols="mobile ? '12' : '2'">
              <Avatar
                v-if="mobile && activeComponent !=='profile'"
                :image="profile.avatarImage"
                :gender="profile.gender"
                size="40px"
                :isView="isView"
              />
              <UserIcon
                v-else
                :size="tablet ? 'x-large':'medium'"
                :color="activeComponent === 'profile' ? 'red' : 'black'"
              />
            </v-col>
            <v-col class="py-0" v-if="!mobile && !isOverflowing">
              <span
                ref="text"
                :style="activeComponent === 'profile' ? 'color:#B02425;' : ''"
                class="ml-2 nav-label subtitle-1"
              >{{ t('profile')}}</span>
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
        </v-col>-->
        <v-col cols="3" md="12" :class="mobile ? 'py-0 px-0' : tablet ? 'py-4 px-0' : 'py-1'">
          <v-btn @click="goArchive()" light :fab="mobile" text>
            <v-col class="pa-0" :cols="mobile ? '12' : '2'">
              <ArchiveIcon
                :size="mobile ? 'large' : tablet ? 'x-large' : 'medium'"
                :color="activeComponent === 'archive' ? 'red' : 'black'"
              />
            </v-col>
            <v-col class="py-0" v-if="!mobile && !isOverflowing">
              <span
                ref="text"
                :style="activeComponent === 'archive' ? 'color:#B02425;' : ''"
                class="ml-2 nav-label subtitle-1"
              >{{ t('archive') }}</span>
            </v-col>
          </v-btn>
        </v-col>
        <v-col cols="3" md="12" :class="mobile ? 'py-0 px-0' : tablet ? 'py-4 px-0' : 'py-1'">
          <!-- TODO: connect timeline -->
          <v-btn @click="setActive('timeline')" light :fab="mobile" text>
          <!-- <v-btn @click="setDialog('coming-soon')" light :fab="mobile" text> -->
            <v-col class="pa-0" :cols="mobile ? '12' : '2'">
              <TimelineIcon
                :size="tablet ? 'x-large' : 'medium'"
                :color="activeComponent === 'timeline' ? 'red' : 'black'"
              />
            </v-col>
            <v-col class="py-0" v-if="!mobile && !isOverflowing">
              <span
                ref="text"
                :style="activeComponent === 'timeline' ? 'color:#B02425;' : 'black'"
                class="ml-2 nav-label subtitle-1"
              >{{ t('timeline')}}</span>
            </v-col>
          </v-btn>
        </v-col>
        <v-col cols="3" md="12" v-if="showWhakapapa" :class="mobile ? 'py-0 px-0' : tablet ? 'py-4 px-0' : 'py-1'">
          <v-btn @click="setActive('whakapapa')" light :fab="mobile" text>
            <v-col class="pa-0" :cols="mobile ? '12' : '2'">
              <WhakapapaIcon
                :size="mobile ? 'large' : tablet ? 'x-large' : 'medium'"
                :color="activeComponent === 'whakapapa' ? 'red' : 'black'"
              />
            </v-col>
            <v-col class="py-0" v-if="!mobile && !isOverflowing">
              <span
                ref="text"
                :style="activeComponent === 'whakapapa' ? 'color:#B02425;' : 'black'"
                class="ml-2 subtitle-1"
              >{{ t('whakapapa') }}</span>
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
import RegisterButton from '@/components/button/RegisterButton.vue'

import Avatar from '@/components/Avatar.vue'
import { mapGetters, mapActions } from 'vuex'

export default {
  name: 'SideNavMenu',
  props: {
    profile: {
      type: Object
    },
    community: {
      type: Boolean,
      default: false
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
  watch: {
    '$route.name' (name) {
      var route = name.split('/')
      if (route[1] === 'profile' && this.mobile) this.offset = 260
      else if (route[1] === 'profile') this.offset = 135
    }
  },
  computed: {
    ...mapGetters(['showStory', 'storeDialog', 'notifications', 'whoami']),
    isView() {
      return this.profile.type === 'community' && !this.profile.avatarImage
    },      
    activeComponent () {
      if (this.$route.name === 'whakapapa/:whakapapaId') return 'whakapapa'
      return this.$route.name.split('/')[1]
    },
    showWhakapapa () {
      if (this.profile.type === 'community') return true
      else if (this.profile.id === this.whoami.personal.profile.id) return true
      else return false
    },
    nonMember () {
      return (
        this.profile.type === 'community' &&
        !this.profile.recps
      )
    },
    buttonText () {
      const notifications = this.notifications.filter(application => application.group.id === this.profile.id)

      // means the notification was sent
      if (notifications.length > 0) {
        if (notifications.some(n => n.isPersonal && n.isNew)) return 'Request Sent'
        else if (notifications.some(n => n.isPersonal && !n.isAccepted && !n.isNew)) return 'Request Declined'
      }

      return 'Join Community'
    },
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
  methods: {
    ...mapActions(['toggleShowStory', 'setDialog']),
    goArchive () {
      if (this.showStory) {
        this.toggleShowStory()
        this.setDialog(null)
      } else this.setActive('archive')
    },
    setActive (component) {
      if (this.showStory) this.toggleShowStory()
      this.$router.push({
        name: this.profile.type + '/' + component,
        params: {
          tribeId: this.$route.params.tribeId,
          profileId: this.$route.params.profileId
        }
      }).catch(() => {})
    },
    onScroll () {
      this.scroll = window.pageYOffset
      var sideNav = this.$refs.sideNav

      // TODO tidy this up by making methods?
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
    },
    t (key, vars) {
      return this.$t('sideNav.' + key, vars)
    }
  },
  components: {
    ArchiveIcon,
    // ActivityIcon,
    WhakapapaIcon,
    UserIcon,
    TimelineIcon,
    Avatar,
    RegisterButton
  }
}
</script>

<style lang="scss" scoped>
.icon-bar {
  border: 0.5px solid rgba(0, 0, 0, 0.3);
  border-radius: 10px;
}

.border {
  border-style: 0.5px solid rgba(0, 0, 0, 0.3);
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
  border: 0.5px solid rgba(0, 0, 0, 0.3);
  border-radius: 10px;
  background-color: white;
}

.sideNav {
  transition: top 0.2s ease;
}

.sticky {
  position: fixed; /* Allocates space for the element, but moves it with you when you scroll */
  top: 50px;
}

.user {
  position: absolute;
  top: 185px;
}

.userMobile {
  position: absolute;
  top: 310px;
  width: 101.5%;
}
.archiveMobile {
  position: absolute;
  top: 0px;
  width: 101.5%;
}
.stickyMobile {
  position: fixed; /* Allocates space for the element, but moves it with you when you scroll */
  top: 50px;
  width: 101.5%;
  z-index: 3;
  background: linear-gradient(
    rgba(255, 255, 255, 0.9),
    rgba(255, 255, 255, 0.02)
  );
.box-shadow {
   box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)
}}

.hideStickyMobile {
  position: fixed; /* Allocates space for the element, but moves it with you when you scroll */
  width: 102%;
  z-index: 1;
  top: -50px;
}

.v-btn::before {
  opacity: 0 !important;
}

</style>
