<template>
  <v-col class="pt-0 pb-0">
    <v-row>
      <v-col class="pt-1 pb-0">
        <small> {{ groupTitle }} </small>
      </v-col>
    </v-row>

    <v-row class="d-flex align-center">
      <v-col
        cols="4"
        class="pt-0 pb-0"
        v-for="profile in profiles"
        :key="profile.id"
      >
        <v-row justify="center">
          <Avatar
            :size="size"
            :image="profile.avatarImage"
            :alt="profile.preferredName"
            :gender="profile.gender"
            :aliveInterval="profile.aliveInterval"
            :deceased="profile.deceased"
            :show-label="showLabels"
            :clickable="true"
            @click="profileClick(profile)"
          />
        </v-row>
      </v-col>

      <v-col cols="4" class="d-flex justify-center align-center">
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
    size: { type: String, default: '80px' }
  },
  methods: {
    profileClick (profile) {
      this.$emit('profile-click', profile)
    }
  }
}
// NOTE: this component stretchs to the parent. Can be changes later on as needed to adapt to different sizes
</script>
