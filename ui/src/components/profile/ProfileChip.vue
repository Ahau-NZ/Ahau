<template>
  <v-list-item class="profile-list">
    <Avatar class="mr-3" size="40px" :image="item.avatarImage" :alt="getDisplayName(item)" :gender="item.gender" :aliveInterval="item.aliveInterval" />
    <v-list-item-content>
      <v-list-item-title> {{ item.legalName || item.preferredName || 'No name' }} </v-list-item-title>
      <v-list-item-subtitle>Name</v-list-item-subtitle>
    </v-list-item-content>
    <v-list-item-content>
      <v-list-item-title> {{ item.placeOfBirth || 'No place of birth' }} </v-list-item-title>
      <v-list-item-subtitle>Place of Birth</v-list-item-subtitle>
    </v-list-item-content>
    <v-list-item-action>
      <v-list-item-title> {{ age(item.aliveInterval) || 'No age' }} </v-list-item-title>
      <v-list-item-subtitle>Age</v-list-item-subtitle>
    </v-list-item-action>
    <v-list-item-action>
      <v-select
        v-model="relatedBy"
        label="Related by"
        :items="relationshipTypes"
        :menu-props="{ light: true }"
        outlined
        hide-details
       />
    </v-list-item-action>
    <v-list-item-action>
      <v-btn class="delete" @click="$emit('removeItem')" icon x-small light max-width="20px" max-height="20px">
        <v-icon>mdi-close</v-icon>
      </v-btn>
    </v-list-item-action>
  </v-list-item>
</template>

<script>
import Avatar from '@/components/Avatar.vue'
import { getDisplayName } from '@/lib/person-helpers.js'
import calculateAge from '@/lib/calculate-age'
import { RELATIONSHIPS } from '@/lib/constants'

export default {
  name: 'ProfileChip',
  components: {
    Avatar
  },
  props: {
    item: { type: Object, default: null }
  },
  data () {
    return {
      relationshipTypes: RELATIONSHIPS
    }
  },
  methods: {
    getDisplayName,
    age (aliveInterval) {
      return calculateAge(aliveInterval)
    }
  }
}
</script>

<style>
.profile-list {

}
</style>
