<template>
    <v-row cols="12" class="rounded-border">
      <ProfileInfoItem :class="mobile ? 'bb br':'br'" :title="'Preferred Name'" :value="profile.preferredName"/>
      <ProfileInfoItem :class="mobile ? 'bb':'br'" :title="'Age'" :value="age"/>
      <ProfileInfoItem class="br" :title="'Occupation'" :value="profile.profession" />
      <ProfileInfoItem :title="'Location'" :value="profile.location" />

      <div v-if="profile.parents && profile.parents.length || isRegistration" :class="mobile ? 'bt' : 'br bt'" style="min-width:150px; flex-grow: 1;">
        <AvatarGroup v-if="profile.parents" :profiles="profile.parents" group-title="Parents" size="50px" :show-labels="true"
          @profile-click="openProfile($event)">
          <template v-slot:action >
            <AddButton v-if="isRegistration" @click="toggleNew('parent')" class="pb-4" justify="start"/>
          </template>
        </AvatarGroup>
      </div>
      <div v-if="profile.siblings && profile.siblings.length" :class="mobile ? 'bt' : profile.children && profile.children.length  ? 'br bt' : 'bt'" style="min-width:150px; flex-grow: 1;">
        <AvatarGroup v-if="profile.siblings" :profiles="profile.siblings" group-title="Siblings" size="50px" :show-labels="true"
          @profile-click="openProfile($event)">
          <template v-slot:action >
            <AddButton v-if="isRegistration" @click="toggleNew('sibling')" class="pb-4" justify="start"/>
          </template>
        </AvatarGroup>
      </div>
      <div v-if="profile.children && profile.children.length" style="min-width:150px; flex-grow: 1;" :class="mobile ? 'bt' : 'bt'">
        <AvatarGroup v-if="profile.children" :profiles="profile.children" group-title="Children" size="50px" :show-labels="true"
          @profile-click="openProfile($event)">
          <template v-slot:action >
            <AddButton v-if="isRegistration" @click="toggleNew('child')" class="pb-4" justify="start"/>
          </template>
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
import AddButton from '@/components/button/AddButton.vue'
import { dateIntervalToString } from '@/lib/date-helpers.js'

export default {
  name: 'ProfileInfoCard',
  components: {
    ProfileInfoItem,
    AvatarGroup,
    AddButton
  },
  props: {
    profile: Object,
    isRegistration: { type:Boolean, default: false }
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
  margin-bottom:20px;
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
