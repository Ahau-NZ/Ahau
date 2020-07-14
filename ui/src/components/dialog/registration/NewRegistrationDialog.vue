<template>
  <Dialog :show="show" :title="title" @close="close" width="720px" :goBack="close" enableMenu>
    <template v-if="!hideDetails" v-slot:content>
      <v-col cols="12" :class="mobile ? 'pb-5 px-2' : 'px-5' ">
        <v-row>
          <span class="py-6 px-4 subtitle-2 blue--text">To join this communtiy, please confirm that you are happy to share the following profile information with <strong><i>{{currentProfile.preferredName}}</i></strong> members</span>
        </v-row>
        <!-- WRAP -->
        <v-form ref="checkboxes">
          <v-card elevation='1' :style="mobile ? 'margin: 0px' : 'margin: 20px'" :class="{'checkbox':checkbox1}">
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
            <ProfileInfoCard :profile="formData" isRegistration :style="mobile ? 'margin: 0px 20px' : 'margin: 0px 30px;'"/>
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
        <v-card elevation='1' :style="mobile ? 'margin: 0px' : 'margin: 20px'" :class="{'checkbox':checkbox2}" class="pt-2">
        <ProfileCard :style="mobile ? 'margin: 10px;':'margin:20px'">
          <template v-slot:content>
            <v-row cols="12" class="pt-0" >
              <ProfileInfoItem :class="mobile ? 'bb':'br bb'" smCols="12" mdCols="6" title="Date of birth" :value="dob"/>
              <ProfileInfoItem :class="mobile ? 'bb':'bb'" smCols="12" mdCols="6" title="Phone" :value="formData.phone"/>
              <ProfileInfoItem :class="mobile ? 'bb':'br'" smCols="12" mdCols="6" title="Email" :value="formData.email"/>
              <ProfileInfoItem smCols="12" mdCols="6" title="Address" :value="formData.address"/>
            </v-row>
          </template>
        </ProfileCard>
                    <!-- ADD PARENTS INFORMATION-->
          <p class="pt-5 pl-5 subtitle-2" :style="parentsRequired ? 'color:crimson':''">Please provide the names of at least one parent and one grandparent</p>
          <div v-for="(parent, index) in parents" :key="index">
            <v-row class="rounded-border mx-4">
              <v-col cols="12">
                <ParentGroup :index="index" :profile="parent" :title="parent.relationshipType ? parent.relationshipType + ' parent' : 'parent'" @removeParent="removeParent($event)"/>
              </v-col>
              <v-col  cols="12" class="pa-0">
                <v-divider></v-divider>
              </v-col>
              <v-col cols="12" v-for="(grandparent, grandparentIndex) in parent.grandparents" :key="`grandparent-${grandparentIndex}`" >
                <ParentGroup :index="grandparentIndex" :profile="grandparent" :title="grandparent.relationshipType ? grandparent.relationshipType + ' grandparent' : 'grandparent'" @removeParent="removeGrandparent($event, index)"/>
              </v-col>
              <v-row class="py-4 pl-10">
                <AddButton justify="start" :width="'50px'" :label="'Add parents of ' + parent.preferredName" @click="addGrandparent(index)"/>
              </v-row>
            </v-row>
          </div>
          <v-row class="py-4 pl-10">
            <AddButton justify="start" :width="'50px'" label="Add parent" @click="addParent('parent')"/>
          </v-row>
          <v-divider></v-divider>
          <v-col cols="12" :class="mobile ? 'pt-4 px-0':'pt-6 px-4'">
            <v-textarea
              v-model="message"
              label="Send a message"
              no-resize
              rows="3"
              auto-grow
              outlined
              placeholder=" "
            >
            </v-textarea>
          </v-col>
        <v-card-actions style="display: flex; justify-content: center; align-items: center;">
          <v-checkbox class="checkbox-label" color="success" v-model="checkbox2" :label="`I agree to share this information`" :rules="requiredRules"></v-checkbox> .
        </v-card-actions>
      </v-card>
      
    </v-form>
  </v-col>
    <v-hover v-if="errorMsgs && errorMsgs.length" v-slot:default="{ hover }">
      <v-row @click="editProfile"  :class="mobile ? 'mx-2':'mx-12'" align="center" style="border: 1px solid rgba(168,0,0); border-radius: 10px;" :style="hover ? 'cursor: pointer;background-color:rgba(168,0,0,0.1)':''">
        <v-col cols="12">
            <v-row justify="center">
              <span class="px-4 subtitle-2 secondary--text">To join this communtiy, please update the required information on your profile</span>
            </v-row>
            <v-row v-for="error in errorMsgs" :key="error" justify="start" :class="mobile ? 'py-1 pl-2':'py-1 pl-12 ml-12'">
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
import ParentGroup from '@/components/registration/ParentGroup.vue'
import AddButton from '@/components/button/AddButton.vue'

import { dateIntervalToString } from '@/lib/date-helpers'

import isEmpty from 'lodash.isempty'
import pick from 'lodash.pick'
import calculateAge from '@/lib/calculate-age'
import { mapActions, mapGetters } from 'vuex'
import { PRIVATE_PERMITTED_PROFILE_ATTRS, COMMON_PERMITTED_PROFILE_ATTRS } from '@/lib/profile-helpers' 


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
    ParentGroup,
    AddButton
  },
  props: {
    show: { type: Boolean, required: true },
    title: { type: String, default: 'Create a new person' },
    hideDetails: { type: Boolean, default: false },
    readOnly: { type: Boolean, default: false },
    profile: { type: Object },
    parents: { type: Array, default: null },
    parentIndex: Number
  },
  data () {
    return {
      checkbox1: false,
      checkbox2: false,
      formData: {},
      hasSelection: false,
      requiredRules: [
        v => v === true || 'Please agree to share information'
      ],
      errorMsgs: [],
      message:'',
    }
  },
  mounted () {
    this.getFullProfile(this.profile.id)
  },
  computed: {
    ...mapGetters(['currentProfile', 'selectedProfile']),
    parentsRequired () {
      var needParents = true
      if (this.parents && this.parents.length) {
        this.parents.map((parent) => {
          if (parent.grandparents && parent.grandparents.length) {
            needParents = false
          } else {
            needParents = true
          }
        })
      }
      return needParents
    },
    length () {
      var name = ''
      if (this.currentProfile.legalName) name = this.currentProfile.legalName
      else if (this.currentProfile.preferredName) name = this.currentProfile.preferredName
      if (name.length > 30) return 'font-size:6vw'
      if (name.length > 25) return 'font-size:7vw'
      if (name.length > 20) return 'font-size:8vw'
      else return 'font-size: 10vw'
    },

    mobile () {
      return this.$vuetify.breakpoint.xs
    },
    disabled () {
      this.getErrorMsgs()
      if (this.errorMsgs && this.errorMsgs.length > 0) {
        return true
      }
      if (this.parentsRequired) {
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
    }
  },
  methods: {
    ...mapActions(['setDialog', 'setProfileById']),
    removeParent (index) {
      this.parents.splice(index, 1)
    },
    removeGrandparent (grandparentIndex, parentIndex) {
      this.parents[parentIndex].grandparents.splice(grandparentIndex, 1)
    },
    addParent () {
      this.setDialog({ active: 'new-node', type: 'parent' })
    },
    addGrandparent (index) {
      this.$emit('update:parentIndex', index)
      this.setDialog({ active: 'new-node', type: 'grandparent' })
    },
    getErrorMsgs () {
      // var errors = {}
      var errors = []
      var output = Object.keys(this.formData)
        .filter(key => REQUIRED_ATTRS.includes(key))
        .reduce((obj, key) => {
          obj[key] = this.formData[key]
          return obj
        }, {})
      Object.entries(output).forEach(([key, value]) => {
        if (isEmpty(output[key])) {
          if (key === 'location') key = 'city,country'
          // errors[key] = value
          errors.push(key)
        }
      })
      this.errorMsgs = errors
    },

    async getFullProfile (id) {
      await this.setProfileById({ id: id, type: 'setWhanau' })
      this.formData = this.selectedProfile
    },

    age (born) {
      var age = calculateAge(born)
      if (age == null) {
        return 'age not entered'
      }
      return age
    },

    editProfile () {
      this.$emit('editProfile', this.formData)
    },

    close () {
      this.$emit('close')
    },

    submit () {
      if (this.$refs.checkboxes.validate()) {
        var input = {
          ...this.formData,
          parents: this.parents,
          message: this.message
        }
        console.log(input)
        console.log(COMMON_PERMITTED_PROFILE_ATTRS)
        console.log(PRIVATE_PERMITTED_PROFILE_ATTRS)
        var common = pick(input, COMMON_PERMITTED_PROFILE_ATTRS)
        var kaitiaki = pick(input, PRIVATE_PERMITTED_PROFILE_ATTRS)

        var output = {
          common: common,
          kaitiaki: kaitiaki
        }
        // TODO - send message to Kaitiaki
        console.warn('send this object: ', output)
        this.close()
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

.checkbox {
  border: 2px solid #4caf50
}
</style>
