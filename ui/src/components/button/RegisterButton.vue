<template>
    <v-btn v-if="tablet" pill outlined large color="#b12526" height="50px" class="tabletBtn" @click="setDialog('new-registration')">
      <span>join community </span>
    </v-btn>
     <v-btn v-else pill outlined large color="#b12526" height="50px" :class="mobile ? 'mobileBtn':'btn'" @click="setDialog('new-registration')">
        <span>join community</span>
    </v-btn>
</template>
<script>
import {mapActions} from 'vuex'

export default {
  computed: {
    mobile () {
      return this.$vuetify.breakpoint.xs || this.$vuetify.breakpoint.sm
    },
    tablet () {
      return this.$vuetify.breakpoint.md
    },
  },
  methods: {
  ...mapActions(['setDialog']) 
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
        border-width: 1px;
    }
    
    .tabletBtn {
        margin-top:53px;
        margin-left:10px;
        background-color: white;
        border-radius: 10px;
        font-size: 0.8rem !important;
        max-width: 250px;
        width:14vw;
        border-width: 1px;
    }

    .mobileBtn {
        margin-top:10px;
        border-radius: 10px;
        font-size: 1rem !important;
        width:100%;
        border-width: 1px;
        background-color: white;
    }
</style>
