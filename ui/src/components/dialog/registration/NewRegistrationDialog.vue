<template>
  <Dialog :show="show" :title="title" @close="close" width="720px" :goBack="close" enableMenu>
    <template v-if="!hideDetails" v-slot:content>
      <v-col cols="12" :class="mobile ? 'pb-5 px-2' : 'px-5' ">
        <v-row>
          <span class="py-6 px-4 subtitle-2 black--text">To join this communtiy, please confirm that you are happy to share the following profile information with <strong><i>{{currentProfile.preferredName}}</i></strong> members</span>
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

          <!-- PRIVATE INFORMATION -->
          <v-row>
            <p class="py-6 px-4 subtitle-2 black--text">The below private information will only be viewable by <strong><i>{{currentProfile.preferredName}}</i></strong> kaitiaki</p>
          </v-row>
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
            <v-card-actions style="display: flex; justify-content: center; align-items: center;">
              <v-checkbox class="checkbox-label" color="success" v-model="checkbox2" :label="`I agree to share this information`" :rules="requiredRules"></v-checkbox> .
            </v-card-actions>
          </v-card>

          <!-- ADD PARENTS INFORMATION-->
          <p class="pt-5 pl-5 subtitle-2 black--text">Please provide the names of at least one parent and one grandparent</p>
          <v-card elevation='1' :style="mobile ? 'margin: 0px' : 'margin: 20px'" class="pt-2" :class="{'checkbox':checkbox3}">
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
                  <v-icon :color="!gpNamesValid ? '#b12526':''">mdi-account-supervisor-circle</v-icon>
                  <AddButton :color="!gpNamesValid ? '#b12526':''" justify="start" :width="'50px'" :label="'Add parents of ' + parent.preferredName" @click="addGrandparent(index)"/>
                </v-row>
              </v-row>
            </div>
            <v-row class="py-4 pl-12">
              <v-icon :color="!parentNamesValid ? '#b12526':''">mdi-account-supervisor-circle</v-icon>
              <AddButton :color="!parentNamesValid ? '#b12526':''" justify="start" :width="'50px'" label="Add parent" @click="addParent('parent')"/>
            </v-row>
            <v-card-actions style="display: flex; justify-content: center; align-items: center;">
              <v-checkbox :disabled="!gpNamesValid" class="checkbox-label" color="success" v-model="checkbox3" :label="`I agree to share this information`" :rules="requiredRules"></v-checkbox> .
            </v-card-actions>
          </v-card>

          <!-- MESSAGE -->
          <v-col cols="12" :class="mobile ? 'pt-4 px-0':'pt-6 px-5'">
            <v-textarea
              v-model="message"
              label="Send a message with your request"
              no-resize
              rows="3"
              auto-grow
              outlined
              placeholder=" "
            >
            </v-textarea>
          </v-col>
        </v-form>
      </v-col>
      <!-- ERROR MESSAGES -->
      <v-hover v-if="errorMsgs && errorMsgs.length" v-slot:default="{ hover }">
        <v-row :class="mobile ? 'mx-2':'mx-10'" align="center" style="border: 1px solid rgba(168,0,0); border-radius: 10px;" >
          <v-col cols="12">
              <v-row justify="center">
                <span class="px-4 subtitle-2 secondary--text">To join this communtiy, please update the required information on your profile</span>
              </v-row>
              <v-row v-for="error in errorMsgs" :key="error" justify="start" :class="mobile ? 'py-1 pl-2':'py-1 pl-12 ml-12'">
                <span class="secondary--text "><i>- Please update your {{error}} information</i></span>
              </v-row>
              <v-row v-if="remainingErrors" @click="editProfile" class="pt-2" justify="center" :style="hover ? 'cursor: pointer;background-color:rgba(168,0,0,0.1)':''">
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
        <span>cancel</span>
      </v-btn>
      <v-btn
        @click="submit"
        :disabled="disabled"
        text large
        class="blue--text mx-5"
      >
        <span>submit</span>
      </v-btn>
    </template>

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
import calculateAge from '@/lib/calculate-age'
import { mapActions, mapGetters } from 'vuex'
// import { ... some mutation helper } from '@/lib/person-helpers'

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
      checkbox3: false,
      formData: {},
      hasSelection: false,
      requiredRules: [
        v => v === true
      ],
      errorMsgs: [],
      message: '',
      gpNamesValid: false,
      parentNamesValid: false
    }
  },
  mounted () {
    this.getFullProfile(this.profile.id)
  },
  watch: {
    parents: {
      deep: true,
      immediate: true,
      handler (newVal) {
        if (newVal.length < 1) this.parentNamesValid = false
        else {
          this.gpNamesValid = newVal.every((parent) => {
            if (!parent.grandparents) return false
            return parent.grandparents.every((gp) => {
              return gp.preferredName && gp.preferredName.length
            })
          })
          this.parentNamesValid = newVal.every((parent) => {
            return parent.preferredName && parent.preferredName.length
          })
        }
      }
    }
  },
  computed: {
    ...mapGetters(['currentProfile', 'selectedProfile']),
    remainingErrors () {
      if (this.errorMsgs && this.errorMsgs.length) {
        var remaining = this.errorMsgs.filter((f) => f !== 'grandparents' & f !== 'parents')
        return remaining.length
      } return false
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
      if (!this.parentNamesValid && !this.gpNamesValid) {
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
      var profile = {
        ...this.formData,
        parents: this.parents
      }
      var output = Object.keys(profile)
        .filter(key => REQUIRED_ATTRS.includes(key))
        .reduce((obj, key) => {
          obj[key] = profile[key]
          return obj
        }, {})
      Object.entries(output).forEach(([key, value]) => {
        if (isEmpty(output[key])) {
          if (key === 'location') key = 'city,country'
          // errors[key] = value
          errors.push(key)
        }
      })
      if (!this.gpNamesValid) errors.push('grandparents')
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
        // var common = pick(input, COMMON_PERMITTED_PROFILE_ATTRS)
        // var kaitiaki = pick(input, PRIVATE_PERMITTED_PROFILE_ATTRS)

        // var output = {
        //   common: common,
        //   kaitiaki: kaitiaki
        // }
        // // TODO - send message to Kaitiaki
        console.warn('send this object: ', input)
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