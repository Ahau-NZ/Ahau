<template>
  <Dialog :show="show" :title="title" @close="close" width="720px" :goBack="close" enableMenu>
    <template v-if="!hideDetails" v-slot:content>
      <v-col cols="12" :class="mobile ? 'pb-5 px-5' : 'px-5' ">
        <v-hover v-if="errorMsgs && errorMsgs.length" v-slot:default="{ hover }">
          <v-row @click="$emit('editProfile',formData)" align="center" style="border: 1px solid rgba(168,0,0); border-radius: 10px;" :style="hover ? 'cursor: pointer;background-color:rgba(168,0,0,0.1)':''">
            <v-col cols="12" md="10">
                <v-row>
                  <span class="px-4 subtitle-2 secondary--text">To join this communtiy, please update the required areas on your profile</span>
                </v-row>
                <v-row v-for="error in errorMsgs" :key="error" justify="start" class="pl-12 py-1">
                <span class="secondary--text subtitle-2"> - Please update your {{error}} information</span>
                <!-- <v-col v-for="error in errorMsgs" :key="error[key]"></v-col> -->
                </v-row>
            </v-col>
          </v-row>
        </v-hover>
        <v-row>
          <span class="py-6 px-4 subtitle-2 blue--text">To join this communtiy, please confirm that you are happy to share the following profile information with whanau members</span>
        </v-row>
        <v-row>
          <v-col cols="12" md="3" class="py-0">
            <v-row class="justify-center pt-12">
              <Avatar
                class="big-avatar"
                :size="mobile ? '200px':'100px'"
                :image="formData.avatarImage"
                :alt="formData.preferredName"
                :gender="formData.gender"
                :aliveInterval="formData.aliveInterval"
                :deceased="formData.deceased"
                @updateAvatar="formData.avatarImage = $event"
              />
            </v-row>
          </v-col>
          <v-col cols="12" md="9" sm="12" :align="mobile ? 'center' : 'start'" :order="mobile ? '3' : '1'" :class="!mobile ? 'pt-12':''">
            <h1 class="primary--text" :style="mobile ? length: ''">{{ formData.legalName ? formData.legalName : formData.preferredName }}</h1>
          </v-col>
        </v-row>
        <!-- <RegisterButton v-if="profile.type === 'community'" :class="!mobile ? 'margin-top':''"/> -->
        <ProfileInfoCard :profile="formData" isRegistration/>
        <ProfileCard>
          <template v-slot:content>
            <ProfileInfoItem title="About" smCols="12" mdCols="12" :value="formData.description"/>
          </template>
        </ProfileCard>
        <v-row>
          <p class="py-6 px-4 subtitle-2 blue--text">The below private information will only be viewable by whanau kaitiaki</p>
        </v-row>
        <ProfileCard>
          <template v-slot:content>
            <v-row cols="12" class="pt-0" >
              <ProfileInfoItem :class="mobile ? 'bb':'br'" smCols="12" mdCols="3" title="Date of birth" :value="dob"/>
              <ProfileInfoItem :class="mobile ? 'bb':'br'" smCols="12" mdCols="3" title="Phone" :value="formData.phone"/>
              <ProfileInfoItem :class="mobile ? 'bb':'br'" smCols="12" mdCols="3" title="Email" :value="formData.email"/>
              <ProfileInfoItem smCols="12" mdCols="3" title="Address" :value="formData.address"/>
            </v-row>
          </template>
        </ProfileCard>
      </v-col>
    </template>


    <!-- Actions Slot -->
    <template v-slot:actions>
      <v-btn @click="close"
        text large
        class="secondary--text"
      >
        <!-- <v-icon color="secondary">mdi-close</v-icon> -->
        <span>cancel</span>
      </v-btn>
      <v-btn 
        @click="submit"
        :disabled="errorMsgs && errorMsgs.length"
        text large
        class="blue--text mx-5"
      >
        <!-- <v-icon>mdi-check</v-icon> -->
        <span>approve</span>
      </v-btn>
    </template>
    <!-- End Actions Slot -->

  </Dialog>
</template>

<script>

import { PERMITTED_PROFILE_ATTRS } from '@/lib/profile-helpers.js'
import getRelatives from '@/lib/profile-helpers.js'
import Avatar from '@/components/Avatar.vue'
import Dialog from '@/components/dialog/Dialog.vue'

import ProfileInfoCard from '@/components/profile/ProfileInfoCard.vue'
import ProfileInfoItem from '@/components/profile/ProfileInfoItem.vue'
import ProfileCard from '@/components/profile/ProfileCard.vue'
import formatDate from '@/lib/format-date'
import EditProfileButton from '@/components/button/EditProfileButton.vue'



import ProfileForm from '@/components/profile/ProfileForm.vue'
import isEmpty from 'lodash.isempty'
import calculateAge from '@/lib/calculate-age'
import pick from 'lodash.pick'
import isEqual from 'lodash.isequal'
import clone from 'lodash.clonedeep'
import { mapActions } from 'vuex'

const REQUIRED_ATTRS = [
  'id', 'legalName', 'aliveInterval', 'gender', 'relationshipType', 
  'parents', 'profession', 'address', 'email', 'phone', 'location'
]

function setProfileData () {
  const formData = {
    type: 'person',
    id: '',
    preferredName: '',
    legalName: '',
    altNames: {
      add: []
    },
    gender: '',
    relationshipType: 'birth',
    legallyAdopted: false,
    children: [],
    parents: [],
    siblings: [],
    avatarImage: {},
    aliveInterval: '',
    bornAt: '',
    diedAt: '',
    birthOrder: '',
    description: '',
    location: '',
    profession: '',
    address: '',
    email: '',
    phone: '',
    deceased: false
  }
  return formData
}

function updateProfileData (input) {
  if (input) 
  var profile = clone(input)
  var aliveInterval = profile.aliveInterval.split('/')
  return {
    id: profile.id,
    gender: profile.gender,
    legalName: profile.legalName,
    aliveInterval: profile.aliveInterval,
    bornAt: aliveInterval[0],
    diedAt: aliveInterval[1],
    preferredName: profile.preferredName,
    avatarImage: profile.avatarImage,
    description: profile.description,
    birthOrder: profile.birthOrder,
    location: profile.location,
    email: profile.email,
    phone: profile.phone,
    deceased: profile.deceased,
    address: profile.address,
    profession: profile.profession,
    altNames: {
      currentState: clone(profile.altNames),
      add: [], // new altNames to add
      remove: [] // altNames to remove
    },
    children: profile.children,
    parents: profile.parents,
    siblings: []
  }
}

export default {
  name: 'NewRegistrationDialog',
  components: {
    Dialog,
    ProfileForm,
    Avatar,
    ProfileInfoItem,
    ProfileInfoCard,
    ProfileCard,
    EditProfileButton
  },
  props: {
    show: { type: Boolean, required: true },
    title: { type: String, default: 'Create a new person' },
    hideDetails: { type: Boolean, default: false },
    readOnly: { type: Boolean, default: false},
    selectedProfile: { type: Object}
  },
  data () {
    return {
      profile: {},
      formData: setProfileData(),
      hasSelection: false,
    }
  },
  created () {
    this.getFullProfile()
  },
  computed: {
    mobile () {
      return this.$vuetify.breakpoint.xs
    },
    customClass () {
      return 
    },
    errorMsgs () {
      var empty = {}
      var output = Object.keys(this.formData)
        .filter(key => REQUIRED_ATTRS.includes(key))
        .reduce((obj, key) => {
          obj[key] = this.formData[key];
          return obj;
        }, {});
      
      Object.entries(output).forEach(([key, value]) => {
        if (isEmpty(output[key])) {
          empty[key] = value
        }
      })
      return Object.keys(empty)
    }
    // profileChanges () {
    //   let changes = {}
    //   Object.entries(this.formData).forEach(([key, value]) => {
    //     if (!isEqual(this.formData[key], this.selectedProfile[key])) {
    //       switch (key) {
    //         case 'altNames':
    //           if (!isEqual(this.formData.altNames.add, this.selectedProfile.altNames)) {
    //             changes[key] = pick(this.formData.altNames, ['add', 'remove'])
    //             changes[key].add = changes[key].add.filter(Boolean)
    //           }
    //           break
    //         case 'birthOrder':
    //           changes[key] = parseInt(value)
    //           break
    //         default:
    //           changes[key] = value
    //       }
    //     }
    //   })
    //   return changes
    // },
    // hasChanges () {
    //   return isEqual(this.data, this.selectedProfile)
    // }
  },
  // watch: {
  //   profile (newVal) {
  //     this.formData = defaultData(newVal)
  //   },
  //   'formData.deceased' (newValue) {
  //     if (!newValue) this.formData.diedAt = ''
  //   }
  // },
  methods: {
    ...mapActions(['setDialog']),
    async getFullProfile () {
      const profile = await getRelatives(this.selectedProfile.id)

      this.formData = updateProfileData(profile) 
      // this.profile = updateProfileData(profile) 
    },
    age (born) {
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
    dob () {
      if (this.formData.aliveInterval) {
        var formattedDate = formatDate(this.formData.aliveInterval)
        return formattedDate
      }
      return ' '
    },
    close () {
      this.$emit('close')
    },

    // checkSubmission () {
    //   var empty = {}
    //   var output = Object.keys(this.formData)
    //     .filter(key => REQUIRED_ATTRS.includes(key))
    //     .reduce((obj, key) => {
    //       obj[key] = this.formData[key];
    //       return obj;
    //     }, {});
      
    //   Object.entries(output).forEach(([key, value]) => {
    //     if (isEmpty(output[key])) {
    //       empty[key] = value
    //     }
    //   })
    //   this.errorMsgs = Object.keys(empty)
    // },

    submit () {
      this.checkSubmission()
      console.log(this.errorMsgs)
     

      // if (!isEmpty(output)) {
      //   this.$emit('submit', output)
      // }
    }
  }
}
</script>

<style scoped>
.custom.v-text-field > .v-input__control > .v-input__slot:before {
  border-style: none;
}
.custom.v-text-field > .v-input__control > .v-input__slot:after {
  border-style: none;
}
.close {
  top: -25px;
  right: -10px;
}
.big-avatar {
  position: relative;
  top: -20px;
}
.v-input--checkbox label {
  font-size: 14px;
}

.v-input--radio-group__input label {
  font-size: 14px;
}
</style>
