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
        <v-expansion-panels flat>
          <v-expansion-panel class="pa-0">
            <v-expansion-panel-header :class="headerClass">
              {{ notification.isPersonal ? 'Your' : (applicant.legalName || applicant.preferredName) + "'s" }} Information
            </v-expansion-panel-header>
            <v-expansion-panel-content>
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
                          :value="applicant.phone"
                          class="pb-0"
                        />
                        <ProfileInfoItem
                          :class="mobile ? 'bb':'br bb'"
                          smCols="12"
                          mdCols="6"
                          title="Email"
                          :value="applicant.email"
                          class="pb-0"
                        />
                        <ProfileInfoItem
                          smCols="12"
                          mdCols="6"
                          title="Address"
                          :value="applicant.postCode"
                          class="pb-0 bb"
                        />
                        <ProfileInfoItem
                          smCols="12"
                          mdCols="12"
                          title="Address"
                          :value="applicant.address"
                          class="pb-0"
                        />
                      </v-row>
                    </template>
                  </ProfileCard>
                      <ProfileCard :style="mobile ? 'margin: 10px;':'margin:20px'">
                    <template v-slot:content>
                      <v-row cols="12" class="pt-0">
                        <ProfileInfoItem
                          :class="mobile ? 'bb':' bb'"
                          smCols="12"
                          mdCols="12"
                          title="Description"
                          :value="applicant.description"
                          class="pb-0"
                        />
                        <ProfileInfoItem
                          :class="mobile ? 'bb':'bb br'"
                          smCols="12"
                          mdCols="6"
                          title="Preferred Name"
                          :value="applicant.preferredName"
                          class="pb-0"
                        />
                        <ProfileInfoItem
                          smCols="12"
                          mdCols="6"
                          title="Full Name"
                          :value="applicant.legalName"
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
                          :value="applicant.placeOfBirth"
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
                          :value="applicant.profession"
                          class="pb-0 bb"
                        />
                        <ProfileInfoItem
                          :class="mobile ? 'bb':'br'"
                          smCols="12"
                          mdCols="6"
                          title="Profession"
                          :value="education"
                          class="pb-0"
                        />
                        <ProfileInfoItem
                          smCols="12"
                          mdCols="6"
                          title="Profession"
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
                          :value="applicant.city"
                          class="pb-0"
                        />
                        <ProfileInfoItem
                          class="pb-0"
                          smCols="12"
                          mdCols="6"
                          title="Country"
                          :value="applicant.country"
                        />
                      </v-row>
                    </template>
                  </ProfileCard>
            </v-expansion-panel-content>
          </v-expansion-panel>
          <v-expansion-panel v-if="notification.answers && notification.answers.length > 0" class="px-0">
            <v-expansion-panel-header :class="headerClass">
              Question Answers
            </v-expansion-panel-header>
            <v-expansion-panel-content class="pl-0">
              <v-card outlined class="px-0">
                <v-col cols="12" sm="12" v-for="(question, i) in notification.answers" :key="`j-q-${i}`" :class="mobile ? 'px-0 pl-5' : 'px-5'">
                  <v-text-field
                    :value="notification.answers[i].answer"
                    v-bind="customProps"
                    :label="notification.answers[i].question"

                  />
                </v-col>
              </v-card>
            </v-expansion-panel-content>
          </v-expansion-panel>
        </v-expansion-panels>
        <v-col :class="headerClass">
          <span>
            Comments
          </span>
        </v-col>
        <v-col :class="mobile ? 'px-0' : ''">
          <v-card outlined :class="mobile ? '' : 'ml-2'">
            <v-row align="center">
              <v-col cols="12" sm="12" v-for="({ comment, author }, i) in comments" :key="`j-q-${i}`" :class="mobile ? 'px-0 pl-5' : 'px-5'">
                <v-text-field
                  :value="comment"
                  v-bind="customProps"
                  :label="author.preferredName || author.legalName"
                />
              </v-col>
              <v-col v-if="!notification.isPersonal && notification.isNew">
                <v-textarea
                  v-model="comment"
                  label="Send a message"
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
            <span>decline</span>
          </v-btn>
          <v-btn @click="submit(true)" text large class="blue--text mx-5">
            <span>approve</span>
          </v-btn>
        </div>
        <div v-else>
          <v-btn @click="close" text large class="blue--text mx-5">
            <span>close</span>
          </v-btn>
        </div>
      </template>
    </Dialog>
  </div>
</template>

<script>

import Dialog from '@/components/dialog/Dialog.vue'
import isEmpty from 'lodash.isempty'
import Avatar from '@/components/Avatar.vue'
import ProfileCard from '@/components/profile/ProfileCard.vue'
import ProfileInfoItem from '@/components/profile/ProfileInfoItem.vue'
import { dateIntervalToString } from '@/lib/date-helpers.js'
import { acceptGroupApplication, declineGroupApplication } from '@/lib/tribes-application-helpers.js'
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
    group () {
      return this.notification.group
    },
    dob () {
      if (this.applicant.aliveInterval) {
        var formattedDate = dateIntervalToString(this.applicant.aliveInterval, this.monthTranslations)
        return formattedDate
      }
      return ' '
    },
    monthTranslations (key, vars) {
      return this.$t('months.' + key, vars)
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
      var age = calculateAge(this.applicant.aliveInterval)
      if (age === null) return ' '
      return age.toString()
    },
    comments () {
      return this.notification.history.filter(d => d.type === 'comment')
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
    async submit (approved) {
      var output = {
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
        console.error('Something went wrong while try to accept/decline application', err)
      }
    },
    close () {
      this.$emit('close')
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
