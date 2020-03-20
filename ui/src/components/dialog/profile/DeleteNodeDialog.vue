<template>
  <Dialog :show="show" @close="close" width="600px" height="calc(100vh - 50px)" :goBack="close" enableMenu>
    <template v-slot:title>
      <v-card-title>
        <span class="headline">Delete {{ profile.preferredName }}</span>
      </v-card-title>
    </template>
    <template v-slot:content>
      <v-card-subtitle>
        <div>
          Are you sure you want to delete {{ profile.preferredName }}?
        </div>
        <div v-if="warnAboutChildren">
          This will also remove all connected children from the whakapapa
          record.
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
  computed: {
    mobile () {
      return this.$vuetify.breakpoint.xs
    }
  },
  methods: {
    close () {
      this.$emit('close')
    },
    submit () {
      this.$emit('submit')
      this.close()
    }
  },
  components: {
    Dialog
  }
}
</script>
