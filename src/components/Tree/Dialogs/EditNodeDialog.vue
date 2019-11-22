<template>
  <Dialog :show="show" @close="close">
    <v-card>
      <v-card-title>
        <span class="headline">
          Edit Person
        </span>
      </v-card-title>
    </v-card>
  </Dialog>
</template>

<script>
import Dialog from './Dialog.vue'

export default {
  components: {
    Dialog
  },
  props: {
    show: {
      type: Boolean,
      required: true
    }
  },
  data () {
    return {

    }
  },
  methods: {
    close () {
      this.$emit('close')
    },
    save () {
      // do stuff here

      this.close()
    }
  }
}
</script>
