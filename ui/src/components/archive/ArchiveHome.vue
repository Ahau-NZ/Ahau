<template>
  <v-row>
    <v-col v-if="!hideCollections" v-show="!showStory" cols="12">
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
    collections: Array,
    hideCollections: Boolean
  },
  components: {
    Stories,
    CollectionGroup
  },
  computed: {
    ...mapGetters(['showStory', 'whoami'])
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
