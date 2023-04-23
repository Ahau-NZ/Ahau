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
        <v-row>
          <v-col>
            <p class="pt-1 pl-5 my-0 headliner black--text">Notifications</p>
          </v-col>
          <v-divider></v-divider>
        </v-row>
        <NotificationList
          v-if="!isKeyBackedUp"
          :notifications="ahauNotification"
          :title="t('systemTitle')"
          show-badge
          @click="toggleShowKeyBackup"
        />
        <NotificationList
          :notifications="filteredNotifications.unseen"
          :title="t('newTitle')"
          show-badge
        />
        <NotificationList
          :notifications="filteredNotifications.pending"
          :title="t('pendingTitle')"
        />
        <NotificationList
          :notifications="filteredNotifications.complete"
          :title="t('completeTitle')"
        />
      </v-card>
    </v-menu>

    <!-- MOBILE NOTIFICATIONS -->
    <div v-else @click="expand = !expand" style="display: flex; position: relative;">
      <v-btn v-if="expand" icon dark>
        <v-icon>mdi-arrow-left</v-icon>
      </v-btn>
      <div v-else>
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
    </div>

    <v-expand-transition v-if="hasNotification && expand">
      <v-card
        tile
        light
        style="position: absolute;left: 0px;top: 54px; width:100%; max-height:calc(100vh + 24px); overflow:auto"
        elevation="12"
        v-scroll="onScroll"
      >
        <NotificationList
          v-if="!isKeyBackedUp"
          :notifications="ahauNotification"
          :title="t('systemTitle')"
          show-badge
          @click="toggleShowKeyBackup"
        />
        <NotificationList
          :notifications="filteredNotifications.unseen"
          :title="t('newTitle')"
          show-badge
        />
        <NotificationList
          :notifications="filteredNotifications.pending"
          :title="t('pendingTitle')"
        />
        <NotificationList
          :notifications="filteredNotifications.complete"
          :title="t('completeTitle')"
        />
      </v-card>
    </v-expand-transition>

    <KeyBackupDialog
      v-if="showKeyBackup"
      :show="showKeyBackup"
      @close="toggleShowKeyBackup"
    />
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import NotificationList from '@/components/menu/NotificationList.vue'
import pileSort from 'pile-sort'
import KeyBackupDialog from '@/components/dialog/KeyBackupDialog.vue'

export default {
  components: {
    NotificationList,
    KeyBackupDialog
  },
  data () {
    return {
      menu: false,
      expand: false,
      offset: 0,
      showKeyBackup: false,
      ahauNotification: [
        {
          type: 'system',
          from: {
            avatarImage: {
              uri: require('@/assets/logo_red.svg')
            },
            preferredName: 'Ahau',
            gender: null,
            bornAt: null
          },
          group: {
            preferredName: 'Ahau'
          },
          isNew: true
        }
      ]
    }
  },
  computed: {
    ...mapGetters(['whoami', 'notifications']),
    ...mapGetters('notifications', ['notifications']),
    filteredNotifications () {
      const [unseen, pending, complete, other] = pileSort(this.notifications, [
        (n) => !n.isPersonal && n.isNew,
        (n) => n.isPersonal && n.isNew,
        (n) => n.isAccepted || !n.isAccepted
      ])

      return { unseen, pending, complete, other }
    },
    isKeyBackedUp () {
      return this.whoami.personal.settings.keyBackedUp
    },
    notificationsCount () {
      const notifs = this.filteredNotifications.unseen.length
      return !this.isKeyBackedUp ? notifs + 1 : notifs
    },
    mobile () {
      return this.$vuetify.breakpoint.xs || this.$vuetify.breakpoint.sm
    },
    hasNotification () {
      return this.filteredNotifications.unseen.length > 0 ||
      this.filteredNotifications.pending.length > 0 ||
      this.filteredNotifications.complete.length > 0 ||
      !this.isKeyBackedUp
    },
    showBadge () {
      return this.filteredNotifications.unseen.length > 0 || !this.isKeyBackedUp
    }
  },
  watch: {
    expand (newVal) {
      // TODO consider using vuex for this
      if (newVal === false) {
        setTimeout(() => {
          window.scrollTo({
            top: this.offset
          })
        }, 100)
      }
    }
  },
  methods: {
    onScroll () {
      if (!this.expand) this.offset = window.pageYOffset
    },
    toggleShowKeyBackup () {
      if (this.showKeyBackup) this.showKeyBackup = false
      else this.showKeyBackup = true
    },
    t (key, vars) {
      return this.$t('notifications.' + key, vars)
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
