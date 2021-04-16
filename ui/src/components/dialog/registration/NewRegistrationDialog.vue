<template>
  <div>
    <Dialog
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
                      :size="mobile ? '200px':'100px'"
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
                Update your information
              </v-stepper-step>
              <v-stepper-content step="1">
                <v-card
                  color="grey lighten-5"
                  class="mb-6"
                  height="auto"
                  outlined
                >
                  <v-card-text>
                    Please update the following information on your profile: <br>
                    <ul>
                      <li v-for="({ prop }) in invalidPersonalProfileProps" :key="JSON.stringify(prop)">
                        {{ prop }}
                      </li>
                    </ul>
                  </v-card-text>
                </v-card>
                <v-btn
                  color="primary"
                  @click="goProfile"
                >
                  Go to edit profile
                </v-btn>
              </v-stepper-content>

              <!-- STEP 2: Share Community information  -->
              <v-stepper-step
                :complete="step > 2"
                step="2"
                :color="checkbox1 ? 'green' : 'black'"
              >
                Share your information with the Community Members
              </v-stepper-step>

              <v-stepper-content step="2">
                <v-card
                  color="grey lighten-5"
                  class="mb-6"
                  height="auto"
                  outlined
                >
                  <v-card-text>
                    I agree to share the following information with the
                    <strong>
                      <i>{{ formData.preferredName }}</i>
                    </strong>
                    community members
                  </v-card-text>
                  <ProfileCard :style="mobile ? 'margin: 10px;':'margin:20px'">
                    <template v-slot:content>
                      <v-row cols="12" class="pt-0">
                        <ProfileInfoItem
                          :class="mobile ? 'bb':' bb'"
                          smCols="12"
                          mdCols="12"
                          title="Description"
                          :value="personalProfile.description"
                          class="pb-0"
                        />
                        <ProfileInfoItem
                          :class="mobile ? 'bb':'bb br'"
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
                          :class="mobile ? 'bb':'br'"
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
                  <ProfileCard :style="mobile ? 'margin: 10px;':'margin:20px'">
                    <template v-slot:content>
                      <v-row cols="12">
                        <ProfileInfoItem
                          :class="mobile ? 'bb':'bb br'"
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
                          :class="mobile ? 'bb':'br'"
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
                  <ProfileCard :style="mobile ? 'margin: 10px;':'margin:20px'">
                    <template v-slot:content>
                      <v-row cols="12">
                        <ProfileInfoItem
                          :class="mobile ? 'bb':'br'"
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
                <v-checkbox v-model="checkbox1" label="I Agree"/>
              </v-stepper-content>

              <!-- STEP 3: Share Kaitiaki information  -->
              <v-stepper-step
                :complete="step > 3"
                step="3"
                :color="checkbox2 ? 'green' : 'black'"
              >
                Share your information with the Community Kaitiaki
                <small></small>
              </v-stepper-step>

              <v-stepper-content step="3">
                <v-card
                  color="grey lighten-5"
                  class="mb-6"
                  height="auto"
                  outlined
                >
                  <v-card-text>
                    I agree to share the following information with the
                    <strong>
                      <i>{{ formData.preferredName }}</i>
                    </strong>
                    community kaitiaki
                  </v-card-text>
                  <ProfileCard :style="mobile ? 'margin: 10px;':'margin:20px'">
                    <template v-slot:content>
                      <v-row cols="12" class="pt-0">
                        <ProfileInfoItem
                          :class="mobile ? 'bb':'br bb'"
                          smCols="12"
                          mdCols="6"
                          title="Date of birth"
                          :value="dob"
                          class="pb-0"
                        />
                        <ProfileInfoItem
                          :class="mobile ? 'bb':'bb'"
                          smCols="12"
                          mdCols="6"
                          title="Phone"
                          :value="personalProfile.phone"
                          class="pb-0"
                        />
                        <ProfileInfoItem
                          :class="mobile ? 'bb':'br bb'"
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
                <v-checkbox v-model="checkbox2" label="I Agree"/>
              </v-stepper-content>

              <!-- Joining Questions -->
              <v-stepper-step
                v-if="hasJoiningQuestions"
                :complete="step > 4"
                step="4"
                :color="step > 4 ? 'green' : 'black'"
              >
                Please answer these questions to join this community
              </v-stepper-step>

              <v-stepper-content step="4" v-if="hasJoiningQuestions">
                <v-card
                  color="grey lighten-5"
                  class="mb-6"
                  height="auto"
                  outlined
                >
                  <v-row>
                    <v-col cols="12" sm="12" v-for="(question, i) in answers" :key="`j-q-${i}`" :class="mobile ? 'pt-4 px-0':'pt-6 px-5'">
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
                  @click="step = 5"
                >
                  Next
                </v-btn>
              </v-stepper-content>

              <!-- comment -->
              <v-stepper-step
                :step="lastStep"
              >
                Send a comment with your request
              </v-stepper-step>
              <v-stepper-content :step="lastStep">
                <v-card
                  color="grey lighten-5"
                  class="mb-6"
                  height="auto"
                  outlined
                >
                  <v-col cols="12" :class="mobile ? 'pt-4 px-0':'pt-6 px-5'">
                    <v-textarea
                      v-model="comment"
                      label="Send a comment with your request"
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
          <span>cancel</span>
        </v-btn>
        <v-btn @click="submit" text large class="blue--text mx-5" :disabled="disableSubmission">
          <span>submit</span>
        </v-btn>
      </template>
    </Dialog>
  </div>
</template>

<script>

import Avatar from '@/components/Avatar.vue'
import Dialog from '@/components/dialog/Dialog.vue'
import ProfileCard from '@/components/profile/ProfileCard.vue'
import ProfileInfoItem from '@/components/profile/ProfileInfoItem.vue'
import calculateAge from '@/lib/calculate-age'

import { getProfile } from '@/lib/profile-helpers.js'

import { mapGetters } from 'vuex'

import { dateIntervalToString } from '@/lib/date-helpers.js'
import { findInvalidProfileProps } from '@/lib/tribes-application-helpers.js'

import clone from 'lodash.clonedeep'

export default {
  name: 'NewRegistrationDialog',
  components: {
    Dialog,
    Avatar,
    ProfileCard,
    ProfileInfoItem
  },
  apollo: {
    personalProfile () {
      return {
        ...getProfile,
        variables () {
          return {
            id: this.whoami.personal.profile.id
          }
        }
      }
    }
  },
  props: {
    show: { type: Boolean, required: true },
    title: { type: String, default: 'Join Community' },
    hideDetails: { type: Boolean, default: false },
    profile: { type: Object, default () { return {} } }
  },
  data () {
    return {
      step: 1,
      checkbox1: null,
      checkbox2: null,
      formData: clone(this.profile),
      comment: '',
      answers: [],
      personalProfile: {}
    }
  },
  watch: {
    profile: {
      deep: true,
      immediate: true,
      handler (profile) {
        this.answers = profile.joiningQuestions.map(q => {
          return {
            question: q.label,
            answer: ''
          }
        })

        this.formData = profile
      }
    },
    checkbox1 (checkbox) {
      if (checkbox) this.step = 3 // step to the next section
    },
    checkbox2 (checkbox) {
      if (checkbox) this.step = 4
    },
    personalProfile: {
      deep: true,
      handler () {
        if (this.isValidPersonalProfile && this.step === 1) this.step = 2
      }
    }
  },
  computed: {
    ...mapGetters(['whoami']),
    altNames () {
      if (this.personalProfile.altNames) return this.personalProfile.altNames.join(', ')
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
      var age = calculateAge(this.personalProfile.aliveInterval)
      if (age === null) return ' '
      return age.toString()
    },
    length () {
      var name = ''
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
        var formattedDate = dateIntervalToString(this.personalProfile.aliveInterval)
        return formattedDate
      }
      return null
    },
    invalidPersonalProfileProps () {
      if (!this.personalProfile) return []
      return findInvalidProfileProps(this.personalProfile)
    },
    isValidPersonalProfile () {
      return this.invalidPersonalProfileProps.length === 0
    },
    hasJoiningQuestions () {
      return this.answers && this.answers.length > 0
    },
    lastStep () {
      return this.hasJoiningQuestions
        ? 5
        : 4
    },
    disableSubmission () {
      return this.step !== this.lastStep
    }
  },
  methods: {
    close () {
      this.$emit('close')
    },
    submit () {
      this.$emit('submit', { comment: this.comment, answers: this.answers })
      this.close()
    },
    goProfile () {
      this.$router.push({
        name: 'person/profile',
        params: {
          tribeId: this.whoami.personal.groupId,
          profileId: this.whoami.personal.profile.id,
          application: {
            dialog: 'edit-node',
            source: {
              tribeId: this.$route.params.tribeId,
              profileId: this.$route.params.profileId
            }
          }
        }
      }).catch(() => {})
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
