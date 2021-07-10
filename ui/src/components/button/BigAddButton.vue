<template>
  <v-btn
    @click="click"
    :class="customClass"
    elevation="1"
    :fab="mobile"
    :rounded="!mobile"
    light
    fixed
    outlined
    >
    <v-icon :large="mobile" class="">mdi-plus</v-icon>
    <span v-if="!mobile" class="px-3" style="font-size:0.9em">
    {{label}}
    </span>
  </v-btn>
</template>

<script>
export default {
  name: 'BigAddButton',
  props: {
    label: String,
    color: String,
    customClass: String
  },
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
    right:20px !important;
    color: white;
    background-color: rgba(160, 35, 36,1) !important;
  }
  .addBtnDesktop {
    right: 50px !important;
    background-color: white
  }
  .addBtnCollection {
    right: 250px !important;
    z-index: 1;
    color: #006b57;
    background-color: white
  }
  </style>
