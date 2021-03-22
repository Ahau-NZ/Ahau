<template>
  <!-- <v-row cols="12" class="pl-2 pt-2"> -->
    <v-menu top offset-y light hide-details dense rounded outlined>
      <template v-slot:activator="{ on, attrs }">
          <v-row :class="margin" justify="start">
            <v-col cols="12" md="auto" class="pa-0 pb-5">
              <v-card-text class="text-caption py-0 text-md-right">Choose who has access to this {{ type }}:</v-card-text>
              <v-btn
                v-bind="attrs"
                v-on="on"
                text
                rounded
                :disabled="disabled"
              >
                <v-icon>mdi-eye</v-icon>
                <span class="ml-2">{{ access ? access.isPersonalGroup ? 'Private' : access.preferredName : 'set access'}}</span>
                <v-icon v-if="!disabled">mdi-chevron-down</v-icon>
              </v-btn>
              <v-card-text v-if="access && !disabled" class="font-italic font-weight-light text-caption py-0 text-md-right">
                {{ access.isPersonalGroup ? `Only you have access to this ${type}` : `Only ${access.preferredName} will have access to this story` }}
              </v-card-text>

              <v-card-text v-if="access && disabled" class="font-italic font-weight-light text-caption py-0 text-md-right">
                {{ access.isPersonalGroup ? `Only you have access to this ${type}` : `Only ${access.preferredName} has access to this story` }}
              </v-card-text>
            </v-col>
          </v-row>
      </template>

      <v-list>
        <v-list-item
          v-for="(tribe, index) in tribes"
          :key="index"
          @click="go(tribe)"
        >
          <Avatar class="mr-3" size="40px" :image="tribe.avatarImage" :isView="!tribe.isPersonalGroup" :alt="getDisplayName(tribe)" :gender="tribe.gender" :aliveInterval="tribe.aliveInterval" />
          <v-list-item-title>{{ tribe.isPersonalGroup ? 'Private' : tribe.preferredName + ' (tribe)' }}</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-menu>
  <!-- </v-row> -->
</template>
<script>
import Avatar from '@/components/Avatar.vue'
import { getTribes } from '@/lib/community-helpers.js'
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
      tribes: []
    }
  },
  apollo: {
    tribes () {
      return {
        ...getTribes,
        update ({ tribes }) {
          tribes = tribes
            .filter(tribe => tribe.private.length !== 0)
            .map(tribe => {
              return {
                groupId: tribe.id,
                ...tribe.private.length > 0
                  ? tribe.private[0]
                  : tribe.public[0]
              }
            })
          tribes.push({
            groupId: this.whoami.personal.groupId,
            ...this.whoami.personal.profile,
            isPersonalGroup: true
          })
          return tribes
        }
      }
    }
  },
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
      return 'pt-3 ml-2'
    }
  },
  methods: {
    getDisplayName,
    go (profile) {
      this.$emit('access', profile)
    }
  }
}
</script>
