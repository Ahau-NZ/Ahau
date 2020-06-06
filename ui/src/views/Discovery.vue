<template>
  <div class="wrapper niho-bg">
    <!-- <CommunitiesNav /> -->
    <!-- <CommunitiesPeople /> -->

    <!-- LeftSideNav -->
    <v-col cols="12" xs="12" sm="12" md="2" :class="!mobile ? 'pr-0' : 'px-5 py-0'">

    </v-col>
    <!-- Content -->
    <v-col cols="12" xs="12" sm="12" md="8" :class="mobile ? 'px-6 py-0' : 'pl-0 py-0'">
      <transition name="fade" mode="out-in">
        <CommunitiesList />
      </transition>
    </v-col>
    <!-- RightSideNav -->
    <v-col cols="12" xs="12" sm="12" md="2" :class="!mobile ? 'pa-5' : 'px-5 py-0'">
        <v-btn fab color="white" @click="addCommunityDialog()">
          <v-icon class="black--text">mdi-plus</v-icon>
        </v-btn>
        <span class="black--text pl-4 subtitle">Create community</span>
        <!-- <v-icon left>mdi-plus</v-icon> Create community -->
    </v-col>

  </div>
</template>

<script>
  // import CommunitiesNav from '@/components/CommunitiesNav'
  import CommunitiesPeople from '@/components/CommunitiesPeople'
  import CommunitiesList from '@/components/CommunitiesList'
  import DialogHandler from '@/components/dialog/DialogHandler.vue'

  import { mapActions } from 'vuex'

  export default {
    name: 'Discovery',
    components: {
      // CommunitiesNav,
      CommunitiesPeople,
      CommunitiesList
    },
    computed: {
      mobile() {
        return this.$vuetify.breakpoint.xs || this.$vuetify.breakpoint.sm
      },
    },
    methods: {
      ...mapActions(['setDialog']),
      addCommunityDialog() {
        console.log("setting dialog to new-communtiy")
        this.setDialog({ active:'new-community'})
      }
    }
  }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
  .wrapper {
    background-color: white;
    width: 100%;
    height: 100%;
    display: flex;
    padding-top: 64px;
  }

  .niho-bg {
    background: linear-gradient(rgba(255, 255, 255, 0.99),
        rgba(255, 255, 255, 0.7)), url(../assets/niho.svg);
    background-position-x: -450px;
    background-attachment: fixed;
    background-repeat: no-repeat;
  }
</style>