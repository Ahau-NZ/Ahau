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
          :notifications="joiningApplications"
          title="New"
          text="Has requested to join"
          show-badge
        />
        <NotificationList
          :notifications="pendingPersonalApplications"
          title="Pending"
          text="Is yet to review your request to join"
        />
        <NotificationList
          :notifications="acceptedPersonalApplications"
          title="Complete"
          text="Has approved your message to join"
        />
        <NotificationList
          :notifications="acceptedOthersApplications"
          text="Has joined"
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
          :notifications="joiningApplications"
          title="New"
          text="Has requested to join"
          show-badge
        />
        <NotificationList
          :notifications="pendingPersonalApplications"
          title="Pending"
          text="Is yet to review your request to join"
        />
        <NotificationList
          :notifications="acceptedPersonalApplications"
          title="Complete"
          text="Has approved your message to join"
        />
        <NotificationList
          :notifications="acceptedOthersApplications"
          text="Has joined"
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
      offset: 0,
      test: []
    }
  },
  computed: {
    ...mapGetters(['whoami', 'notifications']),
    pendingPersonalApplications () { // your requests to join others communities
      const notifications = this.notifications
        .filter(application => {
          return application.accepted === null && application.isPersonalApplication
        })
        .map(application => {
          application.to = application.groupAdmins[0]
          return application
        })
      return notifications
    },
    joiningApplications () { // requests to join a community of yours
      return this.notifications
        .filter(application => {
          return application.accepted === null && !application.isPersonalApplication
        })
        .map(application => {
          application.to = application.applicant
          return application
        })
    },
    acceptedPersonalApplications () { // your applications with have been accepted
      return this.notifications
        .filter(application => {
          return application.accepted && application.isPersonalApplication
        })
        .map(application => {
          application.to = application.groupAdmins[0]
          return application
        })
    },
    acceptedOthersApplications () {
      return this.notifications
        .filter(application => {
          return application.accepted && !application.isPersonalApplication
        })
        .map(application => {
          application.to = application.applicant
          return application
        })
    },
    notificationsCount () {
      return this.joiningApplications.length
    },
    mobile () {
      return this.$vuetify.breakpoint.xs || this.$vuetify.breakpoint.sm
    },
    hasNotification () {
      return this.joiningApplications.length > 0 || this.acceptedPersonalApplications.length > 0 || this.pendingPersonalApplications.length > 0
    },
    showBadge () {
      return this.joiningApplications.length > 0
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
