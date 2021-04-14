<template>
  <v-row class="pl-4">
    <v-col cols="8" :class="mobile ? 'py-2':'py-1'">
      <v-row :class="{'center-items':mobile}">
        <v-col :cols="mobile ? '3':'2'" class="py-0">
          <Avatar
            size="50px"
            :image="item.avatarImage"
            :alt="getDisplayName(item)"
            :gender="item.gender"
            :aliveInterval="item.aliveInterval"
            :addable="!addableProfile"
            clickable
            @click="$emit('profile-click', item)"
          />
        </v-col>
        <v-col :cols="mobile ? '5':'3'" class="py-0" justify="center">
          <span class="list-title"> {{ item.legalName || item.preferredName || 'Unknown' }} </span>
          <p v-if="!mobile" class="list-subtitle">Name</p>
        </v-col>
        <v-col v-if="!mobile" cols="4" class="py-0">
          <span class="list-title"> {{ item.placeOfBirth || '...' }} </span>
          <p class="list-subtitle">Place of Birth</p>
        </v-col>
        <v-col cols="3" class="py-0">
          <span class="list-title"> {{ age(item.aliveInterval) || '...' }} </span>
          <p v-if="!mobile" class="list-subtitle">Year of Birth</p>
        </v-col>
      </v-row>
    </v-col>
    <v-col cols="3" class="py-0 px-0">
      <v-select
        v-if="showRelatedBy"
        v-model="relatedBy"
        label="Related by"
        :items="relationshipTypes"
        :menu-props="{ light: true }"
        hide-details
        style="width: 110px;"
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
    item: { type: Object, default: null },
    addableProfile: { type: Boolean, default: false },
    mobile: { type: Boolean, default: false },
    label: String
  },
  data () {
    return {
      relationshipTypes: RELATIONSHIPS,
      relatedBy: this.item.relationshipType
    }
  },
  watch: {
    relatedBy (newVal) {
      let profile = this.item
      profile.relationshipType = newVal
      this.$emit('related-by', profile)
    }
  },
  computed: {
    showRelatedBy () {
      return this.addableProfile && this.label !== 'Add partners'
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
  font-size: 12px;
}
</style>
