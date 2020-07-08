<template>
    <v-row cols="12" class="rounded-border">
      <ProfileInfoItem class="br bb" :title="'Preferred Name'" :value="profile.preferredName"/>
      <ProfileInfoItem :class="mobile ? 'bb':'br bb'" :title="'Age'" :value="age" :sub-value="dob" />
      <ProfileInfoItem class="br bb" :title="'Occupation'" :value="profile.profession" />
      <ProfileInfoItem class="bb" :title="'Location'" :value="profile.location" />

      <div v-if="profile.parents && profile.parents.length" :class="mobile ? '' : 'br'">
        <AvatarGroup v-if="profile.parents" :profiles="profile.parents" group-title="Parents" size="50px" :show-labels="true"
          @profile-click="openProfile($event)">
        </AvatarGroup>
      </div>
      <div v-if="profile.siblings && profile.siblings.length" :class="mobile ? '' : 'br'">
        <AvatarGroup v-if="profile.siblings" :profiles="profile.siblings" group-title="Siblings" size="50px" :show-labels="true"
          @profile-click="openProfile($event)">
        </AvatarGroup>
      </div>
      <div v-if="profile.children && profile.children.length">
        <AvatarGroup v-if="profile.children" :profiles="profile.children" group-title="Children" size="50px" :show-labels="true"
          @profile-click="openProfile($event)">
        </AvatarGroup>
      </div>
    </v-row>
</template>

<script>
import calculateAge from '@/lib/calculate-age'
import formatDate from '@/lib/format-date'
import AvatarGroup from '@/components/AvatarGroup.vue'
import ProfileInfoItem from './ProfileInfoItem'
import { mapActions } from 'vuex'
import { dateIntervalToString } from '@/lib/date-helpers.js'

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
    age () {
      if (this.profile.aliveInterval) {
        var age = calculateAge(this.profile.aliveInterval)
        return String(age)
      }
      return ' '
    },
    dob () {
      if (this.profile.aliveInterval) {
        var formattedDate = dateIntervalToString(this.profile.aliveInterval)
        return formattedDate
      }
      return ' '
    }
  },
  methods: {
    ...mapActions(['setProfileById', 'setDialog']),

    openProfile (profile) {
      this.setProfileById({ id: profile.id, type: 'preview' })
      this.setDialog({ active: 'view-edit-node', preview: true })
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

</style>
