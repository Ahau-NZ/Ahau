<template>
  <div>
    <v-card
      :width="mobile ? '100%' : '87%'"
      flat
      :ripple="false"
      light
      v-for="n in totalSkeletons"
      :key="`skeleton-${n}`"
      :class="mobile ? 'py-12' : 'pl-12 py-12'"
    >
      <v-skeleton-loader
        :width="mobile ? '100%' : '87%'"
        :type="skeletonType"
      >
      </v-skeleton-loader>
    </v-card>
  </div>
</template>

<script>

export default {
  name: 'SkeletonLoader',
  components: {
  },
  props: {
    totalSkeletons: Number,
    skeletonType: String
  },
  computed: {
    mobile () {
      return this.$vuetify.breakpoint.xs || this.$vuetify.breakpoint.sm
    }
  }
}
</script>
