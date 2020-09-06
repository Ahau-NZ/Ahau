<template>
  <div>
    <div v-if="isgoWhakapapa && !showStory" fab class="ms-10 pr-6 pb-1">
      <v-btn @click="goWhakapapa">
        <v-row align="center">
          <v-icon large>mdi-chevron-left</v-icon>
          <Avatar
            size="45px"
            class="ma-0"
            :image="whakapapa.image ? whakapapa.image : null"
            :alt="whakapapa.name"
            :isView="!whakapapa.image"
            showLabel
            row

          />
          <span class="pl-2 caption">Back to {{whakapapa.name}}</span>
        </v-row>
      </v-btn>
    </div>
    <div v-else-if="!showStory && this.route.name === 'whakapapaShow'" fab class="ms-10  pr-6 pb-1">
      <v-btn @click="$emit('go-back')">
        <v-row align="center">
          <v-icon large>mdi-chevron-left</v-icon>
          <Avatar
            size="45px"
            class="ma-0"
            :image="currentProfile.avatarImage ? currentProfile.avatarImage : null"
            :alt="currentProfile.preferredName"
            :gender="currentProfile.gender"
            showLabel
            row
            :isView="currentProfile.type === 'community' && !currentProfile.avatarImage"

          />
          <span class="pl-2 caption">Back to {{currentProfile.preferredName}}</span>
        </v-row>
      </v-btn>
    </div>
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
