<template>
  <div>
    <v-snackbar v-model='errorSnack'>
      {{ message }}
      <v-icon @click="setShowError(true)" >
        mdi-information-variant
      </v-icon>

      <template v-slot:action="{ attrs }">
        <v-icon
          v-bind="attrs"
          @click="clearError()"
        >
          mdi-close
        </v-icon>
      </template>
    </v-snackbar>

    <v-dialog v-model="errorDialog" max-width="80vw" >
      <v-card>
        <v-card-title>
          <span class="text-h5">{{ message }}</span>
        </v-card-title>

        <v-card-text>
          <pre><code>{{ details }}</code></pre>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="green darken-1"
            text
            @click="clearError()"
          >
            Close
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'

export default {
  computed: {
    ...mapGetters('error', ['message', 'details', 'showErrorSnack', 'showErrorDialog']),
    errorSnack: {
      get () {
        return this.showErrorSnack
      },
      set (bool) {
        if (bool === false) this.clearError()
      }
    },
    errorDialog: {
      get () {
        return this.showErrorDialog
      },
      set (bool) {
        if (bool === false) this.clearError()
      }
    }
  },
  methods: {
    ...mapActions('error', ['setShowError', 'clearError'])
  }
}
</script>

<style scoped lang="scss">

pre {
  --bg-color: #222;

  background: var(--bg-color);
  padding: 10px;

  &> code {
    background: var(--bg-color);
    padding: 0;
  }
}
</style>
