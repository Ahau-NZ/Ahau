<template>
  <div class="text-center ma-2">
    <v-snackbar
      v-model="showMessage"
      content-class="text-center"
    >
      {{ message }}

      <template v-slot:action="{ attrs }">
        <v-btn
          :color="color"
          text
          v-bind="attrs"
          @click="showMessage = false"
        >
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </template>
    </v-snackbar>
  </div>
</template>
<script>
export default {
  name: 'AlertMessage',
  props: {
    show: { type: Boolean, default: false },
    message: { type: String, default: 'Action successfully completed' },
    color: { type: String, default: '' }
  },
  data () {
    return {
      showMessage: false
    }
  },
  watch: {
    show (newVal) {
      this.showMessage = newVal
    }
  }
}
</script>
