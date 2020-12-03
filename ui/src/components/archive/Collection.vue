<template>
  <v-card
    max-width="210px"
    max-height="310px"
    light
    class="pa-0 ma-1 "
    :to="goCollectionShow()"
  >
    <v-img
      :src="image"
      class="white--text align-end"
      gradient="to bottom, rgba(0,0,0,.1), rgba(0,0,0,.5)"
      height="150px"
    >
    </v-img>
    <!-- <v-card-text class="pb-0"> -->
      <v-row class="px-3">
        <v-col cols="12" class="truncate title grey--text body-2 font-weight-medium">
          {{ collection.name || 'Untitled Collection' }}
        </v-col>
        <v-col cols="12" class="py-0 truncate description">
          <div class="small-text">{{ collection.description || 'No Description' }}</div>
        </v-col>
        <v-col cols="5" class="small-text grey--text py-2">
          Records: N/A
        </v-col>
        <v-col cols="7" class="small-text grey--text py-2">
          Last Submission: {{ submissionDate }}
        </v-col>
        <v-col cols="12" class="small-text grey--text py-0" >
          Kaitiaki
          <AvatarGroup :profiles="collection.tiaki" size="30" customClass="pa-0" showLabels/>
        </v-col>
      </v-row>

      <!-- <v-divider class="mt-2"/> -->
    <!-- </v-card-text> -->
  </v-card>
</template>

<script>
import { formatSubmissionDate } from '@/lib/date-helpers.js'
import AvatarGroup from '@/components/AvatarGroup.vue'
import niho from '@/assets/niho.svg'

export default {
  name: 'Collection',
  props: ['collection', 'selected'],
  components: { AvatarGroup },
  computed: {
    image () {
      if (this.collection.image && this.collection.image.uri) return this.collection.image.uri
      return niho
    },
    submissionDate () {
      return formatSubmissionDate(this.collection.submissionDate)
    }
  },
  methods: {
    goCollectionShow () {
      return {
        name: this.$route.name + '/:collectionId',
        params: {
          collectionId: this.collection.id
        }
      }
    }
  }
}
</script>

<style scoped lang=scss>
/* .small-text {
  font-size: 0.8rem;
  line-height: 0.8rem;
} */

.small-text {
  font-size: 0.6rem;
  line-height: 0.6rem;
}

.truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  &.title {
    height: 35px;
    -webkit-line-clamp: 1;
  }
  &.description {
    height: 28px;
    -webkit-line-clamp: 3;
  }
}
</style>
