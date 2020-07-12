<template>
    <div>
      <v-row cols="12" class="rounded-border">
        <ProfileInfoItem class="bb" title="About" smCols="12" mdCols="12" :value="profile.description"/>
        <ProfileInfoItem v-if="profile.type === 'person'" :class="mobile ? 'br bb':'br'" :title="'Preferred Name'" :value="profile.preferredName"/>
        <ProfileInfoItem v-if="profile.type === 'person'" :class="mobile ? 'bb':'br'" :title="'Age'" :value="age"/>
        <ProfileInfoItem v-if="profile.type === 'person'" class="br" :title="'Occupation'" :value="profile.profession" />
        <ProfileInfoItem v-if="profile.type === 'person'" :title="'Location'" :value="profile.location" />
      </v-row>
      <!-- <v-row v-if="isRegistration" class="rounded-border">
        <span> To verify your descendancy, please provide your parents and your grandparents information </span> 
        <div v-for="parent in profile.parents" :key="parent.id" class="pl-6">
          <v-col cols="3">
            <p>{{parent.relationshipType}} parent</p>
            <Avatar :image="parent.avatarImage" :gender="parent.gender" :age="parent.bornAt" :aliveInterval="parent.aliveInterval" :size="tablet ? '100px':'170px'" />
            <Avatar :profiles="parent" :group-title="`${parent.relationshipType} parent`" size="50px" :show-labels="true">
              <template v-slot:action >
                <AddButton v-if="isRegistration" @click="toggleNew('parent')" class="pb-4" justify="start"/>
              </template>
            </Avatar>
          </v-col> -->
          <!-- <v-col cols="9">
             <AvatarGroup :profiles="grandParents(parent)" :group-title="'parent'" size="50px" :show-labels="true"
              @profile-click="openProfile($event)">
              <template v-slot:action >
                <AddButton v-if="isRegistration" @click="toggleNew('parent')" class="pb-4" justify="start"/>
              </template>
            </AvatarGroup>
          </v-col> -->
        <!-- </div>

      </v-row> -->

      <v-row v-if="profile.type !== 'community' & !isRegistration" class="rounded-border">
        <div v-if="profile.parents && profile.parents.length > 0" class="pl-6">
          <AvatarGroup :profiles="profile.parents" group-title="Parents" size="50px" :show-labels="true"
            @profile-click="openProfile($event)">
            <template v-slot:action >
              <AddButton v-if="isRegistration" @click="toggleNew('parent')" class="pb-4" justify="start"/>
            </template>
          </AvatarGroup>
        </div>

        <div v-if="profile.siblings && profile.siblings.length > 0" class="pl-6">
          <AvatarGroup :profiles="profile.siblings" group-title="Siblings" size="50px" :show-labels="true"
            @profile-click="openProfile($event)">
            <template v-slot:action >
              <AddButton v-if="isRegistration" @click="toggleNew('sibling')" class="pb-4" justify="start"/>
            </template>
          </AvatarGroup>
        </div>

        <div v-if="profile.children && profile.children.length > 0" class="pl-6">
          <AvatarGroup :profiles="profile.children" group-title="Children" size="50px" :show-labels="true"
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
import calculateAge from '@/lib/calculate-age'
import AvatarGroup from '@/components/AvatarGroup.vue'
import ProfileInfoItem from './ProfileInfoItem'
import { mapActions } from 'vuex'
import AddButton from '@/components/button/AddButton.vue'
import { dateIntervalToString } from '@/lib/date-helpers.js'
import Avatar from '@/components/Avatar.vue'

export default {
  name: 'ProfileInfoCard',
  components: {
    ProfileInfoItem,
    AvatarGroup,
    AddButton,
    Avatar
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
      console.log(this.profile.aliveInterval)
      var age = calculateAge(this.profile.aliveInterval)
      if (age === null) return ' '
      return age.toString()
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
      this.setDialog({ active: 'view-edit-node', type: 'preview' })
    },
    toggleNew (type) {
      // this.$emit('new', type)
      this.setDialog({active:'new-node', type:type, source:'new-registration'})
    },
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
.bl {
  border-left: 0.5px solid rgba(0,0,0,0.3);
}

</style>
