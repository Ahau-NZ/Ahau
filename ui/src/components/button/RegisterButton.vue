<template>
    <v-btn pill outlined relative large color="#b12526" :class="mobile ? 'mobileBtn' : 'btn'">
        join community
    </v-btn>
    <!-- <v-btn v-on="on"  @click="toggle()" :small="!mobile" :x-small="mobile" :class="mobile ? 'my-2 mr-2': 'my-2'" fab color="white">
        <v-icon :medium ="!mobile" :small="mobile" class="black--text">mdi-account-edit</v-icon>
    </v-btn> -->
    <!-- <h1 style="color:black">register button</h1> -->
</template>
<script>
export default {
  computed: {
    mobile () {
      return this.$vuetify.breakpoint.xs
    }
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
        position: absolute;
        top: 320px;
        background-color: white;
        width: 20%;
        right: 278px;
        border-radius: 10px;
        height: 50px !important;
        font-size: 1rem !important;
    }

    .mobileBtn {
        width: 106%;
        position: relative;
        margin-bottom: 15px;
        border-radius: 10px;
        right: 11px;
        height: 50px !important;
        font-size: 1rem !important;
    }
</style>
