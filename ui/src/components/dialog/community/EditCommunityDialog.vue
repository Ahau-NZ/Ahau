<template>
  <Dialog :show="show" :title="title" @close="close" width="720px" :goBack="close" enableMenu>

    <!-- Content Slot -->
    <template v-if="!hideDetails" v-slot:content>
      <v-col class="py-0">
        <CommunityForm :profile.sync="formData" />
      </v-col>
    </template>
    <!-- End Content Slot -->

    <template v-slot:before-actions>
      <v-col cols="12" sm="auto" class="mt-4">
        <v-btn text @click="$emit('delete')">
          Delete community
          <v-icon class="pl-2">mdi-delete</v-icon>
        </v-btn>
      </v-col>
    </template>

    <!-- Actions Slot -->
    <template v-slot:actions >
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
import { PERMITTED_COMMUNITY_ATTRS } from '@/lib/community-helpers.js'
import Dialog from '@/components/dialog/Dialog.vue'
import CommunityForm from '@/components/community/CommunityForm.vue'
import isEmpty from 'lodash.isempty'
import pick from 'lodash.pick'
import isEqual from 'lodash.isequal'
// import clone from 'lodash.clonedeep'

function defaultData (profile) {
  return {
    id: profile.id,

    preferredName: profile.preferredName,
    // legalName: profile.legalName,
    // altNames: {
    //   currentState: clone(profile.altNames),
    //   add: [], // new altNames to add
    //   remove: [] // altNames to remove
    // },

    description: profile.description,
    avatarImage: profile.avatarImage,
    headerImage: profile.headerImage,

    email: profile.email,
    phone: profile.phone,
    address: profile.address,
    location: profile.location,

    tombstone: profile.tombstone
  }
}

export default {
  name: 'EditCommunityDialog',
  components: {
    Dialog,
    CommunityForm
  },
  props: {
    show: { type: Boolean, required: true },
    title: { type: String, default: 'Create a new person' },
    hideDetails: { type: Boolean, default: false },
    selectedProfile: { type: Object }
  },
  data () {
    return {
      formData: defaultData(this.selectedProfile)
    }
  },

  computed: {
    profileChanges () {
      var form = Object.assign({}, pick(this.formData, [...PERMITTED_COMMUNITY_ATTRS]))
      let changes = {}
      Object.entries(form).forEach(([key, value]) => {
        if (!isEqual(value, this.selectedProfile[key])) {
          changes[key] = value
        }
      })
      return changes
    },
    hasChanges () {
      return isEqual(this.data, this.selectedProfile)
    }
  },
  watch: {
    profile (newVal) {
      this.formData = defaultData(newVal)
    }
  },
  methods: {
    updateAvatar (avatarImage) {
      this.formData.avatarImage = avatarImage
      // this.toggleAvatar(null)
    },
    close () {
      this.$emit('close')
    },

    submit () {
      if (!isEmpty(this.profileChanges)) {
        this.$emit('submit', this.profileChanges)
      }
    },
    toggleDescription () {
      this.showDescription = !this.showDescription
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
