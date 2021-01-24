<template>
  <v-row>
    <v-col v-if="allowCollections" v-show="!showStory" cols="12">
      <CollectionGroup
        :collections="collections"
        @click="showCurrentCollection"
      />
    </v-col>
    <v-col cols="12">
      <Stories :stories="stories" @save="$emit('processStory', $event)" title="Stories"/>
    </v-col>
  </v-row>
</template>
<script>

import Stories from '@/components/archive/Stories.vue'
import CollectionGroup from '@/components/archive/CollectionGroup.vue'
import { mapGetters } from 'vuex'

export default {
  name: 'ArchiveHome',
  props: {
    stories: Array,
    collections: Array
  },
  components: {
    Stories,
    CollectionGroup
  },
  computed: {
    ...mapGetters(['showStory', 'whoami']),
    allowCollections () {
      // only personal or community archives will see collections

      // if on personal archive
      const isPersonal = this.$route.params.profileId === this.whoami.personal.profile.id
      if (isPersonal) return true

      // if on a community archive we're on
      if (this.$route.name === 'community/archive') return true

      // route name is person/archive
      return false
    }
  },
  methods: {
    showCurrentCollection ({ id }) {
      var type = this.$route.name.split('/archive')[0]
      this.$router.push({
        name: type + '/archive/:collectionId',
        params: {
          collectionId: id
        }
      })
    }
  }

}
</script>
