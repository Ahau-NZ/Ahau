<template>
  <v-row cols="12" xs="2" v-scroll="onScroll">
    <v-col cols="12">
      <v-row v-if="showAvatar" cols="12" xs="12" sm="12" justify="center">
        <v-btn @click="$emit('setPageComponent', 'profile')" light text style="height: auto;">
          <Avatar :image="profile.avatarImage" :alt="profile.preferredName" size="60%" />
        </v-btn>
      </v-row>
      <v-row v-if="showAvatar" justify="center" align="center" cols="12" xs="12">
        <h1 class="primary--text">{{ profile.preferredName }}</h1>
      </v-row>
    </v-col>
      <!-- <v-row :class="mobile ? 'rounded-border w' : ''"> -->
    <v-row cols="12" ref="sideNav">
      <v-col v-for="(item, i) in menuItems" :key="i" :cols="mobile ? '3' : '12'">
        <v-btn @click="$emit('setPageComponent', item.label)" light :fab="mobile" text color="red">
          <img justify="start" max-width="30" max-height="30" :src="item.icon" />
          <span v-if="!mobile && !isOverflowing" ref="text" class="ml-2 black--text nav-label subtitle-1">{{ item.label }}</span>
        </v-btn>
      </v-col>
    </v-row>
      <!-- </v-row> -->
  </v-row>
</template>

<script>

import archive from '@/assets/archive.svg'
import timeline from '@/assets/timeline.svg'
import whakapapa from '@/assets/tree.svg'
import activity from '@/assets/activity.svg'

import Avatar from '@/components/Avatar.vue'

// When the user scrolls the page, execute myFunction
// window.onscroll = function() {myFunction()};

// // Get the header
// var header = document.getElementById("sideNav");

// // Get the offset position of the navbar
// var sticky = header.offsetTop;

// // Add the sticky class to the header when you reach its scroll position. Remove "sticky" when you leave the scroll position
// function myFunction() {
//   if (window.pageYOffset > sticky) {
//     header.classList.add("sticky");
//   } else {
//     header.classList.remove("sticky");
//   }
// }

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
      offset: 0,
      sticky: false, 
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
    this.offset = this.$refs.sideNav.offsetTop + 55
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
  },
  methods : {
    onScroll () {
      var scroll = window.pageYOffset
      var sideNav = this.$refs.sideNav 
      console.log("scroll: ", scroll)
      console.log("offset: ", this.offset)
      if (scroll > this.offset) {
        console.log("set stick")
        sideNav.classList.add("sticky");
      } else {
        console.log("remove stick")
        sideNav.classList.remove("sticky")
      }
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
  // .avatar-mobile {
  //   justify: 'center';
  // }

  .avatar-desktop {
    margin-top: 7vw;
    margin-left: 1vw
  }

  .sticky {
    position: fixed; /* Allocates space for the element, but moves it with you when you scroll */
    top: 0; 
    width: 100%; /* specifies the start position for the sticky behavior - 0 is pretty common */
    z-index: 1;
    border: black;
  }


</style>
