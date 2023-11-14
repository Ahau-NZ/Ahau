<template>
  <div>
    <DialogContainer
      :show="show"
      :title="title"
      @close="close"
      width="720px"
      :goBack="close"
      enableMenu
    >
      <template v-if="!hideDetails" v-slot:content>
        <v-col cols="12" :class="mobile ? 'pb-5 px-2' : 'px-5' ">
          <!-- PROFILE INFOMATION -->
          <v-form>
            <v-card
              outlined
              class="mb-5"
            >
              <v-row>
                <v-col cols="12" md="3" class="py-0">
                  <v-row class="justify-center pt-12">
                    <Avatar
                      class="big-avatar"
                      :size="mobile ? '200px' : '100px'"
                      :image="formData.avatarImage"
                      :alt="formData.preferredName"
                      isView
                    />
                  </v-row>
                </v-col>
                <v-col
                  cols="12"
                  md="9"
                  sm="12"
                >
                  <h1
                    class="primary--text pt-12"
                    :style="mobile ? length : ''"
                    align="start"

                  >{{ formData.legalName || formData.preferredName }}</h1>
                </v-col>
              </v-row>
            </v-card>

            <v-stepper
              v-model="step"
              vertical
            >
            <!-- STEP 1: Profile has basic profile information  -->
              <v-stepper-step
                :complete="step > 1"
                step="1"
                :color="isValidPersonalProfile ? 'green' : 'red'"
                :rules="[() => isValidPersonalProfile]"
                error-icon="mdi-close"
              >
                {{ t('updateInfo') }}
              </v-stepper-step>
              <v-stepper-content step="1">
                <v-card
                  color="grey lighten-5"
                  class="mb-6"
                  height="auto"
                  outlined
                >
                  <v-card-text>
                    <div v-if="isLoadingProfile">
                      {{ t('updatingProfile') }}
                      <v-progress-circular
                        indeterminate
                        color="#b12526"
                      />
                    </div>
                    <div v-else>
                      <div v-if="isValidPersonalProfile">
                       {{ t('noUpdates') }}
                      </div>
                      <div v-else>
                        {{ t('updatesNeeded' )}} <br>
                        <ul>
                          <li v-for="({ prop }) in missingRequiredFields" :key="prop">
                            {{ prop }}
                          </li>
                        </ul>
                      </div>
                    </div>
                  </v-card-text>
                </v-card>
                <v-btn
                  color="primary"
                  :disabled="isLoadingProfile"
                  @click="goProfile"
                >
                  {{ t('editProfile') }}
                </v-btn>
                <v-btn
                  :disabled="!isValidPersonalProfile || isLoadingProfile"
                  class="ml-5"
                  color="primary"
                  @click="step = hasJoiningQuestions ? 2 : 3"
                >
                  {{ t('next') }}
                </v-btn>
              </v-stepper-content>

              <!-- STEP 2: joining questions -->
              <v-stepper-step
                :complete="step > 2"
                step="2"
                :color="step > 2 ? 'green' : 'black'"
              >
                {{ hasJoiningQuestions ? t('joiningQuestions') : t('noJoiningQuestions') }}
              </v-stepper-step>

              <v-stepper-content step="2">
                <v-card
                  color="grey lighten-5"
                  class="mb-6"
                  height="auto"
                  outlined
                >
                  <v-row>
                    <v-col cols="12" sm="12" v-for="(question, i) in answers" :key="`j-q-${i}`" :class="mobile ? 'pt-4 px-0' : 'pt-6 px-5'">
                      <v-text-field
                        v-model="answers[i].answer"
                        v-bind="customProps"
                        :label="answers[i].question"
                      />
                    </v-col>
                  </v-row>
                </v-card>
                <v-btn
                  color="primary"
                  @click="step = 3"
                >
                  {{ t('next') }}
                </v-btn>
              </v-stepper-content>

              <!-- STEP 3: Share Community information  -->
              <v-stepper-step
                :complete="step > 3"
                step="3"
                :color="step3Checkbox ? 'green' : 'black'"
              >
                {{ t('shareInfoMembers') }}
              </v-stepper-step>

              <v-stepper-content step="3">
                <v-card
                  color="grey lighten-5"
                  class="mb-6"
                  height="auto"
                  outlined
                >
                  <v-card-text>
                    <span v-html="t('agreeMembers', { groupName: formData.preferredName })"/>
                  </v-card-text>
                  <ProfileCard :style="mobile ? 'margin: 10px;' : 'margin:20px'">
                    <template v-slot:content>
                      <v-row cols="12" class="pt-0">
                        <ProfileInfoItem
                          :class="mobile ? 'bb' : 'bb'"
                          smCols="12"
                          mdCols="12"
                          title="Description"
                          :value="personalProfile.description"
                          class="pb-0"
                        />
                        <ProfileInfoItem
                          :class="mobile ? 'bb' : 'bb br'"
                          smCols="12"
                          mdCols="6"
                          title="Preferred Name"
                          :value="personalProfile.preferredName"
                          class="pb-0"
                        />
                        <ProfileInfoItem
                          smCols="12"
                          mdCols="6"
                          title="Full Name"
                          :value="personalProfile.legalName"
                          class="pb-0 bb"
                        />
                        <ProfileInfoItem
                          :class="mobile ? 'bb' : 'br'"
                          smCols="12"
                          mdCols="6"
                          title="Other names"
                          :value="altNames"
                          class="pb-0"
                        />
                        <ProfileInfoItem
                          smCols="12"
                          mdCols="6"
                          title="Place of birth"
                          :value="personalProfile.placeOfBirth"
                          class="pb-0"
                        />
                      </v-row>
                    </template>
                  </ProfileCard>
                  <ProfileCard :style="mobile ? 'margin: 10px;' : 'margin:20px'">
                    <template v-slot:content>
                      <v-row cols="12">
                        <ProfileInfoItem
                          :class="mobile ? 'bb' : 'bb br'"
                          smCols="12"
                          mdCols="6"
                          title="Age"
                          :value="age"
                          class="pb-0"
                        />
                        <ProfileInfoItem
                          smCols="12"
                          mdCols="6"
                          title="Profession"
                          :value="personalProfile.profession"
                          class="pb-0 bb"
                        />
                        <ProfileInfoItem
                          :class="mobile ? 'bb' : 'br'"
                          smCols="12"
                          mdCols="6"
                          title="Skills"
                          :value="education"
                          class="pb-0"
                        />
                        <ProfileInfoItem
                          smCols="12"
                          mdCols="6"
                          title="Schools"
                          :value="school"
                          class="pb-0"
                        />
                      </v-row>
                    </template>
                  </ProfileCard>
                  <ProfileCard :style="mobile ? 'margin: 10px;' : 'margin:20px'">
                    <template v-slot:content>
                      <v-row cols="12">
                        <ProfileInfoItem
                          :class="mobile ? 'bb' : 'br'"
                          smCols="12"
                          mdCols="6"
                          title="City"
                          :value="personalProfile.city"
                          class="pb-0"
                        />
                        <ProfileInfoItem
                          class="pb-0"
                          smCols="12"
                          mdCols="6"
                          title="Country"
                          :value="personalProfile.country"
                        />
                      </v-row>
                    </template>
                  </ProfileCard>
                </v-card>
                <v-checkbox v-model="step3Checkbox" label="I Agree"/>
              </v-stepper-content>

              <!-- STEP 4: Share Kaitiaki information  -->
              <v-stepper-step
                :complete="step > 4"
                step="4"
                :color="step3Checkbox ? 'green' : 'black'"
              >
                {{ t('shareInfoKaitiaki') }}
                <small></small>
              </v-stepper-step>

              <v-stepper-content step="4">
                <v-card
                  color="grey lighten-5"
                  class="mb-6"
                  height="auto"
                  outlined
                >
                  <v-card-text>
                    <span v-html="t('agreeKaitiaki', { groupName: formData.preferredName })"/>
                  </v-card-text>
                  <ProfileCard :style="mobile ? 'margin: 10px;' : 'margin:20px'">
                    <template v-slot:content>
                      <v-row cols="12" class="pt-0">
                        <ProfileInfoItem
                          :class="mobile ? 'bb' : 'br bb'"
                          smCols="12"
                          mdCols="6"
                          title="Date of birth"
                          :value="dob"
                          class="pb-0"
                        />
                        <ProfileInfoItem
                          :class="mobile ? 'bb' : 'bb'"
                          smCols="12"
                          mdCols="6"
                          title="Phone"
                          :value="personalProfile.phone"
                          class="pb-0"
                        />
                        <ProfileInfoItem
                          :class="mobile ? 'bb' : 'br bb'"
                          smCols="12"
                          mdCols="6"
                          title="Email"
                          :value="personalProfile.email"
                          class="pb-0"
                        />
                        <ProfileInfoItem
                          smCols="12"
                          mdCols="6"
                          title="Post code"
                          :value="personalProfile.postCode"
                          class="pb-0 bb"
                        />
                        <ProfileInfoItem
                          smCols="12"
                          mdCols="12"
                          title="Address"
                          :value="personalProfile.address"
                          class="pb-0"
                        />
                      </v-row>
                    </template>
                  </ProfileCard>
                </v-card>
                <v-checkbox v-model="step4Checkbox" label="I Agree"/>
              </v-stepper-content>

              <!-- STEP 5 Agree to recieve digital credentials -->
              <v-stepper-step
                v-if="issuesVerifiedCredentials"
                step="5"
                :complete="step > 5"
                :color="step4Checkbox ? 'green' : 'black'"
              >
                {{ translateIdentity('credsTnC.title') }}
              </v-stepper-step>

              <v-stepper-content
                v-if="issuesVerifiedCredentials"
                step="5"
              >
                <v-card
                  color="grey lighten-5"
                  class="mb-6"
                  height="auto"
                  outlined
                >
                  <v-card-text>
                    <p><strong>{{ translateIdentity('credsTnC.about') }}</strong></p>
                    <p>{{ translateIdentity('credsTnC.register') }}</p>
                    <div class="pl-4">
                      <p>{{ translateIdentity('credsTnC.reciept') }}</p>
                      <p>{{ translateIdentity('credsTnC.creation') }}</p>
                      <p>{{ translateIdentity('credsTnC.ownership') }}</p>
                      <p>{{ translateIdentity('credsTnC.storage') }}</p>
                      <p>{{ translateIdentity('credsTnC.id') }}</p>
                    </div>
                    <p>{{ translateIdentity('credsTnC.video') }}<a href="https://www.youtube.com/watch?v=Ew-_F-OtDFI&list=RDLVlixl_FRhlhE&index=2&ab_channel=MicrosoftSecurity">video</a></p>
                  </v-card-text>
                </v-card>
                <v-checkbox v-model="step5Checkbox" label="I Agree"/>
              </v-stepper-content>

              <!-- STEP 6 Agree to present presentations -->
              <v-stepper-step
                v-if="acceptsVerifiedCredentials"
                :step="acceptsCredsStep"
                :complete="step > acceptsCredsStep"
                :color="step6Checkbox ? 'green' : 'black'"
              >
                {{ translateIdentity('presTnC.title') }}
              </v-stepper-step>

              <v-stepper-content
                v-if="acceptsVerifiedCredentials"
                :step="acceptsCredsStep"
              >
                <v-card
                  color="grey lighten-5"
                  class="mb-6"
                  height="auto"
                  outlined
                >
                  <v-card-text>
                    <p><strong>{{ translateIdentity('presTnC.about') }}</strong></p>
                    <p>{{ translateIdentity('credsTnC.register') }}</p>
                    <div class="pl-4">
                      <p>{{ translateIdentity('presTnC.present') }}</p>
                      <p>{{ translateIdentity('presTnC.accept') }}</p>
                      <p>{{ translateIdentity('presTnC.usage') }}</p>
                    </div>
                    <p>{{ translateIdentity('credsTnC.video') }}<a href="https://www.youtube.com/watch?v=Ew-_F-OtDFI&list=RDLVlixl_FRhlhE&index=2&ab_channel=MicrosoftSecurity">video</a></p>
                  </v-card-text>
                </v-card>
                <v-checkbox v-model="step6Checkbox" label="I Agree"/>
              </v-stepper-content>

              <!-- Step 6: Comment -->
              <v-stepper-step :step="lastStep">
                {{ t('sendComment') }}
              </v-stepper-step>
              <v-stepper-content :step="lastStep">
                <v-card
                  color="grey lighten-5"
                  class="mb-6"
                  height="auto"
                  outlined
                >
                  <v-col cols="12" :class="mobile ? 'pt-4 px-0' : 'pt-6 px-5'">
                    <v-textarea
                      v-model="comment"
                      :label="t('sendComment')"
                      no-resize
                      v-bind="customProps"
                      rows="3"
                      auto-grow
                      placeholder=" "
                    ></v-textarea>
                  </v-col>
                </v-card>
              </v-stepper-content>
            </v-stepper>

          </v-form>
        </v-col>
      </template>

      <!-- Actions Slot -->
      <template v-slot:actions>
        <v-btn @click="close" text large class="secondary--text">
          <span>{{ t('cancel') }}</span>
        </v-btn>
        <v-btn @click="submit" text large class="blue--text mx-5" :disabled="disableSubmission">
          <span>{{ t('submit') }}</span>
        </v-btn>
      </template>
    </DialogContainer>
    <EditPersonDialog
      v-if="showEditDialog"
      :show="showEditDialog"
      isRegistration
      :title="$t('addPersonForm.addPersonFormTitle', { displayName })"
      @submit="processUpdatePerson"
      @close="showEditDialog = false"
      :nodeProfile="personalProfile"
    />
  </div>
</template>

<script>
import { cloneDeep as clone, isEmpty } from 'lodash-es'

import Avatar from '@/components/Avatar.vue'
import ProfileCard from '@/components/profile/ProfileCard.vue'
import ProfileInfoItem from '@/components/profile/ProfileInfoItem.vue'
import EditPersonDialog from '@/components/dialog/profile/EditPersonDialog.vue'

import { mapGetters, mapActions } from 'vuex'

import calculateAge from '@/lib/calculate-age'
import { dateIntervalToString } from '@/lib/date-helpers'
import { findMissingRequiredFields, getInitialCustomFieldChanges } from '@/lib/custom-field-helpers'

export default {
  name: 'NewRegistrationDialog',
  components: {
    Avatar,
    ProfileCard,
    ProfileInfoItem,
    EditPersonDialog
  },
  props: {
    show: { type: Boolean, required: true },
    title: { type: String, default: 'Join Tribe' },
    hideDetails: { type: Boolean, default: false },
    profile: { type: Object, default () { return {} } }
  },
  data () {
    return {
      step: 1,
      step3Checkbox: null,
      step4Checkbox: null,
      step5Checkbox: null,
      step6Checkbox: null,
      formData: clone(this.profile),
      showEditDialog: false,

      // fields to submit
      comment: '',
      answers: [],
      customFields: [],
      rawCustomFields: {}
    }
  },
  watch: {
    profile: {
      deep: true,
      immediate: true,
      handler (profile) {
        profile.joiningQuestions = this.tribeJoiningQuestions
        this.answers = this.tribeJoiningQuestions.map(q => {
          return {
            question: q.label,
            answer: ''
          }
        })

        this.formData = profile
      }
    },
    step (step) {
      if (step === 2 && !this.hasJoiningQuestions) this.step = 3
    },
    step3Checkbox (isStep3) {
      if (isStep3) this.step = 4 // step to the next section
    },
    step4Checkbox (isStep4) {
      if (isStep4) this.step = 5
    },
    step5Checkbox (isStep5) {
      if (isStep5) this.step = 6
    },
    step6Checkbox (isStep6) {
      if (isStep6) this.step = this.lastStep
    }
  },
  computed: {
    ...mapGetters(['whoami']),
    ...mapGetters('alerts', ['alertSettings']),
    ...mapGetters('tribe', ['currentTribe', 'tribeJoiningQuestions', 'tribeCustomFields', 'tribeRequiredFields', 'tribeDefaultFields', 'tribeSettings']),
    issuesVerifiedCredentials () {
      return this.tribeSettings.issuesVerifiedCredentials
    },
    acceptsVerifiedCredentials () {
      return this.tribeSettings.acceptsVerifiedCredentials
    },
    acceptsCredsStep () {
      const step = this.lastStep - 1
      return step
    },
    lastStep () {
      let step = 5
      if (this.issuesVerifiedCredentials) step++
      if (this.acceptsVerifiedCredentials) step++
      return step
    },
    personalProfile () {
      return {
        ...this.whoami.personal.profile,
        customFields: this.rawCustomFields
      }
    },
    isLoadingProfile () {
      return this.alertSettings.delay === -1
    },
    displayName () {
      return this.personalProfile.preferredName
    },
    altNames () {
      if (this.personalProfile.altNames && this.personalProfile.altNames.length) return this.personalProfile.altNames.join(', ')
      return ''
    },
    education () {
      if (this.personalProfile.education) return this.personalProfile.education.join('\n')
      return ''
    },
    school () {
      if (this.personalProfile.school) return this.personalProfile.school.join('\n')
      return ''
    },
    age () {
      const age = calculateAge(this.personalProfile.aliveInterval)
      if (age === null) return ' '
      return age.toString()
    },
    length () {
      let name = ''
      if (this.profile.legalName) name = this.profile.legalName
      else if (this.profile.preferredName) name = this.profile.preferredName
      if (name.length > 30) return 'font-size:6vw'
      if (name.length > 25) return 'font-size:7vw'
      if (name.length > 20) return 'font-size:8vw'
      else return 'font-size: 10vw'
    },
    mobile () {
      return this.$vuetify.breakpoint.xs
    },
    customProps () {
      return {
        hideDetails: true,
        placeholder: ' ',
        outlined: true
      }
    },
    dob () {
      if (this.personalProfile.aliveInterval) {
        return dateIntervalToString(this.personalProfile.aliveInterval, this.monthTranslations)
      }
      return ''
    },
    missingRequiredFields () {
      if (!this.personalProfile) return []
      const profile = clone(this.personalProfile)
      profile.dateOfBirth = this.dob

      return findMissingRequiredFields(profile, this.tribeRequiredFields)
        .filter(({ prop }) => {
          const field = this.tribeCustomFields.find(field => field.label === prop) || this.tribeDefaultFields.find(field => field.label === prop)
          if (!field) return false
          return !this.customFields.some(customField => customField.key === field.key)
        })
    },
    isValidPersonalProfile () {
      return this.missingRequiredFields.length === 0
    },
    hasJoiningQuestions () {
      return this.answers && this.answers.length > 0
    },
    disableSubmission () {
      return this.step !== this.lastStep
    },
    submission () {
      return {
        comment: this.comment,
        answers: this.answers,
        customFields: this.customFields
      }
    }
  },
  methods: {
    ...mapActions(['setWhoami']),
    ...mapActions('person', ['updatePerson']),
    ...mapActions('alerts', ['showAlert']),
    translateIdentity (key) {
      return this.$t('identityRequirements.' + key)
    },
    t (key, vars) {
      return this.$t('newRegistration.' + key, vars)
    },
    close () {
      this.$emit('close')
    },
    submit () {
      this.$emit('submit', this.submission)
      this.close()
    },
    monthTranslations (key, vars) {
      return this.$t('months.' + key, vars)
    },
    goProfile () {
      this.showEditDialog = true
    },
    async processUpdatePerson (input) {
      this.showEditDialog = false
      this.showAlert({ message: 'Submitting Changes...', color: 'green', delay: -1 })

      const customFields = input.customFields
      /*
        input is of form:
          input = {
            ...personalProfileChanges,
            customFields: {
              [tribeId]: {
                [key]: value,
                ...
              }
            },
            ...
          }
      */
      await this.updatePersonalProfile(input)

      const customFieldValues = getInitialCustomFieldChanges(customFields[this.currentTribe.id], this.tribeCustomFields)
      if (!isEmpty(customFieldValues)) {
        this.rawCustomFields = customFields
        this.customFields = customFieldValues
      }

      // reload your personal profiles
      await this.setWhoami()

      this.showAlert({ message: this.$t('viewPerson.profileUpdated'), color: 'green' })
    },
    async updatePersonalProfile (input) {
      delete input.customFields

      // TODO: show an alert which tells you its saving things....
      // because updating personal profile takes a while
      // if you have a lot of profiles!

      // NOTE: it sometimes is slow to update the UI because this is very slow!!
      // TODO: reduce bulk update to only update profiles that arent tombstoned
      // can use linkedProfileIds (this will be a backend change)

      await this.updatePerson({
        id: this.personalProfile.id,
        ...input
      })
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

</style>
