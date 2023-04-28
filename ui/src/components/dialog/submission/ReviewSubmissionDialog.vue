<template>
  <div>
    <Dialog :show="show" :title="title" width="720px" :goBack="close" enableMenu @close="close">

      <!-- Content Slot -->
      <template v-slot:content>

        <!-- v-card showing who edited who-->
        <v-col class="pb-4">
          <v-card label="test" outlined class="py-1" >
            <v-row align="center" class="ma-n2 pt-0">
              <v-col cols="4" align="center">
                <v-row>
                  <v-col cols="12">
                    <Avatar class="small-avatar" size="80px" :image="applicantProfile.avatarImage"
                      :alt="applicantProfile.preferredName" :gender="applicantProfile.gender"
                      :aliveInterval="applicantProfile.aliveInterval" />
                  </v-col>
                  <v-col cols="12">
                    <h4> {{ applicantProfile.legalName || applicantProfile.preferredName }} </h4>
                  </v-col>
                </v-row>
              </v-col>
              <v-col cols="4" align="center">
                <v-row>
                  <v-col cols="12" class="pa-0">
                    <v-icon large>mdi-account-edit</v-icon>
                  </v-col>
                </v-row>
              </v-col>
              <v-col cols="4" align="center">
                <v-row>
                  <v-col cols="12">
                    <Avatar class="small-avatar" size="80px" :image="targetProfile.avatarImage"
                      :alt="targetProfile.preferredName" isView />
                  </v-col>
                  <v-col cols="12">
                    <h4> {{ targetProfile.preferredName }} </h4>
                  </v-col>
                </v-row>
              </v-col>
            </v-row>
            <v-card-subtitle align="center" class="pt-0">{{ text }}</v-card-subtitle>
          </v-card>
        </v-col>

        <!-- Header for changes -->
        <span :class="headerClass">
          Changes requested:
        </span>

        <!-- Content for changes -->
        <v-col v-for="([key, value], i) in changes" :key="i">
          <div v-if="key == 'avatarImage'">
            <div v-if="targetProfile[key] == null">
              <v-checkbox hide-details v-model="selectedChanges[key]" :value="value" color="green"
                class="shrink pl-6 mt-0 black-label">
                <template v-slot:label>
                  <span class="checkbox_label">
                    Added new profile picture:
                  </span>
                </template>
              </v-checkbox>
              <Avatar class="small-avatar" size="80px" :image="changes.avatarImage"/>
            </div>
            <div v-else>
              <v-checkbox hide-details v-model="selectedChanges[key]" :value="value" color="green"
                class="shrink pl-6 mt-0 black-label">
                <template v-slot:label>
                  <span class="checkbox_label">
                    Changed profile picture
                  </span>
                </template>
              </v-checkbox>

              <v-col>
                <v-card outlined class="py-1">
                  <v-row align="center" class="pt-0">
                    <v-col cols="4" align="center">
                      <v-row>
                        <v-col cols="12">
                          <Avatar class="small-avatar" size="80px" :image="targetProfile.avatarImage"
                            :alt="targetProfile.preferredName" :gender="targetProfile.gender"
                            :aliveInterval="targetProfile.aliveInterval" />
                        </v-col>
                      </v-row>
                    </v-col>
                    <v-col cols="4" align="center">
                      <v-row>
                        <v-col cols="12" class="pa-0">
                          <v-icon large>mdi-arrow-right-bold</v-icon>
                        </v-col>
                      </v-row>
                    </v-col>
                    <v-col cols="4" align="center">
                      <v-row>
                        <v-col cols="12">
                          <Avatar class="small-avatar" size="80px" :image="changes.avatarImage"
                            :alt="changes.preferredName" isView />
                        </v-col>
                      </v-row>
                    </v-col>
                  </v-row>
                </v-card>
              </v-col>
            </div>
          </div>
          <!-- Improving readability of deceased changes -->
          <div v-else-if="key == 'deceased'">
            <v-checkbox hide-details v-model="selectedChanges[key]" :value="value" color="green"
              class="shrink pl-6 mt-0 black-label">
              <template v-slot:label>
                <span class="checkbox_label">
                  User is no longer living set to: {{ value }}
                </span>
              </template>
            </v-checkbox>
          </div>
          <!-- Alt names has different structure {add:[],remove:[]} -->
          <!-- TODO: cherese, not supported -->
          <!-- <div v-else-if="key == 'altNames'">
            <v-checkbox hide-details v-model="selectedChanges[key]" :value="key" color="green" class="shrink pl-6 mt-0 black-label">
              <template v-slot:label> -->
                <!-- newbie dev note, is using "&nbsp;" an acceptable way to add a space in an html span or will this cause issues somehow? -->
                <!-- <span class="checkbox_label">
                  Updated alternative names:&nbsp;
                </span>
                <span v-if="value.add && value.add != null && value.add != ''" class="checkbox_label">
                  added {{ formatArray(value.add) }}
                </span>
                <span v-if="value.remove && value.remove != null && value.add && value.add != null" class="checkbox_label">
                  &nbsp;and&nbsp;
                </span>
                <span v-if="value.remove && value.remove != null" class="checkbox_label">
                  removed {{ formatArray(value.remove) }}
                </span>
              </template>
            </v-checkbox>
          </div> -->

          <div v-else>
            <v-checkbox
              v-if="showActions"
             :label="getLabel(key, value)"
             @change="addSelectedItem(key, value, $event)"

              hide-details
              color="green"
              class="shrink pl-6 mt-0 black-label"
            />
            <li v-else class="pl-6">
              {{ getLabel(key, value) }}
            </li>
          </div>
        </v-col>

       <!-- Header for comments -->
       <v-col v-if="showComments" :class="headerClass">
          <span>
            {{ t('comments') }}
          </span>
        </v-col>

        <!-- Content for comments -->
        <v-col v-if="showComments" :class="mobile ? 'px-0' : ''">
          <v-card outlined :class="mobile ? '' : 'ml-2'">
            <v-row align="center">
              <v-col cols="12" sm="12" v-for="({ comment, author }, i) in comments" :key="`j-q-${i}`" :class="mobile ? 'px-0 pl-5' : 'px-5'">
                <v-text-field
                  v-if="author"
                  :value="comment"
                  v-bind="customProps"
                  :label="author.preferredName || author.legalName"
                />
              </v-col>
            </v-row>
            <v-row>
              <v-col v-if="allowNewComments">
                <v-textarea
                  v-model="comment"
                  :label="t('message')"
                  no-resize
                  rows="3"
                  auto-grow
                  outlined
                  placeholder=" "
                  class="px-4"
                  hide-details
                ></v-textarea>
              </v-col>
            </v-row>
          </v-card>
        </v-col>
      </template>

      <template v-slot:actions>
        <div v-if="showActions">
          <v-btn @click="submit(false)" text large class="secondary--text">
            <span>{{ t('decline') }}</span>
          </v-btn>
          <v-btn @click="submit(true)" text large class="blue--text mx-5">
            <span>{{ t('approve') }}</span>
          </v-btn>
        </div>
        <div v-else>
          <v-btn @click="close" text large class="blue--text mx-5">
            <span>{{ t('close') }}</span>
          </v-btn>
        </div>
      </template>
    </Dialog>
  </div>
</template>

<script>
import { mapActions } from 'vuex'

import isEmpty from 'lodash.isempty'
import get from 'lodash.get'

import Dialog from '@/components/dialog/Dialog.vue'
import Avatar from '@/components/Avatar.vue'

import { dateIntervalToString } from '@/lib/date-helpers.js'
import { getCustomFields, getDefaultFieldValue } from '@/lib/custom-field-helpers'
import calculateAge from '@/lib/calculate-age'

export default {
  name: 'ReviewSubmissionDialog',
  components: {
    Dialog,
    Avatar
  },
  props: {
    show: { type: Boolean, required: true },
    title: { type: String, default: 'Review request' },
    notification: Object
  },
  data () {
    return {
      i: 0,
      formData: '',
      comment: '',
      selectedChanges: {},
      updatedKeys: {
        preferredName: this.t('preferredName'),
        profession: this.t('profession'),
        address: this.t('address'),
        legalName: this.t('legalName'),
        altNames: this.t('altNames'),
        description: this.t('description'),
        gender: this.t('gender'),
        postCode: this.t('postCode'),
        city: this.t('city'),
        country: this.t('country'),
        aliveInterval: this.t('aliveInterval'),
        birthOrder: this.t('birthOrder'),
        deceased: this.t('deceased'),
        placeOfBirth: this.t('placeOfBirth'),
        placeOfDeath: this.t('placeOfDeath'),
        buriedLocation: this.t('buriedLocation'),
        education: this.t('education'),
        school: this.t('school')
      }
    }
  },
  computed: {
    mobile () {
      return this.$vuetify.breakpoint.xs
    },
    customProps () {
      return {
        hideDetails: true,
        placeholder: ' ',
        flat: true,
        class: 'custom',
        readonly: true
      }
    },
    headerClass () {
      return `subtitle-2 black--text ${this.mobile ? 'pl-0 pr-0' : 'pl-3'}`
    },
    showActions () {
      if (isEmpty(this.notification)) {
        return true
      }
      if (!this.notification.isPersonal && this.notification.isNew) return true

      return false
    },
    applicantProfile () {
      return this.notification?.applicant || {}
    },
    targetProfile () {
      return this.notification?.target || {}
    },
    applicantProfileCustomFields () {
      return this.applicantProfile.customFields
    },
    group () {
      return this.notification.group
    },
    tribeCustomFields () {
      return getCustomFields(this.group.customFields)
        .filter(field => !field.tombstone)
    },
    answers () {
      return this.notification.answers
    },
    hasAnswers () {
      return this.answers && this.answers.length
    },
    comments () {
      return this.notification.history
        .filter(d => {
          return (
            d.type === 'comment',
            d.comment && d.comment !== ''
          )
        })
    },
    allowNewComments () {
      return !this.notification.isPersonal && this.notification.isNew
    },
    showComments () {
      return (this.comments && this.comments.length) || this.allowNewComments
    },
    dob () {
      if (this.applicantProfile.aliveInterval) {
        const formattedDate = dateIntervalToString(this.applicantProfile.aliveInterval, this.monthTranslations)
        return formattedDate
      }
      return ' '
    },
    altNames () {
      if (this.applicantProfile.altNames) return this.applicantProfile.altNames.join(', ')
      return ''
    },
    education () {
      if (this.applicantProfile.education) return this.applicantProfile.education.join('\n')
      return ''
    },
    school () {
      if (this.applicantProfile.school) return this.applicantProfile.school.join('\n')
      return ''
    },
    age () {
      const age = calculateAge(this.applicantProfile.aliveInterval)
      if (age === null) return ' '
      return age.toString()
    },
    text () {
      return this.showAction
        ? 'A submission has been received from ' + this.applicantProfile?.preferredName + ' to edit ' + this.targetProfile?.preferredName
        : `This submission has been reviewed and was ${this.notification.isAccepted ? 'accepted' : 'rejected'}`
    },
    changes () {
      const changes = this.notification.changes
      delete changes.__typename

      return Object.entries(changes)
        .filter(([key, value]) => value)
    }
  },
  methods: {
    ...mapActions('person', ['updatePerson']),
    ...mapActions('submissions', ['approveSubmission', 'rejectSubmission']),
    getFieldValue (fieldDef) {
      // find the value from the applicantProfiles profile (if there is one)
      let field = this.applicantProfileCustomFields.find(field => field.key === fieldDef.key)

      // if the field wasnt found
      // it could mean that they havent defined a value for it yet
      if (field === undefined) field = { value: getDefaultFieldValue(fieldDef) }

      switch (fieldDef.type) {
        case 'array':
          if (get(field, 'value.length')) return field.value.join(', ')
          return ''
        case 'list':
          if (fieldDef.multiple) return field.value.join(', ')
          else return field.value
        case 'checkbox':
          if (field.value) return 'yes'
          else return 'no'
        default:
          return field.value || ''
      }
    },
    monthTranslations (key, vars) {
      return this.$t('months.' + key, vars)
    },
    formatArray (values) {
      let string = ''
      for (let i = 0; i < values.length; i++) {
        if (i === values.length - 1) {
          string += values[i]
        } else {
          string += values[i] + ', '
        }
      }
      return string
    },
    async submit (approved) {
      const output = {
        id: this.notification.id, // submissionId
        comment: this.comment
      }

      if (approved) {
        if (isEmpty(this.selectedChanges)) return // TODO: show a message

        await this.approveSubmission(output)

        // TODO: move this execute function to ssb-submissions?
        const profileOutput = {
          id: this.targetProfile.id,
          ...this.selectedChanges
        }

        await this.updatePerson(profileOutput)
      } else {
        await this.rejectSubmission(output)
      }

      this.close()
    },
    close () {
      this.$emit('close')
    },
    t (key, vars) {
      return this.$t('reviewSubmissionDialog.' + key, vars)
    },
    isEmptyValue (value) {
      return (
        value === null ||
        value === '' ||
        (
          Array.isArray(value) &&
          value?.length === 0
        )
      )
    },
    addSelectedItem (key, value, isChecked) {
      if (isChecked) this.selectedChanges[key] = value
      else delete this.selectedChanges[key]
    },
    getLabel (key, value) {
      return this.isEmptyValue(this.targetProfile[key])
        ? `Added new ${this.updatedKeys[key]}: ${Array.isArray(value) ? this.formatArray(value) : value}`
        : this.getChangesLabel(key, value)
    },
    getChangesLabel (key, value) {
      return `
        Changes ${this.updatedKeys[key]}
        from ${Array.isArray(value) ? this.formatArray(this.targetProfile[key]) : this.targetProfile[key]}
        to ${Array.isArray(value) ? this.formatArray(value) : value}
      `
    }
  }
}
</script>

<style scoped>

.close {
  top: -25px;
  right: -10px;
}

.big-avatar {
  position: relative;
  top: -20px;
}

.v-input--checkbox label, .checkbox_label{
  font-size: 14px;
  color: black;
}

.v-input--radio-group__input label {
  font-size: 14px;
}

.v-checkbox__label {
  color: black;
}

.black-label label {
  color: red !important;
}

.custom-outline {
  border: 1px solid grey;
}

</style>
