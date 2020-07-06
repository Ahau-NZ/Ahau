<template>
     <v-btn pill outlined large color="#b12526" height="50px" :class="mobile ? 'mobileBtn':'btn'">
        <span>join community</span>
    </v-btn>
    <!-- <v-col align="end" class="px-0">
        <v-btn pill outlined large color="#b12526" :width="mobile ? '100%':'25%'" height="50px">
            join community
        </v-btn>
    </v-col> -->
</template>
<script>
export default {
  computed: {
    mobile () {
      return this.$vuetify.breakpoint.xs || this.$vuetify.breakpoint.sm
    },
  },
  methods: {
    toggle () {
      this.$emit('click')
    }
  }
}
</script>
<style lang="scss">

    .btn {
        margin-top:43px;
        margin-left:20px;
        background-color: white;
        border-radius: 10px;
        font-size: 1rem !important;
        max-width: 250px;
        width:17vw;
        border-width: 2px;
    }

    .mobileBtn {
        margin-left:-10px;
        margin-top:10px;
        border-radius: 10px;
        font-size: 1rem !important;
        width:106%;
        border-width: 2px;
    }
</style>
