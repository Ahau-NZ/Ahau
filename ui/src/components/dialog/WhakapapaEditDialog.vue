<template>
  <Dialog :show="show" @close="close" width="720px" :goBack="close" :enableBar="false">
    <v-form ref="form" v-model="form.valid" lazy-validation>
      <v-card>
        <v-container width="100%" class="pa-0">
          <v-card-text>
            <v-row class="px-2">
              <v-col cols="12" sm="5" order-sm="2">
                <v-row class="pa-0">
                  <v-col v-if="!mobile" cols="offset-7 4 " class="pa-0" align="right">
                    <!-- Dialog close button -->
                    <v-btn @click="close" fab text top right color="secondary" class="close">
                      <v-icon>mdi-close</v-icon>
                    </v-btn>
                  </v-col>
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
              <v-col cols="12" sm="7" class="border-right">
                <v-row>
                  <v-col cols="12" class="pa-0 pb-5">
                    <h1>Edit {{ formData.name }}</h1>
                  </v-col>
                  <!-- Preferred Name -->
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
              </v-col>
            </v-row>
            <v-row>
              <!-- Action buttons -->
              <!-- Delete button -->
              <v-col cols="12" sm="auto">
                <v-btn
                  @click="toggleDelete"
                  align="center"
                  color="white"
                  text
                  class="secondary--text pt-7 pl-5"
                >
                  <v-icon small class="secondary--text" left>mdi-delete</v-icon>Delete this whakapapa record
                </v-btn>
              </v-col>
              <v-spacer />
              <v-col align-sm="right" class="pt-0 pb-o">
                <v-btn @click="close" text large fab class="secondary--text">
                  <v-icon color="secondary">mdi-close</v-icon>
                </v-btn>
                <v-btn :disabled="!form.valid" @click="submit" text large fab class="blue--text" color="blue">
                  <v-icon>mdi-check</v-icon>
                </v-btn>
              </v-col>
              <!-- END Action buttons -->
            </v-row>
          </v-card-text>
        </v-container>
      </v-card>
    </v-form>

    <DeleteViewDialog
      v-if="deleteDialog"
      :show="deleteDialog"
      :warnAboutChildren="warnAboutChildren"
      @close="toggleDelete"
      :view="view"
      @submit="deleteWhakapapa()"
    />
  </Dialog>
</template>

<script>
import Dialog from '@/components/Dialog.vue'
import Avatar from '@/components/Avatar.vue'
import DeleteViewDialog from '@/components/dialog/DeleteViewDialog.vue'
import ImagePicker from '@/components/ImagePicker.vue'

import isEqual from 'lodash.isequal'
import isEmpty from 'lodash.isempty'

import { RULES } from '@/lib/constants.js'

function defaultData (view) {
  return {
    name: view.name,
    description: view.description,
    image: view.image
  }
}

export default {
  name: 'ViewEditNodeDialog',
  components: {
    Dialog,
    Avatar,
    DeleteViewDialog,
    ImagePicker
  },
  props: {
    show: { type: Boolean, required: true },
    deleteable: { type: Boolean, default: false },
    warnAboutChildren: { type: Boolean, default: true },
    view: { type: Object }
  },

  data () {
    return {
      formData: defaultData(this.view),
      deleteDialog: false,
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
    whakapapaChanges () {
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
      this.formData = defaultData(newVal)
    }
  },
  methods: {
    close () {
      this.$emit('close')
    },
    submit () {
      if (!this.$refs.form.validate()) {
        return
      }
      var output = Object.assign({}, this.whakapapaChanges)
      if (!isEmpty(output)) {
        this.$emit('submit', output)
      }

      this.close()
    },
    toggleDelete () {
      this.deleteDialog = !this.deleteDialog
    },
    deleteWhakapapa () {
      this.$emit('delete')
      this.toggleDelete()
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
