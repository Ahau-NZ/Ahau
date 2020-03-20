<template>
  <div class="wrapper">
    <!-- Profile body (middle column) -->
    <v-container :fluid="true" class="body-width white px-12 niho-bg">
      
      <v-row>

        <!-- Left column -->
        <v-col cols="2">

          <!--===== TODO: Make this a SideNav.vue component -->
          <!-- Pofile pic -->
          <v-row class="avatar-row">
            <v-col>
              <v-row class="avatar-box" justify="center" align="center">
                <Avatar :image="profile.avatarImage" :alt="profile.preferredName" size="15vh" />
              </v-row>
              <v-row justify="center" align="center">
                <h1 class="primary--text">{{ profile.preferredName }}</h1>
              </v-row>
            </v-col>
          </v-row>
          <!-- Nav Icons -->
          <v-row justify="start" align="center" class="nav-row">
                <img class="nav-icon" v-bind:src="require('@/assets/archive-red.svg')"/>
                <span class="ml-4 black--text nav-label">Archive</span>
            </v-row>
            <v-row justify="start" align="center" class="nav-row">
                <img class="nav-icon" v-bind:src="require('@/assets/timeline.svg')"/>
                <span class="ml-4 black--text nav-label">Story</span>
            </v-row>
            <v-row justify="start" align="center" class="nav-row">
                <img class="nav-icon" v-bind:src="require('@/assets/tree.svg')"/>
                <span class="ml-4 black--text nav-label">Whakapapa</span>
            </v-row>
            <v-row justify="start" align="center" class="nav-row">
                <img class="nav-icon" v-bind:src="require('@/assets/activity.svg')"/>
                <span class="ml-4 black--text nav-label">Activity</span>
            </v-row>
        </v-col>

        <!-- Middle column -->
        <v-col cols="8">

          <!-- Name row -->
          <v-row justify="center" >
            <ArchiveStory/>
          </v-row>

        </v-col>
        <!-- End Middle column -->

        <!-- Right column -->
        <v-col cols="2" class="px-12">

          <!-- Communities Card -->
          <v-row>
            <v-col>
             <!-- Edit icon -->
             
             <v-row justify="center" align="center">
                <v-btn
                  v-if="profile.canEdit"
                  large=true
                  class="my-2"
                  fab
                  color="white"
                  @click="editProfile()"
                >
                  <v-icon large=true class="black--text">mdi-plus</v-icon>
                </v-btn>
              </v-row>

             <v-row justify="center" align="center">
                <v-btn
                  v-if="profile.canEdit"
                  small=true
                  class="my-2"
                  fab
                  color="white"
                  @click="editProfile()"
                >
                  <v-icon small=true class="black--text">mdi-magnify</v-icon>
                </v-btn>
              </v-row>
              
            </v-col>

          </v-row>

        </v-col>
        <!-- End Right column -->

      </v-row>

      

      

     


    </v-container>
  </div>
</template>

<script>
import Kaitiaki from '@/components/profile/Kaitiaki.vue'

import Avatar from '@/components/Avatar.vue'

import ArchiveStory from '@/components/ArchiveStory.vue'

// const get = require('lodash.get')

export default {
  name: 'ArchiveShow',
  props: {
    type: {
      type: String, // person / community?
      required: true
    },
    profile: {
      type: Object,
      default: () => ({})
    },
    editProfile: {
      type: Function
      // default: () => console.log('need to define editProfile!')
    }
  },
  methods: {
    splitParagraphs (text) {
      if (!text) return

      return text.split('\n\n')
    }
  },
  components: {
    Kaitiaki,
    Avatar,
    ArchiveStory
  }
}
</script>
<style scoped lang="scss">
$avatarSize: 25vh;
$ratio: 5.33333;
$headerHeight: 100vw / $ratio;
$maxHeaderWidth: 1400px;
$formWidth: 600px;

.wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  // background: linear-gradient(to right, grey 0%,grey 50%,#000000 50%,white 50%,white 100%);

  .body-width {
    min-width: $formWidth;
    max-width: 100vw;
    min-height: 100vh;
    background: white;
  }

  .rounded-card {
    border-radius: 10px;
    
      p {
        font-size: 0.8em;
        line-height: 1.6;
      }
  }

.avatar-row {
  /* position: relative;
  width: 100%;
  height: 20%;
  margin: auto; */


  .avatar-box {
    /* position: absolute;
    left: calc(-100vw / 3 + 3 * #{$avatarSize});
    top: -$avatarSize/1.5; */
  }
}

.col-subtitle {
  color: black;
  text-align: center;
}

.nav-row {
  margin: 20px;
}

.nav-icon {
  width: 30px;
}

.nav-label {
  font-size: 1.3em;
}

v-card {
  margin: 0;
  padding: 0;
}

.niho-bg {
  background:  linear-gradient(
      rgba(255, 255, 255, 0.7), 
      rgba(255, 255, 255, 0.7)
    ), url(../assets/niho.svg);
  background-position-x: 150%;
  background-repeat: no-repeat;  
}


}
</style>
