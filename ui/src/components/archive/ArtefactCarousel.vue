<template>
  <v-container class="pa-0 background">
    <v-carousel v-model="selectedIndex" hide-delimiters style="width: 100vw;">
      <v-carousel-item v-for="(artefact, i) in artefacts" :key="`a-c-${i}`" transition="fade-transition"
        style="width:100%;"
      >
        <ArtefactCarouselItem :artefact="artefact"
          controls
          @update="$emit('update', i)"
          @delete="$emit('delete', i)"
          :editing="editing"
        />
      </v-carousel-item>
    </v-carousel>
    <v-slide-group
      v-model="selectedIndex"
      class="pa-0 background"
      light
      center-active
      style="width:100vw;"
    >
      <v-slide-item
        v-for="(artefact, i) in artefacts"
        :key="`a-s-g-${i}`"
        v-slot:default="{ active, toggle }"
        transition="fade-transition"
        style="width:100px;height:100px"
      >
        <v-scale-transition>
          <ArtefactCarouselItem :artefact="artefact"
            :selected="active"
            @click="toggle"
          />
        </v-scale-transition>
      </v-slide-item>
    </v-slide-group>
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
  components: {
    ArtefactCarouselItem
  },
  data () {
    return {
      selectedIndex: this.index
    }
  },
  watch: {
    selectedIndex (n, o) {
      if (n !== o) this.$emit('update:index', n)
    }
  },
  computed: {
    mobile () {
      return this.$vuetify.breakpoint.xs || this.$vuetify.breakpoint.sm
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
.background {
  background-color: #1E1E1E;
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
