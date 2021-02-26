<template>
  <div>
    <v-list-item class="py-1" @click="$emit('click')">
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
        >{{ text }}</v-list-item-subtitle>
      </v-list-item-content>
    </v-list-item>
    <v-divider></v-divider>
  </div>
</template>

<script>
import Avatar from '@/components/Avatar'

export default {
  name: 'Notification',
  props: {
    notification: Object,
    showBadge: Boolean
  },
  components: {
    Avatar
  },
  computed: {
    bold () {
      return this.showBadge ? 'font-weight-medium' : ''
    },
    text () {
      const { isPersonal, isNew, isAccepted } = this.notification

      const groupName = this.notification.group.preferredName

      if (isPersonal && isNew) return `Has yet to review your request to join ${groupName}`
      if (isPersonal && isAccepted) return `Has accepted your request to join ${groupName}`
      if (isPersonal && !isAccepted) return `Has declined your request to join ${groupName}`
      if (!isPersonal && isNew) return `Has requested to join ${groupName}`
      if (!isPersonal && isAccepted) return `Has joined ${groupName}`
      if (!isPersonal && !isAccepted) return `Has been declined to join ${groupName}`
      return 'No details'
    }
  }
}
</script>
