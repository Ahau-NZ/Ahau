<template>
  <ProfileList
    :label="label"
    :existingProfiles="newProfiles"
    :newProfiles="selectedProfiles"
    readonly-relationship
    :readonly="readonly"

    @click="addNewProfile"
  />
</template>

<script>
import pick from 'lodash.pick'
import { mapActions } from 'vuex'

import ProfileList from '@/components/profile/ProfileList.vue'

export default {
  name: 'SubmissionDependencies',
  components: {
    ProfileList
  },
  props: {
    dependencies: Array,
    label: String,
    readonly: Boolean
  },
  data () {
    return {
      newProfiles: [],
      selectedProfiles: []
    }
  },
  async mounted () {
    this.newProfiles = await Promise.all(
      this.dependencies.map(async dep => {
        const { parent, child } = dep.details
        const profile = await this.getPersonMinimal(parent || child)

        // swap in the details for the whakapapa link
        return {
          ...profile,
          ...pick(dep.details, ['relationshipType', 'legallyAdopted'])
        }
      })
    )

    if (this.readonly) {
      this.selectedProfiles = this.dependencies
        .filter(dep => {
          return dep?.approvedByIds?.length > 0
        })
        .map(dep => {
          const { parent, child } = dep?.details
          return this.newProfiles.find(profile => profile.id === (parent || child))
        })
    }
  },
  methods: {
    ...mapActions('person', ['getPersonMinimal']),
    addNewProfile (newProfile) {
      const hasProfile = this.selectedProfiles.find(profile => {
        return profile.id === newProfile.id
      })

      if (hasProfile) {
        // remove them
        this.selectedProfiles = this.selectedProfiles.filter(profile => {
          return profile.id !== newProfile.id
        })
      } else {
        // add to selected profiles
        const profile = this.newProfiles.find(profile => profile.id === newProfile.id)
        this.selectedProfiles.push(profile)
      }

      this.$emit('selection', this.selectedDependencies())
    },
    selectedDependencies () {
      return this.dependencies.filter(dep => {
        const { parent, child } = dep.details

        return this.selectedProfiles.find(profile => profile.id === (parent || child))
      })
    }
  }
}
</script>
