<template>
  <v-container class="pa-0">
    <v-carousel v-model="selectedIndex" hide-delimiters :style="dimensions">
      <v-carousel-item v-for="(artefact, i) in artefacts" :key="`a-c-${i}`" :style="dimensions" transition="fade-transition">
        <ArtefactCarouselItem :artefact="artefact"
          :width="width"
          :height="height"
          controls
          @update="$emit('update', i)"
        />
      </v-carousel-item>
    </v-carousel>
    <v-sheet
      class="mx-auto"
      max-width="100%"
    >
    <v-slide-group
      v-model="selectedIndex"
      class="pa-0"
      light
      center-active
    >
      <v-slide-item
        v-for="(artefact, i) in artefacts"
        :key="`a-s-g-${i}`"
        v-slot:default="{ active, toggle }"
        transition="fade-transition"
      >
        <v-scale-transition>
          <ArtefactCarouselItem :artefact="artefact"
            :selected="active"
            @click="toggle"
          />
        </v-scale-transition>
      </v-slide-item>
    </v-slide-group>
    </v-sheet>
  </v-container>
</template>

<script>
import ArtefactCarouselItem from '@/components/archive/ArtefactCarouselItem.vue'

export default {
  name: 'ArtefactCarousel',
  props: {
    artefacts: {
      type: Array,
      default () {
        return []
      }
    },
    editing: Boolean,
    index: Number
  },
  components: { ArtefactCarouselItem },
  data () {
    return {
      width: '100%',
      selectedIndex: this.index
    }
  },
  watch: {
    selectedIndex (index) {
      this.$emit('update:index', index)
    }
  },
  computed: {
    mobile () {
      return this.$vuetify.breakpoint.xs || this.$vuetify.breakpoint.sm
    },
    height () {
      if (this.mobile) return '300px'
      return '300px'
    },
    dimensions () {
      return {
        width: this.width,
        height: this.height
      }
    }
  },
  methods: {
    removeItem () {
      this.$emit('delete', this.index)
      this.showArtefact(this.artefacts[0], 0)
    }
  }
}
</script>
<style scoped>
.carousel-item {
  width: 100%;
  height: 200px;
}

.carousel-thumbnail-group {
  display: flex;
  flex-direction: row;
  overflow-x: auto;
}

.show-btns {
  color: rgba(255, 255, 255, 1) !important;
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
