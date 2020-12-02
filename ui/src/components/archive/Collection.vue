<template>
  <v-card
    max-width="250px"
    max-height="370px"
    class="collection ma-2"
    light
    @click="$emit('click')"
  >
    <v-img
      :src="image"
      class="white--text align-end"
      gradient="to bottom, rgba(0,0,0,.1), rgba(0,0,0,.5)"
      height="150px"
    >
      <v-card-title v-text="collection.name"></v-card-title>
    </v-img>
    <v-card-text class="pb-0">
      
      <v-row class="pa-0">
        <v-col cols="6" class="pa-0">
          <v-row>
            <v-col cols="12" class="pa-0 pl-2">
              Records
            </v-col>
            <v-col cols="12" class="pa-0 pt-2 pl-2">
              {{ stories }}
            </v-col>
          </v-row>
        </v-col>
        <v-col cols="6" class="pa-0">
          <v-row>
            <v-col cols="12" class="pa-0 pr-2">
              Last Submission
            </v-col>
            <v-col cols="12" class="pa-0 pt-2 pr-2">
              {{ submissionDate }}
            </v-col>
          </v-row>
        </v-col>
      </v-row>

      <!-- <v-divider class="mt-2"/> -->
    </v-card-text>
  </v-card>
</template>

<script>
import { formatSubmissionDate } from '@/lib/date-helpers.js'
// import AvatarGroup from '@/components/AvatarGroup.vue'
import niho from '@/assets/niho.svg'

export default {
  name: 'Collection',
  props: ['collection', 'selected'],
  // components: { AvatarGroup },
  computed: {
    image () {
      if (this.collection.image && this.collection.image.uri) return this.collection.image.uri
      return niho
    },
    submissionDate () {
      return formatSubmissionDate(this.collection.submissionDate)
    },
    stories () {
      return Math.floor(Math.random() * 10)
    }
  }
}
</script>

<style scoped>
.collection {
  display: inline-block;
  float: none;
}
.small-text {
  font-size: 0.8rem;
  line-height: 0.8rem;
}
</style>
