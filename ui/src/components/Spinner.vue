<template>
  <v-overlay opacity="0.8" :value="isLoading || isIndexing" :z-index="5">
    <div class="text-center">
      <v-progress-circular
        :value="indexingPercent"
        :indeterminate="indexingPercent === undefined"
        :rotate="-90"
        size="84"
        width="6"
        color="#b12526"
        style="filter: drop-shadow(0 0 6px rgba(0,0,0,0.4));"
      >
        {{ indexingPercent ? indexingPercent + '%' : '' }}
      </v-progress-circular>
      <p class="overline pt-4" style="color:white">
        {{ loadingLabel || 'loading...' }}
      </p>
    </div>
  </v-overlay>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'LoadingSpinner',
  computed: {
    ...mapGetters('loading', ['isLoading', 'isIndexing', 'indexingPercent', 'loadingLabel'])
  }
}
</script>
