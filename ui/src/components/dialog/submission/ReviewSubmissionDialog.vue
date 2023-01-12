<template>
  <div>
    <Dialog :show="show" :title="title" width="720px" :goBack="close" enableMenu @close="close">

      <!-- Content Slot -->
      <template v-slot:content>

        <v-col>
          <span class="subtitle-2 black--text">
            {{ text }}
          </span>
        </v-col>

        <v-col>
          <v-card outlined class="py-1">
            <v-row align="center" class="pt-0">
              <v-col cols="4" align="center">
                <v-row>
                  <v-col cols="12">
                    <Avatar class="small-avatar" size="80px" :image="submitter.avatarImage"
                      :alt="submitter.preferredName" :gender="submitter.gender"
                      :aliveInterval="submitter.aliveInterval" />
                  </v-col>
                  <v-col cols="12">
                    <h4> {{ submitter.legalName || submitter.preferredName }} </h4>
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
                    <Avatar class="small-avatar" size="80px" :image="userToBeChanged.avatarImage"
                      :alt="userToBeChanged.preferredName" isView />
                  </v-col>
                  <v-col cols="12">
                    <h4> {{ userToBeChanged.preferredName }} </h4>
                  </v-col>
                </v-row>
              </v-col>
            </v-row>
          </v-card>
        </v-col>

        <!-- Header for changes -->
        <span :class="headerClass">
          Changes requested:
        </span>

        <!-- Content for changes -->
        <v-col v-for="(value, key) in changes" :key="key">
          <div v-if="key == 'avatarImage'">
            <div v-if="userToBeChanged[key] == null">
              <v-checkbox hide-details v-model="selectedChanges" :value="key" color="green"
                class="shrink pl-6 mt-0 black-label" label="Added new profile picture:">
              </v-checkbox>
              <Avatar class="small-avatar" size="80px" :image="changes.avatarImage"/>
            </div>
            <div v-else>
              <v-checkbox hide-details v-model="selectedChanges" :value="key" color="green"
                class="shrink pl-6 mt-0 black-label" label="Changed profile picture">
              </v-checkbox>

              <v-col>
                <v-card outlined class="py-1">
                  <v-row align="center" class="pt-0">
                    <v-col cols="4" align="center">
                      <v-row>
                        <v-col cols="12">
                          <Avatar class="small-avatar" size="80px" :image="userToBeChanged.avatarImage"
                            :alt="userToBeChanged.preferredName" :gender="userToBeChanged.gender"
                            :aliveInterval="userToBeChanged.aliveInterval" />
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
          <div v-else-if="userToBeChanged[key] == null">
            <v-checkbox hide-details v-model="selectedChanges" :value="key" color="green"
              class="shrink pl-6 mt-0 black-label" :label="'Added new ' + updatedKeys[key] + ': ' + value"></v-checkbox>
          </div>
          <div v-else>
            <v-checkbox hide-details v-model="selectedChanges" :value="key" class="shrink pl-6 mt-0 black-label"
              color="green"
              :label="'Changed ' + updatedKeys[key] + ' from ' + userToBeChanged[key] + ' to ' + value"></v-checkbox>
          </div>
        </v-col>

        <!-- Header for question answers -->
        <v-col v-if="hasAnswers" :class="headerClass">
          <span>
            {{ t ('answers') }}
          </span>
        </v-col>

        <!-- Content for question answers -->
        <v-col v-if="hasAnswers" :class="mobile ? 'px-0' : ''">
          <v-card outlined :class="mobile ? '' : 'ml-2'">
            <v-row align="center">
              <v-col cols="12" sm="12" v-for="({ question, answer }, i) in answers" :key="`q-a-${i}`"
                :class="mobile ? 'px-0 pl-5' : 'px-5'">
                <v-text-field v-bind="customProps" :label="question" :value="answer" />
              </v-col>
            </v-row>
          </v-card>
        </v-col>

        <!-- Header for comments -->
        <v-col v-if="showComments" :class="headerClass">
          <span>
            {{ t ('comments') }}
          </span>
        </v-col>

        <!-- Content for comments -->
        <!-- removed <v-card :class="mobile ? '' : 'ml-2'">, ask ben if this is important-->

        <v-form :class="mobile ? '' : 'ml-2'" ref="form">
          <v-row align="center">
            <v-col cols="12" sm="12" v-for="({ comment, author }, i) in comments" :key="`j-q-${i}`"
              :class="mobile ? 'px-0 pl-5' : 'px-5'">
              <v-text-field v-if="author" clearable :value="comment" label="Send a message with your response"
                outlined />
            </v-col>
          </v-row>
          <v-row>
            <v-col v-if="allowNewComments">
              <v-textarea v-model="comment" :label="t('message')" no-resize rows="3" auto-grow outlined placeholder=""
                class="px-4" hide-details></v-textarea>
            </v-col>
          </v-row>
        </v-form>

      </template>
      <template v-slot:actions>
        <!-- <div v-if="showActions"></div> -->
        <!-- <div v-else> -->

        <v-btn @click="submit(true)" text large class="blue--text mx-5">
          <span>{{ t ('approve') }}</span>
        </v-btn>

        <v-btn @click="submit(false)" text large class="secondary--text">
          <span>{{ t ('decline') }}</span>
        </v-btn>

        <!-- </div> -->
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
      formData: '',
      comment: '',
      selectedChanges: [],
      updatedKeys: {
        preferredName: this.t('reviewRegistration.preferredName'),
        profession: this.t('profession'),
        email: this.t('email'),
        address: this.t('address'),
        legalName: this.t('reviewRegistration.legalName'),
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
    submitter () {
      return this.notification.submitter
    },
    userToBeChanged () {
      return this.notification.userToBeChanged
    },
    submitterCustomFields () {
      return this.submitter.customFields
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
      if (this.submitter.aliveInterval) {
        const formattedDate = dateIntervalToString(this.submitter.aliveInterval, this.monthTranslations)
        return formattedDate
      }
      return ' '
    },
    altNames () {
      if (this.submitter.altNames) return this.submitter.altNames.join(', ')
      return ''
    },
    education () {
      if (this.submitter.education) return this.submitter.education.join('\n')
      return ''
    },
    school () {
      if (this.submitter.school) return this.submitter.school.join('\n')
      return ''
    },
    age () {
      const age = calculateAge(this.submitter.aliveInterval)
      if (age === null) return ' '
      return age.toString()
    },
    text () {
      return 'A submission has been received from ' + this.notification.submitter.preferredName + ' to edit ' + this.notification.userToBeChanged.preferredName
    },
    changes () {
      return this.notification.changes
    },
    formatChanges () {
      const obj = {}
      for (let i = 0; i < this.selectedChanges.length; i++) {
        obj[this.selectedChanges[i]] = this.notification.changes[this.selectedChanges[i]]
        // console.log(this.notification.changes[this.selectedChanges[i]])
      }

      return obj
    }
  },
  methods: {
    ...mapActions('person', ['updatePerson']),
    getFieldValue (fieldDef) {
      // find the value from the submitters profile (if there is one)
      let field = this.submitterCustomFields.find(field => field.key === fieldDef.key)

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
    async submit (approved) {
      const obj = { id: this.notification.userToBeChanged.id, ...this.formatChanges }
      if (!isEmpty(this.formatChanges)) await this.updatePerson(obj)
    },
    close () {
      this.$emit('close')
    },
    t (key, vars) {
      return this.$t('reviewRegistration.' + key, vars)
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

.v-input--checkbox label {
  font-size: 14px;
}

.v-input--radio-group__input label {
  font-size: 14px;
}

.black-label label {
  color: red !important;
}

</style>
