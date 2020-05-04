<template>
  <Dialog :title="`Delete ${ view.name }`" :show="show" @close="close" width="600px" height="calc(100vh - 50px)" :goBack="close" enableMenu>
    <template v-slot:content>
      <v-card-subtitle>
        <div>
          Are you sure you want to delete this whakapapa record?
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
  name: 'WhakapapaDeleteDialog',
  props: {
    show: { type: Boolean, required: true },
    view: { type: Object, required: true }
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
