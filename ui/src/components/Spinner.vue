<template>
  <v-overlay opacity="0.8" :value="loadingState" :z-index="1">
    <div class="text-center">
      <v-progress-circular
        :value="value"
        :indeterminate="isBoolean"
        :rotate="-90"
        size="84"
        width="6"
        color="#b12526"
        style="filter: drop-shadow(0 0 6px rgba(0,0,0,0.4));"
        >
        {{ number }}
      </v-progress-circular>
      <p class="overline pt-4" style="color:white">{{label}}</p>
    </div>
  </v-overlay>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'LoadingSpinner',
  computed: {
    ...mapGetters(['loadingState', 'loadingLabel']),
    isBoolean () {
      return typeof this.loadingState === 'boolean'
    },
    number () {
      if (this.isBoolean) return ''
      return this.loadingState + '%'
    },
    value () {
      if (this.isBoolean) return null
      return this.loadingState
    },
    label () {
      return this.loadingLabel || 'loading...'
    }
  }
}
</script>
