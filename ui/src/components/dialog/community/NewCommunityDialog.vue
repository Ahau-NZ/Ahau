<template>
  <Dialog :show="show" :title="title" @close="close" width="720px" :goBack="close" enableMenu>

    <!-- Content Slot -->
    <template v-if="!hideDetails" v-slot:content>
      <v-col class="py-0">
        <CommunityForm :profile.sync="formData"></CommunityForm>
      </v-col>
    </template>
    <!-- End Content Slot -->

    <!-- Actions Slot -->
    <template v-slot:actions  style="border: 2px solid orange;">
      <v-btn @click="close"
        text large fab
        class="secondary--text"
      >
        <v-icon color="secondary">mdi-close</v-icon>
      </v-btn>
      <v-btn @click="submit"
        text large fab
        class="blue--text ml-5"
      >
        <v-icon>mdi-check</v-icon>
      </v-btn>
    </template>
    <!-- End Actions Slot -->

  </Dialog>
</template>

<script>
import Dialog from '@/components/dialog/Dialog.vue'
import CommunityForm from '@/components/community/CommunityForm.vue'
import { PERMITTED_COMMUNITY_ATTRS } from '@/lib/community-helpers.js'

import pick from 'lodash.pick'
import isEmpty from 'lodash.isempty'

function defaultData () {
  const formData = {
    type: 'community',
    id: '',
    preferredName: '',
    avatarImage: {},
    description: '',
    location: '',
    address: '',
    email: '',
    phone: ''
  }
  return formData
}

export default {
  name: 'NewCommunityDialog',
  components: {
    Dialog,
    CommunityForm
  },
  props: {
    show: { type: Boolean, required: true },
    title: { type: String, default: 'Create a new community' },
    hideDetails: { type: Boolean, default: false },
    selectedProfile: { type: Object }

  },
  data () {
    return {
      formData: defaultData()
    }
  },

  computed: {
    mobile () {
      return this.$vuetify.breakpoint.xs
    },

    submission () {
      const form = pick(this.formData, PERMITTED_COMMUNITY_ATTRS)
      let submission = {}
      Object.entries(form).map(([key, value]) => {
        if (!isEmpty(value)) {
          submission[key] = value
        }
      })
      return submission
    }
  },
  methods: {
    submit () {
      var submission = Object.assign({}, this.submission)
      this.$emit('create', submission)
      this.close()
    },
    cordovaBackButton () {
      this.close()
    },
    close () {
      this.formData = defaultData()
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
