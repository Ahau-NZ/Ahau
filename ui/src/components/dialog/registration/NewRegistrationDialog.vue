<template>
  <Dialog :show="show" :title="title" @close="close" width="720px" :goBack="close" enableMenu>
    <template v-if="!hideDetails" v-slot:content>
      <v-col cols="12" :class="mobile ? 'pb-5 px-2' : 'px-5' ">
        <v-row>
          <span class="py-6 px-4 subtitle-2 blue--text">To join this communtiy, please confirm that you are happy to share the following profile information with <strong><i>{{currentProfile.preferredName}}</i></strong> members</span>
        </v-row>
        <!-- WRAP -->
        <v-form ref="checkboxes">
          <v-card outlined elevation='1' :style="mobile ? 'margin: 0px' : 'margin: 20px'" :class="{'checkbox':checkbox1}">
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
            <ProfileInfoCard :profile="formData" isRegistration :style="mobile ? 'margin: 0px 10px' : 'margin: 0px 30px;'"/>
            <!-- <ProfileCard :style="mobile ? 'margin: 10px 10px' : 'margin: 20px 30px;'">
              <template v-slot:content>
                <ProfileInfoItem title="About" smCols="12" mdCols="12" :value="formData.description"/>
              </template>
            </ProfileCard>   -->
            
            <v-divider></v-divider>
            <v-card-actions style="display: flex; justify-content: center; align-items: center;">
              <v-checkbox class="checkbox-label" color="success" v-model="checkbox1" :label="`I agree to share this information`" :rules="requiredRules"></v-checkbox> . 
            </v-card-actions>
          </v-card>
      <!-- WRAP END -->
        <v-row>
          <p class="py-6 px-4 subtitle-2 blue--text">The below private information will only be viewable by <strong><i>{{currentProfile.preferredName}}</i></strong> kaitiaki</p>
        </v-row>
        <!-- WRAP -->
        <v-card outlined elevation='1' style="margin: 20px;  " :style="mobile ? 'margin: 0px' : 'margin: 20px'" :class="{'checkbox':checkbox2}">
        <ProfileCard style="margin: 30px;">
          <template v-slot:content>
            <v-row cols="12" class="pt-0" >
              <ProfileInfoItem :class="mobile ? 'bb':'br bb'" smCols="12" mdCols="6" title="Date of birth" :value="dob"/>
              <ProfileInfoItem :class="mobile ? 'bb':'bb'" smCols="12" mdCols="6" title="Phone" :value="formData.phone"/>
              <ProfileInfoItem :class="mobile ? 'bb':'br'" smCols="12" mdCols="6" title="Email" :value="formData.email"/>
              <ProfileInfoItem smCols="12" mdCols="6" title="Address" :value="formData.address"/>
            </v-row>
          </template>
        </ProfileCard>
                   
        <v-divider></v-divider>
        <v-card-actions style="display: flex; justify-content: center; align-items: center;">
          <v-checkbox class="checkbox-label" color="success" v-model="checkbox2" :label="`I agree to share this information`" :rules="requiredRules"></v-checkbox> . 
        </v-card-actions>
      </v-card>
    </v-form>
  <!-- WRAP END -->

      </v-col>

      <v-hover v-if="errorMsgs && errorMsgs.length" v-slot:default="{ hover }">
        <v-row @click="$emit('editProfile',formData)" align="center" style="border: 1px solid rgba(168,0,0); border-radius: 10px;" :style="hover ? 'cursor: pointer;background-color:rgba(168,0,0,0.1)':''">
          <v-col cols="12">
              <v-row justify="center">
                <span class="px-4 subtitle-2 secondary--text">To join this communtiy, please update the required areas on your profile</span>
              </v-row>
              <v-row v-for="error in errorMsgs" :key="error" justify="center" class="py-1">
                <span class="secondary--text "><i>- Please update your {{error}} information</i></span>
              <!-- <v-col v-for="error in errorMsgs" :key="error[key]"></v-col> -->
              </v-row>
              <v-row class="pt-2" justify="center">
                <v-icon color="secondary">mdi-account-edit</v-icon>
                <v-btn text large>update your details</v-btn>
              </v-row>
          </v-col>
        </v-row>
      </v-hover>
      
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
      <!-- <v-btn 
        @click="submit"
        text large
        class="blue--text mx-5"
      > -->
      <v-btn 
        @click="submit"
        :disabled="disabled"
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

import Avatar from '@/components/Avatar.vue'
import Dialog from '@/components/dialog/Dialog.vue'
import ProfileInfoCard from '@/components/profile/ProfileInfoCard.vue'
import ProfileInfoItem from '@/components/profile/ProfileInfoItem.vue'
import ProfileCard from '@/components/profile/ProfileCard.vue'

import {dateIntervalToString} from '@/lib/date-helpers'
import { PERMITTED_PROFILE_ATTRS } from '@/lib/profile-helpers.js'
import getRelatives from '@/lib/profile-helpers.js'
import tree from '@/lib/tree-helpers'

import isEmpty from 'lodash.isempty'
import calculateAge from '@/lib/calculate-age'
import { mapActions, mapGetters } from 'vuex'

const REQUIRED_ATTRS = [
  'id', 'legalName', 'aliveInterval', 'gender', 'relationshipType', 
  'parents', 'profession', 'address', 'email', 'phone', 'location'
]

export default {
  name: 'NewRegistrationDialog',
  components: {
    Dialog,
    Avatar,
    ProfileInfoItem,
    ProfileInfoCard,
    ProfileCard,
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
      checkbox1: false,
      checkbox2: false,
      profile: {},
      formData: {},
      hasSelection: false,
      requiredRules: [
       v => v == true || 'Please agree to share information'
      ],
      errorMsgs: []
    }
  },
  created () {
    this.getFullProfile()
  },
  computed: {
    ...mapGetters(['currentProfile']),
    mobile () {
      return this.$vuetify.breakpoint.xs
    },
    customClass () {
      return 
    },
    disabled () {
      this.getErrorMsgs()
      if (this.errorMsgs && this.errorMsgs.length > 0) {
        return true
      }
      return false
    },
    dob () {
      if (this.formData.aliveInterval) {
        var formattedDate = dateIntervalToString(this.formData.aliveInterval)
        return formattedDate
      }
      return ' '
    },
  },
  methods: {
    ...mapActions(['setDialog']),
    getErrorMsgs () {
      // var errors = {}
      var errors = []
      var output = Object.keys(this.formData)
        .filter(key => REQUIRED_ATTRS.includes(key))
        .reduce((obj, key) => {
          obj[key] = this.formData[key];
          return obj;
        }, {});
      Object.entries(output).forEach(([key, value]) => {
        if (isEmpty(output[key])) {
          // errors[key] = value
          errors.push(key)
        }
      })
      this.errorMsgs = errors
    },
    async getFullProfile () {
      var person = await getRelatives(this.selectedProfile.id) 

      if (person.children) {
        person.children = await Promise.all(person.children.map(async (child) => {
          const childProfile = await getRelatives(child.profile.id)
          person = tree.getPartners(person, childProfile)
          return childProfile
        }))
      }
      if (person.parents) {
        person.parents = await Promise.all(person.parents.map(async parent => {
          const parentProfile = await getRelatives(parent.profile.id)
          person = tree.getSiblings(parentProfile, person)
          if (parentProfile.parents) {
            person.grandparents = parentProfile.parents.map(grandparent => {
            return grandparent.profile
            // const grandParent = await getRelatives(grandparent.profile.id)
            // return grandParent
          })
        }
          return parentProfile
        }))
      }

      // this.formData = updateProfileData(person) 
      this.formData = person 
    },
    age (born) {
      var age = calculateAge(born)
      if (age == null) {
        return 'age not entered'
      }
      return age
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
      // this.checkSubmission()
      // console.log(this.errorMsgs)
  
      if(this.$refs.checkboxes.validate()) {
        console.log('approved.')
      }
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

.checkbox-label /deep/ label {
  font-size: 1.1em
}

.checkbox {
  border: 2px solid #4caf50 
}
</style>
