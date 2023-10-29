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
      <v-list-item-action v-if="notificationType === 'submission'">
        <v-btn text icon @click.stop="deleteSubmission">
          <v-icon>
            mdi-archive
          </v-icon>
        </v-btn>
      </v-list-item-action>
    </v-list-item>
    <v-divider></v-divider>
  </div>
</template>

<script>
import { mapActions } from 'vuex'

import Avatar from '@/components/Avatar.vue'
import {
  LINK_TYPE_PARTNER,
  LINK_TYPE_CHILD,
  LINK_CHILD,
  LINK_PARTNER,
  PROFILE_TYPE_ADMIN,
  PROFILE_TYPE_PERSON
} from '@/lib/constants'

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
    translationType () {
      switch (this.notification?.targetType) {
        case LINK_TYPE_PARTNER: return LINK_PARTNER
        case LINK_TYPE_CHILD: return LINK_CHILD
        default: return ''
      }
    },
    isLinkType () {
      return [LINK_TYPE_PARTNER, LINK_TYPE_CHILD].includes(this.notification?.targetType)
    },
    isPersonType () {
      return [PROFILE_TYPE_PERSON, PROFILE_TYPE_ADMIN].includes(this.notification?.targetType)
    },
    isNewRecord () {
      return !this.notification?.sourceRecord
    },
    text () {
      if (this.isSystem) return this.t('system')

      const groupName = this.notification.group?.preferredName

      const prepended = this.isPersonal ? 'personal' + '.' : ''
      if (this.isFromWeb) return this.t('submission.profile.new.web', { groupName })

      if (this.isLinkType) {
        const type = this.notification.targetType === LINK_TYPE_PARTNER
          ? LINK_PARTNER
          : LINK_CHILD

        return this.isPersonal
          ? this.t(`personal.submission.link.${type}.${this.notificationStatus}`, { groupName })
          : this.t(`submission.link.${type}.${this.notificationStatus}`, { authorName: this.author.preferredName, groupName })
      }

      if (this.isPersonType) {
        return this.isPersonal
          ? this.t(`personal.submission.profile.${this.notificationStatus}`, { groupName })
          : this.isNewRecord
            ? this.isNew
              ? this.t('submission.profile.new.ahau', { groupName })
              : this.t(`submission.profile.${this.notificationStatus}`, { groupName })
            : this.t('submission.profile.edit', { groupName, profileName: this.notification?.sourceRecord?.preferredName })
      }

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
    ...mapActions('submissions', ['tombstoneSubmission']),
    async deleteSubmission () {
      if (!confirm(this.t('submission.archiveConfirmation'))) return

      await this.tombstoneSubmission(this.notification.id) // the submissionId
    },
    t (key, vars) {
      return this.$t('notifications.' + key, vars)
    }
  }
}
</script>
