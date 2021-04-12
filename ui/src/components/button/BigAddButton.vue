<template>
  <v-btn
    @click="click"
    :class="customClass"
    elevation="4"
    :fab="mobile"
    :rounded="!mobile"
    light
    fixed
    >
    <v-icon :large="mobile" class="white--text">mdi-plus</v-icon>
    <span v-if="!mobile" class="white--text px-3" style="font-size:0.9em">
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
    background-color: rgba(160, 35, 36,1) !important;
  }
  .addBtnDesktop {
    right: 50px !important;
    background-color: #383838 !important ;
  }
  .addBtnCollection {
    right: 250px !important;
    z-index: 1;
    background-color: #2f4f4f !important;
  }
  </style>
