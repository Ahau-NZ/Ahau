<template>
  <v-row cols="12" class="py-0 px-3">
    <v-row :class="margin">
      <v-col cols="12" class="py-0">
        <v-row :justify="mobile ? 'center':'start'">
          <v-btn
            text
            small
            :ripple="false"
            disabled
          >
            <Avatar class="" size="20px" :image="profile.avatarImage" :isView="!profile.avatarImage" :alt="getDisplayName(profile)" :gender="profile.gender" :aliveInterval="profile.aliveInterval" />
            <span class="ml-1 truncated-x">{{ profile ? currentAccessIsPersonalGroup ? t('private') : profile.preferredName : t('setAccess')}}</span>
          </v-btn>
          <div v-if="!currentAccessIsPersonalGroup">
              <!-- TODO: Update to list groups in Tribe: This is dependant on Groups Epic  -->
              <v-menu offset-y light hide-details dense rounded outlined>
                <template v-slot:activator="{ on, attrs }">
                  <v-btn
                    v-bind="attrs"
                    v-on="on"
                    text
                    rounded
                    small
                    :disabled="disabled || recordView || editing"
                    :ripple="false"
                  >
                    <v-icon small>mdi-eye</v-icon>
                    <span class="ml-2">{{ currentAccess.label || t(currentAccess.type) }}</span>
                    <v-icon v-if="!disabled && allowedOptions.length > 1">mdi-chevron-down</v-icon>
                  </v-btn>
                </template>
                <v-list v-if="allowedOptions.length > 1">
                  <v-list-item
                    v-for="(accessOption, index) in allowedOptions"
                    :key="index"
                    @click="setCurrentAccess(accessOption)"
                  >
                    <v-list-item-title>{{ t(accessOption.type) || t(currentAccess.type) }}</v-list-item-title>
                  </v-list-item>
                </v-list>
              </v-menu>

              <!-- Set record Permissions: TODO when enabling this you will need to hide the 'submit' option until the Review and Submissions Epic is completed -->
              <v-menu
                v-if="currentAccess.type !== 'kaitiaki'"
                offset-y light hide-details dense rounded outlined>
                <template v-slot:activator="{ on, attrs }">
                  <v-btn
                    v-bind="attrs"
                    v-on="on"
                    text
                    rounded
                    small
                    :disabled="disabled"
                  >
                  <!-- <v-btn
                    v-bind="attrs"
                    v-on="on"
                    text
                    rounded
                    :disabled="group === 'Kaitiaki only'"
                    small
                  > -->
                    <span class="ml-2">{{ permission }}</span>
                    <v-icon v-if="!disabled">mdi-chevron-down</v-icon>
                  </v-btn>
                </template>

                <v-list>
                  <v-list-item
                    v-for="(permission, index) in permissions"
                    :key="index"
                    @click="setPermission(permission.value)"
                  >
                    <v-list-item-title>{{ permission.text }}</v-list-item-title>
                  </v-list-item>
                </v-list>
              </v-menu>
          </div>
        </v-row>
      </v-col>
      <v-col cols="12" class="pt-0">
        <v-card-text class="font-italic font-weight-light text-caption pa-0 text-md-start">
          {{ recordPermissions }}
        </v-card-text>
      </v-col>
    </v-row>
  </v-row>
</template>
<script>
import { mapGetters, mapActions } from 'vuex'

import Avatar from '@/components/Avatar.vue'
import { getDisplayName } from '@/lib/person-helpers.js'

import { ACCESS_TYPES, ACCESS_PRIVATE, ACCESS_ALL_MEMBERS, ACCESS_KAITIAKI } from '@/lib/constants'

export default {
  name: 'AccessButton',
  props: {
    accessOptions: {
      type: Array,
      validator (options) {
        const errors = []
        for (const option of options) {
          if (!ACCESS_TYPES.includes(option.type)) errors.push(`invalid type ${option.type}`)
          if (!option.groupId) errors.push('missing groupId')
          if (!option.profileId) errors.push('missing profilId')
        }
        if (errors.length) {
          console.log('invalid accessOptions', JSON.stringify(options, null, 2))
          console.log(errors.join('\n'))
          return false
        }
        return true
      },
      default: () => []
    },
    disabled: Boolean,
    permission: String,
    type: String,
    editing: Boolean
  },
  data () {
    return {
      profile: {},
      toggle: false,
      permissions: [
        { value: 'edit', text: this.t('edit') },
        { value: 'view', text: this.t('read') },
        { value: 'submit', text: this.t('submit') }
        // this.t('submit')
      ]
    }
  },
  components: {
    Avatar
  },
  mounted () {
    if (!this.permission) this.type === 'whakapapa' ? this.setPermission('edit') : this.setPermission('view')
  },
  computed: {
    ...mapGetters(['whoami', 'currentAccess']),
    recordView () {
      return this.$route.name === 'community/archive'
    },
    allowedOptions () {
      if (this.type === 'whakapapa') return this.accessOptions

      // we currently are only allowing the kaitiaki-only option in whakapapa
      // so for now, im just filtering it on all other types
      // TODO: when kaitiaki-only is allowed in other places, remove this filter
      return this.accessOptions
        .filter(option => option.type !== ACCESS_KAITIAKI)
    },
    mobile () {
      return this.$vuetify.breakpoint.xs || this.$vuetify.breakpoint.sm
    },
    margin () {
      if (this.mobile) return ''
      return 'pt-2 ml-2'
    },
    recordPermissions () {
      const { currentAccess, permission } = this

      if (currentAccess.type === ACCESS_PRIVATE) return this.t('privateAccess', { recordType: this.type })
      else if (currentAccess.type === ACCESS_KAITIAKI) return this.t('kaitiakiAccess', { recordType: this.type })
      else if (currentAccess.type === ACCESS_ALL_MEMBERS) {
        if (permission === 'edit') return this.t('membersCanEdit', { recordType: this.type })
        else if (permission === 'view') return this.t('membersCanAccess', { recordType: this.type })
        else if (permission === 'submit') return this.t('membersCanSubmit', { recordType: this.type })
      }
      return ''
    },
    currentAccessIsPersonalGroup () {
      return (this.currentAccess && this.currentAccess.groupId === this.whoami.personal.groupId)
    }
  },

  methods: {
    ...mapActions(['setCurrentAccess']),
    ...mapActions('profile', ['getProfile']),
    getDisplayName,
    setPermission (permission) {
      // TODO update record backend to hold permission
      this.$emit('update:permission', permission)
    },
    t (key, vars) {
      return this.$t('accessButton.' + key, vars)
    }
  },
  watch: {
    'currentAccess.profileId': {
      immediate: true,
      async handler (profileId) {
        if (!profileId) return
        this.profile = await this.getProfile(profileId)
      }
    }
  }
}
</script>
<style scoped>
.truncated-x {
  overflow: hidden;
  display: block;
  width: 120px;
  white-space: nowrap;
  text-overflow: ellipsis;
  text-align: start;
}
</style>
