<template>
  <v-row cols="12" class="py-0 px-3">
    <v-row :class="margin">
      <v-col cols="12" class="py-0">
        <v-row :justify="mobile ? 'center':'start'">
          <v-btn
            text
            small
            :ripple="false"
          >
            <Avatar class="" size="20px" :image="profile.avatarImage" :isView="!profile.avatarImage" :alt="getDisplayName(profile)" :gender="profile.gender" :aliveInterval="profile.aliveInterval" />
            <span class="ml-1 truncated-x">{{ profile ? currentAccess.isPersonalGroup ? t('private') : profile.preferredName : t('setAccess')}}</span>
          </v-btn>
          <v-tooltip top open-delay="200">
            <template v-slot:activator="{ on }">
              <div v-on="on">
                <template v-if="!currentAccess.isPersonalGroup">
                  <!-- TODO: Update to list groups in Tribe: This is dependant on Groups Epic  -->
                  <v-menu offset-y light hide-details dense rounded outlined>
                    <template v-slot:activator="{ on, attrs }">
                      <v-btn
                        v-bind="attrs"
                        v-on="on"
                        text
                        rounded
                        small
                      >
                        <v-icon small>mdi-eye</v-icon>
                        <span class="ml-2">{{ currentAccess.label }}</span>
                        <v-icon v-if="!disabled">mdi-chevron-down</v-icon>
                      </v-btn>
                    </template>
                    <v-list v-if="accessOptions.length > 1">
                      <v-list-item
                        v-for="(accessOption, index) in accessOptions"
                        :key="index"
                        @click="setCurrentAccess(accessOption)"
                      >
                        <v-list-item-title>{{ accessOption.label }}</v-list-item-title>
                      </v-list-item>
                    </v-list>
                  </v-menu>
                  <!-- Set record Permissions: TODO when enabling this you will need to hide the 'submit' option until the Review and Submissions Epic is completed -->
                  <v-menu offset-y light hide-details dense rounded outlined>
                    <template v-slot:activator="{ on, attrs }">
                      <v-btn
                        v-bind="attrs"
                        v-on="on"
                        text
                        rounded
                        disabled
                        small
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
                        @click="setPermission(permission)"
                      >
                        <v-list-item-title>{{ permission }}</v-list-item-title>
                      </v-list-item>
                    </v-list>
                  </v-menu>
                </template>
              </div>
            </template>
            <span>{{ $t('support.comingSoon')}}</span>
          </v-tooltip>
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
// import { getTribes } from '@/lib/community-helpers.js'
import { getDisplayName } from '@/lib/person-helpers.js'
import mapProfileMixins from '@/mixins/profile-mixins.js'

const ACCESS_PERSONAL = 'all members'
const ACCESS_ALL_MEMBERS = 'all members'
const ACCESS_KAITIAKI = 'kaitiaki'
const VALID_ACCESS_TYPES = [ACCESS_PERSONAL, ACCESS_ALL_MEMBERS, ACCESS_KAITIAKI]

export default {
  name: 'AccessButton',
  props: {
    accessOptions: {
      type: Array,
      validator (value) {
        const isValid = value.every(opt => VALID_ACCESS_TYPES.includes(opt.type) && opt.label && opt.groupId && opt.profileId)
        if (!isValid) console.log('invalid accessOptions', JSON.stringify(value, null, 2))
        return isValid
      },
      default: () => []
    },
    disabled: Boolean,
    type: String
  },
  data () {
    return {
      profile: {},
      toggle: false,
      permissions: [
        this.t('edit'),
        this.t('read'),
        this.t('submit')
      ],
      permission: this.t('edit')
    }
  },
  // apollo: {
  //   tribes () {
  //     return {
  //       ...getTribes,
  //       update ({ tribes }) {
  //         tribes = tribes
  //         // a person can only change access to a tribe that it canEdit (is a kaitiaki)
  //           .filter(tribe => tribe.private.length !== 0 && tribe.private[0].canEdit)
  //           .map(tribe => {
  //             return {
  //               groupId: tribe.id,
  //               ...tribe.private.length > 0
  //                 ? tribe.private[0]
  //                 : tribe.public[0]
  //             }
  //           })
  //         tribes.push({
  //           groupId: this.whoami.personal.groupId,
  //           ...this.whoami.personal.profile,
  //           isPersonalGroup: true
  //         })
  //         return tribes
  //       }
  //     }
  //   }
  // },
  components: {
    Avatar
  },
  computed: {
    ...mapGetters(['whoami', 'currentAccess']),
    mobile () {
      return this.$vuetify.breakpoint.xs || this.$vuetify.breakpoint.sm
    },
    margin () {
      if (this.mobile) return ''
      return 'pt-2 ml-2'
    },
    recordPermissions () {
      const { currentAccess, permission } = this

      if (currentAccess.type === ACCESS_PERSONAL) return this.t('privateAccess', { recordType: this.type })
      else if (currentAccess.type === ACCESS_KAITIAKI) return this.t('kaitiakiAccess', { recordType: this.type })
      else if (currentAccess.type === ACCESS_ALL_MEMBERS) {
        if (permission === this.t('edit')) return this.t('membersCanEdit', { recordType: this.type })
        else if (permission === this.t('read')) return this.t('membersCanAccess', { recordType: this.type })
        else if (permission === this.t('submit')) return this.t('membersCanSubmit', { recordType: this.type })
      }
      return ''
    }
    // caption () {
    //   return this.t('addToArchive', { recordType: this.type })
    // }
  },

  methods: {
    ...mapActions(['setCurrentAccess']),
    getDisplayName,
    setPermission (permission) {
      // TODO update record backend to hold permission
      this.permission = permission
      console.log('change permission to: ', permission)
      // this.$emit('permission', permission)
    },
    t (key, vars) {
      return this.$t('accessButton.' + key, vars)
    }
  },
  mixins: [
    mapProfileMixins({
      mapMethods: ['getProfile']
    })
  ],
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
