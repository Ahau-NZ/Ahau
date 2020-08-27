<template>
  <div>
    <!-- DESKTOP NOTIFICATIONS -->
    <v-menu v-if="!mobile" absolute v-model="menu" :close-on-content-click="true" light>
      <template v-slot:activator="{ on, attrs }">
        <div v-bind="attrs" v-on="on" style="display: flex; position: relative;">
          <img src="@/assets/logo_red.svg" class="logo" />
          <div
            :style="mobile ? 'position:absolute; bottom:-10px;right:8px':'position:absolute; bottom:-10px;right:30px'"
          >
            <v-badge
              v-if="hasNotification"
              color="#B12526"
              :content="notificationsCount"
              style="cursor: pointer;"
            ></v-badge>
          </div>
        </div>
      </template>
      <v-card v-if="hasNotification">
        <v-list class="py-0">
          <v-list-item>
            <p class="pt-1 pl-5 my-0 headliner black--text">Notifications</p>
          </v-list-item>
        </v-list>
        <v-divider></v-divider>
        <v-list height="30px" class="py-0" style="background-color:#a9a9a950">
          <p class="pt-1 pl-8 my-0 subtitle-2 black--text">New</p>
        </v-list>
        <v-divider></v-divider>
        <v-list class="py-0">
          <div v-for="(notification, index) in notificationsToJoin" :key="index">
            <!-- Registration Notification -->
            <div>
              <v-list-item class="py-1" @click="openReview(notification)">
                <Avatar
                  size="50px"
                  :image="notification.from.avatarImage"
                  :alt="notification.from.preferredName"
                  :gender="notification.from.gender"
                  :bornAt="notification.from.bornAt"
                />
                <v-list-item-content class="pl-5">
                  <v-list-item-title class="bold">{{notification.from.preferredName}}</v-list-item-title>
                  <v-list-item-subtitle
                    class="text-caption bold "
                  >Has requested to join {{notification.message.group.preferredName}}</v-list-item-subtitle>
                </v-list-item-content>
              </v-list-item>
              <v-divider></v-divider>
            </div>
          </div>
        </v-list>
        <v-list height="30px" class="py-0" style="background-color:#a9a9a950">
          <p class="pt-1 pl-8 my-0 subtitle-2 black--text">Complete</p>
        </v-list>
        <v-divider></v-divider>
        <v-list class="py-0">
          <div v-for="(notification, index) in notificationsAccepted" :key="index">
            <!-- Response notification -->
            <div v-if="notification.mine">
              <v-list-item class="py-1" @click="openResponse(notification)">
                <Avatar
                  size="50px"
                  :image="notification.message.groupAdmins[0].avatarImage"
                  :alt="notification.message.groupAdmins[0].preferredName"
                  :gender="notification.message.groupAdmins[0].gender"
                  :bornAt="notification.message.groupAdmins[0].bornAt"
                />
                <v-list-item-content class="pl-5">
                  <v-list-item-title>{{notification.message.groupAdmins[0].preferredName}}</v-list-item-title>
                  <v-list-item-subtitle class="text-caption ahauRed">
                    Has approved your request to join {{notification.message.group.preferredName}}
                  </v-list-item-subtitle>
                </v-list-item-content>
              </v-list-item>
              <v-divider></v-divider>
            </div>
            <div v-else>
              <v-list-item class="py-1" @click="openResponse(notification)">
                <Avatar
                  size="50px"
                  :image="notification.from.avatarImage"
                  :alt="notification.from.preferredName"
                  :gender="notification.from.gender"
                  :bornAt="notification.from.bornAt"
                />
                <v-list-item-content class="pl-5">
                  <v-list-item-title>{{notification.from.preferredName}}</v-list-item-title>
                  <v-list-item-subtitle class="text-caption ahauRed">
                    Has joined {{notification.message.group.preferredName}}
                  </v-list-item-subtitle>
                </v-list-item-content>
              </v-list-item>
              <v-divider></v-divider>
            </div>
          </div>
        </v-list>
      </v-card>
    </v-menu>

    <!-- MOBILE NOTIFICATIONS -->
    <div v-else @click="expand = !expand" style="display: flex; position: relative;">
      <img src="@/assets/logo_red.svg" class="logo" />
      <div
        :style="mobile ? 'position:absolute; bottom:-10px;right:8px':'position:absolute; bottom:-10px;right:30px'"
      >
        <v-badge v-if="hasNotification" color="#B12526" :content="notificationsCount" style="cursor: pointer;"></v-badge>
      </div>
    </div>

    <v-expand-transition v-if="hasNotification">
      <v-card tile light v-show="expand" style="position: absolute;left: 0px;top: 54px; width:100%">
        <v-list class="py-0">
          <v-list-item>
            <p class="pt-1 pl-5 my-0 headliner black--text">Notifications</p>
            <v-list-item-action style>
              <v-btn @click="expand = !expand" icon x-small style="position:relative; left:215px; top:2px;">
                <v-icon>mdi-close</v-icon>
              </v-btn>
            </v-list-item-action>
          </v-list-item>
        </v-list>
        <v-divider></v-divider>
        <v-list height="30px" class="py-0" style="background-color:#a9a9a950">
          <p class="pt-1 pl-8 my-0 subtitle-2 black--text">New</p>
        </v-list>
        <v-divider></v-divider>
        <v-list class="py-0">
          <div v-for="(notification, index) in notificationsToJoin" :key="index">
            <!-- Registration Notification -->
            <div v-if="notification.type === 'registration'">
              <v-list-item class="py-1" @click="openReview(notification)">
                <Avatar
                  size="50px"
                  :image="notification.from.avatarImage"
                  :alt="notification.from.preferredName"
                  :gender="notification.from.gender"
                  :bornAt="notification.from.bornAt"
                />
                <v-list-item-content class="pl-5">
                  <v-list-item-title class="bold">{{notification.from.preferredName}}</v-list-item-title>
                  <v-list-item-subtitle
                    class="text-caption bold "
                  >Has requested to join {{notification.message.group.preferredName}}</v-list-item-subtitle>
                </v-list-item-content>
              </v-list-item>
              <v-divider></v-divider>
            </div>
          </div>
        </v-list>
        <v-list height="30px" class="py-0" style="background-color:#a9a9a950">
          <p class="pt-1 pl-8 my-0 subtitle-2 black--text">Earlier</p>
        </v-list>
        <v-divider></v-divider>
        <v-list class="py-0 mb-6">
          <div v-for="(notification, index) in notificationsAccepted" :key="index">

            <!-- Response notification -->
            <div v-if="notification.type === 'response' && notification.accepted === true">
              <v-list-item class="py-1" @click="openResponse(notification)">
                <Avatar
                  size="50px"
                  :image="notification.from.avatarImage"
                  :alt="notification.from.preferredName"
                  :gender="notification.from.gender"
                  :bornAt="notification.from.bornAt"
                />
                <v-list-item-content class="pl-5">
                  <v-list-item-title>{{notification.from.preferredName}}</v-list-item-title>
                  <v-list-item-subtitle class="text-caption ahauRed">
                    Has joined {{notification.message.group.preferredName}}
                  </v-list-item-subtitle>
                </v-list-item-content>          
              </v-list-item>
              <v-divider></v-divider>
            </div>
          </div>
        </v-list>
      </v-card>
    </v-expand-transition>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import { personComplete } from '@/mocks/person-profile'
import Avatar from '@/components/Avatar'
export default {
  components: {
    Avatar
  },
  data () {
    return {
      menu: false,
      expand: false,
      completePerson: personComplete
    }
  },
  computed: {
    ...mapGetters(['whoami', 'currentProfile', 'notifications']),
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
    // notificationsCount () {
    //   var newNotifications = this.notifications.filter(notification => notification.message.outcome === "not responded")
    //   return this.newNotifications.length
    // },
    mobile () {
      return this.$vuetify.breakpoint.xs || this.$vuetify.breakpoint.sm
    },
    hasNotification () {
      return this.notifications.length > 0
    }
  },
  methods: {
    ...mapActions(['setDialog', 'setCurrentNotification']),
    openReview (notification) {
      console.log('open review')
      this.setCurrentNotification(notification)
      this.setDialog({ active: 'new-registration', type: 'review' })
    },
    openResponse (notification) {
      console.log('open response')
      this.setCurrentNotification(notification)
      this.setDialog({ active: 'new-registration', type: 'response' })
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
