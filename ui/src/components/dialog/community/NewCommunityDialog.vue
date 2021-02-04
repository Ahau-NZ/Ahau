<template>
  <Dialog :show="show" :title="title" width="720px" :goBack="close" enableMenu
    @submit="submit"
    @close="close"
  >
    <template v-if="!hideDetails" v-slot:content>
      <v-col class="py-0">
        <CommunityForm :editing="editing" :formData.sync="formData" />
        <v-col align="center">
          <v-btn v-if="editing" text @click="$emit('delete')">
            Delete this community
            <v-icon class="pl-2">mdi-delete</v-icon>
          </v-btn>
        </v-col>
      </v-col>
    </template>
  </Dialog>
</template>

<script>
import Dialog from '@/components/dialog/Dialog.vue'
import CommunityForm from '@/components/community/CommunityForm.vue'
import { EMPTY_COMMUNITY, setDefaultCommunity } from '@/lib/community-helpers.js'
import { getObjectChanges } from '@/lib/get-object-changes.js'

export default {
  name: 'NewCommunityDialog',
  components: {
    Dialog,
    CommunityForm
  },
  props: {
    show: { type: Boolean, required: true },
    profile: { type: Object, default () { return EMPTY_COMMUNITY } },
    title: { type: String, default: 'Create a new community' },
    hideDetails: { type: Boolean, default: false },
    editing: Boolean
  },
  data () {
    return {
      formData: setDefaultCommunity(this.profile)
    }
  },

  computed: {
    mobile () {
      return this.$vuetify.breakpoint.xs
    }
  },
  methods: {
    submit () {
      var output = {}
      if (this.editing) {
        // get all changes
        output = getObjectChanges(setDefaultCommunity(this.profile), this.formData)
      } else {
        output = getObjectChanges(setDefaultCommunity(EMPTY_COMMUNITY), this.formData)
      }

      console.log('output', output)

      this.$emit('submit', output)
      this.close()
    },
    cordovaBackButton () {
      this.close()
    },
    close () {
      this.formData = setDefaultCommunity(this.profile)
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
