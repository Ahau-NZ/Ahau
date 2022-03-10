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
          :value="getRelationshipType(profile.id)"
          label="Related by"
          :items="relationshipTypes"
          :menu-props="{ light: true }"
          hide-details
          style="width: 110px;"
          @input="updateRelationship(profile.id, $event)"
        />
      </v-col>
      <v-col class="pt-8">
        <v-icon @click="removeRelationship(profile.id)">mdi-delete</v-icon>
      </v-col>
    </v-row>
  </v-col>
</template>
<script>
import { mapGetters } from 'vuex'

import avatarHelper from '@/lib/avatar-helpers.js'
import { RELATIONSHIPS, LINK_CHILD, LINK_PARENT, LINK_PARTNER } from '@/lib/constants'

export default {
  props: {
    profiles: {
      type: Array,
      required: true
    },
    type: {
      type: String,
      required: true,
      default: null,
      validator: (val) => [
        LINK_CHILD, LINK_PARENT, LINK_PARTNER
      ].includes(val)
    },
    label: String
  },
  data () {
    return {
      relationshipTypes: RELATIONSHIPS
    }
  },
  computed: {
    ...mapGetters('person', ['selectedProfile']),
    ...mapGetters('whakapapa', ['getChildRelationshipType']),
    mobile () {
      return this.$vuetify.breakpoint.xs
    },
    customClass () {
      if (this.isView) return ''
      return this.deceased ? 'deceased' : 'alive'
    },
    showRelatedBy () {
      return this.type !== LINK_PARTNER
    }
  },
  methods: {
    getRelationshipType (relativesId) {
      if (![LINK_PARENT, LINK_CHILD].includes(this.type)) return

      const { parent, child } = this.buildLink(relativesId)

      return this.getChildRelationshipType(parent, child)
    },
    getImage (profile) {
      if (profile.avatarImage && profile.avatarImage.uri) return profile.avatarImage.uri
      return avatarHelper.defaultImage(false, profile.aliveInterval, profile.gender)
    },
    updateRelationship (relativesId, newRelationshipType) {
      const link = this.buildLink(relativesId)
      link.relationshipType = newRelationshipType

      this.$emit('updateLink', link)
    },
    removeRelationship (relativesId) {
      const link = this.buildLink(relativesId)

      this.$emit('removeLink', link)
    },
    buildLink (relativesId) {
      return (this.type === LINK_PARENT)
        ? { parent: relativesId, child: this.selectedProfile.id }
        : { parent: this.selectedProfile.id, child: relativesId }
    }
  }
}
</script>
