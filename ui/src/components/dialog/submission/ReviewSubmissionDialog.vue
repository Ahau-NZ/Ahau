<template>
  <div>
    <Dialog :show="show" :title="submissionTitle" width="720px" :goBack="close" enableMenu @close="close">

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
                    <Avatar class="small-avatar" size="80px" :image="sourceProfile.avatarImage"
                      :alt="sourceProfile.preferredName" isView />
                  </v-col>
                  <v-col cols="12">
                    <h4> {{ sourceProfile.preferredName }} </h4>
                  </v-col>
                </v-row>
              </v-col>
            </v-row>
            <v-card-subtitle align="center" class="pt-0">{{ text }}</v-card-subtitle>
          </v-card>
        </v-col>

        <!-- Header for changes -->
        <span :class="headerClass">
          {{ isNewRecord ? t('profileFieldsRequested') : t('changesRequested') }}
        </span>

        <!-- Content for changes -->
        <v-col v-for="([key, value], i) in changes" :key="i">
          <div v-if="key == 'avatarImage'">
            <div v-if="sourceProfile[key] == null">
              <v-checkbox hide-details v-model="selectedChanges[key]" :value="value" color="green"
                class="shrink pl-6 mt-0 black-label">
                <template v-slot:label>
                  <span class="checkbox_label">
                    {{ t('addedPicture') }}
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
                    {{ t('changedPicture') }}
                  </span>
                </template>
              </v-checkbox>

              <v-col>
                <v-card outlined class="py-1">
                  <v-row align="center" class="pt-0">
                    <v-col cols="4" align="center">
                      <v-row>
                        <v-col cols="12">
                          <Avatar class="small-avatar" size="80px" :image="sourceProfile.avatarImage"
                            :alt="sourceProfile.preferredName" :gender="sourceProfile.gender"
                            :aliveInterval="sourceProfile.aliveInterval" />
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
                  {{ t('userDeceased', { value }) }}
                </span>
              </template>
            </v-checkbox>
          </div>

          <!-- Alt names has different structure {add:[],remove:[]} -->
          <div v-else-if="key == 'altNames'">
            <div class="pl-6" v-if="value && value.add && value.add.length">
              {{ t('altNameChanges.add', { altNames: '' }) }}

              <div v-for="name in value.add" :key="name">
                <v-checkbox
                  v-if="showActions"
                  :label="name"
                  hide-details
                  color="green"
                  class="shrink pl-6 mt-0 black-label"
                  @change="addAltName('add', name)"
                />
                <li v-else class="pl-6">
                  {{ name }}
                </li>
              </div>
            </div>

            <div class="pl-6" v-if="value && value.remove && value.remove.length">
              {{ t('altNameChanges.remove', { altNames: '' }) }}

              <div v-for="name in value.remove" :key="name">
                <v-checkbox
                  v-if="showActions"
                  :label="name"
                  hide-details
                  color="green"
                  class="shrink pl-6 mt-0 black-label"
                  @change="addAltName('remove', name)"
                />
                <li v-else class="pl-6">
                  {{ name }}
                </li>
              </div>
            </div>
          </div>

          <div v-else-if="key === 'customFields'">
            <div v-for="field in value" :key="field.key">
              <v-checkbox
                v-if="showActions"
                :label="getCustomFieldLabel(field.key, field.value)"
                hide-details
                color="green"
                class="shrink pl-6 mt-0 black-label"
                @change="addCustomField(field)"
              />
              <li v-else>
                {{ getCustomFieldLabel(field.key, field.value) }}
              </li>
            </div>
          </div>

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
        <v-col class="pt-8" align="center">
        <v-btn text @click="deleteSubmission">
          {{ t('deleteSubmission') }}
          <v-icon class="pl-2">mdi-delete</v-icon>
        </v-btn>
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
// import get from 'lodash.get'

import isEmpty from 'lodash.isempty'
import Dialog from '@/components/dialog/Dialog.vue'
import Avatar from '@/components/Avatar.vue'

import { getTribeCustomFields } from '@/lib/custom-field-helpers'
import calculateAge from '@/lib/calculate-age'

export default {
  name: 'ReviewSubmissionDialog',
  components: {
    Dialog,
    Avatar
  },
  props: {
    show: { type: Boolean, required: true },
    notification: { type: Object, required: true }
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
    submissionTitle () {
      return this.isNewRecord
        ? this.t('createProfileRequest')
        : this.t('editProfileRequest')
    },
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
      if (!this.notification?.isPersonal && this.notification.isNew) return true

      return false
    },
    applicantProfile () {
      return this.notification?.applicant || {}
    },
    sourceProfile () {
      return this.notification?.source || {}
    },
    applicantProfileCustomFields () {
      return this.applicantProfile.customFields
    },
    tribeCustomFields () {
      return getTribeCustomFields(this.notification?.rawGroup, !this.notification?.isPersonal)
    },
    isNewRecord () {
      // if there is not source or target, it means we are looking at
      // creating a new record
      return !this.notification.source && !this.notification.target
    },
    comments () {
      return this.notification?.history
        .filter(d => {
          return (
            d.type === 'comment',
            d.comment && d.comment !== ''
          )
        })
    },
    allowNewComments () {
      return !this.notification?.isPersonal && this.notification?.isNew
    },
    showComments () {
      return (this.comments && this.comments.length) || this.allowNewComments
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
      if (this.showAction) {
        return this.t('submission.new', {
          applicantName: this.applicantProfile?.preferredName,
          sourceName: this.sourceProfile?.preferredName
        })
      }

      switch (this.notification?.isAccepted) {
        case true:
          return this.t('submission.accepted')
        case false:
          return this.t('submission.rejected')
        default:
          return this.t('submission.review')
      }
    },
    changes () {
      const changes = this.notification?.changes

      if (!changes) return []
      delete changes.__typename

      return Object.entries(changes)
        .filter(([key, value]) => value)
    }
  },
  methods: {
    ...mapActions('person', ['updatePerson']),
    ...mapActions('submissions', ['approveEditGroupPersonSubmission', 'approveNewGroupPersonSubmission', 'rejectSubmission', 'tombstoneSubmission']),
    ...mapActions('alerts', ['showAlert']),
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
        id: this.notification?.id, // submissionId
        comment: this.comment
      }

      if (!approved) {
        await this.rejectSubmission(output)
        this.close()
        return
      }

      if (isEmpty(this.selectedChanges)) {
        this.showAlert({ message: this.t('noChanges'), color: 'green', delay: 3000 })
        return
      }

      output.allowedFields = this.selectedChanges

      if (this.isNewRecord) {
        output.recps = [this.notification?.rawGroup?.id]
        await this.approveNewGroupPersonSubmission(output)
      } else {
        await this.approveEditGroupPersonSubmission(output)
      }

      this.close()
    },
    close () {
      this.$emit('close')
    },
    async deleteSubmission () {
      await this.tombstoneSubmission(this.notification.id) // the submissionId
      this.close()
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
      return this.isEmptyValue(this.sourceProfile[key])
        ? this.t('newField', { fieldName: this.updatedKeys[key], fieldValue: this.formatValue(value) })
        : this.getChangesLabel(key, value)
    },
    // NOTE: cherese 1/05/23
    // I removed the "from" text from here, change from ... to, because when the sourceProfile is updated, it shows
    // the updated values, so there isnt an "easy" way to show the old values
    getChangesLabel (key, value) {
      const fieldName = this.updatedKeys[key]
      const fieldValue = this.formatValue(value)
      return this.isNewRecord
        ? this.t('newField', { fieldName, fieldValue })
        : this.t('changedField', { fieldName, fieldValue })
    },
    getAltNamesAddLabel (value) {
      return this.t('altNameChanges.add', { altNames: value.add.join(', ') })
    },
    getAltNamesRemoveLabel (value) {
      return this.t('altNameChanges.remove', { altNames: value.remove.join(', ') })
    },
    getCustomFieldLabel (key, value) {
      const fieldDef = this.tribeCustomFields.find(field => field.key === key)
      return this.t('newField', { fieldName: fieldDef.label, fieldValue: this.formatValue(value) })
    },
    formatValue (value) {
      return Array.isArray(value) ? this.formatArray(value) : value
    },
    addAltName (key, name) {
      if (!this.selectedChanges.altNames) this.selectedChanges.altNames = { add: [], remove: [] }
      const items = this.selectedChanges.altNames[key]
      if (items.includes(name)) items.splice(items.indexOf(name), 1) // remove it
      else items.push(name) // add it

      this.selectedChanges.altNames[key] = items
      this.cleanupAltNames()
    },
    cleanupAltNames () {
      if (this.selectedChanges.altNames.add.length === 0 && this.selectedChanges.altNames.remove.length === 0) delete this.selectedChanges.altNames
    },
    cleanupCustomFields () {
      if (this.selectedChanges?.customFields?.length === 0) delete this.selectedChanges.customFields
    },
    addCustomField (customField) {
      if (!this.selectedChanges.customFields) this.selectedChanges.customFields = []

      const items = this.selectedChanges.customFields
      const field = items.find(field => field.key === customField.key)
      if (field) items.splice(items.indexOf(field), 1)
      else {
        delete customField.__typename
        items.push(customField)
      }
      this.cleanupCustomFields()
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
