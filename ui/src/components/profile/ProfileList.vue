<template>
  <v-col :class="mobile ? 'px-0':''">
    <v-row class="pl-4 pb-4">{{ label }}</v-row>
    <v-row v-for="(profile, index) in existingProfiles" :key="profile.id">
      <ProfileChip
        :profile="profile"

        :readonly="(readonly && index === 0) || readonly"
        :isNewProfile="isNewProfile(profile)"
        :hideDetails="hideDetails"

        :readonly-relationship="readonlyRelationship"

        @click="$emit('click', $event)"
        @update="$emit('update', $event)"
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
    readonly: Boolean,
    newProfiles: Array,
    existingProfiles: Array,
    hideDetails: Boolean,
    readonlyRelationship: Boolean
  },
  computed: {
    mobile () {
      return this.$vuetify.breakpoint.xs || this.$vuetify.breakpoint.sm
    }
  },
  methods: {
    isNewProfile (profile) {
      if (!this.newProfiles || !this.newProfiles.length) return false

      return this.newProfiles.some(person => person.id === profile.id)
    }
  }
}
</script>
