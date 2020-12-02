<template>
  <div>
    <v-row>
      <v-col cols="10" class="sub-headliner black--text pa-0 pl-4 pt-2">
        Collections
      </v-col>
    </v-row>
    <v-row v-if="collections && collections.length > 0">
      <v-col cols="12" xs="12" sm="12" md="9" class="pa-0">
        <v-slide-group
          v-model="model"
          light
          center-active
          style="width: 100%; height: 100%;"
        >
          <v-slide-item
            v-for="(collection, i) in collections"
            :key="`c-s-g-${i}`"
            v-slot:default="{ active, toggle }"
            transition="fade-transition"
            style="width:210px;height:310px;"
            class="pa-0 mx-3"
          >
            <v-scale-transition>
              <Collection :collection="collection"
                :selected="active"
                @click="toggle"
              />
            </v-scale-transition>
          </v-slide-item>
        </v-slide-group>
      </v-col>
    </v-row>
    <v-row v-else>
      <div
        class="px-8 subtitle-1 grey--text "
        :class="{ 'text-center': mobile }"
      >
        No collections found
      </div>
    </v-row>
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

<style>
.v-slide-group__prev {
  display: none !important;
}
.v-slide-group__next {
  display: none !important;
}
.v-slide-group__wrapper {
  overflow-x: auto; /* Enables the horizontal scrollbar */
  /* Next lines hides scrollbar in different browsers for styling purposes */
  -ms-overflow-style: none; /* IE and Edge */
  scrollbar-width: none; /* Firefox */
}

.v-slide-group__wrapper::-webkit-scrollbar {
  display: none;
}
/*
FOR SCROLLBAR
.v-slide-group__wrapper::-webkit-scrollbar {
  height: 4px;
}

.v-slide-group__wrapper::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.v-slide-group__wrapper::-webkit-scrollbar-thumb {
  background: #888;
}

.v-slide-group__wrapper::-webkit-scrollbar-thumb:hover {
  background: #555;
}
*/

</style>
