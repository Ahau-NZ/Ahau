<template>
  <div class="pa-0">
    <v-slide-group
      v-if="collections && collections.length > 0"
      v-model="model"
      dark
      center-active
      style="width:100vw;"
    >
      <v-slide-item
        v-for="(collection, i) in collections"
        :key="`c-s-g-${i}`"
        v-slot:default="{ active, toggle }"
        transition="fade-transition"
        style="width:200px;height:250px;"
        class="pa-1"
      >
        <v-scale-transition>
          <Collection :collection="collection"
            :selected="active"
            @click="toggle"
          />
        </v-scale-transition>
      </v-slide-item>
    </v-slide-group>
    <div v-else
      class="px-8 subtitle-1 grey--text "
      :class="{ 'text-center': mobile }"
    >
      No collections found
    </div>
  </div>
</template>

<script>
import Collection from './Collection.vue'

export default {
  name: 'CollectionGroup',
  props: ['collections'],
  components: { Collection },
  data () {
    return {
      selectedCollection: {},
      model: null
    }
  },
  watch: {
    model (index) {
      this.selectedCollection = this.collections[index]
      this.$emit('selectedIndex', index)
    }
  },
  computed: {
    mobile () {
      return this.$vuetify.breakpoint.xs || this.$vuetify.breakpoint.sm
    }
  }
}
</script>

<style scoped>
.collection-group {
  overflow-x: scroll;
  white-space: nowrap;
}
::-webkit-scrollbar {
  height: 5px;
  /* display: none; */
}

/* Track */
::-webkit-scrollbar-track {
  background: #f1f1f1;
}

/* Handle */
::-webkit-scrollbar-thumb {
  background: #888;
}

/* Handle on hover */
::-webkit-scrollbar-thumb:hover {
  background: #555;
}
</style>
