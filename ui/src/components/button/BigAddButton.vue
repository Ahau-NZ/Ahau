<template>
  <v-btn
    @click="click"
    :class="!mobile ? '' : 'addBtnMobile'"
    :color="!mobile ? 'white' : 'rgba(160, 35, 36,1)'"
    elevation="4"
    fab
    light
    fixed
    :bottom="mobile"
    :right="mobile"
    >
  <v-icon :large="!mobile" :class="!mobile ? 'black--text' : 'white--text'">mdi-plus</v-icon>
  </v-btn>
</template>

<script>
export default {
  name: 'BigAddButton',
  methods: {
    click () {
      this.$emit('click')
    }
  },
  computed: {
    mobile () {
      return this.$vuetify.breakpoint.xs
    }
  }
}
</script>
  <style scoped lang="scss">
  .addBtnMobile {
    bottom: 16px !important;
  }
  </style>
