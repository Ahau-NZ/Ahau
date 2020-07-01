<template>
  <Dialog :title="`Delete community profile`" :show="show" @close="close" width="720px" :goBack="close" enableMenu>
    <template v-slot:content>
      <v-card-subtitle>
        <div class="warning-blurb">
          Are you sure you want to delete this community profile and all its connections, including members, records and artefacts?
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
    show: { type: Boolean, required: true }
  },
  computed: {
    mobile () {
      return this.$vuetify.breakpoint.xs
    },
    height () {
      if (this.mobile) {
        return 'calc(100vh - 50px)'
      } else return 'auto'
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
      this.$emit('submit')
      // this.close()
    }
  },
  components: {
    Dialog
  }
}
</script>
