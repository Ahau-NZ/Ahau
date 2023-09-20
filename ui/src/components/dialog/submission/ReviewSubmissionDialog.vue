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
                    <Avatar class="small-avatar"
                      size="80px"
                      :image="applicantProfile.avatarImage"
                      :alt="applicantProfile.preferredName"
                      :gender="applicantProfile.gender"
                      :aliveInterval="applicantProfile.aliveInterval"
                      :isView="applicantProfile.isView"
                    />
                  </v-col>
                  <v-col cols="12">
                    <h4> {{ applicantProfile.legalName || applicantProfile.preferredName }} </h4>
                  </v-col>
                </v-row>
              </v-col>
              <v-col v-if="isWebForm" cols="4" align="center">
                <v-row>
                  <v-col cols="12" class="pa-0">
                    <v-icon large>mdi-transfer-right</v-icon>
                  </v-col>
                  <v-col cols="12" class="pa-0">
                    <v-icon large>mdi-transfer-left</v-icon>
                  </v-col>
                </v-row>
              </v-col>
              <v-col v-else cols="4" align="center">
                <v-row>
                  <v-col cols="12" class="pa-0">
                    <v-icon large>mdi-account-edit</v-icon>
                  </v-col>
                </v-row>
              </v-col>
              <v-col cols="4" align="center">
                <v-row>
                  <v-col cols="12">
                    <Avatar class="small-avatar"
                      size="80px"
                      :image="sourceProfile.avatarImage"
                      :alt="sourceProfile.preferredName"
                      :gender="sourceProfile.gender"
                      :isView="isSourceGroup"
                    />
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
        <v-col v-if="!isLinkSubmission" :class="headerClass">
          {{ (isNewRecord || isTombstone) ? t('profileFieldsRequested') : t('changesRequested') }}
        </v-col>

        <!-- Profile Field (changes) and Select all section -->
        <FieldList
          v-if="!isLinkSubmission"
          :fields="profileFields"
          :source-profile="sourceProfile"
          :selected-changes.sync="selectedChanges"
          :changes="changes"
          :show-actions="showActions"
          :is-tombstone="isTombstone"
          :tribeCustomFields="tribeCustomFields"
        />

        <LinkSubmission
          v-else

          :submission="notification"
        />

        <!-- Family links section -->
        <v-col v-if="dependencies.length" :class="headerClass">
          {{ t('family' )}}
        </v-col>
        <v-card v-if="dependencies.length" outlined class="py-1 mx-3">
          <SubmissionDependencies v-if="parentLinks.length" :label="t('parents')" :dependencies="parentLinks" @selection="updateSelectedDependencies('parents', $event)" :readonly="!showActions"/>
          <SubmissionDependencies v-if="childLinks.length" :label="t('children')" :dependencies="childLinks" @selection="updateSelectedDependencies('children', $event)" :readonly="!showActions"/>
          <SubmissionDependencies v-if="partnerLinks.length" :label="t('partners')" :dependencies="partnerLinks" @selection="updateSelectedDependencies('partners', $event)" :readonly="!showActions"/>
        </v-card>

        <!-- Header for question answers -->
        <v-col v-if="hasAnswers" :class="headerClass">
          <span>
            {{ t('answers') }}
          </span>
        </v-col>

        <!-- Content for question answers -->
        <v-col v-if="hasAnswers" :class="mobile ? 'px-0' : ''">
          <v-card outlined>
            <v-row align="center">
              <v-col cols="12" sm="12" v-for="({ question, answer }, i) in answers" :key="`q-a-${i}`" :class="mobile ? 'px-0 pl-5' : 'px-5'">
                <v-text-field
                  v-bind="customProps"
                  :label="question"
                  :value="answer"
                  class="pl-4"
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
                  :label="isWebForm ? t('saveComment') : t('message')"
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

        <!-- NOTE: for development purposes, this just shows the data in the notification -->
        <v-col v-if="isDevelopment">
          <details>
            <summary>
              DEBUG: Notification
            </summary>
            <code><pre>{{ JSON.stringify(notification, null, 2) }}</pre></code>
          </details>
        </v-col>
      </template>

      <template v-slot:actions>
        <v-col v-if="showActions" cols="12" class="py-0">
          <v-card-text class="row wrap justify-center font-italic font-weight-light text-caption pb-1">
            {{ t('helpText') }}
          </v-card-text>
        </v-col>
        <v-col class="mx-3 pt-0">
          <v-row>
            <v-spacer />
            <div v-if="showActions">
              <v-btn text class="secondary--text" @click="decline">{{  t('decline') }}</v-btn>
              <v-btn text color="blue" @click="approve">{{ t('approve')}}</v-btn>
            </div>
            <v-btn v-else text color="blue" class="mt-3" @click="close">{{ t('close')}}</v-btn>
          </v-row>
        </v-col>
      </template>
    </Dialog>
  </div>
</template>

<script>
import { mapActions } from 'vuex'
import { isEmpty, pick } from 'lodash-es'

import Dialog from '@/components/dialog/Dialog.vue'
import Avatar from '@/components/Avatar.vue'
import SubmissionDependencies from '@/components/submission/SubmissionDependencies.vue'
import FieldList from '@/components/submission/FieldList.vue'
import LinkSubmission from '@/components/submission/LinkSubmission.vue'

import { getTribeCustomFields } from '@/lib/custom-field-helpers'
import calculateAge from '@/lib/calculate-age'

const CHILD_LINK = 'link/profile-profile/child'
const PARTNER_LINK = 'link/profile-profile/partner'

export default {
  name: 'ReviewSubmissionDialog',
  components: {
    Dialog,
    Avatar,
    SubmissionDependencies,
    FieldList,
    LinkSubmission
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
      selectedDependencies: {}
    }
  },
  computed: {
    isWebForm () {
      return this.notification?.source === 'webForm'
    },
    isTombstone () {
      return Boolean(this.notification?.changes?.tombstone)
    },
    isLinkSubmission () {
      return this.notification?.targetType === CHILD_LINK || this.notification?.targetType === PARTNER_LINK
    },
    dependencies () {
      return this.notification?.dependencies || []
    },
    childLinks () {
      return this.dependencies
        .filter(dep => {
          return (
            dep.targetType === CHILD_LINK &&
            dep?.details?.parent === null
          )
        })
    },
    parentLinks () {
      return this.dependencies
        .filter(dep => {
          return (
            dep.targetType === CHILD_LINK &&
            dep?.details?.child === null
          )
        })
    },
    partnerLinks () {
      return this.dependencies
        .filter(dep => {
          return (
            dep.targetType === PARTNER_LINK
          )
        })
    },
    submissionTitle () {
      if (this.isTombstone) return this.t('deleteProfileRequest')

      if (this.isLinkSubmission) {
        return this.isNewRecord
          ? this.t('createLinkRequest')
          : this.t('editLinkRequest')
      }

      return this.isNewRecord
        ? this.t('createProfileRequest')
        : this.t('editProfileRequest')
    },
    isDevelopment () {
      return process.env.NODE_ENV === 'development'
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
      return `overline black--text ${this.mobile ? 'pl-0 pr-0' : 'pl-3 pb-0'}`
    },
    showActions () {
      if (isEmpty(this.notification)) {
        return true
      }
      if (!this.notification?.isPersonal && this.notification.isNew) return true

      return false
    },
    applicantProfile () {
      if (this.isWebForm) {
        return {
          ...this.notification?.group,
          isView: true
        }
      }
      return this.notification?.applicant || {}
    },
    sourceProfile () {
      if (this.isLinkSubmission) return this.notification?.group

      return this.notification?.sourceRecord || {
        ...(this.notification?.changes || {})
      }
    },
    isSourceGroup () {
      return this.sourceProfile?.id === this.notification?.group?.id
    },
    applicantProfileCustomFields () {
      return this.applicantProfile.customFields
    },
    tribeCustomFields () {
      return getTribeCustomFields(this.notification?.rawGroup, !this.notification?.isPersonal)
    },
    tribeJoiningQuestions () {
      return this.notification?.group?.joiningQuestions
    },
    isNewRecord () {
      // if there is not source, it means we are looking at
      // creating a new record
      return !this.notification.sourceRecord
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
    groupName () {
      return this.notification?.group?.preferredName
    },
    text () {
      const groupName = this.notification?.group?.preferredName

      if (this.showActions) {
        if (this.isWebForm) {
          return this.$t('notifications.submission.profile.new.web', { groupName: this.groupName })
        }

        if (this.isLinkSubmission) {
          return this.$t('notifications.submission.link.new', { groupName })
        }

        return this.$t(`notifications.submission.profile.${this.isTombstone ? 'delete' : 'edit'}`, {
          applicantName: this.applicantProfile?.preferredName,
          profileName: this.sourceProfile?.preferredName,
          groupName: this.groupName
        })
      }

      switch (this.notification?.isAccepted) {
        case true:
          return this.$t('notifications.submission.accepted', { groupName })
        case false:
          return this.$t('notifications.submission.declined', { groupName })
        default:
          return this.isTombstone
            ? this.$t('notifications.submission.delete.review')
            : this.$t('notifications.submission.review')
      }
    },
    changes () {
      const changes = this.notification?.changes

      if (!changes) return []
      delete changes.__typename

      // filter all custom fields that dont have a definition
      changes.customFields = changes?.customFields?.filter(field => {
        return this.tribeCustomFields.find(fieldDef => fieldDef.key === field.key)
      })

      return Object.entries(changes)
        .filter(([key, value]) => {
          // filter out altNames here so we arent showing empty labels for nothing
          if (key === 'altNames' && !this.hasAltnameChanges) return false
          if (key === 'customFields' && !value?.length) return false

          if (key === 'tombstone') return false

          return value
        })
    },
    profileFields () {
      if (!this.isTombstone) return this.changes

      const profile = this.sourceProfile
      if (!profile) return []

      delete profile.__typename

      profile.customFields = profile?.customFields.filter(field => {
        return this.tribeCustomFields.find(fieldDef => fieldDef.key === field.key)
      })

      return Object.entries(this.sourceProfile)
        .filter(([key, value]) => {
          if (['recps', 'id', 'originalAuthor', 'canEdit', 'type'].includes(key)) return false
          if (value === null || isEmpty(value)) return false

          return true
        })
    },
    hasAltnameChanges () {
      const altNames = this.notification?.changes?.altNames

      if (!altNames) return false

      const { add, remove } = altNames
      return (
        (add && add.length) ||
        (remove && remove.length)
      )
    },
    answers () {
      return this.notification?.answers
    },
    hasAnswers () {
      return this.answers?.length
    }
  },
  methods: {
    ...mapActions('person', ['updatePerson']),
    ...mapActions('submissions', [
      'approveNewGroupPersonSubmission',
      'approveEditGroupPersonSubmission',
      'approveDeleteGroupPersonSubmission',
      'approveWhakapapaLinkSubmission',
      'processWhakapapaLinkSubmission',
      'approveWhakapapaLinkSubmissions',
      'rejectSubmission',
      'tombstoneSubmission'
    ]),
    ...mapActions('alerts', ['showAlert']),
    async decline () {
      await this.rejectSubmission({
        id: this.notification?.id,
        comment: this.comment
      })

      this.close()
    },
    async approve () {
      const output = {
        id: this.notification?.id, // submissionId
        comment: this.comment
      }

      if (this.isTombstone) {
        await this.approveDeleteGroupPersonSubmission({ ...output, profileId: this.sourceProfile.id })
        this.close()
        return
      }

      if (isEmpty(this.selectedChanges) && !this.isLinkSubmission) {
        this.showAlert({ message: this.t('noChanges'), color: 'red', delay: 10000 })
        return
      }

      // TODO: ui to change the relationshipType they selected and the legallyAdopted
      output.allowedFields = this.isLinkSubmission
        ? pick(this.notification?.changes, ['parent', 'child', 'relationshipType', 'legallyAdopted', 'recps'])
        : this.selectedChanges

      if (this.isNewRecord) {
        output.recps = [this.notification?.rawGroup?.id]

        if (this.isLinkSubmission) {
          await this.processWhakapapaLinkSubmission(output)
          this.close()
          return
        }

        await this.approveNewGroupPersonSubmission(output)

        const { parents = [], children = [], partners = [] } = (this.selectedDependencies || {})
        const selectedDependencies = [...parents, ...children, ...partners]
        await this.approveWhakapapaLinkSubmissions(selectedDependencies)
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
    updateSelectedDependencies (type, dependencies) {
      if (dependencies?.length) this.selectedDependencies[type] = dependencies
      else delete this.selectedDependencies[type]
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
  font-weight: bold;
}

.black-label label {
  color: red !important;
}

.custom-outline {
  border: 1px solid grey;
}

</style>
