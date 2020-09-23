<template>
  <Dialog :show="show" :title="title" width="55vw" :goBack="close" enableMenu
    @submit="submit"
    @close="close"
  >
    <!-- FORM -->
    <template v-slot:content>
      <RecordForm ref="recordForm" :editing="editing" :formData.sync="formData" :access="access"/>
      <v-col align="center">
        <v-btn v-if="editing" text @click="$emit('delete')">
          Delete this record
          <v-icon class="pl-2">mdi-delete</v-icon>
        </v-btn>
      </v-col>
    </template>

    <template v-if="access" v-slot:before-actions>
      <AccessButton :access.sync="access" :disabled="editing" />
    </template>
  </Dialog>
</template>

<script>

import Dialog from '@/components/dialog/Dialog.vue'
import RecordForm from '@/components/archive/RecordForm.vue'
import AccessButton from '@/components/button/AccessButton.vue'

import { mapGetters, mapActions } from 'vuex'

import {
  GET_CHANGES,
  EMPTY_STORY,
  setDefaultStory
} from '@/lib/story-helpers.js'

export default {
  name: 'NewRecordDialog',
  components: {
    Dialog,
    RecordForm,
    AccessButton
  },
  props: {
    show: { type: Boolean, required: true },
    story: { type: Object, default () { return EMPTY_STORY } },
    title: String,
    editing: { type: Boolean, default: false }
  },
  data () {
    return {
      formData: setDefaultStory(this.story),
      access: null,
      initial: false
    }
  },
  computed: {
    ...mapGetters(['whoami', 'currentProfile', 'defaultAccess', 'getAccessFromRecps']),
    mobile () {
      return this.$vuetify.breakpoint.xs
    }
  },
  async mounted () {
    this.initial = true
    if (!this.editing) {
      this.access = await this.defaultAccess
    } else {
      this.access = this.getAccessFromRecps(this.story.recps)
    }
  },
  watch: {
    access (newAccess) {
      if (!newAccess || this.editing) return
      // make sure it doesnt clear the current profile on initial loading
      if (!this.initial) this.formData.mentions = []
      else {
        this.formData.mentions = [this.currentProfile]
        this.initial = false
      }
      // when the access changes, we need to reset all prefilled values to ensure we
      // dont allow publishing of records that arent in the current group
      this.formData.contributors = [this.whoami.public.profile]
      this.formData.kaitiaki = [this.whoami.public.profile]
      this.formData.creators = []
      this.formData.relatedRecords = []
    }
  },
  methods: {
    ...mapActions(['setDialog']),
    close () {
      this.formData = setDefaultStory(this.story)
      this.$emit('close')
    },
    submit () {
      var output = {}
      if (this.editing) {
        // get all changes
        output = {
          id: this.story.id,
          ...GET_CHANGES(setDefaultStory(this.story), this.formData)
        }
      } else {
        output = {
          ...GET_CHANGES(setDefaultStory(EMPTY_STORY), this.formData),
          recps: [this.access.groupId]
        }
      }

      this.$emit('submit', output)
      this.close()
    }
  }
}
</script>

<style scoped lang="scss">
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
