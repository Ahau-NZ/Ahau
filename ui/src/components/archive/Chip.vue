<template>
  <v-card light tile outlined class="d-inline-block rounded-corners" :min-width="mobile ? '100%' : '300'" :max-width="mobile ? '100%' : '300px'" max-height="60" min-height="60" style="overflow: hidden;">
    <v-container class="pa-0">
      <v-row >
        <v-col cols="auto" class="pa-0 pl-3">
          <v-img
            height=60
            width="80"
            :src="src"
          ></v-img>
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
export default {
  name: 'Chip',
  props: {
    title: String,
    description: String,
    // image: Object,
    deletable: Boolean,
    type: String,
    chip: Object
  },
  computed: {
    mobile () {
      return this.$vuetify.breakpoint.xs
    },
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

.rounded-corners {
  border-radius: 10px;
}
</style>
