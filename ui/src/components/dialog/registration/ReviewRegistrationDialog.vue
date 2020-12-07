<template>
  <Dialog :show="show" :title="title" width="720px" :goBack="close" enableMenu
    @submit="submit"
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
    <template v-slot:actions>
      <v-btn @click="respond('decline')" text large class="secondary--text">
        <span>decline</span>
      </v-btn>
      <v-btn @click="respond('approve')" text large class="blue--text mx-5">
        <span>approve</span>
      </v-btn>
    </template>

  </Dialog>
</template>

<script>

import Dialog from '@/components/dialog/Dialog.vue'
import clone from 'lodash.clonedeep'

import Avatar from '@/components/Avatar.vue'

function defaultData (input) {
  var profile = clone(input)

  return {
  }
}

export default {
  name: 'ReviewRegistrationDialog',
  components: {
    Dialog,
    Avatar
  },
  props: {
    show: { type: Boolean, required: true },
    title: { type: String, default: 'Request' },
    profile: { type: Object },
    notification: Object
  },
  data () {
    return {
      formData: {},
      hasSelection: false
    }
  },

  computed: {
    mobile () {
      return this.$vuetify.breakpoint.xs
    },
    receivedMessage () {
      return this.notification.message.comments[this.notification.accepted ? 1 : 0]
    }
  },
  watch: {
    profile: {
      deep: true,
      immediate: true,
      handler (newVal) {
        if (!newVal) return
        this.formData = defaultData(newVal)
      }
    }
  },
  methods: {
    close () {
      this.$emit('close')
    },

    submit () {
      // var output = Object.assign({}, pick(this.profileChanges, PERMITTED_PERSON_ATTRS))
      // if (!isEmpty(output)) {
      //   this.$emit('submit', output)
      // } else {
      //   this.close()
      // }
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
