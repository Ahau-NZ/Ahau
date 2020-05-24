<template>
  <div class="carousel">
    <div class="carousel-show">
      <ArtefactCarouselItem :artefact="displayedArtefact"
        width="100%" height="300px"
        controls
        @delete="removeItem()"
        @update="$emit('update', displayedArtefact)"
        @previous="previous()"
        @next="next()"
        :end="isEndItem(displayedIndex)"
        :start="isStartItem(displayedIndex)"
        selected
        @click=""
      />
    </div>
    <div class="carousel-thumbnail-group mt-2" style="background-color: grey;">
      <ArtefactCarouselItem v-for="(artefact, i) in artefacts" :key="`carousel-item-${i}-${artefact.id}`"
        :artefact="artefact"
        :end="isEndItem(i)"
        @click="showArtefact(artefact, i)"
        :selected="(displayedIndex === i)"
      />
    </div>
  </div>
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
    }
  },
  components: { ArtefactCarouselItem },
  data () {
    return {
      displayedArtefact: this.artefacts[0],
      displayedIndex: 0,
      componentLoaded: false
    }
  },
  mounted () {
    this.componentLoaded = true
  },
  methods: {
    showArtefact (artefact, i) {
      this.displayedArtefact = artefact
      this.displayedIndex = i
    },
    removeItem () {
      this.$emit('delete', this.displayedIndex)
      this.showArtefact(this.artefacts[0], 0)
    },
    previous () {
      // if (this.isStartItem(this.displayedIndex)) return
      this.displayedIndex--
      this.showArtefact(this.artefacts[this.displayedIndex], this.displayedIndex)
    },
    next () {
      // if (this.isStartItem(this.displayedIndex)) return
      this.displayedIndex++
      this.showArtefact(this.artefacts[this.displayedIndex], this.displayedIndex)
    },
    isEndItem (i) {
      if (i === (this.artefacts.length - 1)) return true
      return false
    },
    isStartItem (i) {
      if (i === 0) return true
      return false
    }
  }
}
</script>
<style scoped>
.carousel {
  width: 100%;
}
.container {
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
  /* transform: translate(-50%, -50%);
  -webkit-transform: translate(-50%, -50%); */
}
.edit {
  position: absolute;
  top: 2px;
  right: 40px;
  /* transform: translate(-50%, -50%);
  -webkit-transform: translate(-50%, -50%); */
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
  height: 105px;
}
.v-card {
  transition: opacity .4s ease-in-out;
}

.v-card:not(.on-hover) {
  opacity: 0.8;
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
