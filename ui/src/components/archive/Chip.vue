<template>
  <v-card
    :flat="timeline"
    :color="timeline ? 'none' : colour"
    :dark="!timeline"
    tile
    class="d-inline-block related-tile pa-0"
    :min-width="getWidth"
    :max-width="getWidth"
    :max-height="timeline ? 'auto' : '60'"
    :min-height="timeline ? '100' : '60'"
    :class="timeline ? 'ma-0': 'ma-1'"

    @click="showRelatedStory"

  >
    <v-container fluid class="pa-0" >
      <v-row class="ma-0">
        <!-- Image -->
        <v-col :cols="timeline ? '4': 'auto'" md="2" class="pa-0">
          <v-img
            v-if="hasImage"
            :height="timeline ? '100' : '60'"
            :width="timeline ? '100' : '80'"
            :src="getImage"
            :class="timeline ? 'ma-0' : ''"
          >
          </v-img>
          <v-card v-else height="60" width="80" style="background-color:#383838">
            <v-icon x-large class="pl-1 pt-2">mdi-book-open</v-icon>
          </v-card>
        </v-col>
        <!-- Text Container -->
        <v-col class="py-2" :cols="timeline && !hasImage ? '12' : timeline && mobile ? '8': '10' ">
          <div v-if="!timeline">
            <span class="truncated-x">{{ title }}</span>
            <p class="truncate-overflow">{{ description }}</p>
          </div>
          <div v-else>
            <span class="timeline-title">{{ title }}</span>
            <p class="timeline-description my-2">{{ description }}</p>
          </div>
          <v-btn v-if="deletable" @click="$emit('delete')" class="mr-2 white--text" style="position:absolute; top:-2px; right:-10px" small top right icon>
            <v-icon small>mdi-close</v-icon>
          </v-btn>
        </v-col>
      </v-row>
    </v-container>
  </v-card>
</template>

<script>
import { colours } from '@/lib/colours.js'
import { mapMutations, mapGetters } from 'vuex'
export default {
  name: 'Chip',
  props: {
    title: String,
    description: String,
    deletable: Boolean,
    type: String,
    chip: Object,
    index: Number,
    timeline: { type: Boolean, default: false },
    image: { type: String, default: null }
  },
  computed: {
    ...mapGetters(['stories']),
    colour () {
      var i = Math.round(Math.random() * 10)
      return colours[i]
    },
    mobile () {
      return this.$vuetify.breakpoint.xs
    },
    hasImage () {
      if (this.image) return true
      if (this.chip.image && this.chip.uri) return true
      else if (this.type === 'story' && this.chip.artefacts && this.chip.artefacts.length > 0) {
        var artefact = this.chip.artefacts[0].artefact
        if (artefact.type === 'photo') {
          return true
        }
      }
      return false
    },
    getImage () {
      if (this.image) return this.image
      if (this.chip.image && this.chip.uri) return this.chip.uri
      else if (this.type === 'story' && this.chip.artefacts && this.chip.artefacts.length > 0) {
        var artefact = this.chip.artefacts[0].artefact
        if (artefact.type === 'photo') {
          return artefact.blob.uri
        }
      }
      return null
    },
    getWidth () {
      if (this.timeline) {
        return '100%'
      } else if (this.mobile) {
        return '100%'
      } else {
        return '300'
      }
    }
  },
  methods: {
    ...mapMutations(['setStory']),
    showRelatedStory () {
      if (this.deletable) return
      var story = this.stories.find(story => story.id === this.chip.id)
      this.setStory(story)
      window.scrollTo(0, 0)
    }
  }
}
</script>

<style>
.truncated-x {
  overflow: hidden;
  display: block;
  width: 200px;
  white-space: nowrap;
  text-overflow: ellipsis;
  font-size: 12px;
}

.truncate-overflow {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  font-size: 10px;
  width: 200px;
  overflow: hidden;
}

.related-tile {
  border-radius: 10px;
  text-decoration-color: white;
}

.center {
  justify-content: center;
  align-content: center;
}

.timeline-title {
  font-size: 1em;
  font-weight: 400;
  color: rgba(0,0,0,0.87);
}

.timeline-description {
  font-size: 0.9em;
  font-weight: 300;
  color: #383838;
}
</style>
