<template>
  <div>
    <v-card v-if="ignoredProfiles.length" outlined class="mx-3 pa-3">
      <span  class="row wrap justify-center">
        {{  t('hideProfileText', { whakapapaName }) }}
      </span>
      <v-divider class="my-3"/>
      <!-- NOTE: for now this can only be one profile -->
      <v-row v-for="profile in ignoredProfiles" :key="profile.id">
        <ProfileChip
          :profile="profile"
          readonly
          hide-details
          readonly-relationship
        />
      </v-row>
    </v-card>
    <!--
      TODO cherese 2023-10-06 this can be uncommented if we decide to support ignoring profiles
      here, so far those are handled differently
    -->
    <!-- <v-card v-else-if="unIgnoredProfiles.length" outlined class="mx-3 pa-3">
      <span  class="row wrap justify-center">
        Hide these profiles from the {{ displayName }} (whakapapa)
      </span>
      <v-divider class="my-3"/>
      <v-row v-for="profile in unIgnoredProfiles" :key="profile.id">
        <ProfileChip
          :profile="profile"
          readonly
          hide-details
          readonly-relationship
        />
      </v-row>
    </v-card> -->
    <v-card v-else outlined class="mx-3 pa-3">
      <span  class="row wrap justify-center">
        {{ t('unsupported') }}
      </span>
    </v-card>
  </div>
</template>

<script>
import { mapActions } from 'vuex'
import ProfileChip from '@/components/profile/ProfileChip.vue'

export default {
  name: 'WhakapapaViewSubmission',
  components: {
    ProfileChip
  },
  props: {
    submission: Object
  },
  data () {
    return {
      ignoredProfiles: [],
      // unIgnoredProfiles: []
    }
  },
  watch: {
    ignoredIds: {
      deep: true,
      immediate: true,
      async handler (ids) {
        this.ignoredProfiles = await Promise.all(
          ids.map(profileId => this.getPersonMinimal(profileId))
        )
      }
    },
    // unIgnoredIds: {
    //   deep: true,
    //   immediate: true,
    //   async handler (ids) {
    //     this.unIgnoredProfiles = await Promise.all(
    //       ids.map(profileId => this.getPersonMinimal(profileId))
    //     )
    //   }
    // }
  },
  computed: {
    ignoredIds () {
      return this.ignoredProfilesChanges?.add || []
    },
    // unIgnoredIds () {
    //   return this.ignoredProfilesChanges?.remove || []
    // },
    ignoredProfilesChanges () {
      return this.submission?.changes?.ignoredProfiles
    },
    whakapapaName () {
      return this.whakapapaView?.name
    },
    whakapapaView () {
      return this.submission?.sourceRecord
    }
  },
  methods: {
    ...mapActions('person', ['getPersonMinimal']),
    t (key, vars) {
      return this.$t('reviewSubmissionDialog.' + key, vars)
    }
  }
}
</script>
