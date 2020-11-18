<template>
  <!-- <v-row cols="12" class="pl-2 pt-2"> -->
    <v-menu top offset-y light hide-details dense rounded outlined>
      <template v-slot:activator="{ on, attrs }">
          <v-row :class="margin">
            <v-col cols="12" md="auto" class="pa-0">
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
            </v-col>
            <v-col class="pa-0 py-md-2">

              <v-card-text v-if="access && !disabled" class="font-italic font-weight-light text-caption py-0 text-md-right">
                {{ access.isPersonalGroup ? 'Only you will have access to this record' : `Only ${access.preferredName} will have access to this record` }}
              </v-card-text>

              <v-card-text v-if="access && disabled" class="font-italic font-weight-light text-caption py-0 text-md-right">
                {{ access.isPersonalGroup ? 'Only you have access to this record' : `Only ${access.preferredName} has access to this record` }}
              </v-card-text>
            </v-col>
          </v-row>
      </template>

      <v-list>
        <v-subheader>Choose who has access to this record:</v-subheader>
        <v-list-item
          v-for="(tribe, index) in accessOptions"
          :key="index"
          @click="go(tribe)"
        >
          <Avatar class="mr-3" size="40px" :image="tribe.avatarImage" :isView="!tribe.isPersonalGroup" :alt="tribe.preferredName" :gender="tribe.gender" :aliveInterval="tribe.aliveInterval" />
          <v-list-item-title>{{ tribe.isPersonalGroup ? 'Private' : tribe.preferredName + ' (tribe)' }}</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-menu>
  <!-- </v-row> -->
</template>
<script>
import Avatar from '@/components/Avatar.vue'
import { mapGetters } from 'vuex'

export default {
  name: 'AccessButton',
  props: {
    access: Object,
    disabled: Boolean
  },
  data () {
    return {
      toggle: false
    }
  },
  mounted () {
    console.log(this.access)
  },
  components: {
    Avatar
  },
  computed: {
    ...mapGetters(['accessOptions']),
    mobile () {
      return this.$vuetify.breakpoint.xs || this.$vuetify.breakpoint.sm
    },
    margin () {
      if (this.mobile) return ''
      return 'pt-3 ml-2'
    }
  },
  methods: {
    go (profile) {
      this.$emit('access', profile)
      // const name = this.$route.name.split('/')[1]
      // we want the access button to take us to the active component
      // this.$router.push({
      //   name: profile.type + '/' + name,
      //   tribeId: profile.groupId,
      //   profileId: profile.id,
      //   profile
      // })
    }
  }
}
</script>
