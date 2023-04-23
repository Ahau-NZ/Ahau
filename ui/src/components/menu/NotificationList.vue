<template>
  <div>
    <v-list
      height="30px"
      class="py-0"
      style="background-color:#e5e5e5"
      v-if="notifications && notifications.length > 0 && title"
    >
      <p :class="`pt-1 pl-8 my-0 subtitle-2 black--text font-weight-medium`">{{ title }}</p>
    </v-list>
    <v-divider v-if="title"></v-divider>
    <v-list class="py-0">
      <div v-for="(notification, index) in notifications" :key="index">
        <!-- Registration Notification -->
        <Notification :notification="notification" :showBadge="showBadge" @click="openNotification(notification)" />
      </div>

    </v-list>
  </div>
</template>

<script>
import { mapActions } from 'vuex'
import Notification from './Notification.vue'

export default {
  props: {
    notifications: Array,
    title: String,
    text: String,
    showBadge: Boolean
  },
  components: {
    Notification
  },
  methods: {
    ...mapActions(['setDialog', 'setCurrentNotification']),
    openNotification (notification) {
      this.setCurrentNotification(notification)
      if (notification.type === 'system') this.$emit('click')
      else if (notification.isSubmission) this.setDialog({ active: 'review-submission' })
      else this.setDialog({ active: 'review-registration' })
    }
  }
}
</script>
