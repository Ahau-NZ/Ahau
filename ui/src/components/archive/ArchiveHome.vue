<template>
  <v-row>
    <v-col v-if="!hideCollections" v-show="!showStory" cols="12" class="pa-0">
      <CollectionGroup
        :collections="collections"
        @click="showCurrentCollection"
      />
    </v-col>
    <v-col cols="12">
      <Stories :stories="stories" @save="$emit('processStory', $event)" :title="title"/>
    </v-col>
  </v-row>
</template>
<script>

import Stories from '@/components/archive/Stories.vue'
import CollectionGroup from '@/components/archive/CollectionGroup.vue'
import { mapGetters } from 'vuex'
import { getDisplayName } from '@/lib/person-helpers.js'

export default {
  name: 'ArchiveHome',
  props: {
    stories: Array,
    collections: Array,
    hideCollections: Boolean,
    profile: Object
  },
  components: {
    Stories,
    CollectionGroup
  },
  computed: {
    ...mapGetters(['showStory', 'whoami', 'currentAccess']),
    title () {
      if (this.profile.id !== this.currentAccess.id) return `Stories about ${this.getDisplayName(this.profile)}`
      return 'Stories'
    }
  },
  methods: {
    getDisplayName,
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
