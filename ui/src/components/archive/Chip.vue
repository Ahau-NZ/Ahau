<template>
  <v-card
    :flat="expanded"
    :color="expanded ? 'none' : colour"
    :dark="!expanded"
    tile
    class="d-inline-block related-tile pa-0"
    :min-width="width"
    :max-width="width"
    :max-height="expanded ? 'auto' : '60'"
    :min-height="expanded ? '100' : '60'"
    :class="expanded ? 'ma-0': 'ma-1'"

    @click="showRelatedStory"

  >
    <v-container fluid class="pa-0" >
      <v-row class="ma-0">
        <!-- Image -->
        <v-col :cols="expanded ? '4': 'auto'" md="2" class="pa-0">
          <v-img
            v-if="hasImage"
            :height="expanded ? '100' : '60'"
            :width="expanded ? '100' : '80'"
            :src="getImage"
            :class="expanded ? 'ma-0' : ''"
          >
          </v-img>
        </v-col>
        <!-- Text Container -->
        <v-col class="py-2" :cols="expanded && !hasImage ? '12' : expanded && mobile ? '8': '10' ">
          <span :class="expanded ? 'expanded-title' : 'truncated-x'">{{ title }}</span>
          <p :class="expanded ? 'expanded-description my-2' : 'truncate-overflow'"> {{ description }}</p>
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
import { mapMutations } from 'vuex'
import mapStoryMixins from '@/mixins/story-mixins.js'

export default {
  name: 'Chip',
  props: {
    title: String,
    description: String,
    deletable: Boolean,
    type: String,
    chip: Object,
    index: Number,
    expanded: { type: Boolean, default: false },
    image: { type: String, default: null }
  },
  mixins: [
    mapStoryMixins({
      mapMethods: ['getStory']
    })
  ],
  computed: {
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
    width () {
      if (this.expanded) {
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
    async showRelatedStory () {
      if (this.deletable) return
      var story = await this.getStory(this.chip.id)
      this.setStory(story)
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

.expanded-title {
  font-size: 1em;
  font-weight: 400;
  color: rgba(0,0,0,0.87);
}

.expanded-description {
  font-size: 0.9em;
  font-weight: 300;
  color: #383838;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
