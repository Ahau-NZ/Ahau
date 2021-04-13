<template>
  <v-list-item class="profile-list">
    <Avatar
      class="mr-3"
      size="40px"
      :image="item.avatarImage"
      :alt="getDisplayName(item)"
      :gender="item.gender"
      :aliveInterval="item.aliveInterval"
      :addable="!addableProfile"
      clickable
      @click="$emit('profile-click', item)"
    />
    <v-list-item-content v-if="!mobile">
      <v-list-item-title class="list-title"> {{ item.legalName || item.preferredName || 'Unknown' }} </v-list-item-title>
      <v-list-item-subtitle class="list-subtitle">Name</v-list-item-subtitle>
    </v-list-item-content>
    <v-list-item-content v-if="!mobile">
      <v-list-item-title class="list-title"> {{ item.placeOfBirth || 'No place of birth' }} </v-list-item-title>
      <v-list-item-subtitle class="list-subtitle">Place of Birth</v-list-item-subtitle>
    </v-list-item-content>
    <v-list-item-action v-if="!mobile">
      <v-list-item-title class="list-title"> {{ age(item.aliveInterval) || 'Unknown' }} </v-list-item-title>
      <v-list-item-subtitle class="list-subtitle">Year of Birth</v-list-item-subtitle>
    </v-list-item-action>
    <v-list-item-action v-else >
      <v-list-item-title class="list-title"> {{ item.legalName || item.preferredName || 'Unknown' }} </v-list-item-title>
      <v-list-item-subtitle class="list-subtitle">{{ age(item.aliveInterval) || 'Unknown' }}</v-list-item-subtitle>
    </v-list-item-action>
    <v-list-item-action style="margin-left: 100px;">
      <v-select
        v-model="relatedBy"
        label="Related by"
        :items="relationshipTypes"
        :menu-props="{ light: true }"
        hide-details
        style="width: 100px;"
       />
    </v-list-item-action>
  </v-list-item>
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
    item: { type: Object, default: null },
    addableProfile: { type: Boolean, default: false },
    mobile: { type: Boolean, default: false }
  },
  data () {
    return {
      relationshipTypes: RELATIONSHIPS,
      relatedBy: 'birth'
    }
  },
  methods: {
    getDisplayName,
    age (aliveInterval) {
      return getBirthYear(aliveInterval)
    }
  }
}
</script>

<style>
.profile-list {
  height: 60px;
}
.list-title {
  font-size: 15px;
}
.list-subtitle {
  font-size: 12px;
}
</style>
