<template>
  <div>
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
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import Avatar from '@/components/Avatar'
export default {
  components: {
    Avatar
  },
  props: {
    notificationsToJoin: Array,
    notificationsAccepted: Array
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
    },
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

.bold {
  font-weight: 550;
}
</style>