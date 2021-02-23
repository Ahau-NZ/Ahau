<template>
  <div>
    <v-list
      height="30px"
      class="py-0"
      style="background-color:#a9a9a950"
      v-if="notifications && notifications.length > 0 && title"
    >
      <p :class="`pt-1 pl-8 my-0 subtitle-2 black--text ${bold}`">{{ title }}</p>
    </v-list>
    <v-divider v-if="title"></v-divider>
    <v-list class="py-0">
      <div v-for="(notification, index) in notifications" :key="index">
        <!-- Registration Notification -->
        <div>
          <v-list-item class="py-1" @click="openReviewRegistration(notification)">
            <Avatar
              size="50px"
              :image="notification.from.avatarImage"
              :alt="notification.from.preferredName"
              :gender="notification.from.gender"
              :bornAt="notification.from.bornAt"
            />
            <v-list-item-content class="pl-5">
              <v-list-item-title :class="bold">{{ notification.from.preferredName }}</v-list-item-title>
              <v-list-item-subtitle
                :class="`text-caption ${bold}`"
              >{{ text }} {{ notification.group.preferredName }}</v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>
          <v-divider></v-divider>
        </div>
      </div>
    </v-list>
  </div>
</template>

<script>
import Avatar from '@/components/Avatar'
import { acceptGroupApplication } from '@/lib/tribes-application-helpers'

import { mapActions } from 'vuex'

export default {
  components: {
    Avatar
  },
  props: {
    notifications: Array,
    title: String,
    text: String,
    showBadge: Boolean
  },
  computed: {
    bold () {
      return this.showBadge ? 'bold' : ''
    }
  },
  methods: {
    ...mapActions(['setDialog', 'setCurrentNotification']),
    openReviewRegistration (notification) {
      this.setCurrentNotification(notification)
      this.setDialog({ active: 'review-registration' })
    },
    async sendResponse ({ comment, approved }) {
      try {
        const mutation = approved
          ? acceptGroupApplication({
            id: this.currentNotification.id,
            comment
            // TODO: groupItro: ...
          })
          : null
          // TODO decline applications
          // - graphql mutation
          // - helper mutation

        if (!mutation) return

        const res = await this.$apollo.mutate(
          mutation
        )

        if (res.errors) throw res.errors
      } catch (err) {
        console.log('Something went wrong while trying to respond to the group application', err)
      }
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

.bold {
  font-weight: 550;
}
</style>
