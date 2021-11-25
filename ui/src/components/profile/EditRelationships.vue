<template>
  <v-col :class="mobile ? 'px-0':'px-4'">
    <v-row class="overline pb-4">{{ label }}</v-row>
    <v-row v-for="profile in profiles" :key="profile.id" class="pl-4">
      <v-col cols="4" class="pl-0 ">
        <v-avatar size="50px">
          <v-img :src="getImage(profile)" :class="customClass"/>
        </v-avatar>
        <v-row justify="center" class="ml-n8">
          <p class="mb-0">{{ profile.preferredName }}</p>
        </v-row>
      </v-col>
      <v-col v-if="showRelatedBy" cols="4" class="pt-4 px-0 mx-3">
        <v-select
          v-if="showRelatedBy"
          :value="profile.relationshipType"
          label="Related by"
          :items="relationshipTypes"
          :menu-props="{ light: true }"
          hide-details
          style="width: 110px;"
          @input="(relationship) => updateRelationship(profile, relationship)"
        />
      </v-col>
      <v-col class="pt-8">
        <v-icon @click="$emit('remove', profile)">mdi-delete</v-icon>
      </v-col>
    </v-row>
  </v-col>
</template>
<script>
import avatarHelper from '@/lib/avatar-helpers.js'
import { RELATIONSHIPS } from '@/lib/constants'

export default {
  props: {
    profiles: {
      type: Array,
      required: true
    },
    label: String
  },
  data () {
    return {
      relationshipTypes: RELATIONSHIPS
    }
  },
  computed: {
    mobile () {
      return this.$vuetify.breakpoint.xs
    },
    customClass () {
      if (this.isView) return ''
      return this.deceased ? 'deceased' : 'alive'
    },
    showRelatedBy () {
      return this.label !== 'partners'
    }
  },
  methods: {
    getImage (profile) {
      if (profile.avatarImage && profile.avatarImage.uri) return profile.avatarImage.uri
      return avatarHelper.defaultImage(false, profile.aliveInterval, profile.gender)
    },
    updateRelationship (profile, relationship) {
      profile.relationshipType = relationship
      this.$emit('edit', profile)
    }
  }
}
</script>
