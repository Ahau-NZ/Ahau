<template>
  <v-row fluid :class="mobile ? 'rounded-border' : ''">
    <v-row>
      <v-col v-if="showAvatar">
        <v-btn @click="$emit('setPageComponent', 'profile')" light text style="height: auto;">
          <Avatar :image="profile.avatarImage" :alt="profile.preferredName" size="15vh" />
          <h1 class="primary--text">{{ profile.preferredName }}</h1>
        </v-btn>
      </v-col>
      <v-col v-for="(item, i) in menuItems" :key="i" :cols="mobile ? '3' : '12'">
        <v-btn @click="$emit('setPageComponent', item.page)" light :fab="mobile" text>
          <v-img justify-start max-width="30" max-height="30" :src="item.icon" />
          <span v-if="!mobile && !isOverflowing" ref="text" class="ml-4 black--text nav-label subtitle-1">{{ item.label }}</span>
        </v-btn>
      </v-col>
    </v-row>
  </v-row>
</template>

<script>

import archive from '@/assets/archive-red.svg'
import timeline from '@/assets/timeline.svg'
import whakapapa from '@/assets/tree.svg'
import activity from '@/assets/activity.svg'

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
    showAvatar: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      componentLoaded: false,
      menuItems: [
        {
          icon: archive,
          label: 'Archive',
          page: 'archive'
        },
        {
          icon: timeline,
          label: 'Story',
          page: 'Story'
        },
        {
          icon: whakapapa,
          label: 'Whakapapa',
          page: 'whakapapa'
        },
        {
          icon: activity,
          label: 'Activity',
          page: 'activity'
        }
      ]
    }
  },
  mounted () {
    this.componentLoaded = true
  },
  computed: {
    mobile () {
      return this.$vuetify.breakpoint.xs
    },
    isOverflowing () {
      if (!this.componentLoaded) return false
      var element = this.$refs.text
      return (element.offsetHeight < element.scrollHeight || element.offsetWidth < element.scrollWidth)
    }
  }
}
</script>

<style lang="scss" scoped>
  .icon-bar {
    border: 0.5px solid rgba(0, 0, 0, 0.2);
    border-radius: 10px;
  }

  .border {
    border-style: 1px solid lightgrey;
  }
</style>
