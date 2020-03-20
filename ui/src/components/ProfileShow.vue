<template>
  <div class="wrapper">

    <!-- Header & Profile Pic -->
    <Header
      :preferredName="profile.preferredName"
      :headerImage="profile.headerImage"
      :avatarImage="profile.avatarImage"
    />

    <!-- Profile body (middle column) -->
    <v-container :fluid="true" class="body-width white px-12 niho-bg">
      
      <v-row>

        <!-- Left column -->
        <v-col cols="2">
          <!-- Pofile pic -->
          <v-row class="avatar-row">
            <v-row class="avatar-box">
              <Avatar :image="profile.avatarImage" :alt="profile.preferredName" size="25vh" />
            </v-row>
          </v-row>
          <!-- Nav Icons -->
          <v-row justify="start" align="center" class="nav-row">
            <v-btn light :to="{ name: 'archive', params: { id: profile.id } }">
              <img class="nav-icon" v-bind:src="require('@/assets/archive.svg')"/>
              <span class="ml-4 black--text nav-label">Archive</span>
            </v-btn>
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
              <v-col cols="10">
                <h1 class="primary--text">{{ profile.preferredName }}</h1>
                <v-row>
                  <v-col v-if="profile.legalName" style="text-align: center;">
                    <h3 class="primary--text caption">Legal name</h3>
                    <p class="primary--text body-1">{{ profile.legalName }}</p>
                  </v-col>
                  <v-col style="text-align: center;">
                    <h3 class="primary--text caption">Other names</h3>
                    <p class="primary--text body-1">{{profile.altNames}}</p>
                  </v-col>
                  <v-col style="text-align: center;">
                    <h3 class="primary--text caption">Date of birth</h3>
                    <p class="primary--text body-1">{{profile.bornAt}}</p>
                  </v-col>
                </v-row>
              </v-col>
      
             
      
            </v-row>
            <!-- End of Name row -->

            <!-- About row -->
            <v-row>
                <v-col cols="12">
                  <v-card light min-height="150px">
                    <v-card-title class="headline font-weight-bold">About</v-card-title>
                    <v-card-text>
                      <p
                        v-for="(p, i) in splitParagraphs(profile.description)"
                        :key="i + p"
                      >
                        {{ p }}
                      </p>
                    </v-card-text>
                  </v-card>
                </v-col>
              </v-row>
            <!-- Contact row -->
            <v-row>
                <v-col cols="12">
                  <v-card light min-height="200px">
                    <v-card-title class="headline font-weight-bold">Contact</v-card-title>
                    <v-card-text>
                      <p>
                        TODO: Contact fields
                      </p>
                    </v-card-text>
                  </v-card>
                </v-col>
              </v-row>
        </v-col>

        <!-- Right column -->
        <v-col cols="2" class="px-12">



          <!-- Communities Card -->
          <v-row>
            <v-col>
             <!-- Edit icon -->
             
             <v-row justify="center" align="center">
                <v-btn
                  v-if="profile.canEdit"
                  small="true"
                  class="my-2"
                  fab
                  color="white"
                  @click="editProfile()"
                >
                  <v-icon small=true class="black--text">mdi-pencil</v-icon>
                </v-btn>
                <span class="ml-4 black--text subtitle">Edit Profile</span>
              </v-row>

            <h4 class="col-subtitle mt-6">Kaitiaki</h4>
            <v-card min-height="200px" light class="my-3 rounded-card">
              <v-card-text>
                <p>These are the people who have administrative rights on this profile</p>
              </v-card-text>
              <!-- TODO: v-for Kaitiaki -->
              <v-card-content>
                  <p style="color: lightgrey; text-align: center;">TODO: v-for Kaitiaki Component</p>
              </v-card-content>
            </v-card>

            <h4 class="col-subtitle mt-6">Communities</h4>
            <v-card min-height="200px" light class="my-3 rounded-card">
              <v-card-text>
                <p>These are the communities connected to this profile</p>
              </v-card-text>
              <!-- TODO: v-for Communities -->
              <v-card-content>
                  <p style="color: lightgrey; text-align: center">TODO: v-for Communities Component</p>
              </v-card-content>
            </v-card>
            </v-col>

          </v-row>

        </v-col>

      </v-row>

      

      

     


    </v-container>
  </div>
</template>

<script>
import Header from '@/components/profile/Header.vue'
import Kaitiaki from '@/components/profile/Kaitiaki.vue'

import Avatar from '@/components/Avatar.vue'

// const get = require('lodash.get')

export default {
  name: 'ProfileShow',
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
    Header,
    Kaitiaki,
    Avatar
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
  position: relative;
  width: 100%;
  height: 20%;
  margin: auto;


  .avatar-box {
    position: absolute;
    left: calc(-100vw / 3 + 3 * #{$avatarSize});
    top: -$avatarSize/1.5;
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
