<template>
  <Dialog :show="show" @close="close" width="600px" height="calc(100vh - 50px)" :goBack="close" enableMenu>
    <template v-slot:title>
      <v-card-title>
        <span class="headline">Delete {{ profile.preferredName }}</span>
      </v-card-title>
    </template>
    <template v-slot:content>
      <v-card-subtitle>
        <v-col cols="12" sm="5" md="8">
          <v-radio-group v-model="removeProfile" column>
            <v-radio label="Hide this profile from this whakapapa record" value="ignore"></v-radio>
            <v-radio label="Delete this profile from all whakapapa records" value="delete"></v-radio>
          </v-radio-group>
        </v-col>
        <div v-show="removeProfile == 'delete' " class="warning-blurb">
          Are you sure you want to delete this profile from all whakapapa records.
          <span v-if="warnAboutChildren">
            This will also remove all connected children from the whakapapa
            record.
        </span>
        </div>
        <div v-show="removeProfile == 'ignore' " class="warning-blurb">
          Are you sure you want to hide this profile from this whakapapa record.
          <span v-if="warnAboutChildren">
            This will also remove all connected children from the whakapapa
            record.
        </span>
        </div>
      
      </v-card-subtitle>
    </template>
    <template v-slot:actions>
      <v-btn @click="close"
        text large fab
        class="secondary--text"
      >
        <v-icon color="secondary">mdi-close</v-icon>
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

export default {
  props: {
    show: { type: Boolean, required: true },
    profile: { type: Object, required: true },
    warnAboutChildren: { type: Boolean, default: true }
  },
  data () {
    return {
      removeProfile: 'ignore'
    }
  },
  computed: {
    mobile () {
      return this.$vuetify.breakpoint.xs
    },
    height () {
      if (this.mobile) {
        return 'calc(100vh - 50px)'
      } else return 'auto'
    },
    warningVisibility () {
      if (!this.warnAboutChildren) return { visibility: 'hidden' }
      if (this.removeProfile === 'ignore') return { visibility: 'hidden' }

      return { }
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
      this.$emit('submit', this.removeProfile)
      this.close()
    }
  },
  components: {
    Dialog
  }
}
</script>
