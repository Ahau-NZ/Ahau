<template>
  <div>
    <v-row>
      <v-col cols="10" class="sub-headliner black--text pa-0 pl-6 pb-2">
        {{ t('collections' )}}
      </v-col>
    </v-row>
    <v-row v-if="collections && collections.length > 0">
      <v-col cols="12" xs="12" sm="12" md="9" class="pa-0">
        <v-slide-group
          v-model="model"
          light
          show-arrows
          style="width: 100%; height: 100%; margin-top: 10px; background: rgba(0,0,0, 0.05)"
        >
          <v-slide-item
            v-for="(collection, i) in collections"
            :key="`c-s-g-${i}`"
            v-slot:default="{ active, toggle }"
            transition="fade-transition"
            style="width:210px; height:310px;"
            class="pa-0 mt-4 ml-6 mb-5"
          >
            <v-scale-transition>
              <Collection
                :collection="collection"
                :selected="active"
                @click="toggle && $emit('click', collection)"
              />
            </v-scale-transition>
          </v-slide-item>
        </v-slide-group>
      </v-col>
    </v-row>

    <!-- empty -->
    <v-row v-else>
      <v-col
        cols="12"
        xs="12"
        sm="12"
        md="9"
        class="pa-0"
      >
        <v-col v-if="!collections">
          <v-slide-group light center-active style="width: 100%; height: 100%;">
            <v-slide-item
              v-for="n in 4"
              :key="`skeleton-${n}`"
              transition="fade-transition"
              style="width:210px; height:310px;"
              class="pa-0 mx-3 mb-5"
            >
              <v-scale-transition>
                <v-skeleton-loader
                  :width="mobile ? '100%' : '87%'"
                  type="card-avatar, article, actions"
                ></v-skeleton-loader>
              </v-scale-transition>
            </v-slide-item>
          </v-slide-group>
        </v-col>
        <v-col
          v-else
          class="px-8 subtitle-1 grey--text "
          :class="{ 'text-center': mobile }"
        >
          {{ t('collectionNotFound') }}
        </v-col>
      </v-col>
    </v-row>
  </div>
</template>

<script>
import Collection from './Collection.vue'

export default {
  name: 'CollectionGroup',
  props: {
    collections: Array
  },
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
  },
  methods: {
    t (key, vars) {
      return this.$t('viewArchive.' + key, vars)
    }
  }
}
</script>

<style lang="scss">
.v-slide-group {
  .v-slide-group__prev, .v-slide-group__next {
    display: none !important;
  }
  .v-slide-group__wrapper {
    overflow-x: auto; /* Enables the horizontal scrollbar */
    /* Next lines hides scrollbar in different browsers for styling purposes */
    -ms-overflow-style: none; /* IE and Edge */
    scrollbar-width: none; /* Firefox */

    &::-webkit-scrollbar {
      height: 4px;
    }

    &::-webkit-scrollbar-track {
      background: lightgrey;
    }

    &::-webkit-scrollbar-thumb {
      /* background: #888; */
      background: #888;

      &:hover {
        background: #555;
      }
    }
  }
}

</style>
