<template>
  <v-col class="pt-0 pb-0">
    <v-row>
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
            :bornAt="profile.bornAt"
            :deceased="profile.deceased"
            :showLabel="showLabels"
            :clickable="clickable"
            @click="profileClick(profile)"
          />
        </div>
      </div>

      <v-col v-if="addButtonSlot" :class="customClass">
        <v-row justify="center">
          <slot></slot>
        </v-row>
      </v-col>
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
    showLabels: { type: Boolean, default: false },
    size: { type: String, default: '80px' },
    addButtonSlot: { type: Boolean, default: true },
    customClass: { type: String, default: 'd-flex justify-start align-center pa-2 pl-4' },
    spacing: { type: String, default: 'pr-5' },
    clickable: { type: Boolean, default: true }
  },
  computed: {
    columns () {
      return this.profiles.length
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
.label {
  color: #9b9b9b
}
* {
  color: #383838
}

</style>
