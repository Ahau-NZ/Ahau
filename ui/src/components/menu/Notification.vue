<template>
  <div>
    <v-list-item class="py-1" @click="$emit('click')">
      <Avatar
        size="50px"
        :image="author.avatarImage"
        :alt="author.preferredName"
        :gender="author.gender"
        :bornAt="author.bornAt"
      />
      <v-list-item-content class="pl-5">
        <v-list-item-title :class="bold">{{ author.preferredName }}</v-list-item-title>
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
  name: 'NotificationListItem',
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
      const { type, isPersonal, isNew, isAccepted } = this.notification

      if (type === 'system') return this.t('system')

      const groupName = this.notification.group?.preferredName || 'TODO'

      const notificationStatus = () => {
        switch (true) {
          case isNew: return 'new'
          case isAccepted: return 'accepted'
          default: return 'declined'
        }
      }

      const prepended = isPersonal ? 'personal' + '.' : ''

      return this.t(`${prepended}${type}.${notificationStatus()}`, { groupName })
    },
    author () {
      if (this.notification.isPersonal && this.notification.type !== 'submission') {
        const message = this.notification.history.find(history => history.type === 'decision')
        if (message && this.notification.isAccepted) return message.author
        return this.notification.group
      }
      return this.notification.from
    }
  },
  methods: {
    t (key, vars) {
      return this.$t('notifications.' + key, vars)
    }
  }
}
</script>
