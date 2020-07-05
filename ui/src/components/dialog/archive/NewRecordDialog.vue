<template>
  <Dialog :show="show" :title="title" @close="close" width="70%" :goBack="close" enableMenu>

      <!-- FORM -->
      <template v-slot:content>
        <RecordForm ref="recordForm" :editing="editing" :formData.sync="formData"/>
      </template>

      <template v-if="editing" v-slot:before-actions>
        <v-col cols="12" sm="auto" class="mt-4">
          <v-btn text @click="$emit('delete')">
            Delete this record
            <v-icon class="pl-2">mdi-delete</v-icon>
          </v-btn>
        </v-col>
      </template>

      <template v-slot:actions>
        <v-btn @click="close"
          text large fab
          class="secondary--text"
          :class="mobile ? 'mr-4':''"
        >
          <v-icon>mdi-close</v-icon>
        </v-btn>
        <v-btn @click="submit"
            text large fab
            class="blue--text"
          >
            <v-icon>mdi-check</v-icon>
          </v-btn>
      </template>
    </Dialog>
</template>

<script>

import Dialog from '@/components/dialog/Dialog.vue'
import RecordForm from '@/components/archive/RecordForm.vue'

import { mapGetters, mapActions } from 'vuex'

import {
  GET_CHANGES,
  EMPTY_STORY,
  SET_DEFAULT_STORY
} from '@/lib/story-helpers.js'

export default {
  name: 'NewRecordDialog',
  components: {
    Dialog,
    RecordForm
  },
  props: {
    show: { type: Boolean, required: true },
    story: { type: Object, default () { return EMPTY_STORY } },
    title: String,
    editing: { type: Boolean, default: false }
  },
  data () {
    return {
      formData: SET_DEFAULT_STORY(this.story)
    }
  },
  computed: {
    ...mapGetters(['whoami', 'currentProfile']),
    mobile () {
      return this.$vuetify.breakpoint.xs
    }
  },
  mounted () {
    if (!this.editing) {
      this.formData.mentions.push(this.currentProfile)
      this.formData.contributors.push(this.whoami.profile)
      this.formData.access.push(this.whoami.profile)
    }
  },
  methods: {
    ...mapActions(['setDialog']),
    close () {
      this.formData = SET_DEFAULT_STORY(this.story)
      this.$emit('close')
    },
    submit () {
      var output = {}
      if (this.editing) {
        // get all changes
        output = { id: this.story.id, ...GET_CHANGES(SET_DEFAULT_STORY(this.story), this.formData) }
      } else {
        output = { ...GET_CHANGES(SET_DEFAULT_STORY(EMPTY_STORY), this.formData) }
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
