<template>
  <v-col class="pt-0 pb-0">
    <v-row>
      <v-col class="pt-1 pb-0">
        <small> {{ groupTitle }} </small>
      </v-col>
    </v-row>

    <v-row class="d-flex justify-start align-center pa-2">
      <div
        width="100%"
        class="pt-0 pb-0 pr-5"
        v-for="profile in profiles"
        :key="profile.id"
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
            :clickable="true"
            @click="profileClick(profile)"
          />
        </div>
      </div>

      <v-col v-if="addButtonSlot" class="d-flex justify-center align-center">
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
    addButtonSlot: { type: Boolean, default: true }
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
