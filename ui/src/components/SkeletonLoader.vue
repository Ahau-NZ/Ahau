<template>
  <v-card
    :width="mobile ? '100%' : '87%'"
    flat
    :ripple="false"
    light
    :class="customClass"
  >
    <v-container fluid>
      <v-row>
        <v-col v-for="n in totalSkeletons" :key="`skeleton-${n}`" :cols="cols">
          <v-skeleton-loader
          :width="skeletonWidth"
          :type="skeletonType"
          />
        </v-col>
      </v-row>
    </v-container>
  </v-card>
</template>

<script>

export default {
  name: 'SkeletonLoader',
  props: {
    totalSkeletons: [String, Number],
    skeletonType: String,
    cols: [String, Number],
    customClass: String,
    width: String
  },
  computed: {
    mobile () {
      return this.$vuetify.breakpoint.xs || this.$vuetify.breakpoint.sm
    },
    skeletonWidth () {
      if (this.width) return this.width

      return this.mobile ? '100%' : '87%'
    }
  }
}
</script>
