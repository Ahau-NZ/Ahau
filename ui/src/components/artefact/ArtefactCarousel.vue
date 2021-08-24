<template>
  <v-container class="pa-0 background">
    <v-carousel v-model="selectedIndex"
      hide-delimiters
      :show-arrows="!mobile && fullStory && artefacts.length > 1"
      :show-arrows-on-hover="!mobile"
      :height="artefactHeight"
      style="width:100vw; background-color:#1E1E1E"
    >
      <v-carousel-item v-for="(artefact, i) in artefacts" :key="`a-c-${i}`"
        style="width: 100%;">
        <ArtefactCarouselItem
          :artefact="artefact"
          :controls="fullStory"
          :editing="editing"
          :show-preview="!editing && !fullStory && !showArtefact"
          :selected="i === selectedIndex"

          @click="toggleArtefact(artefact, i)"
          @update="$emit('update', i)"
          @delete="$emit('delete', i)"
      />
      </v-carousel-item>
    </v-carousel>

    <v-slide-group
      v-if="!showArtefact && artefacts.length > 1"
      v-model="selectedIndex"
      class="pa-0 background"
      dark
      center-active
      style="width:100vw; margin-top:-2px"
    >
      <v-slide-item
        v-for="(artefact, i) in artefacts"
        :key="`a-s-g-${i}`"
        v-slot:default="{ active, toggle }"
        transition="fade-transition"
        style="width:100px; height:100px; background-color:rgba(30,30,30)"
        class="pa-1"
      >
        <v-scale-transition>
          <ArtefactCarouselItem :artefact="artefact"
            :selected="active"
            @click="selectItem(active, toggle)"
            show-preview
            icon
          />
        </v-scale-transition>
      </v-slide-item>

      <v-slide-item v-if="editing">
        <UploadArtefactButton dark class="pt-4 px-5" @artefacts="$emit('artefacts', $event)"/>
      </v-slide-item>
    </v-slide-group>

  </v-container>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'

import ArtefactCarouselItem from '@/components/artefact/ArtefactCarouselItem.vue'
import UploadArtefactButton from '@/components/artefact/UploadArtefactButton.vue'

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
    fullStory: Boolean,
    index: Number
  },
  components: {
    ArtefactCarouselItem,
    UploadArtefactButton
  },
  data () {
    return {
      selectedIndex: this.index || 0
    }
  },
  watch: {
    index (newValue) {
      if (newValue === this.selectedIndex) return // stop a loop?
      this.selectedIndex = newValue
    },
    selectedIndex (n, o) {
      this.$emit('update:selectedIndex', n)
    }
  },
  computed: {
    ...mapGetters(['showArtefact']),
    mobile () {
      return this.$vuetify.breakpoint.xs || this.$vuetify.breakpoint.sm
    },
    artefact () {
      const thing = this.artefacts[this.selectedIndex]
      if (thing && thing.artefact) return thing.artefact
      if (thing) return thing
      return {}
    },
    artefactHeight () {
      return this.showArtefact
        ? '80vh'
        : (this.mobile ? '300px' : '500px')
    }
  },
  methods: {
    ...mapActions(['setShowArtefact']),
    removeItem () {
      this.$emit('delete', this.selectedIndex)
      this.showArtefact(this.artefacts[0], 0)
    },
    selectItem (isActive, toggleArtefact) {
      if (typeof toggleArtefact !== 'function') return
      if (!isActive) toggleArtefact()
    },
    toggleArtefact (artefact, i) {
      if (artefact.type === 'photo' && this.showArtefact && this.mobile) return

      this.selectedIndex = i
      if (this.fullStory) {
        this.setShowArtefact(!this.showArtefact)
      }
    }
  }
}
</script>

<style scoped>

.background {
  background-color: #1E1E1E;
}

::-webkit-scrollbar {
  height: 8px;
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
