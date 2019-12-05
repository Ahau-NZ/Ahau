<template>
  <Dialog :show="show" @close="close" :width="`550px`">
    <v-card>
      <v-card-title>
        <span class="headline">
          Delete {{ profile }}
        </span>
      </v-card-title>
      <v-spacer />
      <v-card-subtitle>
        Are you sure you want to delete {{ profile }} and all connected children from the whakapapa record.
        It cannot be undone once deleted?
      </v-card-subtitle>
      <v-row class="actions">
        <v-col cols="12" sm="5" md="8"/>
        <v-col>
          <v-btn @click="close" fab text color="secondary" class="mr-4">
            <v-icon>mdi-close</v-icon>
          </v-btn>
          <v-btn @click="submit"
            fab text color="blue" class="mr-4">
            <v-icon>mdi-check</v-icon>
          </v-btn>
        </v-col>
      </v-row>
    </v-card>
  </Dialog>
</template>

<script>
import Dialog from '@/components/Dialog.vue'

export default {
  components: {
    Dialog
  },
  props: {
    show: {
      type: Boolean,
      required: true
    },
    profile: {
      type: String,
      required: true
    }
  },
  data () {
    return {
      message: ''
    }
  },
  computed: {
    deleteMessage () {
      return `Are you sure you want to delete Ben and all connected children from the whakapapa record.\n
      it cannot be undone once delete?`
    }
  },
  methods: {
    close () {
      console.log('close delete dialog')
      this.$emit('close')
    },
    submit () {
      this.$emit('submit')
      this.close()
    }
  }
}
</script>

<style scoped>
.btn {
  align-content: right;
}
</style>
