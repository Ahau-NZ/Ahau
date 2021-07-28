<template>
  <div>
    <v-row class="pa-0">
      <v-col cols="12" class="headliner black--text pa-0 pl-4">
        Tribes
      </v-col>
    </v-row>
    <v-row v-if="!tribes">
      <SkeletonLoader
        :cols="mobile ? 12 : 3"
        :totalSkeletons=1
        skeletonType="heading"
        customClass="py-0"
      />
      <SkeletonLoader
        :cols="mobile ? 12 : 2"
        :totalSkeletons=12
        skeletonType="image, card-heading"
      />
      <SkeletonLoader
        cols="12"
        :totalSkeletons=1
        skeletonType="divider"
      />
      <SkeletonLoader
        :cols="mobile ? 12 : 3"
        :totalSkeletons=1
        skeletonType="heading"
        customClass="py-0"
      />
      <SkeletonLoader
        :cols="mobile ? 12 : 2"
        :totalSkeletons=12
        skeletonType="image, card-heading"
      />
    </v-row>
    <v-row v-else>
      <v-col v-if="connectedTribes.length" cols="12" class="py-0">
        <CommunityList :title="t('connectedTribes')" :tribes="connectedTribes"/>
      </v-col>
      <v-col v-if="otherTribes.length" cols="12" class="py-0">
        <v-divider light color="grey" class="my-10"></v-divider>
        <CommunityList :title="t('otherTribes')" :tribes="otherTribes"/>
      </v-col>
    </v-row>
  </div>
</template>

<script>

import CommunityList from '@/components/community/CommunityList.vue'
import { getTribes } from '@/lib/community-helpers.js'
import SkeletonLoader from '@/components/SkeletonLoader.vue'

export default {
  name: 'CommunitiesList',
  data () {
    return {
      confirmationText: null,
      tribes: null,
      dialog: false
    }
  },
  components: {
    CommunityList,
    SkeletonLoader
  },
  apollo: {
    tribes: {
      ...getTribes,
      pollInterval: 10e3
    }
  },
  computed: {
    mobile () {
      return this.$vuetify.breakpoint.xs
    },
    connectedTribes () {
      return this.tribes.filter(tribe => tribe.private.length > 0)
    },
    otherTribes () {
      return this.tribes.filter(tribe => tribe.private.length < 1 && tribe.public.length > 0)
    }
  },
  methods: {
    t (key, vars) {
      return this.$t('viewTribes.' + key, vars)
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
.col {
  flex-grow: 0;
}
.headliner {
  font-size: 1em;
  text-transform: uppercase;
  font-weight: 400;
  letter-spacing: 5px;
  color: black;
}
</style>
