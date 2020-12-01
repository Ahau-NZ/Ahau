<template>
  <v-card max-width="250px" max-height="370px" class="collection ma-2" light @click="$emit('click')">
    <v-img
      :src="image"
      class="white--text align-end"
      gradient="to bottom, rgba(0,0,0,.1), rgba(0,0,0,.5)"
      height="150px"
    >
      <v-card-title v-text="collection.name"></v-card-title>
    </v-img>
    <v-card-subtitle class="py-2" v-text="collection.description"></v-card-subtitle>
    <!-- <v-card-text class="pb-0"> -->
      <!-- <v-row> -->
        <!-- <v-col>
          Records:
        </v-col> -->
          <!-- <v-row>
            <div>
              Records:
            </div>
          </v-row>
          <v-row>
            <div>
              {{ stories }}
            </div>
          </v-row>
        </v-col> -->
        <!-- <v-col class="small-text pr-6 pl-6 pb-0" cols="7">
          <v-row justify="end">
            <div>
              Last submission:
            </div>
          </v-row>
          <v-row justify="end">
            <div>
              {{ submissionDate }}
            </div>
          </v-row>
        </v-col> -->
      <!-- </v-row> -->

      <!-- <v-divider class="mt-2"/> -->
    <!-- </v-card-text> -->
  </v-card>
</template>

<script>
import { formatSubmissionDate } from '@/lib/date-helpers.js'
// import AvatarGroup from '@/components/AvatarGroup.vue'
import niho from '@/assets/niho.svg'

export default {
  name: 'Collection',
  props: ['collection'],
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
