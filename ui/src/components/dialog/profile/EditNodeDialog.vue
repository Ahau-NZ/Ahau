<template>
  <Dialog
    :show="show"
    :title="title"
    width="720px"
    :goBack="close"
    enableMenu
    :hideActions="hideActions"
    @submit="submit"
    @close="close"
  >
    <template v-if="!hideDetails" v-slot:pinned>
      <v-app-bar
        flat
        dense
        light
        color="#fff"
        height="60px"
        max-height="60px"
      >
        <v-tabs v-model="tab" class="mt-n3">
          <v-tab href="#tab-1" :class="mobile ? 'mb-tabs':'desk-tabs'">
            <v-icon small v-if="!mobile"  left>
              mdi-account
            </v-icon>
            {{ t('profile') }}
          </v-tab>
          <v-tab href="#tab-2" :class="mobile ? 'mb-tabs':'desk-tabs'">
            <v-icon small v-if="!mobile" left>
              mdi-cog
            </v-icon>
            {{ t('settings') }}
          </v-tab>
        </v-tabs>
      </v-app-bar>
      <v-divider/>
    </template>
    <!-- Content Slot -->
    <template v-if="!hideDetails" v-slot:content>
      <v-tabs-items light v-model="tab">
        <v-tab-item value="tab-1">
          <v-col class="py-0 px-0">
            <ProfileForm isUser :profile.sync="formData" :withRelationships="false" :mobile="mobile" :fullForm="true"/>
          </v-col>
        </v-tab-item>
        <v-tab-item value="tab-2">
          <SettingsForm @openDeleteProfile="showDeleteProfile = true"/>
          <DeleteProfileDialog
            v-if="showDeleteProfile"
            :show="showDeleteProfile"
            @close="showDeleteProfile = false"
            @cancel="showDeleteProfile = false"
            @submit="deleteProfile"
          />
        </v-tab-item>
      </v-tabs-items>
    </template>
    <!-- End Content Slot -->

  </Dialog>
</template>

<script>

import { PERMITTED_PERSON_ATTRS, setPersonProfile } from '@/lib/person-helpers.js'
import { parseInterval } from '@/lib/date-helpers.js'
import mapProfileMixins from '@/mixins/profile-mixins.js'

import Dialog from '@/components/dialog/Dialog.vue'
import DeleteProfileDialog from '@/components/dialog/DeleteProfileDialog.vue'
import SettingsForm from '@/components/settings/SettingsForm.vue'
import ProfileForm from '@/components/profile/ProfileForm.vue'
import isEmpty from 'lodash.isempty'
import calculateAge from '@/lib/calculate-age'
import pick from 'lodash.pick'
import isEqual from 'lodash.isequal'

import {
  mapActions,
  createNamespacedHelpers,
  mapGetters }
  from 'vuex'

const { mapActions: mapSettingsActions } = createNamespacedHelpers('settings')
const { mapMutations: mapAlertMutations } = createNamespacedHelpers('alerts')

export default {
  name: 'EditNodeDialog',
  mixins: [
    mapProfileMixins({
      mapApollo: ['profile'],
      mapMethods: ['saveProfile']
    })
  ],
  components: {
    Dialog,
    DeleteProfileDialog,
    SettingsForm,
    ProfileForm
  },
  props: {
    show: { type: Boolean, required: true },
    title: { type: String, default: '' },
    hideDetails: { type: Boolean, default: false },
    nodeProfile: { type: Object, default: () => {} },
    readOnly: { type: Boolean, default: false }
  },
  data () {
    return {
      formData: {},
      hasSelection: false,
      tab: null,
      showDeleteProfile: false,
      hideActions: false
    }
  },
  computed: {
    ...mapGetters(['whoami']),
    mobile () {
      return this.$vuetify.breakpoint.xs
    },
    profileChanges () {
      let changes = {}
      Object.entries(this.formData).forEach(([key, value]) => {
        if (!isEqual(this.formData[key], this.nodeProfile[key])) {
          switch (key) {
            case 'altNames':
              if (!isEqual(this.formData.altNames.add, this.nodeProfile.altNames)) {
                changes[key] = pick(this.formData.altNames, ['add', 'remove'])
                changes[key].add = changes[key].add.filter(Boolean)
              }
              break
            case 'birthOrder':
              changes[key] = parseInt(value)
              break
            case 'aliveInterval':
              changes[key] = parseInterval(this.formData.aliveInterval)
              break
            default:
              changes[key] = value
          }
        }
      })
      return changes
    },
    hasChanges () {
      return isEqual(this.data, this.nodeProfile)
    }
  },
  watch: {
    nodeProfile: {
      deep: true,
      immediate: true,
      handler (newVal) {
        if (!newVal) return
        this.formData = setPersonProfile(newVal)
      }
    },
    tab (newVal) {
      if (newVal === 'tab-2') this.hideActions = true
      else this.hideActions = false
    }
  },
  methods: {
    ...mapActions(['setLoading']),
    ...mapAlertMutations(['showAlert']),
    ...mapSettingsActions(['deleteAhau']),
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
    async deleteProfile () {
      this.setLoading(true)
      this.showDeleteProfile = false
      this.close()

      // update the authors to all authors on all of our own profiles
      const input = {
        id: this.profile.id,
        authors: {
          add: ['*']
        }
      }

      await this.saveProfile(input)

      // tombstone our public profile
      const tombstoneInput = {
        id: this.whoami.public.profile.id,
        tombstone: {
          date: Date.now(),
          reason: 'User deleted Ahau'
        },
        allowPublic: true // to update the public profile
      }

      await this.saveProfile(tombstoneInput)

      // now delete the ahau folder where the db sits
      await this.deleteAhau()

      this.setLoading(false)

      this.$router.push({ path: '/login' })
        .then(() => {
          this.showAlert({ message: this.t('deletedProfileMessage') })
        })
        .catch(() => {})
    },
    submit () {
      var output = Object.assign({}, pick(this.profileChanges, PERMITTED_PERSON_ATTRS))
      if (!isEmpty(output)) {
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
    },
    t (key, vars) {
      return this.$t('editNodeDialog.' + key, vars)
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
