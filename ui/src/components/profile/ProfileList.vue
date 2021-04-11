<template>
    <div>
<div v-for="profile in items" v-bind:key="profile.id">
    <ProfileChip :item="profile" @removeItem="$emit('removeItem', profileId)">
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
    items: { type: Array, default: null }
  },
  mounted () {
    console.log('profile list items: ', this.items)
  },
  methods: {

  }
}
</script>
