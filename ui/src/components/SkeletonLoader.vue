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
          :width="mobile ? '100%' : '87%'"
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
  components: {
  },
  props: {
    totalSkeletons: Number,
    skeletonType: String,
    cols: String,
    customClass: String
  },
  computed: {
    mobile () {
      return this.$vuetify.breakpoint.xs || this.$vuetify.breakpoint.sm
    }
  }
}
</script>
