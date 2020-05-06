<template>
  <div>
    <v-row>
      <!--======== Main column ========-->
      <v-col cols="10" class="pt-0">
        <!-- Name row -->
        <v-row justify="center" class="pl-10">
          <v-col>
            <h1 class="primary--text">{{ profile.legalName }}</h1>
          </v-col>
        </v-row>

        <!-- square info hub -->
        <v-row>
          <v-col v-if="!isEditing">
            <v-row style="border: 0.5px solid rgba(0,0,0,0.12); border-radius: 10px; background-color: white;"
              class="flex-column ma-0">
              <v-row style="border-bottom: 0.5px solid rgba(0,0,0,0.12);" class="ma-0 py-2">
                <v-col cols="3">
                  <!-- Desktop: Legal Name -->
                  <v-row>
                    <v-col class="py-1 px-0 profile-label"><small>Preferred Name</small></v-col>
                  </v-row>
                  <v-row class="py-0 justify-center">
                    <p class="ma-0 profile-info">{{profile.preferredName}}</p>
                  </v-row>
                </v-col>
                <v-divider vertical light />

                <v-col cols="3">
                  <!-- Desktop: Age -->
                  <v-row>
                    <v-col class="py-1 px-0 profile-label"><small>Age</small></v-col>
                  </v-row>
                  <v-row v-if="profile.bornAt" class="py-0 justify-center">
                    <p class="ma-0 profile-info">{{age(profile.bornAt)}}</p>
                  </v-row>
                  <v-row v-if="profile.bornAt" class="py-0 justify-center">
                    <p class="ma-0 profile-info"><small>{{formatDob(profile.bornAt)}}</small></p>
                  </v-row>
                </v-col>
                <v-divider vertical light />

                <v-col cols="3">
                  <!-- Desktop: Profession -->
                  <v-row>
                    <v-col class="py-1 px-0 profile-label"><small>Occupation</small></v-col>
                  </v-row>
                  <v-row class="py-0 justify-center">
                    <p class="ma-0 profile-info" style="font-size: 0.8em">{{profile.profession}}</p>
                  </v-row>
                </v-col>
                <v-divider vertical light />

                <v-col cols="2">
                  <!-- Desktop: Location -->
                  <v-row>
                    <v-col class="py-1 px-0 profile-label"><small>Location</small></v-col>
                  </v-row>
                  <v-row class="py-0 justify-center">
                    <p class="ma-0 profile-info" style="font-size: 0.8em">{{profile.location}}</p>
                  </v-row>
                </v-col>

              </v-row>

              <v-row style="border-bottom: 0.5px solid rgba(0,0,0,0.12)" class="ma-0 pb-5">
                <!-- Desktop: Information Col -->
                <!-- <v-col cols="12" class="border-right"  v-if="!isEditing" justify-sm="space-around"> -->
                <!--===== Family Members =====-->

                <!-- Desktop: Parents -->
                <v-col class="pa-0">
                  <AvatarGroup v-if="profile.parents" :profiles="profile.parents" group-title="Parents" size="50px" :show-labels="true"
                    @profile-click="openProfile($event)">
                  </AvatarGroup>
                </v-col>
                <v-divider vertical light />


                <!-- <hr v-if="profile.siblings" class="family-divider" /> -->

                <!-- Desktop: Siblings -->
                <v-col class="pa-0">
                  <AvatarGroup v-if="profile.siblings" :profiles="profile.siblings" group-title="Siblings" size="50px" :show-labels="true"
                    @profile-click="openProfile($event)">
                  </AvatarGroup>
                </v-col>
                <v-divider vertical light />


                <!-- <hr class="family-divider"> -->

                <!-- Desktop: Children -->
                <v-col class="pa-0">
                  <AvatarGroup v-if="profile.children" :profiles="profile.children" group-title="Children" size="50px" :show-labels="true"
                    @profile-click="openProfile($event)">
                  </AvatarGroup>
                </v-col>
              </v-row>

            </v-row>
          </v-col>
        </v-row>
        <!-- End of Name row -->

        <!-- About row -->
        <v-row >
          <v-col cols="12">
            <v-card light min-height="100px">
              <v-card-title class="headline font-weight-bold">About</v-card-title>
              <v-card-text>
                <p v-for="(p, i) in splitParagraphs(profile.description)" :key="i + p">
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

      <!--======== Side column ========-->
      <v-col cols="2" class="px-6 pt-0">

        <!-- Edit Card -->
        <v-row class="first-row">
          <!-- Edit icon -->
          <v-col justify="center" align="center">
            <v-btn small class="my-2" fab color="white" @click="updateDialog('edit-node')">
              <v-icon small class="black--text">mdi-pencil</v-icon>
            </v-btn>
            <!-- <span class="ml-4 black--text subtitle">Edit Profile</span> -->
          </v-col>
        </v-row>

        <!-- Kaitiaki Card -->
        <v-row>
          <v-card min-height="200px" light class="my-3 rounded-card">
            <h4 class="ma-3 mb-0">Kaitiaki</h4>
            <v-card-text>
              <p>These are the people who have administrative rights on this profile</p>
            </v-card-text>
            <!-- TODO: v-for Kaitiaki -->
            <div>
              <p style="color: lightgrey; text-align: center;">TODO: v-for Kaitiaki Component</p>
            </div>
          </v-card>
        </v-row>

        <!-- Communities Card -->
        <v-row>
          <v-card min-height="200px" light class="my-3 rounded-card">
            <h4 class="ma-3 mb-0">Communities</h4>
            <v-card-text>
              <p>These are the communities connected to this profile</p>
            </v-card-text>
            <!-- TODO: v-for Communities -->
            <div>
              <p style="color: lightgrey; text-align: center">TODO: v-for Communities Component</p>
            </div>
          </v-card>
        </v-row>
      </v-col>
    </v-row>
  </div>
</template>

<script>
import Kaitiaki from '@/components/profile/Kaitiaki.vue'
import Avatar from '@/components/Avatar.vue'
import AvatarGroup from '@/components/AvatarGroup.vue'
import AddButton from '@/components/button/AddButton.vue'

import calculateAge from '@/lib/calculate-age'
import formatDate from '@/lib/format-date'

export default {
  name: 'Profile',
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
  data () {
    return {
      isEditing: false
    }
  },
  methods: {
    splitParagraphs (text) {
      if (!text) return
      return text.split('\n\n')
    },
    getComponent () {
      // isMobile would be some check to determine the validity of that, how ever you check for that
      switch (this.$vuetify.breakpoint.name) {
        case 'xs':
          return 'ProfileShowMobile'
        case 'sm':
        case 'md':
        case 'lg':
        case 'xl':
          return 'ProfileShowDesktop'
      }
    },
    age (born) {
      console.log("dob: ", born)
      var age = calculateAge(born)
      if (age == null) {
        return 'age not entered'
      }
      return age
    },
    formatDob (born) {
      var formattedDate = formatDate(born)
      if (formattedDate == null) {
        return 'no dob'
      }
      return formattedDate
    },
    updateDialog (dialog) {
      this.$emit('setDialog', dialog)
    }
  },
  components: {
    AvatarGroup,
    AddButton
  }
}
</script>
<style scoped lang="scss">
  .wrapper {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .rounded-card {
    border-radius: 10px;
    p {
      font-size: 0.8em;
      line-height: 1.6;
    }
  }

  .first-row {
    height: 70px;
  }

  .nav-icon {
    width: 30px;
  }
</style>
