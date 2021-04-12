<template>
  <div>
    <div v-for="profile in items" v-bind:key="profile.id">
      <ProfileChip 
        :item="profile"
        @removeItem="$emit('removeItem', profileId)"
        :mobile="mobile"
        :addableProfile="addedProfile(profile)"
        @profile-click="$emit('profile-click', profile)">
      </ProfileChip>
    </div>
  </div>
</template>

<script>
import ProfileChip from '@/components/profile/ProfileChip.vue'

export default {
  name: 'ProfileList',
  components: {
    ProfileChip
  },
  props: {
    items: { type: Array, default: null },
    addedProfiles: { type: Array, default: null },
    mobile: { type: Boolean, default: false }
  },
  methods: {
    addedProfile (profile) {
      if (!this.addedProfiles || !this.addedProfiles.length) return null
      let added = this.addedProfiles.some(person => {
        return person.id === profile.id
      })

      return added
    }
  }
}
</script>
