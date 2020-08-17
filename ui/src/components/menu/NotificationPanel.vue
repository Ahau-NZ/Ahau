<template>
  <div>
    <!-- DESKTOP NOTIFICATIONS -->
    <v-menu v-if="!mobile" absolute v-model="menu" :close-on-content-click="true" light>
      <template v-slot:activator="{ on, attrs }">
        <div v-bind="attrs" v-on="on" style="display: flex; position: relative;">
          <!-- <router-link to="/" v-if="enableMenu" class="logo-link" @click.native="karakiaWhakamutunga()"> -->
          <img src="@/assets/logo_red.svg" class="logo" />
          <!-- </router-link> -->
          <div
            :style="mobile ? 'position:absolute; bottom:-10px;right:8px':'position:absolute; bottom:-10px;right:30px'"
          >
            <v-badge
              v-if="hasNotification"
              color="#B12526"
              :content="notifications.length"
              style="cursor: pointer;"
            ></v-badge>
          </div>
        </div>
      </template>
      <v-card v-if="hasNotification">
        <v-list height="40px">
          <p class="pt-1 pl-5 my-0 headliner black--text">Notifications</p>
        </v-list>
        <v-divider></v-divider>
        <v-list class="pt-0">
          <div v-for="(notification, index) in notifications" :key="index">
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
                  <v-list-item-title>{{notification.from.preferredName}}</v-list-item-title>
                  <v-list-item-subtitle
                    class="text-caption ahauRed"
                  >Has requested to join {{notification.message.group.preferredName}}</v-list-item-subtitle>
                </v-list-item-content>
                <!-- <v-list-item-action>
                  <v-btn icon x-small>
                    <v-icon>mdi-close</v-icon>
                  </v-btn>
                </v-list-item-action>-->
              </v-list-item>
              <v-divider></v-divider>
            </div>

            <!-- Response notification -->
            <div v-else-if="notification.type === 'response'">
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
                  <v-list-item-subtitle
                    class="text-caption ahauRed"
                  >Has {{notification.message.outcome}} your request to join {{notification.message.group.preferredName}}</v-list-item-subtitle>
                </v-list-item-content>
                <!-- <v-list-item-action>
                  <v-btn icon x-small>
                    <v-icon>mdi-close</v-icon>
                  </v-btn>
                </v-list-item-action>-->
              </v-list-item>
              <v-divider></v-divider>
            </div>
          </div>
          <v-spacer class="mb-6"></v-spacer>
        </v-list>
      </v-card>
    </v-menu>

    <!-- MOBILE NOTIFICATIONS -->
    <div v-else @click="expand = !expand" style="display: flex; position: relative;">
      <img src="@/assets/logo_red.svg" class="logo" />
      <div
        :style="mobile ? 'position:absolute; bottom:-10px;right:8px':'position:absolute; bottom:-10px;right:30px'"
      >
        <v-badge color="#B12526" :content="notifications.length" style="cursor: pointer;"></v-badge>
      </div>
    </div>

    <v-expand-transition>
      <v-card tile light v-show="expand" style="position: absolute;left: 0px;top: 54px;">
        <v-list height="40px">
          <p class="pt-1 pl-5 my-0 headliner black--text">Notifications</p>
        </v-list>
        <v-divider></v-divider>
        <v-list class="pt-0">
          <div v-for="(notification, index) in notifications" :key="index">
            <v-list-item
              class="py-1"
              @click="setDialog({ active: 'new-registration', type: 'review' })"
            >
              <Avatar
                size="50px"
                :image="notification.from.avatarImage"
                :alt="notification.from.preferredName"
                :gender="notification.from.gender"
                :bornAt="notification.from.bornAt"
              />
              <v-list-item-content class="pl-5">
                <v-list-item-title>{{notification.from.preferredName}}</v-list-item-title>
                <v-list-item-subtitle
                  class="text-caption ahauRed"
                >{{notification.is}} {{notification.to}}</v-list-item-subtitle>
              </v-list-item-content>
              <v-list-item-action>
                <v-btn icon x-small>
                  <v-icon>mdi-close</v-icon>
                </v-btn>
              </v-list-item-action>
            </v-list-item>
            <v-divider></v-divider>
          </div>
          <v-spacer class="mb-6"></v-spacer>
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
  mounted () {
    this.getAllNotifications()
  },
  computed: {
    ...mapGetters(['whoami', 'currentProfile', 'notifications']),
    mobile () {
      return this.$vuetify.breakpoint.xs || this.$vuetify.breakpoint.sm
    },
    hasNotification () {
      return this.notifications.length > 0
    }
  },
  methods: {
    ...mapActions(['setDialog', 'getAllNotifications', 'setCurrentNotification']),

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
</style>
