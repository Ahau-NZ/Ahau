<template>
    <div class="wrapper">

        <!-- Header & Profile Pic -->
        <Header :preferredName="profile.preferredName" :headerImage="profile.headerImage" :avatarImage="profile.avatarImage" />

        <!-- Profile body (middle column) -->
        <v-container :fluid="true" class="body-width white px-6 niho-bg">

            <v-row>

                <!-- Left column -->
                <v-col cols="2">
                    <!-- Pofile pic -->
                    <v-row class="avatar-row first-row">
                        <v-col class="avatar-box">
                            <Avatar :image="profile.avatarImage" :alt="profile.preferredName" :gender="profile.gender" size="200" />
                        </v-col>
                    </v-row>
                    <!-- Nav Icons -->
                    <v-row>
                        <v-col class="ml-4">
                            <v-row justify="start" align="center" class="nav-row" to="/archive">
                                <img class="nav-icon" v-bind:src="require('@/assets/archive.svg')" />
                                <span class="ml-4 black--text nav-label">Archive</span>
                            </v-row>
                            <v-row justify="start" align="center" class="nav-row">
                                <img class="nav-icon" v-bind:src="require('@/assets/timeline.svg')" />
                                <span class="ml-4 black--text nav-label">Story</span>
                            </v-row>
                            <v-row justify="start" align="center" class="nav-row">
                                <img class="nav-icon" v-bind:src="require('@/assets/tree.svg')" />
                                <span class="ml-4 black--text nav-label">Whakapapa</span>
                            </v-row>
                            <v-row justify="start" align="center" class="nav-row">
                                <img class="nav-icon" v-bind:src="require('@/assets/activity.svg')" />
                                <span class="ml-4 black--text nav-label">Activity</span>
                            </v-row>
                        </v-col>
                    </v-row>

                </v-col>

                <!-- Middle column -->
                <v-col cols="8">
                    <!-- Name row -->
                    <v-row justify="center" class="first-row">
                        <v-col>
                            <h1 class="primary--text">{{ profile.preferredName }}</h1>
                        </v-col>
                    </v-row>

                    <!-- square info hub -->
                    <v-row>
                        <v-col v-if="!isEditing">
                            <v-row style="border: 0.5px solid rgba(0,0,0,0.12); border-radius: 10px; background-color: white;" class="flex-column ma-0">
                                <v-row style="border-bottom: 0.5px solid rgba(0,0,0,0.12);" class="ma-0 py-6">
                                    <v-col cols="3" class="px-0">
                                        <!-- Desktop: Legal Name -->
                                        <v-row>
                                            <v-col class="py-1 px-0 profile-label"><small>Legal Name</small></v-col>
                                        </v-row>
                                        <v-row class="py-0 justify-center">
                                            <p class="ma-0 profile-info">{{profile.legalName}}</p>
                                        </v-row>
                                    </v-col>
                                    <v-divider vertical light />

                                    <v-col cols="3" class="px-0">
                                        <!-- Desktop: Age -->
                                        <v-row>
                                            <v-col class="py-1 px-0 profile-label"><small>Age</small></v-col>
                                        </v-row>
                                        <v-row class="py-0 justify-center">
                                            <p class="ma-0 profile-info">{{age(profile.bornAt)}}</p>
                                        </v-row>
                                        <v-row class="py-0 justify-center">
                                            <p class="ma-0 profile-info"><small>{{formatDob(profile.bornAt)}}</small></p>
                                        </v-row>
                                    </v-col>
                                    <v-divider vertical light />

                                    <v-col cols="3" class="px-0">
                                        <!-- Desktop: Profession -->
                                        <v-row>
                                            <v-col class="py-1 px-0 profile-label"><small>Occupation</small></v-col>
                                        </v-row>
                                        <v-row class="py-0 justify-center">
                                            <p class="ma-0 profile-info" style="font-size: 0.8em">{{profile.profession}}</p>
                                        </v-row>
                                    </v-col>
                                    <v-divider vertical light />

                                    <v-col cols="2" class="px-0">
                                        <!-- Desktop: Location -->
                                        <v-row>
                                            <v-col class="py-1 px-0 profile-label"><small>Location</small></v-col>
                                        </v-row>
                                        <v-row class="py-0 justify-center">
                                            <p class="ma-0 profile-info" style="font-size: 0.8em">{{profile.location}}</p>
                                        </v-row>
                                    </v-col>

                                </v-row>

                                <v-row style="border-bottom: 0.5px solid rgba(0,0,0,0.12);" class="ma-0">
                                    <!-- Desktop: Information Col -->
                                    <!-- <v-col cols="12" class="border-right"  v-if="!isEditing" justify-sm="space-around"> -->
                                    <!--===== Family Members =====-->

                                    <!-- Desktop: Parents -->
                                    <v-col cols="4" class="pa-0">
                                        <AvatarGroup :profiles="profile.parents" group-title="Parents" size="50px" :show-labels="true" @profile-click="openProfile($event)">
                                            <AddButton @click="toggleNew('parent')" />
                                        </AvatarGroup>
                                    </v-col>

                                    <!-- <hr v-if="profile.siblings" class="family-divider" /> -->

                                    <!-- Desktop: Siblings -->
                                    <v-col  cols="8" v-if="profile.siblings" class="pa-0">
                                        <AvatarGroup :profiles="profile.siblings" group-title="Siblings" size="60px" :show-labels="true" @profile-click="openProfile($event)">
                                            <AddButton v-if="view.focus !== profile.id" @click="toggleNew('sibling')" />
                                        </AvatarGroup>
                                    </v-col>

                                    <!-- <hr class="family-divider"> -->

                                    <!-- Desktop: Children -->
                                    <v-col class="pa-0">
                                        <AvatarGroup :profiles="profile.children" group-title="Children" size="60px" :show-labels="true" @profile-click="openProfile($event)">
                                            <AddButton @click="toggleNew('child')" />
                                        </AvatarGroup>
                                    </v-col>

                                    <!-- Desktop: Go to whakapapa -->
                                    <!-- <v-col class="pa-0" style="display: flex; justify-content: center; align-items: center;">
                                        <v-btn color=""><img class="nav-icon mr-3" v-bind:src="require('@/assets/tree-white.svg')" />View this persons whakapapa</v-btn>
                                    </v-col> -->

                                    <!-- END Desktop: Family Members -->

                                    <!-- </v-col> -->
                                </v-row>

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

            <!-- Right column -->
            <v-col cols="2" class="px-6">

                <!-- Edit Card -->
                <v-row class="first-row">
                    <!-- Edit icon -->
                    <v-col justify="center" align="center">
                        <v-btn small class="my-2" fab color="white" @click="updateDialog('edit-node', '')">
                            <v-icon small class="black--text">mdi-pencil</v-icon>
                        </v-btn>
                        <span class="ml-4 black--text subtitle">Edit Profile</span>
                    </v-col>
                </v-row>

                <!-- Kaitiaki Card -->
                <v-row>
                    <v-card min-height="200px" light class="my-3 rounded-card">
                        <h4 class="col-subtitle mt-3">Kaitiaki</h4>
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
                        <h4 class="col-subtitle mt-3">Communities</h4>
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
        </v-container>

    </div>
</template>

<script>
import Header from '@/components/profile/Header.vue'
import Kaitiaki from '@/components/profile/Kaitiaki.vue'
import Avatar from '@/components/Avatar.vue'
import AvatarGroup from '@/components/AvatarGroup.vue'
import AddButton from '@/components/button/AddButton.vue'
import calculateAge from '@/lib/calculate-age'
import formatDate from '@/lib/format-date'

// const get = require('lodash.get')

export default {
  name: 'ProfileShowDesktop',
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
    age (born) {
      var age = calculateAge(born)
      if (age == null) { return 'age not entered' }
      return age
    },
    formatDob (born) {
      var formattedDate = formatDate(born)
      if (formattedDate == null) { return 'no dob' }
      return formattedDate
    },
    updateDialog (dialog, type) {
      this.$emit('dialogTrigger', {
        dialog: dialog,
        type: type
      })
    }
  },
  components: {
    Header,
    Kaitiaki,
    Avatar,
    AvatarGroup,
    AddButton
  }
}
</script>

<style scoped lang="scss">
$avatarSize: 25vh;
$ratio: 5.33333;
$headerHeight: 100vw / $ratio;
$maxHeaderWidth: 1400px;
$formWidth: 600px;
* {
    color: black;
}

.wrapper {
    display: flex;
    flex-direction: column;
    align-items: center; // background: linear-gradient(to right, grey 0%,grey 50%,#000000 50%,white 50%,white 100%);
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
        /* height: 20%; */
        margin: auto;
        .avatar-box {
            position: absolute;
            /* left: calc(-100vw / 3 + 3 * #{$avatarSize}); */
            top: -$avatarSize/1.5;
            width: 100%;
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
        background: linear-gradient(rgba(255, 255, 255, 0.7), rgba(255, 255, 255, 0.7)), url(../assets/niho.svg);
        background-position-x: 150%;
        background-repeat: no-repeat;
    }
}

.first-row {
    height: 70px;
}
</style>
