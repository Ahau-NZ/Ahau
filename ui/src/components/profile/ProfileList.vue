<template>
  <v-col :class="mobile ? 'px-0':''">
    <v-row class="pl-4 pb-4">{{label}}</v-row>
    <v-row v-for="(profile, index) in items" v-bind:key="profile.id">
      <ProfileChip
        :label="label"
        :item="profile"
        :mobile="mobile"
        :index="index"
        :groupType="groupType"
        :addableProfile="isAdded(profile)"
        @profile-click="$emit('profile-click', $event)"
        @related-by="$emit('related-by', $event)"
      />
    </v-row>
  </v-col>
</template>

<script>
import ProfileChip from '@/components/profile/ProfileChip.vue'

export default {
  name: 'ProfileList',
  components: {
    ProfileChip
  },
  props: {
    label: String,
    items: { type: Array, default: null },
    addedProfiles: { type: Array, default: null },
    groupType: { type: String, default: '' }
  },
  computed: {
    mobile () {
      return this.$vuetify.breakpoint.xs || this.$vuetify.breakpoint.sm
    }
  },
  methods: {
    isAdded (profile) {
      if (!this.addedProfiles || !this.addedProfiles.length) return null

      let added = this.addedProfiles.some(person => {
        return person.id === profile.id
      })

      return added
    }
  }
}
</script>
