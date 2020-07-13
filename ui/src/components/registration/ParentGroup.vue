<template>
  <v-col class="px-4 py-0">
    <v-row>
      <v-col class="pt-0 pb-1">
        <v-row>
          <v-col class="pt-1 pb-2">
            <small class="label"> {{ title }} </small>
          </v-col>
        </v-row>
        <v-row >
          <v-col cols="2" class="pa-0 pl-0">
              <Avatar
                size="50px"
                :image="profile.avatarImage"
                :alt="profile.preferredName"
                :gender="profile.gender"
                :aliveInterval="profile.aliveInterval"
                :deceased="profile.deceased"
                :showLabel="showLabels"
                :clickable="clickable"
                @click="profileClick(profile)"
                :deletable="deletable"
                @delete="$emit('delete', i)"
                :isView="isView"
                :dark="dark"
              />
          </v-col>
          <v-col v-if="profile.legalName" cols="6" class="py-0">
            <v-row>
              <span class="text">{{profile.legalName}}</span>
            </v-row>
            <v-row class="sub-title">
              <span>legal name</span>
            </v-row>
          </v-col>
          <v-col cols="3" class="py-0 pl-0">
            <v-row>
              <span class="text">{{profile.preferredName}}</span>
            </v-row>
            <v-row class="sub-title">
              <p>name</p>
            </v-row>
          </v-col>
          <v-col cols="1" class="py-0 ">
            <v-row>
              <span class="text">{{ age }}</span>
            </v-row>
            <v-row class="sub-title">
              <span>age</span>
            </v-row>
          <v-btn color="white" elevation="2" fab light x-small style="position:relative;left:40px">
            <v-icon>mdi-close</v-icon>
          </v-btn>
          </v-col>
        </v-row>
      </v-col>
    </v-row>
  </v-col>
</template>

<script>
import Avatar from '@/components/Avatar.vue'
import calculateAge from '@/lib/calculate-age'
import AddButton from '@/components/button/AddButton.vue'

// import has from 'lodash.has'
export default {
  name: 'ParentGroup',
  components: {
    Avatar,
    AddButton
  },
  props: {
    profile: { type: Object, default: null },
    title: { type: String, default: null },
    showLabels: { type: Boolean, default: false },
    size: { type: String, default: '80px' },
    customClass: { type: String, default: 'd-flex justify-start align-center pa-2 pl-4' },
    spacing: { type: String, default: 'pr-5' },
    deletable: { type: Boolean, default: false },
    isView: { type: Boolean, default: false },
    clickable: { type: Boolean, default: true },
    dark: { type: Boolean, default: false }
  },
  // data () {
  //   return {
  //     groupProfiles: this.formatProfiles(this.profiles)
  //   }
  // },
  computed: {
    age () {
      var age = calculateAge(this.profile.aliveInterval)
      if (age === null) return ' '
      return age.toString()
    },
    grandParents () {
      var grandparents = []
      if (this.profile.parents) {
        this.profile.parents.map(grandparent => {
          console.log(grandparent)
          
          var profile = {
            ...grandparent.profile,
            relationshipType: grandparent.relationshipType
          }
          grandparents.push(profile)
        })
        return grandparents
      }
    }
  },
  methods: {
    profileClick (profile) {
      this.$emit('profile-click', profile)
    },
  
    // formatProfiles (profiles) {
    //   if (profiles.length > 0 && has(profiles[0], 'profile')) {
    //     var formattedProfiles = []
    //     profiles.map(profile => {
    //       formattedProfiles.push(profile.profile)
    //     })
    //     return formattedProfiles      
    //   } else return profiles
    // }
  }
}
</script>
<style scoped lang="scss">
.label {
  color: #9b9b9b
}
* {
  color: #383838
}

.sub-title {
  font-size: .6rem;
  color : #9b9b9b
}

.text {
  font-size:85%
}
</style>
