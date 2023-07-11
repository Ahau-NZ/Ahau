<template>
  <div>
    <v-list-item class="py-1" @click="$emit('click')">
      <Avatar
        size="50px"
        :image="author.avatarImage"
        :alt="author.preferredName"
        :gender="author.gender"
        :bornAt="author.bornAt"
        :isView="author.isView"
      />
      <v-list-item-content class="pl-5">
        <v-list-item-title :class="bold">{{ title }}</v-list-item-title>
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
    notificationType () {
      return this.notification?.type
    },
    isSystem () {
      return this.notificationType === 'system'
    },
    isSubmission () {
      return this.notificationType === 'submission'
    },
    isNew () {
      return this.notification?.isNew
    },
    isAccepted () {
      return this.notification?.isAccepted
    },
    isPersonal () {
      return this.notification?.isPersonal
    },
    isFromWeb () {
      return this.notification?.source === 'webForm'
    },
    notificationStatus () {
      switch (true) {
        case this.isNew: return 'new'
        case this.isAccepted: return 'accepted'
        default: return 'declined'
      }
    },
    title () {
      if (this.isFromWeb) {
        const from = this.notification?.changes?.preferredName
        return this.t('submission.profile.new.title', { from })
      } else return this.author.preferredName
    },
    text () {
      if (this.isSystem) return this.t('system')

      const groupName = this.notification.group?.preferredName

      const prepended = this.isPersonal ? 'personal' + '.' : ''
      if (this.isFromWeb) return this.t('submission.profile.new.web', { groupName })

      return this.t(`${prepended}${this.notificationType}.${this.notificationStatus}`, { groupName })
    },
    author () {
      if (this.notification.isPersonal && this.notification.type !== 'submission') {
        const message = this.notification.history.find(history => history.type === 'decision')
        if (message && this.notification.isAccepted) return message.author
        return this.notification.group
      }

      if (this.isFromWeb) {
        return {
          ...this.notification.group,
          isView: true
        }
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
