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
              elevation="1"
              :style="mobile ? 'margin: 0px' : 'margin: 20px'"
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
                  :align="mobile ? 'center' : 'start'"
                  :order="mobile ? '3' : '1'"
                  :class="!mobile ? 'pt-12':''"
                >
                  <h1
                    class="primary--text"
                    :style="mobile ? length : ''"
                  >{{ formData.legalName ? formData.legalName : formData.preferredName }}</h1>
                </v-col>
              </v-row>
              <v-divider></v-divider>
            </v-card>

            <!-- MESSAGE -->
            <v-col cols="12" :class="mobile ? 'pt-4 px-0':'pt-6 px-5'">
              <v-textarea
                v-model="message"
                label="Send a message with your request"
                no-resize
                rows="3"
                auto-grow
                outlined
                placeholder=" "
              ></v-textarea>
            </v-col>
          </v-form>
        </v-col>
      </template>

      <!-- Actions Slot -->
      <template v-slot:actions>
        <v-btn @click="close" text large class="secondary--text">
          <span>cancel</span>
        </v-btn>
        <v-btn @click="submit" text large class="blue--text mx-5">
          <span>submit</span>
        </v-btn>
      </template>
    </Dialog>
  </div>
</template>

<script>

import Avatar from '@/components/Avatar.vue'
import Dialog from '@/components/dialog/Dialog.vue'

export default {
  name: 'NewRegistrationDialog',
  components: {
    Dialog,
    Avatar
  },
  props: {
    show: { type: Boolean, required: true },
    title: { type: String, default: 'Join Community' },
    hideDetails: { type: Boolean, default: false },
    profile: { type: Object }
  },
  data () {
    return {
      formData: this.profile,
      message: ''
    }
  },
  computed: {
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
    }
  },
  methods: {
    close () {
      this.$emit('close')
    },

    submit () {
      this.$emit('submit', this.message)

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
