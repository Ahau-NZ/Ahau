<template>
  <v-col class="pt-0 pb-0">
    <v-row>
      <v-col class="pt-1 pb-0">
        <small> {{ groupTitle }} </small>
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="4" class="pt-0 pb-0" v-for="profile in profiles" :key="profile.id">
        <v-row justify="center">
          <Avatar :size="size" :show-label="showLabels" :image="profile.avatarImage" :alt="profile.preferredName" :gender="profile.gender" :bornAt="profile.bornAt"/>
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
    click () {
      this.$emit('button-click')
    }
  }
}
// NOTE: this component stretchs to the parent. Can be changes later on as needed to adapt to different sizes
</script>
