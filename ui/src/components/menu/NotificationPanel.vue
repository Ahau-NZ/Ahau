<template>
  <div>
    <!-- DESKTOP NOTIFICATIONS -->
    <v-menu v-if="!mobile" absolute v-model="menu" :close-on-content-click="true" light allow-overflow>
      <template v-slot:activator="{ on, attrs }">
        <div v-bind="attrs" v-on="on" style="display: flex; position: relative;">
          <img src="@/assets/logo_red.svg" class="logo" />
          <div
            v-if="notificationsCount > 0"
            :style="mobile ? 'position:absolute; bottom:-10px;right:8px':'position:absolute; bottom:-10px;right:30px'"
          >
            <v-badge
              v-if="showBadge"
              color="#B12526"
              :content="notificationsCount"
              style="cursor: pointer;"
            ></v-badge>
          </div>
        </div>
      </template>
      <v-card v-if="hasNotification" style="max-height:500px;">
        <NotificationList
          @expand="expand = !expand"
          :notificationsToJoin="notificationsToJoin"
          :notificationsAccepted="notificationsAccepted"
        />
      </v-card>
    </v-menu>

    <!-- MOBILE NOTIFICATIONS -->
    <div v-else @click="expand = !expand" style="display: flex; position: relative;">
      <img src="@/assets/logo_red.svg" class="logo" />
      <div
        :style="mobile ? 'position:absolute; bottom:-10px;right:8px':'position:absolute; bottom:-10px;right:30px'"
      >
        <v-badge
          v-if="showBadge"
          color="#B12526"
          :content="notificationsCount"
          style="cursor: pointer;"
        ></v-badge>
      </div>
    </div>

    <v-expand-transition v-if="hasNotification">
      <v-card
        tile
        light
        v-show="expand"
        style="position: absolute;left: 0px;top: 54px; width:100%; max-height:calc(100vh + 24px);overflow-y:scroll;"
        elevation="12"
        v-scroll="onScroll"
      >
        <NotificationList
          @expand="expand = !expand"
          :notificationsToJoin="notificationsToJoin"
          :notificationsAccepted="notificationsAccepted"
        />
      </v-card>
    </v-expand-transition>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import NotificationList from '@/components/menu/NotificationList.vue'

export default {
  components: {
    NotificationList
  },
  data () {
    return {
      menu: false,
      expand: false,
      offset: 0
    }
  },
  computed: {
    ...mapGetters(['whoami', 'notifications']),
    myNotifications () {
      const reversedNotifications = this.notifications.slice(0).reverse()
      return reversedNotifications.map(i => ({ ...i, mine: i.from.id === this.whoami.public.profile.id }))
    },
    notificationsToJoin () {
      return this.myNotifications
        .filter(i => {
          return !i.accepted && !i.mine
        })
    },
    notificationsAccepted () {
      return this.myNotifications
        .filter(i => {
          return i.accepted
        })
    },
    notificationsCount () {
      return this.notificationsToJoin.length
    },
    mobile () {
      return this.$vuetify.breakpoint.xs || this.$vuetify.breakpoint.sm
    },
    hasNotification () {
      return this.notificationsToJoin.length > 0 || this.notificationsAccepted.length > 0
    },
    showBadge () {
      return this.notificationsToJoin.length > 0
    }
  },
  watch: {
    offset (newVal, oldVal) {
      if (this.expand && newVal < oldVal) this.expand = !this.expand
    },
    menu (newVal) {
      // TODO consider using vuex for this
      if (newVal === true) {
        document.body.classList.add('stop-scroll')
      } else {
        document.body.classList.remove('stop-scroll')
      }
    }
  },
  methods: {
    onScroll () {
      if (this.mobile) this.offset = window.pageYOffset
    }
  }

}
</script>

<style lang="scss" scoped>
.headliner {
  font-size: 0.8em;
  text-transform: uppercase;
  font-weight: 400;
  letter-spacing: 5px;
}
.mobile {
  .logo,
  .logo-link {
    height: 35px;
  }
}

.desktop {
  .logo {
    height: 45px;
    padding: 0 25px;
  }
}

.bold {
  font-weight: 550;
}

</style>
