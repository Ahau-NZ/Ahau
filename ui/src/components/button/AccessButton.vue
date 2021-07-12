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
            <Avatar class="" size="20px" :image="access.avatarImage" :isView="!access.avatarImage" :alt="getDisplayName(access)" :gender="access.gender" :aliveInterval="access.aliveInterval" />
            <span class="ml-1 truncated-x">{{ access ? access.isPersonalGroup ? t('private') : access.preferredName : t('setAccess')}}</span>
          </v-btn>
          <v-tooltip top open-delay="200">
            <template v-slot:activator="{ on }">
              <div v-on="on">
                <template v-if="!access.isPersonalGroup">
                  <!-- TODO: Update to list groups in Tribe: This is dependant on Groups Epic  -->
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
                        <v-icon small>mdi-eye</v-icon>
                        <span class="ml-2">{{ group }}</span>
                        <v-icon v-if="!disabled">mdi-chevron-down</v-icon>
                      </v-btn>
                    </template>
                    <v-list>
                      <v-list-item
                        v-for="(group, index) in groups"
                        :key="index"
                        @click="setGroup(group)"
                      >
                        <v-list-item-title>{{ group }}</v-list-item-title>
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
import Avatar from '@/components/Avatar.vue'
// import { getTribes } from '@/lib/community-helpers.js'
import { mapGetters } from 'vuex'
import { getDisplayName } from '@/lib/person-helpers.js'

export default {
  name: 'AccessButton',
  props: {
    access: Object,
    disabled: Boolean,
    type: String
  },
  data () {
    return {
      toggle: false,
      groups: [this.t('allMembers'), this.t('kaitiaki')],
      group: this.t('allMembers'),
      permissions: [this.t('edit'), this.t('read'), this.t('submit')],
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
    ...mapGetters(['whoami']),
    mobile () {
      return this.$vuetify.breakpoint.xs || this.$vuetify.breakpoint.sm
    },
    margin () {
      if (this.mobile) return ''
      return 'pt-2 ml-2'
    },
    recordPermissions () {
      if (this.access.isPersonalGroup) return this.t('privateAccess', { recordType: this.type })
      else if (this.group === this.t('allMembers')) {
        if (this.permission === this.t('edit')) return this.t('membersCanEdit', { recordType: this.type })
        else if (this.permission === this.t('read')) return this.t('membersCanAccess', { recordType: this.type })
        else if (this.permission === this.t('submit')) return this.t('membersCanSubmit', { recordType: this.type })
      } else if (this.group === this.t('kaitiaki')) return this.t('kaitiakiAccess', { recordType: this.type })
      return ''
    }
    // caption () {
    //   return this.t('addToArchive', { recordType: this.type })
    // }
  },
  methods: {
    getDisplayName,
    setGroup (group) {
      this.group = group
      console.log('change access to group: ', group)
      // TODO update record backend to connect to group
      // this.$emit('access', group, permission)
    },
    setPermission (permission) {
      // TODO update record backend to hold permission
      this.permission = permission
      console.log('change permission to: ', permission)
      // this.$emit('permission', permission)
    },
    t (key, vars) {
      return this.$t('accessButton.' + key, vars)
    }
  }
}
</script>
<style scoped>
.truncated-x {
  overflow: hidden;
  display: block;
  width: 200px;
  white-space: nowrap;
  text-overflow: ellipsis;
  text-align: start;
}
</style>
