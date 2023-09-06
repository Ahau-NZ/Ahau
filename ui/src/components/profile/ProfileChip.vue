<template>
  <v-row class="pl-4">
    <v-col cols="8" :class="mobile ? 'py-2':'py-1'">
      <v-row :class="{'center-items':mobile}">
        <v-col :cols="mobile ? '3':'2'" class="py-0">
          <Avatar
            size="50px"
            :image="profile.avatarImage"
            :alt="displayName"
            :gender="profile.gender"
            :aliveInterval="profile.aliveInterval"
            :showAddIcon="!isNewProfile"
            :clickable="!readonly"
            @click="handleEmit('click')"
          />
        </v-col>
        <v-col :cols="mobile ? '5':'3'" class="py-0" justify="center">
          <span class="list-title"> {{ displayName }} </span>
          <p v-if="!mobile" class="list-subtitle">Name</p>
        </v-col>
        <v-col v-if="!mobile && !readonlyRelationship" cols="4" class="py-0">
          <span class="list-title"> {{ profile.placeOfBirth || '...' }} </span>
          <p class="list-subtitle">Place of Birth</p>
        </v-col>
        <v-col v-if="!readonlyRelationship" cols="3" class="py-0">
          <span class="list-title"> {{ age(profile.aliveInterval) || '...' }} </span>
          <p v-if="!mobile" class="list-subtitle">Year of Birth</p>
        </v-col>
        <v-col v-if="readonlyRelationship" cols="3" class="py-0">
          <span class="list-title"> {{ relatedBy || '...' }} </span>
          <p v-if="!mobile" class="list-subtitle">Related By</p>
        </v-col>
        <v-col v-if="readonlyRelationship && legallyAdopted !== true" cols="3" class="py-0">
          <span class="list-title"> {{ legallyAdopted || '...' }} </span>
          <p v-if="!mobile" class="list-subtitle">Legally Adopted</p>
        </v-col>
      </v-row>
    </v-col>
    <v-col v-if="!readonlyRelationship" cols="3" class="py-0 px-0">
      <v-select v-if="showRelatedBy"
        label="Related by"
        v-model="relatedBy"
        :items="relationshipTypes"
        :menu-props="{ light: true }"
        hide-details
        style="width: 110px;"
        @change="handleEmit('update')"
      />
    </v-col>
  </v-row>
</template>

<script>
import Avatar from '@/components/Avatar.vue'
import { getDisplayName } from '@/lib/person-helpers.js'
import { RELATIONSHIPS } from '@/lib/constants'
import { getBirthYear } from '@/lib/date-helpers.js'

export default {
  name: 'ProfileChip',
  components: {
    Avatar
  },
  props: {
    profile: Object,
    isNewProfile: Boolean,
    readonly: Boolean,
    label: String,
    hideDetails: Boolean,
    readonlyRelationship: Boolean
  },
  data () {
    return {
      relationshipTypes: RELATIONSHIPS,
      relatedBy: 'birth',
      legallyAdopted: null
    }
  },
  mounted () {
    if (this.readonlyRelationship) {
      this.relatedBy = this.profile.relationshipType
      this.legallyAdopted = this.profile.legallyAdopted
    }
  },
  computed: {
    showRelatedBy () {
      return !this.hideDetails && this.isNewProfile
    },
    displayName () {
      return getDisplayName(this.profile)
    },
    mobile () {
      return this.$vuetify.breakpoint.xs || this.$vuetify.breakpoint.sm
    }
  },
  methods: {
    age (aliveInterval) {
      return getBirthYear(aliveInterval)
    },
    handleEmit (type) {
      this.$emit(type, {
        id: this.profile.id,
        relationshipType: this.relatedBy
      })
    }
  }
}
</script>

<style>
.center-items {
  justify-content: center !important;
  align-items: center !important;
}
.profile-list {
  height: 60px;
}
.list-title {
  font-size: 14px;
  color: black;
}
.list-subtitle {
  font-size: 10px;
}
</style>
