<template>
  <div>
    <v-btn v-if="isgoWhakapapa && !showStory" fab @click="goWhakapapa" class="ms-10 pr-6 pb-1">
      <v-row align="center">
        <v-icon large>mdi-chevron-left</v-icon>
        <Avatar
          size="45px"
          class="ma-0"
          :image="whakapapa.image ? whakapapa.image : null"
          :alt="whakapapa.name"
          :isView="!whakapapa.image"
        />
      </v-row>
    </v-btn>
    <v-btn v-else-if="!showStory && this.route.name === 'whakapapaShow'" fab @click="$emit('goBack')" class="ms-10  pr-6 pb-1">
      <v-row align="center">
        <v-icon large>mdi-chevron-left</v-icon>
        <Avatar
          size="45px"
          class="ma-0"
          :image="currentProfile.avatarImage ? currentProfile.avatarImage : null"
          :alt="currentProfile.preferredName"
          :gender="currentProfile.gender"
        />
      </v-row>
    </v-btn>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import Avatar from '@/components/Avatar'

export default {
  components: {
    Avatar
  },
  computed: {
    ...mapGetters(['whakapapa', 'route', 'showStory', 'currentProfile']),
    mobile () {
      return this.$vuetify.breakpoint.xs || this.$vuetify.breakpoint.sm
    },
    isgoWhakapapa () {
      if (this.route.from) {
        return this.route.from.name === 'whakapapaShow' && this.route.name === 'profileShow'
      }
      return false
    }
  },
  methods: {
    goWhakapapa () {
      this.$router.push({ path: this.route.from.fullPath })
    }
  }

}
</script>

<style lang="scss" scoped>

</style>
