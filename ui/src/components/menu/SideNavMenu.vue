<template>
  <v-row ref="sideNav" class="sideNav" :class="position" v-scroll="onScroll">
    <v-col :class="nonMember ? 'px-3 pt-3' : mobile ? 'px-6': tablet ? 'pt-12':''">
      <v-row
        v-if="!mobile"
        justify-center
        :class="tablet ? 'pa-2 pt-5 ml-6':'pa-2 ml-12'"
        cols="12"
      >
        <v-btn
          :class="tablet ? 'pl-2':''"
          @click="setActive(PROFILE)"
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

      <!-- if not member register -->
      <RegisterButton v-if="nonMember" :text="buttonText" @click="$emit('new-registration')" />

      <!-- else, show buttons (profile/ archive/ whakapapa/ personIndex/ credentials) -->
      <v-row v-else justify="space-around" :class="customClass">
        <v-col v-if="showWhakapapa" cols="auto" md="12" :class="mobile ? 'py-0 px-0' : tablet ? 'py-4 px-0' : 'py-1'">
          <v-btn @click="setActive(PROFILE)" light :fab="mobile" text>
            <v-col class="pa-0" :cols="mobile ? '12' : '2'">
              <Avatar
                v-if="mobile && activeComponent !== PROFILE"
                :image="profile.avatarImage"
                :gender="profile.gender"
                size="40px"
                :isView="isView"
              />
              <UserIcon
                v-else
                :size="tablet ? 'x-large':'medium'"
                :color="activeComponent === PROFILE ? 'red' : 'black'"
              />
            </v-col>
            <v-col class="py-0" v-if="!mobile && !isOverflowing">
              <span
                ref="text"
                :style="activeComponent === PROFILE? 'color:#B02425;' : ''"
                class="ml-2 nav-label subtitle-1"
              >{{ t(PROFILE)}}</span>
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
        <v-col v-if="isPersonalTribe || settings.allowStories" cols="auto" md="12" :class="mobile ? 'py-0 px-0' : tablet ? 'py-4 px-0' : 'py-1'">
          <v-btn @click="goArchive()" light :fab="mobile" text>
            <v-col class="pa-0" :cols="mobile ? '12' : '2'">
              <ArchiveIcon
                :size="mobile ? 'large' : tablet ? 'x-large' : 'medium'"
                :color="activeComponent === ARCHIVE || activeComponent === 'collection' ? 'red' : 'black'"
              />
            </v-col>
            <v-col class="py-0" v-if="!mobile && !isOverflowing">
              <span
                ref="text"
                :style="activeComponent === ARCHIVE || activeComponent === 'collection' ? 'color:#B02425;' : ''"
                class="ml-2 nav-label subtitle-1"
              >{{ t(ARCHIVE ) }}</span>
            </v-col>
          </v-btn>
        </v-col>
        <v-col v-if="showWhakapapa && (isPersonalTribe || settings.allowWhakapapaViews)" cols="auto" md="12" :class="mobile ? 'py-0 px-0' : tablet ? 'py-4 px-0' : 'py-1'">
          <v-btn @click="setActive(WHAKAPAPA)" light :fab="mobile" text>
            <v-col class="pa-0" :cols="mobile ? '12' : '2'">
              <WhakapapaIcon
                :size="mobile ? 'large' : tablet ? 'x-large' : 'medium'"
                :color="activeComponent === WHAKAPAPA? 'red' : 'black'"
              />
            </v-col>
            <v-col class="py-0" v-if="!mobile && !isOverflowing">
              <span
                ref="text"
                :style="activeComponent === WHAKAPAPA? 'color:#B02425;' : 'black'"
                class="ml-2 subtitle-1"
              >{{ t(WHAKAPAPA) }}</span>
            </v-col>
          </v-btn>
        </v-col>
        <v-col v-if="showPeopleList && (isPersonalTribe || settings.allowPersonsList)" cols="auto" md="12" :class="mobile ? 'py-0 px-0' : tablet ? 'py-4 px-0' : 'py-1'">
          <v-btn @click="setActive(PERSON)" light :fab="mobile" text>
            <v-col class="pa-0" :cols="mobile ? '12' : '2'">
              <PersonListIcon
                :size="mobile ? 'large' : tablet ? 'x-large' : 'medium'"
                :color="activeComponent === PERSON? '#B02425' : 'black'"
              />
            </v-col>
            <v-col class="py-0" v-if="!mobile && !isOverflowing">
              <span
                ref="text"
                :style="$route.name === 'personIndex' ? 'color:#B02425;' : 'black'"
                class="ml-2 subtitle-1"
              >{{ t(PERSON) }}</span>
            </v-col>
          </v-btn>
        </v-col>
        <v-col v-if="showCredentials" cols="auto" md="12" :class="mobile ? 'py-0 px-0' : tablet ? 'py-4 px-0' : 'py-1'">
          <v-btn @click="setActive(WALLET)" light :fab="mobile" text>
            <v-col class="pa-0" :cols="mobile ? '12' : '2'">
              <WalletIcon
                :size="mobile ? 'large' : tablet ? 'x-large' : 'medium'"
                :color="activeComponent === PERSON? '#B02425' : 'black'"
              />
            </v-col>
            <v-col class="py-0" v-if="!mobile && !isOverflowing">
              <span
                ref="text"
                :style="$route.name === 'personIndex' ? 'color:#B02425;' : 'black'"
                class="ml-2 subtitle-1"
              >{{ t(WALLET) }}</span>
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
import PersonListIcon from '@/components/button/PersonListIcon.vue'
import UserIcon from '@/components/button/UserIcon.vue'
import RegisterButton from '@/components/button/RegisterButton.vue'

import Avatar from '@/components/Avatar.vue'
import { mapGetters, mapActions } from 'vuex'

const PROFILE = 'profile'
const ARCHIVE = 'archive'
const WHAKAPAPA = 'whakapapa'
const PERSON = 'person'
const WALLET = 'wallet'

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
  components: {
    ArchiveIcon,
    // ActivityIcon,
    WhakapapaIcon,
    PersonListIcon,
    UserIcon,
    Avatar,
    RegisterButton
  },
  data () {
    return {
      // magic strings
      PROFILE,
      ARCHIVE,
      WHAKAPAPA,
      PERSON,
      WALLET,

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
    this.getAllCredentials()
  },
  watch: {
    '$route.name' (name) {
      const route = name.split('/')
      if (route[1] === 'profile' && this.mobile) this.offset = 260
      else if (route[1] === 'profile') this.offset = 135
    }
  },
  computed: {
    ...mapGetters('notifications', ['notifications']),
    ...mapGetters(['storeDialog', 'whoami']),
    ...mapGetters('archive', ['showStory']),
    ...mapGetters('tribe', ['tribeSettings', 'isPersonalTribe']),
    ...mapGetters('credentials', ['credentials']),
    customClass () {
      return {
        'rounded-border box-shadow': this.mobile,
        'ml-10': this.tablet,
        'ml-12 px-4': !this.mobile && !this.tablet
      }
    },
    showCredentials () {
      return this.isPersonalTribe && this.credentials.length
    },
    settings () {
      if (this.tribeSettings) return this.tribeSettings
      return {}
    },
    isCommunity () {
      return this.profile.type === 'community'
    },
    isView () {
      return this.isCommunity && !this.profile.avatarImage
    },
    activeComponent () {
      if (this.$route.name === 'whakapapa/:whakapapaId') return WHAKAPAPA
      if (this.$route.name === 'personIndex') return PERSON

      return this.$route.name.split('/')[1]
    },
    showWhakapapa () {
      if (this.isCommunity) return true
      else if (this.isPersonalTribe) return true
      else return false
    },
    showPeopleList () {
      if (!this.profile) return false
      if (!Array.isArray(this.profile.kaitiaki)) return false

      return this.profile.kaitiaki.some(k => k.feedId === this.whoami.public.feedId)
    },
    nonMember () {
      return (
        this.isCommunity &&
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

      return 'Join Tribe'
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
        user: !this.mobile && this.activeComponent === PROFILE,
        sticky: !this.mobile && this.activeComponent !== PROFILE,
        userMobile: this.mobile && this.activeComponent === PROFILE,
        archiveMobile: this.mobile && this.activeComponent !== PROFILE,
        sideNav: this.activeComponent !== PROFILE
      }
    }
  },
  methods: {
    ...mapActions(['setDialog', 'setNavComponent']),
    ...mapActions('archive', ['toggleShowStory']),
    ...mapActions('credentials', ['getAllCredentials']),
    goArchive () {
      if (this.showStory) {
        this.toggleShowStory()
        this.setDialog(null)
      } else this.setActive(ARCHIVE)
    },
    setActive (component) {
      if (this.showStory) this.toggleShowStory()
      this.setNavComponent(component)

      const type = this.isCommunity ? 'community' : 'person'

      this.$router.push({
        name: component === this.PERSON ? 'personIndex' : (type + '/' + component),
        params: {
          tribeId: this.$route.params.tribeId,
          profileId: this.$route.params.profileId
        }
      }).catch(() => {})
    },
    onScroll (e) {
      this.scroll = window.pageYOffset
      const sideNav = this.$refs.sideNav
      // TODO tidy this up by making methods?
      if (!this.mobile && this.activeComponent === PROFILE) {
        if (this.scroll > this.offset) {
          sideNav.classList.add('sticky')
          sideNav.classList.remove('user')
          sideNav.classList.remove('sideNav')
        } else {
          sideNav.classList.remove('sticky')
          sideNav.classList.add('user')
        }
      } else if (this.mobile && this.activeComponent === PROFILE) {
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
      } else if (this.mobile && this.activeComponent !== PROFILE) {
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
  max-width: 300px;
  transition: top 0.2s ease;

  &.userMobile,
  &.archiveMobile,
  &.stickMobile {
    max-width: 102%;
  }
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
  top: 280px;
  width: 102%;
}
.archiveMobile {
  position: fixed;
  top: 50px;
  width: 102%;
  z-index: 3
}
.stickyMobile {
  position: fixed; /* Allocates space for the element, but moves it with you when you scroll */
  top: 50px;
  width: 102%;
  z-index: 1;
  background: linear-gradient(
    rgba(255, 255, 255, 0.9),
    rgba(255, 255, 255, 0.02)
  );
  .box-shadow {
     box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19);
  }
}

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
