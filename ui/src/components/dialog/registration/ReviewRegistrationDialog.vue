<template>
  <div>
    <Dialog :show="show" :title="title" width="720px" :goBack="close" enableMenu
      @close="close"
    >

      <!-- Content Slot -->
      <template v-slot:content>
        <v-col>
          <span class="subtitle-2 black--text">
            A new request has been recieved from
            <strong>
              <i>{{ applicant.preferredName }}</i>
            </strong> to join
            <strong>
              <i>{{ group.preferredName }}</i>
            </strong>
            <br/>
            Please review their information and respond below
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
                      :deceased="applicant.deceased"
                      @updateAvatar="applicant.avatarImage = $event"
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
                      :gender="group.gender"
                      :aliveInterval="group.aliveInterval"
                      :deceased="group.deceased"
                      @updateAvatar="group.avatarImage = $event"
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
          <span class="subtitle-2 black--text">
            {{ applicant.legalName || applicant.preferredName }}'s Information
          </span>
        </v-col>
        <v-col class="px-0">
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
                  :value="applicant.phone"
                />
                <ProfileInfoItem
                  :class="mobile ? 'bb':'br'"
                  smCols="12"
                  mdCols="6"
                  title="Email"
                  :value="applicant.email"
                />
                <ProfileInfoItem
                  smCols="12"
                  mdCols="6"
                  title="Address"
                  :value="applicant.address"
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
                />
                <ProfileInfoItem
                  :class="mobile ? 'bb':'bb br'"
                  smCols="12"
                  mdCols="6"
                  title="Preferred Name"
                  :value="applicant.preferredName"
                />
                <ProfileInfoItem
                  :class="mobile ? 'bb':'bb'"
                  smCols="12"
                  mdCols="6"
                  title="Full Name"
                  :value="applicant.legalName"
                />
                <ProfileInfoItem
                  :class="mobile ? 'bb':'br'"
                  smCols="12"
                  mdCols="6"
                  title="City/Country"
                  :value="applicant.location"
                />
                <ProfileInfoItem
                  smCols="12"
                  mdCols="6"
                  title="Profession"
                  :value="applicant.profession"
                />
              </v-row>
            </template>
          </ProfileCard>
          <ProfileCard :style="mobile ? 'margin: 10px;':'margin:20px'">
            <template v-slot:content>
              <v-row cols="12" class="pt-0">
                <ProfileInfoItem
                  smCols="12"
                  mdCols="12"
                  title="Message"
                  :value="receivedMessage"
                />
              </v-row>
            </template>
          </ProfileCard>
        </v-col>
        <v-col cols="12" sm="12" v-for="(question, i) in group.answers" :key="`j-q-${i}`" :class="mobile ? 'pt-4 px-0':'pt-6 px-5'">
          <v-text-field
            :value="group.answers[i].answer"
            v-bind="customProps"
            :label="group.answers[i].question"
          />
        </v-col>
      </template>
      <template v-if="type === 'review'" v-slot:actions>
        <v-btn @click="submit(false)" text large class="secondary--text">
          <span>decline</span>
        </v-btn>
        <v-btn @click="submit(true)" text large class="blue--text mx-5">
          <span>approve</span>
        </v-btn>
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

import { mapGetters } from 'vuex'

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
    type: { type: String }
  },
  computed: {
    ...mapGetters(['currentNotification']),
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
    receivedMessage () {
      // return this.notification.message.comments[this.notification.accepted ? 1 : 0]
      return '' // TODO: add to store and here...
    },
    showActions () {
      if (isEmpty(this.currentNotification)) {
        return true
      }
      if (this.currentNotification.type === 'new') return true

      return false
    },
    applicant () {
      return this.currentNotification.applicant
    },
    group () {
      return this.currentNotification.group
    },
    dob () {
      if (this.applicant.aliveInterval) {
        var formattedDate = dateIntervalToString(this.applicant.aliveInterval)
        return formattedDate
      }
      return ' '
    }
  },
  methods: {
    submit (approved) {
      var output = {
        comment: this.comment,
        approved
      }

      this.$emit('submit', output)
      this.$emit('close')
    },
    close () {
      this.$emit('close')
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
