<template>
  <div>
    <Dialog :show="show" :title="title" width="720px" :goBack="close" enableMenu
      @close="close"
    >

      <!-- Content Slot -->
      <template v-slot:content>
        <v-col>
          <span class="subtitle-2 black--text">
            {{ text }}
          </span>
        </v-col>
        <v-col>
          <v-card outlined class="py-6">
            <v-row align="center" class="pt-5">
              <v-col cols="4" align="center">
                <v-row>
                  <v-col cols="12">
                    <Avatar
                      class="big-avatar"
                      size="100px"
                      :image="applicant.avatarImage"
                      :alt="applicant.preferredName"
                      :gender="applicant.gender"
                      :aliveInterval="applicant.aliveInterval"
                    />
                  </v-col>
                  <v-col cols="12">
                    <h4> {{ applicant.legalName || applicant.preferredName }} </h4>
                  </v-col>
                </v-row>
              </v-col>
              <v-col cols="4" align="center">
                <v-row>
                  <v-col cols="12" class="pa-0">
                    <v-icon large>mdi-transfer-right</v-icon>
                  </v-col>
                  <v-col cols="12" class="pa-0">
                    <v-icon large>mdi-transfer-left</v-icon>
                  </v-col>
                </v-row>
              </v-col>
              <v-col cols="4" align="center">
                <v-row>
                  <v-col cols="12">
                    <Avatar
                      class="big-avatar"
                      size="100px"
                      :image="group.avatarImage"
                      :alt="group.preferredName"
                      isView
                    />
                  </v-col>
                  <v-col cols="12">
                    <h4> {{ group.preferredName }} </h4>
                  </v-col>
                </v-row>
              </v-col>
            </v-row>
          </v-card>
        </v-col>
        <v-col>
          <v-row :class="headerClass">
            {{ notification.isPersonal ? 'Your' : (applicant.legalName || applicant.preferredName) + "'s" }} Information
          </v-row>
          <v-row>
            <ProfileCard :style="mobile ? 'margin: 10px;' : 'margin:20px'">
              <template v-slot:content>
                <v-row cols="12" class="pt-0">
                  <ProfileInfoItem
                    :class="mobile ? 'bb' : 'br bb'"
                    smCols="12"
                    mdCols="6"
                    :title="t('dob')"
                    :value="dob"
                    class="pb-0"
                  />
                  <ProfileInfoItem
                    :class="mobile ? 'bb' : 'bb'"
                    smCols="12"
                    mdCols="6"
                    :title="t('phone')"
                    :value="applicant.phone"
                    class="pb-0"
                  />
                  <ProfileInfoItem
                    :class="mobile ? 'bb' : 'br bb'"
                    smCols="12"
                    mdCols="6"
                    :title="t('email')"
                    :value="applicant.email"
                    class="pb-0"
                  />
                  <ProfileInfoItem
                    smCols="12"
                    mdCols="6"
                    :title="t('postcode')"
                    :value="applicant.postCode"
                    class="pb-0 bb"
                  />
                  <ProfileInfoItem
                    smCols="12"
                    mdCols="12"
                    :title="t('address')"
                    :value="applicant.address"
                    class="pb-0"
                  />
                </v-row>
              </template>
            </ProfileCard>
            <ProfileCard :style="mobile ? 'margin: 10px;' : 'margin:20px'">
              <template v-slot:content>
                <v-row cols="12" class="pt-0">
                  <ProfileInfoItem
                    :class="mobile ? 'bb' : ' bb'"
                    smCols="12"
                    mdCols="12"
                    :title="t('description')"
                    :value="applicant.description"
                    class="pb-0"
                  />
                  <ProfileInfoItem
                    :class="mobile ? 'bb' : 'bb br'"
                    smCols="12"
                    mdCols="6"
                    :title="t('preferredName')"
                    :value="applicant.preferredName"
                    class="pb-0"
                  />
                  <ProfileInfoItem
                    smCols="12"
                    mdCols="6"
                    :title="t('fullName')"
                    :value="applicant.legalName"
                    class="pb-0 bb"
                  />
                  <ProfileInfoItem
                    :class="mobile ? 'bb' : 'br'"
                    smCols="12"
                    mdCols="6"
                    :title="t('otherNames')"
                    :value="altNames"
                    class="pb-0"
                  />
                  <ProfileInfoItem
                    smCols="12"
                    mdCols="6"
                    :title="t('placeOfBirth')"
                    :value="applicant.placeOfBirth"
                    class="pb-0"
                  />
                </v-row>
              </template>
            </ProfileCard>
            <ProfileCard :style="mobile ? 'margin: 10px;' : 'margin:20px'">
              <template v-slot:content>
                <v-row cols="12" class="pt-0">
                  <ProfileInfoItem
                    :class="mobile ? 'bb' : ' bb br'"
                    smCols="12"
                    mdCols="6"
                    :title="t('age')"
                    :value="age"
                    class="pb-0"
                  />
                  <ProfileInfoItem
                    :class="mobile ? 'bb' : 'bb'"
                    smCols="12"
                    mdCols="6"
                    :title="t('profession')"
                    :value="applicant.profession"
                    class="pb-0"
                  />
                  <ProfileInfoItem
                    :class="mobile ? 'bb' : 'br'"
                    smCols="12"
                    mdCols="6"
                    :title="t('education')"
                    :value="education"
                    class="pb-0"
                  />
                  <ProfileInfoItem
                    smCols="12"
                    mdCols="6"
                    :title="t('school')"
                    :value="school"
                    class="pb-0"
                  />
                </v-row>
              </template>
            </ProfileCard>
             <ProfileCard :style="mobile ? 'margin: 10px;' : 'margin:20px; width:100%'">
              <template v-slot:content>
                <v-row cols="12" class="pt-0">
                  <ProfileInfoItem
                    :class="mobile ? 'bb' : 'br'"
                    smCols="12"
                    mdCols="6"
                    :title="t('city')"
                    :value="applicant.city"
                    class="pb-0"
                  />
                  <ProfileInfoItem
                    smCols="12"
                    mdCols="6"
                    :title="t('country')"
                    :value="applicant.country"
                    class="pb-0"
                  />
                </v-row>
              </template>
            </ProfileCard>
            <ProfileCard v-if="tribeCustomFields.length" :style="mobile ? 'margin: 10px;' : 'margin:20px; width:100%'">
              <template v-slot:content>
               <v-row cols="12" class="pt-0">
                  <ProfileInfoItem
                    v-for="(fieldDef, i) in tribeCustomFields" :key="i"
                    :class="mobile ? 'bb' : 'br'"
                    smCols="12"
                    mdCols="6"
                    :title="fieldDef.label"
                    :value="getFieldValue(fieldDef)"
                    class="pb-0"
                  />
                </v-row>
              </template>
            </ProfileCard>
          </v-row>
        </v-col>

        <!-- Header for question answers -->
        <v-col v-if="hasAnswers" :class="headerClass">
          <span>
            {{ t('answers') }}
          </span>
        </v-col>

        <!-- Content for question answers -->
        <v-col v-if="hasAnswers" :class="mobile ? 'px-0' : ''">
          <v-card outlined :class="mobile ? '' : 'ml-2'">
            <v-row align="center">
              <v-col cols="12" sm="12" v-for="({ question, answer }, i) in answers" :key="`q-a-${i}`" :class="mobile ? 'px-0 pl-5' : 'px-5'">
                <v-text-field
                  v-bind="customProps"
                  :label="question"
                  :value="answer"
                />
              </v-col>
            </v-row>
          </v-card>
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

import isEmpty from 'lodash.isempty'
import get from 'lodash.get'

import Dialog from '@/components/dialog/Dialog.vue'
import Avatar from '@/components/Avatar.vue'
import ProfileCard from '@/components/profile/ProfileCard.vue'
import ProfileInfoItem from '@/components/profile/ProfileInfoItem.vue'

import { dateIntervalToString } from '@/lib/date-helpers'
import { acceptGroupApplication, declineGroupApplication } from '@/lib/tribes-application-helpers'
import { getCustomFields, getDefaultFieldValue } from '@/lib/custom-field-helpers'
import calculateAge from '@/lib/calculate-age'

export default {
  name: 'ReviewRegistrationDialog',
  components: {
    Dialog,
    Avatar,
    ProfileCard,
    ProfileInfoItem
  },
  props: {
    show: { type: Boolean, required: true },
    title: { type: String, default: 'Review request' },
    notification: Object
  },
  data () {
    return {
      comment: ''
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
    applicant () {
      return this.notification.applicant
    },
    applicantCustomFields () {
      return this.applicant.customFields
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
      if (this.applicant.aliveInterval) {
        const formattedDate = dateIntervalToString(this.applicant.aliveInterval, this.monthTranslations)
        return formattedDate
      }
      return ' '
    },
    altNames () {
      if (this.applicant.altNames) return this.applicant.altNames.join(', ')
      return ''
    },
    education () {
      if (this.applicant.education) return this.applicant.education.join('\n')
      return ''
    },
    school () {
      if (this.applicant.school) return this.applicant.school.join('\n')
      return ''
    },
    age () {
      const age = calculateAge(this.applicant.aliveInterval)
      if (age === null) return ' '
      return age.toString()
    },
    text () {
      const { isPersonal, isNew, isAccepted } = this.notification

      const groupName = this.notification.group.preferredName
      const from = this.notification.from.preferredName

      if (!isPersonal && isNew) return `A new request has been received from ${from} to join ${groupName}. please review their information and respond below`
      if (!isPersonal && isAccepted) return `${from}'s application to join ${groupName} has been accepted`
      if (!isPersonal && !isAccepted) return `${from}'s application to join ${groupName} has been declined`
      if (isPersonal && isNew) return `Your request to join ${groupName} has been sent and is yet to be reviewed`
      if (isPersonal && isAccepted) return `Your application to join ${groupName} has been accepted`
      if (isPersonal && !isAccepted) return `Your application to join ${groupName} has been declined`
      return 'No details'
    }
  },
  methods: {
    getFieldValue (fieldDef) {
      // find the value from the applicants profile (if there is one)
      let field = this.applicantCustomFields.find(field => field.key === fieldDef.key)

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
      const output = {
        id: this.notification.id, // the applicationId
        comment: this.comment
        // TODO (later): groupIntro
      }

      const mutation = approved
        ? acceptGroupApplication(output)
        : declineGroupApplication(output)

      try {
        const res = await this.$apollo.mutate(mutation)

        if (res.errors) throw res.errors

        // success
        this.close()
      } catch (err) {
        console.error('Something went wrong while trying to accept/decline application', err)
      }
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
</style>
