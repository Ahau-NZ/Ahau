<template>
  <div>
    <!-- Pofile pic -->
    <v-row v-if="!noAvatar" class="mt-8">
      <v-col class="pa-0">
        <v-row class="pa-0" justify="center" align="center">
          <v-btn @click="$emit('setPageComponent', 'profile')" light text class="px-0" style="height: auto;">
            <Avatar :image="profile.avatarImage" :alt="profile.preferredName" size="15vh" />
          </v-btn>
        </v-row>
        <v-row justify="center" align="center">
          <h1 class="primary--text">{{ profile.preferredName }}</h1>
        </v-row>
      </v-col>
    </v-row>
    <!-- Nav Icons -->
    <v-row>
      <v-col class="pl-8">
        <v-row justify="start" align="center" class="nav-row">
          <v-btn @click="$emit('setPageComponent', 'archive')" light text class="px-0">
            <img class="nav-icon" v-bind:src="require('@/assets/archive-red.svg')" />
            <span class="ml-4 black--text nav-label subtitle-1">Archive</span>
          </v-btn>
        </v-row>
        <v-row justify="start" align="center" class="nav-row">
          <v-btn @click="$emit('setPageComponent', 'storyTimeline')" light text class="px-0">
            <img class="nav-icon" v-bind:src="require('@/assets/timeline.svg')" />
            <span class="ml-4 black--text nav-label subtitle-1">Story</span>
          </v-btn>
        </v-row>
        <v-row justify="start" align="center" class="nav-row">
          <img class="nav-icon" v-bind:src="require('@/assets/tree.svg')" />
          <span class="ml-4 black--text nav-label subtitle-1">Whakapapa</span>
        </v-row>
        <v-row justify="start" align="center" class="nav-row">
          <img class="nav-icon" v-bind:src="require('@/assets/activity.svg')" />
          <span class="ml-4 black--text nav-label subtitle-1">Activity</span>
        </v-row>
      </v-col>
    </v-row>
  </div>
</template>

<script>
import gql from 'graphql-tag'

import Avatar from '@/components/Avatar.vue'

export default {
  name: 'SideNavMenu',
  props: {
    profile: {
      type: Object
    },
    editProfile: {
      type: Function
      // default: () => console.log('need to define editProfile!')
    },
    noAvatar: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {}
  },
  beforeMount () {},
  mounted () {},
  methods: {},
  components: {
    Avatar
  }
}
</script>

<style lang="scss" scoped>

  .nav-row {
    margin: 20px;
  }

  .nav-icon {
    width: 30px;
  }

  .nav-label {
    // font-size: 1.2em;
  }
</style>
