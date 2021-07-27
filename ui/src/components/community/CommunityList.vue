<template>
  <v-row>
    <v-col cols="12">
      <p class="sub-headline pa-0 mb-4">{{ title }}</p>
    </v-col>
    <v-col
      v-for="tribe in tribes"
      :key="tribe.id"
      justify-self="start"
      cols="auto"
    >
      <CommunityCard v-if="tribe.private && tribe.private.length" :community="tribe.private[0]" @click="goTribe(tribe)"/>
      <CommunityCard v-else :community="tribe.public[0]" @click="goTribe(tribe)"/>
    </v-col>
  </v-row>
</template>

<script>
import CommunityCard from '@/components/community/CommunityCard.vue'

export default {
  name: 'CommunityList',
  props: {
    title: String,
    tribes: Array
  },
  components: {
    CommunityCard
  },
  methods: {
    goTribe (tribe) {
      if (tribe.private.length > 0) return this.goProfile(tribe.id, tribe.private[0])
      return this.goProfile(tribe.id, tribe.public[0])
    },
    goProfile (tribeId, profile) {
      this.$router.push({
        name: 'community', params: { tribeId, profileId: profile.id, profile }
      }).catch({})
    }
  }
}
</script>

<style scoped>
.sub-headline {
  font-size: 0.8rem;
  color: rgba(0, 0, 0, 0.6);
}
</style>
