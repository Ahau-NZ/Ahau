<template>
 <v-col class="pa-0">
    <v-row>
      <v-col class="pt-1 pb-0">
        <small class="label"> {{ title }} </small>
      </v-col>
    </v-row>

    <v-row :class="customClass">
      <v-col>
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
      <v-col>
        <v-row>
          <span>preferred name</span>
        </v-row>
        <v-row>
          <span>{{profile.preferredName}}</span>
        </v-row>
      </v-col>
      <v-col>
        <v-row>
          <span>legal name</span>
        </v-row>
        <v-row>
          <span>{{profile.legalName}}</span>
        </v-row>
      </v-col>
      <v-col>
         <v-row>
          <span>age</span>
        </v-row>
        <v-row>
          <span>{{ age }}</span>
        </v-row>
        <v-row>
          
        </v-row>
      </v-col>


    </v-row>
  </v-col>
</template>

<script>
import Avatar from '@/components/Avatar.vue'
import calculateAge from '@/lib/calculate-age'

// import has from 'lodash.has'
export default {
  name: 'AvatarGroup',
  components: {
    Avatar
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
      console.log(this.profile.aliveInterval)
      var age = calculateAge(this.profile.aliveInterval)
      if (age === null) return ' '
      return age.toString()
    },
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

</style>
