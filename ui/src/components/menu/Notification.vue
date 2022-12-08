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
      const { isPersonal, isNew, isAccepted, isSubmission, isSystem } = this.notification

      if (isSystem) return this.t('system')

      const groupName = this.notification.group.preferredName
      // if isSubmission is true then request is submission
      if (!isSubmission) {
        if (isPersonal && isNew) return this.t('personalNew', { groupName: groupName })
        if (isPersonal && isAccepted) return this.t('personalAccepted', { groupName: groupName })
        if (isPersonal && !isAccepted) return this.t('personalDeclined', { groupName: groupName })
        if (!isPersonal && isNew) return this.t('groupNew', { groupName: groupName })
        if (!isPersonal && isAccepted) return this.t('groupAccepted', { groupName: groupName })
        if (!isPersonal && !isAccepted) return this.t('groupDeclined', { groupName: groupName })
      } else if (isSubmission) {
        if (isPersonal && isNew) return this.t('personalSubmissionNew', { groupName: groupName })
        if (isPersonal && isAccepted) return this.t('personalSubmissionAccepted', { groupName: groupName })
        if (isPersonal && !isAccepted) return this.t('personalSubmissionDeclined', { groupName: groupName })
        if (!isPersonal && isNew) return this.t('submissionNew', { groupName: groupName })
        if (!isPersonal && isAccepted) return this.t('submissionAccepted', { groupName: groupName })
        if (!isPersonal && !isAccepted) return this.t('submissionDeclined', { groupName: groupName })
      }
      return this.t('noDetails')
    },
    author () {
      if (this.notification.isPersonal) {
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
