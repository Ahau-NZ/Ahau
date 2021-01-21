<template>
  <!--
  <v-col v-show="!showStory && !currentCollection" cols="12">
    <CollectionGroup :collections="collections" @selectedIndex="index = $event" @click="showCurrentCollection"/>
  </v-col>
  <v-col>
    <Stories :stories="filteredStories" @save="processStory($event)" :title="title"/>
  </v-col> -->
  <v-row>
    <v-col cols="12">
      <CollectionGroup
        :collections="collections"
        @selectedIndex="index = $event"
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

// import { saveStoryMixin, storiesApolloMixin } from '@/mixins/story-mixins.js'
// import mapProfileMixins from '@/mixins/profile-mixins.js'
// import { collectionsApolloMixin, saveCollectionsMixin } from '@/mixins/collection-mixins.js'

// import { mapGetters } from 'vuex'

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
