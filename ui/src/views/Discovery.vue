<template>
  <v-container fluid :class="`niho-bg ${mobile ? 'pt-0' : 'container'}`">
    <!-- body of the page -->
    <v-row class="pa-0">
      <!-- top of page -->
      <!-- left hand side of page -->
      <v-col v-if="!mobile" cols="12" md="2">
      </v-col>

      <!-- main/middle body of page -->
      <v-col cols="12" md="8" >
        <CommunitiesList :class="mobile ? 'mt-4':'mt-4 mr-12'" style="max-width:calc(5 * 214px);" >
          <div class="mr-3" style="display: flex; justify-content: right;">
            <BigAddButton
              :label="t('newTribeButton')"
              :customClass="mobile ? 'addBtnMobile' : 'addBtnDesktop'"
              :class="mobile ? 'mt-2' : ''"
              style="right:unset !important;"
              @click="addCommunityDialog"
            />
          </div>
        </CommunitiesList >

      </v-col>

      <!-- right hand side of page -->
      <v-col cols="12" md="2" :class="mobile ? 'px-6' : 'py-0 pr-8 pl-4 mt-7'">
        <PatakaList :style="customStyle"/>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
// import CommunitiesNav from '@/components/CommunitiesNav'
import CommunitiesList from '@/components/community/CommunitiesList.vue'
import PatakaList from '@/components/community/PatakaList.vue'

import BigAddButton from '@/components/button/BigAddButton.vue'

import { mapActions } from 'vuex'

export default {
  name: 'CommunityDiscovery',
  components: {
    // CommunitiesNav,
    CommunitiesList,
    PatakaList,
    BigAddButton
  },
  beforeMount () {
    window.scrollTo(0, 0)
  },
  computed: {
    mobile () {
      return this.$vuetify.breakpoint.xs || this.$vuetify.breakpoint.sm
    },
    customStyle () {
      if (this.isMobile) return {}
      return {
        marginTop: '78px'
      }
    }
  },
  methods: {
    ...mapActions(['setDialog']),
    addCommunityDialog () {
      this.setDialog({ active: 'new-community' })
    },
    t (key, vars) {
      return this.$t('viewTribes.' + key, vars)
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

.container {
  padding-top: 64px;
}

.niho-bg {
  background: linear-gradient(
      rgba(255, 255, 255, 0.99),
      rgba(255, 255, 255, 0.8)
    ),
    url(@/assets/niho.svg);
  background-position-x: -450px;
  background-attachment: fixed;
  background-repeat: no-repeat;
}
</style>
