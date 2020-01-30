<template>
  <Dialog :show="show" @close="close" :width="`600px`">
    <v-card>
      <v-container light>
        <v-card-title>
          <span class="headline">
            Delete {{ profile.preferredName }}
          </span>
        </v-card-title>
        <v-spacer />
        <v-card-subtitle>
          <div>Are you sure you want to delete {{ profile.preferredName }}?</div>
          <div v-if="warnAboutChildren">
             This will also remove all connected children from the whakapapa record.
          </div>
        </v-card-subtitle>
        <v-row class="actions">
          <v-col cols="12" sm="5" md="8"/>
          <v-col>
            <v-btn @click="close" fab text color="secondary" class="mr-4">
              <v-icon>mdi-close</v-icon>
            </v-btn>
            <v-btn @click="submit" fab text color="blue" class="mr-4">
              <v-icon>mdi-check</v-icon>
            </v-btn>
          </v-col>
        </v-row>
      </v-container>
    </v-card>
  </Dialog>
</template>

<script>
import Dialog from '@/components/Dialog.vue'

export default {
  props: {
    show: { type: Boolean, required: true },
    profile: { type: Object, required: true },
    warnAboutChildren: { type: Boolean, default: true }
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
