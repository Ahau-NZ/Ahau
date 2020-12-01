<template>
  <div>
    <v-slide-group
      v-model="model"
      dark
      center-active
      show-arrows
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
