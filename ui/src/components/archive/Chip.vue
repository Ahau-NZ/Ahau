<template>
  <v-card rounded :color="colour" dark class="d-inline-block related-tile" :min-width="mobile ? '100%' : '300'" :max-width="mobile ? '100%' : '300px'" max-height="60" min-height="60" style="overflow: hidden;">
    <v-container class="pa-0">
      <v-row >
        <v-col cols="auto" class="pa-0 pl-3">
          <v-img
            v-if="hasImage"
            height=60
            width="80"
            :src="getImage"
          >
          </v-img>
          <v-card v-else height=60 width="80" style="background-color:#383838">
            <v-icon x-large class="pl-5 pt-2">mdi-book-open</v-icon>
          </v-card>
        </v-col>
        <v-col class="py-0">
          <span class="truncated-x">{{ title }}</span>
          <p class="truncate-overflow">{{ description }}</p>
        </v-col>
        <v-col
          cols="auto"
          class="pa-0"
        >
          <v-btn v-if="deletable" @click="$emit('delete')" class="mr-2" small top right icon>
            <v-icon small>mdi-close</v-icon>
          </v-btn>
        </v-col>
      </v-row>
    </v-container>
  </v-card>
</template>

<script>
import { colours } from '@/lib/colours.js'
export default {
  name: 'Chip',
  props: {
    title: String,
    description: String,
    deletable: Boolean,
    type: String,
    chip: Object,
    index: Number,
    image: { type: Object, default: null }
  },
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
          return artefact.uri
        }
      }
      return null
    }
  }
}
</script>

<style>
.truncated-x {
  overflow: hidden;
  display: block;
  width: 140px;
  white-space: nowrap;
  text-overflow: ellipsis;
  font-size: 12px;
}

.truncate-overflow {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  font-size: 10px;
  width: 170px;
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
</style>
