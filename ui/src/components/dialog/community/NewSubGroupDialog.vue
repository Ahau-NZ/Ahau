<template>
  <Dialog :show="show" :title="title" width="40vw" :goBack="close" enableMenu
    @submit="submit"
    @close="close"
  >
    <template v-slot:content>
      <v-col class="py-0">
        <v-form ref="form" v-model="valid" light>
            <v-row>

              <!-- Upload subgroup photo -->
              <v-col order-sm="2" class="mt-5">
                <v-row>
                  <v-col cols="12" class="pa-0">
                    <!-- Avatar -->
                    <Avatar class="big-avatar" size="200px" :image="formData.avatarImage" :alt="formData.preferredName" isView />
                  </v-col>
                  <!-- Upload subgroup Photo Button -->
                  <v-col cols="12" justify="center" align="center" class="pa-0">
                    <ImagePicker @updateAvatar="formData.avatarImage = $event" :avatarLoaded="formData.avatarImage" type="avatar" isView />
                  </v-col>
                </v-row>
              </v-col>

              <!-- Names -->
              <v-col cols="12" sm="6" class="pt-4">
                <v-row>
                  <v-col cols="12" class="pa-1">
                    <!-- <slot name="search"> -->
                      <v-text-field v-model="formData.preferredName" :rules="nameRules" required :label="$t('addCommunityForm.name')" v-bind="customProps"/>
                    <!-- </slot> -->
                  </v-col>
                </v-row>
                <v-row>
                  <!-- Description textarea -->
                  <v-col cols="12" class="pa-1">
                    <v-textarea v-model="formData.description" :label="$t('addCommunityForm.description')" v-bind="customProps" no-resize rows="4"
                      auto-grow>
                    </v-textarea>
                  </v-col>
                </v-row>
              </v-col>
            </v-row>
        </v-form>
      </v-col>
    </template>
    <template v-slot:before-actions>
      <v-col justify="center">
        <v-btn v-if="editing" text @click="$emit('delete', formData)">
          {{ t('delete') }}
          <v-icon class="pl-2">mdi-delete</v-icon>
        </v-btn>
      </v-col>
    </template>
    <template v-slot:actions>
      <v-col cols="6" md="auto" align="center">
        <v-btn @click="close"
          text
          :large="!mobile"
          class="secondary--text"
        >
          Cancel
        </v-btn>
      </v-col>
      <v-col cols="6" md="auto" align="center">
        <v-btn @click="submit"
          :large="!mobile"
          text
          color="blue"
          :disabled="!valid"
        >
          create
        </v-btn>
      </v-col>
    </template>
  </Dialog>
</template>

<script>
import Dialog from '@/components/dialog/Dialog.vue'
import Avatar from '@/components/Avatar.vue'
import ImagePicker from '@/components/ImagePicker.vue'
import isEmpty from 'lodash.isempty'

import { getObjectChanges } from '@/lib/get-object-changes.js'
import { EMPTY_SUBGROUP, setDefaultSubgroup } from '@/lib/community-helpers.js'

export default {
  name: 'NewSubGroupDialog',
  components: {
    Dialog,
    Avatar,
    ImagePicker
  },
  props: {
    show: { type: Boolean, required: true },
    profile: Object,
    title: String,
    editing: Boolean
  },
  data () {
    return {
      valid: false,
      formData: isEmpty(this.profile) ? setDefaultSubgroup(EMPTY_SUBGROUP) : setDefaultSubgroup(this.profile),
      nameRules: [ v => !!v || 'Name is required' ]
    }
  },
  computed: {
    mobile () {
      return this.$vuetify.breakpoint.xs
    },
    customProps () {
      return {
        placeholder: ' ',
        outlined: true
      }
    }
  },
  methods: {
    submit () {
      var output = {}
      if (this.editing) {
        // get all changes
        output = getObjectChanges(setDefaultSubgroup(this.profile), this.formData)
        this.$emit('edit', output)
      } else {
        // output = getObjectChanges(setDefaultSubgroup(EMPTY_SUBGROUP), this.formData)
        this.$emit('submit', this.formData)
      }
      this.close()
    },
    cordovaBackButton () {
      this.close()
    },
    close () {
      this.formData = setDefaultSubgroup(EMPTY_SUBGROUP)
      this.$emit('close')
    },
    t (key, vars) {
      return this.$t('groups.' + key, vars)
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

.v-text-field input {
  text-align: center !important;
}
</style>
