<template>
    <!--
        This is a UI component that shows Legal Name, Age, Occupation, Location, Parents, Siblings and Children.
        Was made for profile but tried a different UI, so put here incase we want to use somewhere else.
        Screenshot of this component: https://pasteboard.co/J6sDygK.png
     -->
    <v-row>
        <v-col v-if="!isEditing">
            <v-row style="border: 0.5px solid rgba(0,0,0,0.12); border-radius: 10px; background-color: white;" class="flex-column ma-0">
                <v-row style="border-bottom: 0.5px solid rgba(0,0,0,0.12);" class="ma-0 py-6">
                    <v-col cols="3">
                        <!-- Desktop: Legal Name -->
                        <v-row>
                            <v-col class="py-1 px-0 profile-label"><small>Legal Name</small></v-col>
                        </v-row>
                        <v-row class="py-0 justify-center">
                            <p class="ma-0 profile-info">{{profile.legalName}}</p>
                        </v-row>
                    </v-col>

                    <v-col cols="3">
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

                    <v-col cols="3">
                        <!-- Desktop: Profession -->
                        <v-row>
                            <v-col class="py-1 px-0 profile-label"><small>Occupation</small></v-col>
                        </v-row>
                        <v-row class="py-0 justify-center">
                            <p class="ma-0 profile-info" style="font-size: 0.8em">{{profile.profession}}</p>
                        </v-row>
                    </v-col>

                    <v-col cols="3">
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
                    <v-col class="pa-0">
                        <AvatarGroup :profiles="profile.parents" group-title="Parents" size="50px" :show-labels="true" @profile-click="openProfile($event)">
                            <AddButton @click="toggleNew('parent')" />
                        </AvatarGroup>
                    </v-col>

                    <!-- <hr v-if="profile.siblings" class="family-divider" /> -->

                    <!-- Desktop: Siblings -->
                    <v-col v-if="profile.siblings" class="pa-0">
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
                    <v-col class="pa-0" style="display: flex; justify-content: center; align-items: center;">
                        <v-btn color=""><img class="nav-icon mr-3" v-bind:src="require('@/assets/tree-white.svg')" />View this persons whakapapa</v-btn>
                    </v-col>

                    <!-- END Desktop: Family Members -->

                    <!-- </v-col> -->
                </v-row>

            </v-row>
        </v-col>
    </v-row>
</template>

<script>
import AvatarGroup from '@/components/AvatarGroup.vue'
import AddButton from '@/components/button/AddButton.vue'
import calculateAge from '@/lib/calculate-age'
import formatDate from '@/lib/format-date'

export default {
  name: 'ProfileInfoBox',
  props: {
    profile: {
      type: Object,
      default: () => ({})
    }
  },
  data () {

  },
  methods: {
    age (born) {
      var age = calculateAge(born)
      if (age == null) { return 'age not entered' }
      return age
    },
    formatDob (born) {
      var formattedDate = formatDate(born)
      if (formattedDate == null) { return 'no dob' }
      return formattedDate
    }
  },
  components: {
    AvatarGroup,
    AddButton
  }
}
</script>

<style scoped lang="scss">
* {
    color: black;
}
</style>
