<template>
  <v-col :cols="mobile ? '6' : '12'" sm="6" md="3">
    <v-row>
      <v-col class=" ma-0 profile-label"><small>{{ title }}</small></v-col>
    </v-row>
    <v-row v-if="value" class="justify-center">
      <p class="ma-0 profile-info">{{ value }}</p>
    </v-row>
    <v-row v-if="subValue" class="justify-center">
      <p class="ma-0 profile-info"><small>{{ subValue }}</small></p>
    </v-row>
  </v-col>
</template>

<script>

export default {
  name: 'ProfileInfoCard',
  props: {
    title: String,
    value: String,
    subValue: String
  },
  computed: {
    mobile () {
      return this.$vuetify.breakpoint.xs || this.$vuetify.breakpoint.sm
    }
  }
}
</script>

<style>
.divider-vertical {
  border-right: 1px solid lightgrey;
}

.divider-horizontal {
  border-bottom: 1px solid lightgrey;
}

.profile-label {
  color: rgba(0,0,0,0.6);
  display: flex;
  justify-content: center;
}
</style>
