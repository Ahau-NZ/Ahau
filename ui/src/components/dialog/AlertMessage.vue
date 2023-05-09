<template>
  <div class="text-center">
    <v-snackbar
      v-model="showMessage"
      :timeout="alertSettings.delay"
      content-class="text-center"
      class="ma-2"
    >
      {{ alertSettings.message }}

      <template v-slot:action="{ attrs }">
        <v-btn
          v-bind="attrs"
          :color="alertSettings.color"
          text
          :loading="alertSettings.delay === -1"
          @click="showMessage = false"
        >
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </template>
    </v-snackbar>
  </div>
</template>
<script>

import { mapGetters } from 'vuex'

export default {
  name: 'AlertMessage',
  data () {
    return {
      showMessage: false
    }
  },
  watch: {
    alertSettings: {
      deep: true,
      handler (settings) {
        this.showMessage = settings.show
      }
    }
  },
  computed: {
    ...mapGetters('alerts', ['alertSettings'])
  }
}
</script>
