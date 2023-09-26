<template>
    <div>
      <v-row cols="12" class="rounded-border mb-5">
        <ProfileInfoItem :class="isPerson ? 'bb':''" :title="$t('viewPerson.about')" smCols="12" mdCols="12" :value="profile.description"/>
        <ProfileInfoItem v-if="isPerson" :class="mobile ? 'br bb' : 'br'" :title="$t('viewPerson.preferredName')"  :value="profile.preferredName"/>
        <ProfileInfoItem v-if="isPerson" :class="mobile ? 'bb' : 'br'" :title="$t('viewPerson.otherNames')" :value="profile.altNames.join(', ')"/>
        <ProfileInfoItem v-if="isPerson" class="br" :title="$t('viewPerson.age')" :value="age"/>
        <ProfileInfoItem v-if="isPerson" :title="$t('viewPerson.placeOfBirth')" :value="profile.placeOfBirth" />
      </v-row>
      <v-row v-if="isFamily" class="rounded-border mb-5 py-2">
        <div v-if="profile.parents && profile.parents.length > 0" class="pl-6">
          <AvatarGroup :profiles="profile.parents" :group-title="$t('viewPerson.parents')" size="50px" show-labels
            @profile-click="openProfile($event)">
          </AvatarGroup>
        </div>

        <div v-if="profile.partners && profile.partners.length > 0" class="pl-6">
          <AvatarGroup :profiles="profile.partners" :group-title="$t('viewPerson.partners')" size="50px" show-labels
            @profile-click="openProfile($event)">
          </AvatarGroup>
        </div>

        <div v-if="profile.siblings && profile.siblings.length > 0" class="pl-6">
          <AvatarGroup :profiles="profile.siblings" :group-title="$t('viewPerson.siblings')" size="50px" show-labels
            @profile-click="openProfile($event)">
          </AvatarGroup>
        </div>

        <div v-if="profile.children && profile.children.length > 0" class="pl-6">
          <AvatarGroup :profiles="profile.children" :group-title="$t('viewPerson.children')" size="50px" show-labels
            @profile-click="openProfile($event)">
          </AvatarGroup>
        </div>

      </v-row>
    </div>
</template>

<script>
import { mapActions } from 'vuex'

import calculateAge from '@/lib/calculate-age'
import { dateIntervalToString } from '@/lib/date-helpers'
import AvatarGroup from '@/components/AvatarGroup.vue'
import ProfileInfoItem from './ProfileInfoItem.vue'

export default {
  name: 'ProfileInfoCard',
  components: {
    ProfileInfoItem,
    AvatarGroup
  },
  props: {
    profile: Object,
    myProfile: Boolean
  },
  computed: {
    isPerson () {
      return this.profile.type.startsWith('person')
    },
    mobile () {
      return this.$vuetify.breakpoint.xs || this.$vuetify.breakpoint.sm
    },
    age () {
      const age = calculateAge(this.profile.aliveInterval)
      if (age === null) return ' '
      return age.toString()
    },
    dob () {
      if (this.profile.aliveInterval) {
        const formattedDate = dateIntervalToString(this.profile.aliveInterval, this.monthTranslations)
        return formattedDate
      }
      return ' '
    },
    monthTranslations (key, vars) {
      return this.$t('months.' + key, vars)
    },
    isFamily () {
      if (this.profile.type === 'community') return false
      if (this.profile.parents && this.profile.parents.length) return true
      if (this.profile.children && this.profile.children.length) return true
      return false
    }
  },
  methods: {
    ...mapActions(['setDialog']),
    ...mapActions('person', ['setSelectedProfileById']),
    openProfile (profile) {
      this.setSelectedProfileById(profile.id)
      this.setDialog({ active: 'view-edit-person', type: 'preview' })
    }
  }
}
</script>

<style>
.rounded-border {
  color: black;
  border: 0.5px solid rgba(0,0,0,0.3);
  border-radius: 10px;
  background-color: white;
}

.br {
  border-right: 0.5px solid rgba(0,0,0,0.3);
}

.bb {
  border-bottom: 0.5px solid rgba(0,0,0,0.3);
}
.bt {
  border-top: 0.5px solid rgba(0,0,0,0.3);
}
.bl {
  border-left: 0.5px solid rgba(0,0,0,0.3);
}

</style>
