<template>
  <v-col class="pt-0 pb-0">
    <v-row v-if="groupTitle">
      <v-col class="pt-1 pb-0">
        <small class="label overline"> {{ groupTitle }} </small>
      </v-col>
    </v-row>

    <v-row :class="customClass">
      <div
        width="100%"
        :class="spacing"
        v-for="(profile, i) in formattedProfiles"
        :key="`${groupTitle}-${profile.id}-${i}`"
      >
        <div justify="center" class="pt-2">
          <Avatar
            :size="size"
            ::isEditing="false"
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
            :isView="isView || (profile.type === 'community' && !profile.avatarImage)"
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
  computed: {
    columns () {
      return this.profiles.length
    },
    formattedProfiles () {
      if (!this.profiles) return null
      return this.profiles.map(d => {
        if (d.profile) return d.profile
        return d
      })
    }
  },
  methods: {
    profileClick (profile) {
      this.$emit('profile-click', profile)
    }
  }
}
</script>
<style scoped lang="scss">

* {
  color: #383838
}

.label {
  color: rgba(0,0,0,0.6);
  font-size: 65% !important;
}

</style>
