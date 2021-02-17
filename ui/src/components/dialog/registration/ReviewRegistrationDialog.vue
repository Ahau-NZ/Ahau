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
              <i>{{ notification.from.preferredName }}</i>
            </strong> to join
            <strong>
              <i>{{ notification.message.group.preferredName }}</i>
            </strong>
            <br/>
            Please review their information and respond below
          </span>
        </v-col>
        <v-col>
          <v-card>
            <v-row align="center" class="pt-5">
              <v-col cols="4" align="center">
                <v-row>
                  <v-col cols="12">
                    <Avatar
                      class="big-avatar"
                      size="100px"
                      :image="notification.from.avatarImage"
                      :alt="notification.from.preferredName"
                      :gender="notification.from.gender"
                      :aliveInterval="notification.from.aliveInterval"
                      :deceased="notification.from.deceased"
                      @updateAvatar="notification.from.avatarImage = $event"
                    />
                  </v-col>
                  <v-col cols="12">
                    <h4> {{ notification.from.legalName || notification.from.preferredName }} </h4>
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
                      :image="notification.message.group.avatarImage"
                      :alt="notification.message.group.preferredName"
                      :gender="notification.message.group.gender"
                      :aliveInterval="notification.message.group.aliveInterval"
                      :deceased="notification.message.group.deceased"
                      @updateAvatar="notification.message.group.avatarImage = $event"
                    />
                  </v-col>
                  <v-col cols="12">
                    <h4> {{ notification.message.group.preferredName }} </h4>
                  </v-col>
                </v-row>
              </v-col>
            </v-row>
          </v-card>
        </v-col>
        <v-col cols="12" :class="mobile ? 'pt-4 px-0':'pt-6 px-5'">
          <div>{{ receivedMessage }}</div>
        </v-col>
      </template>
      <template v-if="type === 'review'" v-slot:actions>
        <v-btn @click="respond('decline')" text large class="secondary--text">
          <span>decline</span>
        </v-btn>
        <v-btn @click="respond('approve')" text large class="blue--text mx-5">
          <span>approve</span>
        </v-btn>
      </template>

    </Dialog>

    <!-- MESSAGE RESPONSE -->
    <Dialog
      v-if="showMessage"
      :show="showMessage"
      :title="`${response} request to join ${notification.message.group.preferredName}` "
      @close="close"
      width="720px"
      :goBack="close"
      enableMenu
    >
      <template v-slot:content>
        <p class="pt-4 px-4 subtitle-2 black--text">
          Would you like to send a message along with your response to
          <strong>
            <i>{{notification.from.preferredName}}</i>
          </strong>
        </p>
        <v-col cols="12" :class="mobile ? 'pt-4 px-0':'px-5'">
          <v-textarea
            v-model="resMessage"
            label="Message"
            no-resize
            rows="3"
            auto-grow
            outlined
            placeholder=" "
          ></v-textarea>
        </v-col>
      </template>

      <template v-slot:actions>
        <v-btn @click="showMessage = !showMessage" text large class="secondary--text">
          <span>cancel</span>
        </v-btn>
        <v-btn @click="sendResponse" text large class="blue--text mx-5">
          <span>send</span>
        </v-btn>
      </template>
    </Dialog>
  </div>
</template>

<script>

import Dialog from '@/components/dialog/Dialog.vue'
import isEmpty from 'lodash.isempty'
import Avatar from '@/components/Avatar.vue'
import { acceptGroupApplication } from '@/lib/tribes-application-helpers'

export default {
  name: 'ReviewRegistrationDialog',
  components: {
    Dialog,
    Avatar
  },
  props: {
    show: { type: Boolean, required: true },
    title: { type: String },
    profile: { type: Object },
    notification: Object,
    type: { type: String }
  },
  data () {
    return {
      formData: {},
      showMessage: false,
      message: '',
      resMessage: '',
      response: '',
      isResponding: false
    }
  },

  computed: {
    mobile () {
      return this.$vuetify.breakpoint.xs
    },
    receivedMessage () {
      return this.notification.message.comments[this.notification.accepted ? 1 : 0]
    },
    showActions () {
      if (isEmpty(this.currentNotification)) {
        return true
      }
      if (!this.currentNotification.mine && this.type === 'review') {
        return true
      }
      if (this.currentNotification.mine && this.type === 'response' && !this.currentNotification.accepted) {
        return true
      }
      return false
    }
  },
  watch: {
    profile: {
      deep: true,
      immediate: true,
      handler (newVal) {
        if (!newVal) return
        this.formData = newVal
      }
    }
  },
  methods: {
    respond (response) {
      if (response === 'approve') {
        this.showMessage = !this.showMessage
        this.response = response
      } else this.close()
    },

    async sendResponse () {
      if (this.isResponding) return
      this.isResponding = true
      /* TODO: format */
      // var output = {
      //   // TODO - update to match notifications
      //   action: 'response',
      //   from: this.whoami.profile.id,
      //   message: {
      //     community: 'community profile.id',
      //     outcome: this.response,
      //     message: this.resMessage
      //   },
      //   to: this.formData.id
      // }

      try {
        const res = await this.$apollo.mutate(
          acceptGroupApplication({
            id: this.notification.applicationId,
            comment: this.resMessage
            // TODO: groupItro: ...
          })
        )

        if (res.errors) throw res.errors

        // successfully accepted the application
      } catch (err) {
        console.log('Something went wrong while trying to accept a group application', err)
      }
      /* TODO: check for errors */
      this.showMessage = !this.showMessage
      this.close()
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
