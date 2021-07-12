<template>
  <v-col cols="12" md="6" class="pa-0">
    <v-autocomplete
      v-model="groupMembers"
      :items="tribeMembers"
      v-bind="customProps"
      outlined
      :label="t('selectMember')"
      dense
      bottom
      light
      style="background-color: white"
    >
      <template v-slot:item="data">
        <template>
          <v-list-item @click="addMember(data.item)">
            <v-list-item-avatar>
              <img :src="profileImage(data.item)">
            </v-list-item-avatar>
            <v-list-item-content>
              <v-list-item-title> {{ getDisplayName(data.item) }}</v-list-item-title>
            </v-list-item-content>
          </v-list-item>
        </template>
      </template>
    </v-autocomplete>
  </v-col>
</template>
<script>
import avatarHelper from '@/lib/avatar-helpers.js'
import { getDisplayName } from '@/lib/person-helpers.js'

export default {
  name: 'MembersPicker',
  props: {
    groupMembers: Array,
    tribeMembers: Array
  },
  data () {
    return {
    }
  },
  computed: {
    customProps () {
      return {
        hideDetails: true,
        menuProps: { bottom: true, offsetY: true, light: true },
        light: true,
        autoFocus: true
      }
    }
  },
  methods: {
    getDisplayName,
    addMember (member) {
      this.$emit('addMember', member)
    },
    profileImage (profile) {
      if (profile.avatarImage && profile.avatarImage.uri) return profile.avatarImage.uri
      else return avatarHelper.defaultImage()
    },
    t (key, vars) {
      return this.$t('addCommunityForm.' + key, vars)
    }
  }

}
</script>
