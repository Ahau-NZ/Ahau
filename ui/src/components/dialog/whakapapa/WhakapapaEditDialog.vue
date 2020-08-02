<template>
  <Dialog :title="`Edit ${ formData.name } Whakapapa`" :show="show" @close="close" width="720px" :goBack="close" :enableBar="false">
    <template v-slot:content>
      <v-row class="px-2 pa-5">
        <v-col cols="12" sm="5" order-sm="2">
          <v-row class="pa-0">
            <v-col cols="12" class="pa-0">
              <!-- Avatar -->
              <Avatar
                class="big-avatar"
                size="250px"
                :image="formData.image"
                :alt="formData.name"
                :isView="true"
              />
            </v-col>
            <v-col cols="12" justify="center" align="center" class="pa-0">
              <ImagePicker label="Edit whakapapa image"
                @updateAvatar="formData.image = $event"
                isView
              />
            </v-col>
            <!-- END of Avatar -->
          </v-row>
        </v-col>
        <!-- Information Col -->
        <v-col cols="12" sm="7" class="pl-5">
          <v-row>
            <!-- Name -->
            <v-col cols="12" class="pa-1">
              <v-text-field
                v-model="formData.name"
                label="Name*"
                placeholder=" "
                hide-details
                :rules="form.rules.name.whakapapaView"
              />
            </v-col>
            <!-- Description textarea -->
            <v-col cols="12" class="pa-1">
              <v-textarea
                v-model="formData.description"
                label="Description"
                placeholder=" "
                hide-details
                no-resize
                rows="1"
                auto-grow
              ></v-textarea>
            </v-col>
          </v-row>
          <v-row>
            <v-col>
              <AvatarGroup :profiles="view.kaitiaki" groupTitle="Kaitiaki" size="50px"/>
            </v-col>
          </v-row>
        </v-col>
      </v-row>
    </template>
    <template v-slot:before-actions>
      <v-col cols="12" sm="auto">
        <v-btn
          @click="$emit('delete')"
          align="center"
          color="white"
          text
          class="secondary--text pl-5"
        >
          <v-icon small class="secondary--text" left>mdi-delete</v-icon>Delete whakapapa record
        </v-btn>
      </v-col>
    </template>
    <template v-slot:actions>
      <v-btn @click="close" text large fab class="secondary--text">
        <v-icon color="secondary">mdi-close</v-icon>
      </v-btn>
      <v-btn :disabled="!form.valid" @click="submit" text large fab class="blue--text" color="blue">
        <v-icon>mdi-check</v-icon>
      </v-btn>
    </template>
  </Dialog>
</template>

<script>
import Dialog from '@/components/dialog/Dialog.vue'
import Avatar from '@/components/Avatar.vue'
import AvatarGroup from '@/components/AvatarGroup.vue'
import ImagePicker from '@/components/ImagePicker.vue'

import isEqual from 'lodash.isequal'
import isEmpty from 'lodash.isempty'

import { RULES } from '@/lib/constants.js'

function setDefaultData (view) {
  return {
    name: view.name,
    description: view.description,
    image: view.image,
    recps: view.recps
  }
}

export default {
  name: 'WhakapapaEditDialog',
  components: {
    Dialog,
    Avatar,
    AvatarGroup,
    ImagePicker
  },
  props: {
    show: { type: Boolean, required: true },
    view: { type: Object }
  },

  data () {
    return {
      formData: setDefaultData(this.view),
      form: {
        valid: true,
        rules: RULES
      }
    }
  },
  computed: {
    mobile () {
      return this.$vuetify.breakpoint.xs
    },
    submission () {
      let changes = {}
      Object.entries(this.formData).forEach(([key, value]) => {
        if (!isEqual(this.formData[key], this.view[key])) {
          changes[key] = value === '' ? null : value
        }
      })
      return changes
    }
  },
  watch: {
    view (newVal) {
      this.formData = setDefaultData(newVal)
    }
  },
  methods: {
    cordovaBackButton () {
      this.close()
    },
    close () {
      this.$emit('close')
    },
    submit () {
      var output = Object.assign({}, this.submission)
      if (!isEmpty(output)) {
        this.$emit('submit', output)
      }
      this.close()
    }
  }
}
</script>

<style>
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
