<template>
  <div class="collection-group">
    <Collection :collection="collection" v-for="(collection, i) in collections" :key="`collection-${i}`" />
  </div>
</template>

<script>
import Collection from './Collection.vue'
export default {
  name: 'CollectionGroup',
  props: ['collections'],
  components: { Collection }
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
