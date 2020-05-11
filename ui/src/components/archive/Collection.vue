<template>
  <v-card max-width="200px" max-height="370px" class="collection ma-2" light>
    <v-img
      :src="collection.image"
      class="white--text align-end"
      gradient="to bottom, rgba(0,0,0,.1), rgba(0,0,0,.5)"
      height="150px"
    >
      <v-card-title v-text="collection.title"></v-card-title>
    </v-img>
    <v-card-subtitle class="py-2" v-text="collection.description"></v-card-subtitle>
    <v-card-text class="pb-0">
      <v-row >
        <v-col class="small-text pl-6 pb-0" cols="5">
          <v-row>
            <div >
              Records:
            </div>
          </v-row>
          <v-row>
            <div>
              {{ collection.stories.length }}
            </div>
          </v-row>
        </v-col>
        <v-col class="small-text pr-6 pl-6 pb-0" cols="7">
          <v-row justify="end">
            <div>
              Last submission:
            </div>
          </v-row>
          <v-row justify="end">
            <div>
              {{ formatSubmissionDate(collection.lastSubmissionDate) }}
            </div>
          </v-row>
        </v-col>
      </v-row>

      <v-divider class="mt-2"/>
      <AvatarGroup :profiles="collection.hasAccess" group-title="Access" size="40px" :show-labels="true" />
    </v-card-text>
  </v-card>
</template>

<script>
import formatDate from '@/lib/format-date.js'
import AvatarGroup from '@/components/AvatarGroup.vue'

export default {
  name: 'Collection',
  props: ['collection'],
  components: { AvatarGroup },
  methods: {
    formatSubmissionDate (date) {
      return formatDate(date)
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
  font-size: 0.6rem;
  line-height: 0.6rem;
}
</style>
