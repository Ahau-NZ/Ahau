<template>
  <div :class="mobile ? 'niho-bg':'wrapper niho-bg'">
    <!-- LeftSideNav -->
    <v-col cols="12" xs="12" sm="12" md="2  " :class="!mobile ? 'pr-0' : 'px-0 py-0'"></v-col>
    <!-- Content -->
    <v-col cols="12" xs="12" sm="12" md="10" :class="mobile ? 'py-0' : 'pl-0 py-0'">
      <!-- <CommunitiesNav /> -->
      <CommunitiesList @add-community-dialog="addCommunityDialog" />
    </v-col>
  </div>
</template>

<script>
// import CommunitiesNav from '@/components/CommunitiesNav'
import CommunitiesList from '@/components/community/CommunitiesList'
import { mapActions } from 'vuex'

export default {
  name: 'Discovery',
  components: {
    // CommunitiesNav,
    CommunitiesList
  },
  computed: {
    mobile () {
      return this.$vuetify.breakpoint.xs || this.$vuetify.breakpoint.sm
    }
  },
  methods: {
    ...mapActions(['setDialog']),
    addCommunityDialog () {
      this.setDialog({ active: 'new-community' })
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
  background: linear-gradient(
      rgba(255, 255, 255, 0.99),
      rgba(255, 255, 255, 0.8)
    ),
    url(../assets/niho.svg);
  background-position-x: -450px;
  background-attachment: fixed;
  background-repeat: no-repeat;
}
</style>
