<template>
  <v-card :color="colour" dark tile class="d-inline-block related-tile" :min-width="mobile ? '100%' : '300'" :max-width="mobile ? '100%' : '300px'" max-height="60" min-height="60" style="overflow: hidden;">
    <v-container class="pa-0">
      <v-row >
        <v-col cols="auto" class="pa-0 pl-3">
          <v-img
            v-if="thumbnail"
            height=60
            width="80"
            :src="src"
          ></v-img>
          <v-card height=60 width="80" v-else style="background-color:#383838">
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
    index: Number
  },
  computed: {
    colour () {
      var i = Math.round(Math.random() * 10)
         return colours[i]
    },
    mobile () {
      return this.$vuetify.breakpoint.xs
    },
    thumbnail () {
      if (this.chip.image) return true
      else if (this.type === 'story' && this.chip.artefacts.length && this.chip.artefacts[0].type === 'photo') return true
      else return false  
    },
    // src () {
    //   if (this.chip.image && this.chip.image.uri) return this.chip.image.uri
    //   else if (this.type === 'story') {
    //     console.log("story")
    //     let artefacts = this.chip.artefacts
    //     console.log(artefacts)
    //     if (artefacts[0].type === 'photo') {
    //       this.thumbnail = true
    //       return artefacts[0].blob
    //     }
    //   }
    //   return this.chip.image
    // }
    src () {
      if (this.chip.image && this.chip.image.uri) return this.chip.image.uri
      else if (this.type === 'story') return this.chip.artefacts[0].blob
      return this.chip.image
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
