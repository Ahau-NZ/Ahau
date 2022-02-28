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
            :clickable="!addSibling"
            @click="emitWithKey('profile-click')"
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
      <v-select v-if="showRelatedBy"
        label="Related by"
        v-model="relatedBy"
        :items="relationshipTypes"
        :menu-props="{ light: true }"
        hide-details
        style="width: 110px;"
        change="emitWithKey('related-by')"
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
    label: String,
    index: { type: Number, default: -1 },
    groupType: { type: String, default: '' }
  },
  data () {
    return {
      relationshipTypes: RELATIONSHIPS,
      relatedBy: 'birth'
    }
  },
  computed: {
    showRelatedBy () {
      return this.addableProfile && this.label !== 'Add partners'
    },
    addSibling () {
      return this.index === 0 && this.groupType === 'parents-siblings'
    }
  },
  methods: {
    getDisplayName,
    age (aliveInterval) {
      return getBirthYear(aliveInterval)
    },
    emitWithKey (key) {
      this.$emit(key, {
        id: this.item.id,
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
