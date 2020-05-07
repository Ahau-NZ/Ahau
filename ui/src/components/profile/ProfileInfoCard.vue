<template>
    <v-row cols="12" class="rounded-border">
      <ProfileInfoItem :class="mobile ? 'bb' : 'br bb'" :title="'Preferred Name'" :value="profile.preferredName"/>
      <ProfileInfoItem :class="mobile ? 'bb' : 'br bb'" :title="'Age'" :value="age" :sub-value="dob" />
      <ProfileInfoItem :class="mobile ? 'bb' : 'br bb'" :title="'Occupation'" :value="profile.occupation" />
      <ProfileInfoItem class="bb" :title="'Location'" :value="profile.location" />

      <v-col cols="12" xs="12" sm="12" md="4" :class="mobile ? 'bb' : 'br'">
        <AvatarGroup v-if="profile.parents" :profiles="profile.parents" group-title="Parents" size="50px" :show-labels="true"
          :addButtonSlot="false" @profile-click="openProfile($event)">
        </AvatarGroup>
      </v-col>
      <v-col cols="12" xs="12" sm="12" md="4" :class="mobile ? 'bb' : 'br'">
        <AvatarGroup v-if="profile.siblings" :profiles="profile.siblings" group-title="Siblings" size="50px" :show-labels="true"
          :addButtonSlot="false" @profile-click="openProfile($event)">
        </AvatarGroup>
      </v-col>
      <v-col cols="12" xs="12" sm="12" md="4">
        <AvatarGroup v-if="profile.children" :profiles="profile.children" group-title="Children" size="50px" :show-labels="true"
          :addButtonSlot="false" @profile-click="openProfile($event)">
        </AvatarGroup>
      </v-col>
    </v-row>
</template>

<script>
import calculateAge from '@/lib/calculate-age'
import formatDate from '@/lib/format-date'
import AvatarGroup from '@/components/AvatarGroup.vue'

import ProfileInfoItem from './ProfileInfoItem'

export default {
  name: 'ProfileInfoCard',
  components: {
    ProfileInfoItem,
    AvatarGroup
  },
  props: {
    profile: Object
  },
  computed: {
    mobile () {
      return this.$vuetify.breakpoint.xs || this.$vuetify.breakpoint.sm
    },
    divider () {
      if (this.mobile) return 'divider-horizontal'
      return 'divider-vertical'
    },
    age () {
      var age = calculateAge(this.profile.bornAt)
      if (age == null) {
        return 'age not entered'
      }
      return String(age)
    },
    dob () {
      var formattedDate = formatDate(this.profile.bornAt)
      if (formattedDate == null) {
        return 'no dob'
      }
      return formattedDate
    }
  },
  methods: {
    openProfile (profile) {
      this.$emit('setupProfile', profile.id)
    }
  }
}
</script>

<style>
.rounded-border {
  border: 0.5px solid rgba(0,0,0,0.12);
  border-radius: 10px;
  background-color: white;
}

.br {
  border-right: 0.5px solid rgba(0,0,0,0.12);
}

.bb {
  border-bottom: 0.5px solid rgba(0,0,0,0.12);
}

</style>
