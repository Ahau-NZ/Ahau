<template>
  <v-container class="pa-0 background">
    <v-carousel v-model="selectedIndex" hide-delimiters style="width: 100vw;">
      <v-carousel-item v-for="(artefact, i) in artefacts" :key="`a-c-${i}`" transition="fade-transition"
        style="width:100%;"
      >
        <ArtefactCarouselItem 
          :artefact="artefact"
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
        style="width:100px;height:100px; background-color:rgba(30,30,30)"
        class="pa-1"
      >
        <v-scale-transition>
          <ArtefactCarouselItem :artefact="artefact"
            :selected="active"
            @click="toggle"
          />
        </v-scale-transition>
      </v-slide-item>
      <div class="mt-10 ml-10">
        <input v-show="false" ref="fileInput" type="file" accept="audio/*,video/*,image/*" multiple @change="processMediaFiles($event)" />
        <AddButton dark size="30px" icon="mdi-image-plus" iconClass="pr-12" class="right: 0;" @click="$refs.fileInput.click()" label=""/>
      </div>
    </v-slide-group>
  </v-container>
</template>

<script>
import ArtefactCarouselItem from '@/components/archive/ArtefactCarouselItem.vue'
import AddButton from '@/components/button/AddButton.vue'

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
    ArtefactCarouselItem,
    AddButton
  },
  data () {
    return {
      selectedIndex: this.index
    }
  },
  watch: {
    index (newValue) {
      this.selectedIndex = newValue
    },
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
    processMediaFiles (event) {
      this.$emit('processMediaFiles', event)
    },
    removeItem () {
      this.$emit('delete', this.index)
      this.showArtefact(this.artefacts[0], 0)
    }
  }
}
</script>
<style scoped>
/* .container {
  position: relative;
  padding: 0;
  margin: 0;
  height: 100%;
  width: 100%;
  background-color: #121212;
}

.center {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  -webkit-transform: translate(-50%, -50%);
}
.close {
  position: absolute;
  top: 2px;
  right: 2px;
}
.edit {
  position: absolute;
  top: 2px;
  right: 40px;
}
.constraints {
  width: 100px;
  height: 100px;
  background-color: #121212;
}

.center-button {
  display: flex;
  align-items: center;
  justify-content: center;
}

.carousel-show {
  width: 100%;
  height: 300px;
}

.carousel-thumbnail-group {
  display: flex;
  flex-direction: row;
  overflow-x: auto;
  width: 100%;
  height: 130px;
}
.v-card {
  transition: opacity .4s ease-in-out;
}

.v-card:not(.on-hover) {
  opacity: 0.8;
 }

.show-btns {
  color: rgba(255, 255, 255, 1) !important; */

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
