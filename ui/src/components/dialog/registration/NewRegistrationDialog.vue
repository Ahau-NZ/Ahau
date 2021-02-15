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
                >
                  Go to edit profile
                </v-btn>
              </v-stepper-content>

              <v-stepper-step
                :complete="step > 2"
                step="2"
                :color="checkbox1 ? 'green' : 'black'"
              >
                Share your information with the Community Kaitiaki
                <small></small>
              </v-stepper-step>

              <v-stepper-content step="2">
                <v-card
                  color="grey lighten-5"
                  class="mb-6"
                  height="auto"
                  outlined
                >
                  <v-card-text>
                    Share the following information with the
                    <strong>
                      <i>{{ formData.preferredName }}</i>
                    </strong>
                    Community Kaitiaki
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
                        />
                        <ProfileInfoItem
                          :class="mobile ? 'bb':'bb'"
                          smCols="12"
                          mdCols="6"
                          title="Phone"
                          :value="personalProfile.phone"
                        />
                        <ProfileInfoItem
                          :class="mobile ? 'bb':'br'"
                          smCols="12"
                          mdCols="6"
                          title="Email"
                          :value="personalProfile.email"
                        />
                        <ProfileInfoItem
                          smCols="12"
                          mdCols="6"
                          title="Address"
                          :value="personalProfile.address"
                        />
                      </v-row>
                    </template>
                  </ProfileCard>
                </v-card>
                <v-checkbox v-model="checkbox1" label="Agree"/>
              </v-stepper-content>

              <v-stepper-step
                :complete="step > 3"
                step="3"
                :color="checkbox2 ? 'green' : 'black'"
              >
                Share your information with the Community Members
              </v-stepper-step>

              <v-stepper-content step="3">
                <v-card
                  color="grey lighten-5"
                  class="mb-6"
                  height="auto"
                  outlined
                >
                  <v-card-text>
                    Share the following information with the
                    <strong>
                      <i>{{ formData.preferredName }}</i>
                    </strong>
                    Community Members
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
                        />
                        <ProfileInfoItem
                          :class="mobile ? 'bb':'bb br'"
                          smCols="12"
                          mdCols="6"
                          title="Preferred Name"
                          :value="personalProfile.preferredName"
                        />
                        <ProfileInfoItem
                          :class="mobile ? 'bb':'bb'"
                          smCols="12"
                          mdCols="6"
                          title="Full Name"
                          :value="personalProfile.legalName"
                        />
                        <ProfileInfoItem
                        :class="mobile ? 'bb':'br'"
                          smCols="12"
                          mdCols="6"
                          title="City/Country"
                          :value="personalProfile.location"
                        />
                        <ProfileInfoItem
                          smCols="12"
                          mdCols="6"
                          title="Profession"
                          :value="personalProfile.profession"
                        />
                      </v-row>
                    </template>
                  </ProfileCard>
                </v-card>
                <v-checkbox v-model="checkbox2" label="Agree"/>
              </v-stepper-content>
              <!-- Joining Questions -->
              <v-stepper-step
                v-if="hasJoiningQuestions"
                :complete="step > 4"
                step="3"
                :color="step > 4 ? 'green' : 'black'"
              >
                Answer Joining Questions
              </v-stepper-step>

              <v-stepper-content step="4" v-if="hasJoiningQuestions">
                <v-card
                  color="grey lighten-5"
                  class="mb-6"
                  height="auto"
                  outlined
                >
                  <v-row>
                    <v-col cols="12" sm="12" v-for="(question, i) in joiningQuestions" :key="`j-q-${i}`" :class="mobile ? 'pt-4 px-0':'pt-6 px-5'">
                      <v-text-field
                        v-model="joiningQuestions[i].answer"
                        v-bind="customProps"
                        :label="joiningQuestions[i].question"
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

              <!-- MESSAGE -->
              <v-stepper-step :step="hasJoiningQuestions ? 5 : 4">
                Send a message with your request
              </v-stepper-step>
              <v-stepper-content :step="hasJoiningQuestions ? 5 : 4">
                <v-card
                  color="grey lighten-5"
                  class="mb-6"
                  height="auto"
                  outlined
                >
                  <v-col cols="12" :class="mobile ? 'pt-4 px-0':'pt-6 px-5'">
                    <v-textarea
                      v-model="message"
                      label="Send a message with your request"
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

import { getProfile } from '@/lib/profile-helpers.js'

import { mapGetters } from 'vuex'

import { dateIntervalToString } from '@/lib/date-helpers.js'
import { findInvalidProfileProps } from '@/lib/tribes-application-helpers.js'

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
      formData: this.profile,
      message: '',
      joiningQuestions: [],
      personalProfile: {}
    }
  },
  watch: {
    'profile': {
      deep: true,
      immediate: true,
      handler (profile) {
        this.joiningQuestions = profile.joiningQuestions.map(q => {
          return {
            question: q.label,
            answer: ''
          }
        })
      }
    },
    checkbox1 (checkbox) {
      if (checkbox) this.step = 2 // step to the next section
    },
    checkbox2 (checkbox) {
      if (checkbox) this.step = 3 // step to the next section
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
      return findInvalidProfileProps(this.personalProfile)
    },
    isValidPersonalProfile () {
      return this.invalidPersonalProfileProps.length === 0
    },
    hasJoiningQuestions () {
      return this.joiningQuestions && this.joiningQuestions.length > 0
    },
    disableSubmission () {
      // if we're not on the last step
      if (this.step === (this.hasJoiningQuestions ? 5 : 4)) return false

      return true
    }
  },
  methods: {
    close () {
      this.$emit('close')
    },
    submit () {
      this.$emit('submit', { text: this.message, joiningQuestionAnswers: this.joiningQuestions })
      this.close()
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
