<template>
  <div class="text-center ma-2">
    <v-snackbar
      v-model="showMessage"
    >
      {{ message }}

      <template v-slot:action="{ attrs }">
        <v-btn
          color="pink"
          text
          v-bind="attrs"
          @click="show = false"
        >
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </template>
    </v-snackbar>
  </div>
</template>
<script>
export default {
  props: {
    show: { type: Boolean, default: false },
    message: { stype: String, default: 'Action successfully completed' }
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
