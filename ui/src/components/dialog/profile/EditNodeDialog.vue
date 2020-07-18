<template>
  <Dialog :show="show" :title="title" @close="close" width="720px" :goBack="close" enableMenu>

    <!-- Content Slot -->
    <template v-if="!hideDetails" v-slot:content>
      <v-col class="py-0 px-0">
        <ProfileForm :profile.sync="formData" :withRelationships="false" :mobile="mobile"/>
      </v-col>
    </template>
    <!-- End Content Slot -->

    <!-- Actions Slot -->
    <template v-slot:actions>
      <v-btn @click="close"
        text large fab
        class="secondary--text"
      >
        <v-icon color="secondary">mdi-close</v-icon>
      </v-btn>
      <v-btn @click="submit"
        text large fab
        class="blue--text ml-5"
      >
        <v-icon>mdi-check</v-icon>
      </v-btn>
    </template>
    <!-- End Actions Slot -->

  </Dialog>
</template>

<script>

import { PERMITTED_PROFILE_ATTRS } from '@/lib/profile-helpers.js'

import Dialog from '@/components/dialog/Dialog.vue'
import ProfileForm from '@/components/profile/ProfileForm.vue'
import isEmpty from 'lodash.isempty'
import calculateAge from '@/lib/calculate-age'
import pick from 'lodash.pick'
import isEqual from 'lodash.isequal'
import clone from 'lodash.clonedeep'

function defaultData (input) {
  var profile = clone(input)

  var aliveInterval = ['', '']

  if (profile.aliveInterval) {
    aliveInterval = profile.aliveInterval.split('/')
  }

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
    }
  }
}

export default {
  name: 'EditNodeDialog',
  components: {
    Dialog,
    ProfileForm
  },
  props: {
    show: { type: Boolean, required: true },
    title: { type: String, default: 'Create a new person' },
    hideDetails: { type: Boolean, default: false },
    profile: { type: Object, default: () => {} },
    readOnly: { type: Boolean, default: false }
  },
  data () {
    return {
      formData: {},
      hasSelection: false
    }
  },

  computed: {
    mobile () {
      return this.$vuetify.breakpoint.xs
    },
    profileChanges () {
      console.log('profilechanges')
      let changes = {}
      Object.entries(this.formData).forEach(([key, value]) => {
        if (!isEqual(this.formData[key], this.profile[key])) {
          switch (key) {
            case 'altNames':
              if (!isEqual(this.formData.altNames.add, this.profile.altNames)) {
                changes[key] = pick(this.formData.altNames, ['add', 'remove'])
                changes[key].add = changes[key].add.filter(Boolean)
              }
              break
            case 'birthOrder':
              changes[key] = parseInt(value)
              break
            default:
              changes[key] = value
          }
        }
      })
      console.log('changes: ', changes)
      return changes
    },
    hasChanges () {
      return isEqual(this.data, this.profile)
    }
  },
  watch: {
    profile: {
      deep: true,
      immediate: true,
      handler (newVal) {
        if (!newVal) return
        this.formData = defaultData(newVal)

        if (this.formData.aliveInterval) {
          var dates = this.formData.aliveInterval.split('/')
          this.formData.bornAt = dates[0]
          this.formData.diedAt = dates[1]
        }
      }
    },
    'formData.bornAt' (newVal) {
      this.formData.aliveInterval = this.formData.bornAt + '/' + this.formData.diedAt
    },
    'formData.diedAt' (newVal) {
      this.formData.aliveInterval = this.formData.bornAt + '/' + this.formData.diedAt
    },
    // profile (newVal) {
    //   console.log("watching profile: ", newVal)
    //   this.formData = defaultData(newVal)
    // },
    'formData.deceased' (newValue) {
      if (!newValue) this.formData.diedAt = ''
    }
  },
  methods: {
    updateAvatar (avatarImage) {
      this.formData.avatarImage = avatarImage
    },
    age (born) {
      var age = calculateAge(born)
      return age
    },
    close () {
      this.$emit('close')
    },

    submit () {
      console.log('submit')
      var output = Object.assign({}, pick(this.profileChanges, [...PERMITTED_PROFILE_ATTRS]))
      if (!isEmpty(output)) {
        console.log('output: ', output)
        this.$emit('submit', output)
      } else {
        this.close()
      }
    },

    toggleAltName () {
      if (!this.formData.altNames.currentState) { this.formData.altNames.currentState = [] }
      this.formData.altNames.add.push(null)
    },
    toggleDescription () {
      this.showDescription = !this.showDescription
    },
    deleteFromState (altName, index) {
      this.deleteFromDialog(index) // removes it from the dialog
      this.formData.altNames.remove.push(altName)
    },
    deleteFromDialog (index) {
      this.formData.altNames.currentState.splice(index, 1)
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
