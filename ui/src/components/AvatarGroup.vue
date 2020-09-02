<template>
  <v-col class="pt-0 pb-0">
    <v-row v-if="groupTitle">
      <v-col class="pt-1 pb-0">
        <small class="label"> {{ groupTitle }} </small>
      </v-col>
    </v-row>

    <v-row :class="customClass">
      <div
        width="100%"
        :class="spacing"
        v-for="(profile, i) in profiles"
        :key="`${groupTitle}-${profile.id}-${i}`"
      >
        <div justify="center" class="pt-2">
          <Avatar
            :size="size"
            :image="profile.avatarImage"
            :alt="profile.preferredName"
            :gender="profile.gender"
            :aliveInterval="profile.aliveInterval"
            :deceased="profile.deceased"
            :showLabel="showLabels"
            :clickable="clickable"
            @click="profileClick(profile)"
            :deletable="deletable"
            @delete="$emit('delete', i)"
            :isView="isView || profile.type === 'community'"
            :dark="dark"
            :row="row"
          />
        </div>
      </div>
      <slot name="action"></slot>
    </v-row>
  </v-col>
</template>

<script>
import Avatar from './Avatar.vue'
// import has from 'lodash.has'
export default {
  name: 'AvatarGroup',
  components: {
    Avatar
  },
  props: {
    profiles: { type: Array, default: null },
    groupTitle: { type: String, default: null },
    showLabels: Boolean,
    size: { type: String, default: '80px' },
    customClass: { type: String, default: 'd-flex justify-start align-center pa-2 pl-4' },
    spacing: { type: String, default: 'pr-5' },
    deletable: Boolean,
    isView: Boolean,
    clickable: { type: Boolean, default: true },
    dark: Boolean,
    row: Boolean
  },
  // data () {
  //   return {
  //     groupProfiles: this.formatProfiles(this.profiles)
  //   }
  // },
  computed: {
    columns () {
      return this.profiles.length
    }
  },
  methods: {
    profileClick (profile) {
      this.$emit('profile-click', profile)
    }
    // formatProfiles (profiles) {
    //   if (profiles.length > 0 && has(profiles[0], 'profile')) {
    //     var formattedProfiles = []
    //     profiles.map(profile => {
    //       formattedProfiles.push(profile.profile)
    //     })
    //     return formattedProfiles
    //   } else return profiles
    // }
  }
}
</script>
<style scoped lang="scss">
.label {
  color: #9b9b9b
}
* {
  color: #383838
}

</style>
