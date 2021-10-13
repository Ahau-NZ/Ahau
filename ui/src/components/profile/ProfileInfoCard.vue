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
          <AvatarGroup :profiles="profile.parents" :group-title="$t('viewPerson.parents')" size="50px" :show-labels="true"
            @profile-click="openProfile($event)">
            <template v-slot:action >
              <AddButton v-if="isRegistration" @click="toggleNew('parent')" class="pb-4" justify="start"/>
            </template>
          </AvatarGroup>
        </div>

        <div v-if="profile.partners && profile.partners.length > 0" class="pl-6">
          <AvatarGroup :profiles="profile.partners" :group-title="$t('viewPerson.partners')" size="50px" :show-labels="true"
            @profile-click="openProfile($event)">
            <template v-slot:action >
              <AddButton v-if="isRegistration" @click="toggleNew('partner')" class="pb-4" justify="start"/>
            </template>
          </AvatarGroup>
        </div>

        <div v-if="profile.siblings && profile.siblings.length > 0" class="pl-6">
          <AvatarGroup :profiles="profile.siblings" :group-title="$t('viewPerson.siblings')" size="50px" :show-labels="true"
            @profile-click="openProfile($event)">
            <template v-slot:action >
              <AddButton v-if="isRegistration" @click="toggleNew('sibling')" class="pb-4" justify="start"/>
            </template>
          </AvatarGroup>
        </div>

        <div v-if="profile.children && profile.children.length > 0" class="pl-6">
          <AvatarGroup :profiles="profile.children" :group-title="$t('viewPerson.children')" size="50px" :show-labels="true"
            @profile-click="openProfile($event)">
            <template v-slot:action >
              <AddButton v-if="isRegistration" @click="toggleNew('child')" class="pb-4" justify="start"/>
            </template>
          </AvatarGroup>
        </div>

      </v-row>
    </div>
</template>

<script>
import { mapActions, createNamespacedHelpers } from 'vuex'

import calculateAge from '@/lib/calculate-age'
import AvatarGroup from '@/components/AvatarGroup.vue'
import ProfileInfoItem from './ProfileInfoItem'
import AddButton from '@/components/button/AddButton.vue'
import { dateIntervalToString } from '@/lib/date-helpers.js'

const { mapActions: mapPersonActions } = createNamespacedHelpers('person')

export default {
  name: 'ProfileInfoCard',
  components: {
    ProfileInfoItem,
    AvatarGroup,
    AddButton
  },
  props: {
    profile: Object,
    isRegistration: { type: Boolean, default: false },
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
      var age = calculateAge(this.profile.aliveInterval)
      if (age === null) return ' '
      return age.toString()
    },
    dob () {
      if (this.profile.aliveInterval) {
        var formattedDate = dateIntervalToString(this.profile.aliveInterval, this.monthTranslations)
        return formattedDate
      }
      return ' '
    },
    monthTranslations (key, vars) {
      return this.$t('months.' + key, vars)
    },
    isFamily () {
      if (this.profile.type === 'community') return false
      if (this.isRegistration) return false
      if (this.profile.parents && this.profile.parents.length) return true
      if (this.profile.children && this.profile.children.length) return true
      return false
    }
  },
  methods: {
    ...mapActions(['setDialog']),
    ...mapPersonActions(['setProfileById']),
    openProfile (profile) {
      this.setProfileById({ id: profile.id, type: 'preview' })
      this.setDialog({ active: 'view-edit-node', type: 'preview' })
    },
    toggleNew (type) {
      this.setDialog({ active: 'new-node', type, source: 'new-registration' })
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
