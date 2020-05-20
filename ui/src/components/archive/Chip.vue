<template>
  <v-card light tile outlined class="d-inline-block" :min-width="mobile ? '100%' : '300'" :max-width="mobile ? '100%' : '300'" max-height="80" min-height="80" style="overflow: hidden;">
    <v-container class="pa-0">
      <v-row >
        <v-col cols="auto" class="pa-0 pl-3">
          <v-img
            height="80"
            width="100"
            :src="src"
          ></v-img>
        </v-col>
        <v-col class="py-0 pt-2">
          <span class="body-1 truncated-x">{{ title }}</span>
          <p class="caption truncate-overflow">{{ description }}</p>
        </v-col>
        <v-col
          cols="auto"
          class="pa-0"
        >
          <v-btn class="mr-2" small top right icon>
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
    image: Object
  },
  computed: {
    mobile () {
      return this.$vuetify.breakpoint.xs
    },
    src () {
      if (this.image && this.image.uri) return this.image.uri
      return this.image
    }
  }
}
</script>

<style>
.truncated-x {
  overflow: hidden;
  display: block;
  width: 170px;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.truncate-overflow {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
}
</style>
