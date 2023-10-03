<template>
  <DialogContainer :title="`Edit ${ formData.name } Whakapapa`" :show="show"  :goBack="close" :enableBar="false"
    width="720px" height="370px"
    @submit="submit"
    @close="close"
  >
    <template v-slot:content>
      <v-row class="px-2 pa-5 pb-0">
        <v-col cols="12" sm="5" order-sm="2" class="pb-0">
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
        <v-col cols="12" sm="7" class="pb-md-0">
          <v-row>
            <!-- Name -->
            <v-col cols="12" class="pa-1">
              <v-tooltip top open-delay="700">
                <template v-slot:activator="{ on }">
                  <v-text-field
                    v-on="on"
                    v-model="formData.name"
                    label="Name*"
                    placeholder=" "
                    hide-details
                    :rules="form.rules.name.whakapapaView"
                 />
               </template>
                <span>Name of Whakapapa</span>
              </v-tooltip>
            </v-col>
            <!-- Description textarea -->
            <v-col cols="12" class="pa-1">
               <v-tooltip top open-delay="700">
                <template v-slot:activator="{ on }">
                  <v-textarea
                    v-on="on"
                    v-model="formData.description"
                    label="Description"
                    placeholder=" "
                    hide-details
                    no-resize
                    rows="1"
                    auto-grow
                  ></v-textarea>
                </template>
                <span>A short description of the whakapapa record</span>
               </v-tooltip>
            </v-col>
          </v-row>
          <v-row>
            <v-col>
              <AvatarGroup :profiles="view.tiaki" groupTitle="Kaitiaki" size="50px" showLabels/>
            </v-col>
          <!-- </v-row>
          <v-row> -->
            <v-col cols="12" class="pb-md-0 pl-md-0">
              <v-btn text @click="$emit('delete')" class="pl-md-0">
                <v-icon class="pl-2">mdi-delete</v-icon>
                Delete whakapapa record
              </v-btn>
            </v-col>
          </v-row>
        </v-col>
      </v-row>
    </template>
    <template v-if="accessOptions && accessOptions.length" v-slot:before-actions>
      <AccessButton type="whakapapa" editing :accessOptions="accessOptions" :permission.sync="formData.permission"/>
    </template>
  </DialogContainer>
</template>

<script>
import { mapGetters } from 'vuex'
import { isEqual, isEmpty } from 'lodash-es'

import DialogContainer from '@/components/dialog/DialogContainer.vue'
import Avatar from '@/components/Avatar.vue'
import AvatarGroup from '@/components/AvatarGroup.vue'
import ImagePicker from '@/components/ImagePicker.vue'
import AccessButton from '@/components/button/AccessButton.vue'

import { RULES } from '@/lib/constants'

function setDefaultData (view) {
  return {
    name: view.name,
    description: view.description,
    image: view.image,
    recps: view.recps,
    permission: view.permission
  }
}

export default {
  name: 'WhakapapaEditDialog',
  components: {
    DialogContainer,
    Avatar,
    AvatarGroup,
    ImagePicker,
    AccessButton
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
    ...mapGetters(['whoami']),
    ...mapGetters('tribe', ['tribes', 'accessOptions']),
    mobile () {
      return this.$vuetify.breakpoint.xs
    },
    submission () {
      const changes = {}
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
      const output = Object.assign({}, this.submission)
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
