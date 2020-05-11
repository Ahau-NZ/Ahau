<template>
  <v-row cols="12" xs="2">
    <v-col cols="12">
      <v-row v-if="showAvatar" cols="12" xs="12" sm="12" :justify="mobile ? 'center' : ''">
        <v-btn @click="$emit('setPageComponent', 'profile')" light text style="height: auto;">
          <Avatar :image="profile.avatarImage" :alt="profile.preferredName" size="200px" />
        </v-btn>
      </v-row>
      <v-row v-if="showAvatar" justify="center" align="center" cols="12" xs="12">
        <h1 class="primary--text">{{ profile.preferredName }}</h1>
      </v-row>
    </v-col>
      <!-- <v-row :class="mobile ? 'rounded-border w' : ''"> -->
    <v-col v-for="(item, i) in menuItems" :key="i" :cols="mobile ? '3' : '12'">
      <v-btn @click="$emit('setPageComponent', item.label)" light :fab="mobile" text>
        <v-img justify-start max-width="30" max-height="30" :src="item.icon" justify-center/>
        <span v-if="!mobile && !isOverflowing" ref="text" class="ml-4 black--text nav-label subtitle-1">{{ item.label }}</span>
      </v-btn>
    </v-col>
      <!-- </v-row> -->
  </v-row>
</template>

<script>

import archive from '@/assets/archive.svg'
import timeline from '@/assets/timeline.svg'
import whakapapa from '@/assets/tree.svg'
import activity from '@/assets/activity.svg'

import Avatar from '@/components/Avatar.vue'

export default {
  name: 'SideNavMenu',
  components: {
    Avatar
  },
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
          label: 'Archive'
        },
        {
          icon: timeline,
          label: 'Timeline'
        },
        {
          icon: whakapapa,
          label: 'Whakapapa'
        },
        {
          icon: activity,
          label: 'Activity'
        }
      ]
    }
  },
  mounted () {
    this.componentLoaded = true
  },
  computed: {
    mobile () {
      return this.$vuetify.breakpoint.xs || this.$vuetify.breakpoint.sm
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

  .side-padding {
    padding-left: 10px;
    padding-right: 10px;
    background-color: white;
  }
  .w {
    height: 80px;
  }
  .rounded-border {
    border: 0.5px solid rgba(0,0,0,0.12);
    border-radius: 10px;
    background-color: white;
    margin-left: 3px;
    margin-right: 3px;
  }
  .avatar-mobile {
    justify: 'center';
  }

  .avatar-desktop {
    margin-top: 7vw;
    margin-left: 1vw
  }
</style>
