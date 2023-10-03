<template>
  <DialogContainer :title="t('titleArchive')" :show="show" @close="close" :width="`700px`" :goBack="close">
    <template v-slot:content>
      <v-card-text class="pt-4">
        <p>{{ t('archiveDescription') }}</p>
        <p>
          {{ t('storyDescription') }}
        </p>
        <p>
          {{ t('archiveTypes') }}
          <ul>
            <li>{{ t('personalArchive') }}</li>
            <li>{{ t('whanauArchive') }}</li>
          </ul>
        </p>
        <p>
          {{ t('createRecord') }}
        </p>
      </v-card-text>
      <v-divider />
      <p>
          {{ t('exampleImages') }}
      </p>
      <v-carousel hide-delimiters height="100%">
        <v-tooltip
          v-for="(item,i) in examples"
          :key="i" top>
          <template v-slot:activator="{ on }">
            <v-carousel-item
              v-on="on"
              :src="item.src"
              style="background-size:contain"
            ></v-carousel-item>
          </template>
          <span> {{item.text}} </span>
        </v-tooltip>
      </v-carousel>
    </template>
    <template v-slot:actions>
      <v-col :align="mobile ? 'center' : 'end'" class="py-0">
        <v-btn
          text
          @click="close"
        >
          {{ t('close') }}
        </v-btn>
      </v-col>
    </template>
  </DialogContainer>
</template>

<script>
import addRecordURL from '@/assets/images/add-record.webp'
import editArtefactURL from '@/assets/images/edit-artefact.webp'
import viewArchiveURL from '@/assets/images/view-archive.webp'
import viewStoryURL from '@/assets/images/view-story.webp'

import mobileAddRecordURL from '@/assets/images/mobile-add-record.webp'
import mobileEditArtefactURL from '@/assets/images/mobile-edit-artefact.webp'
import mobileViewArchiveURL from '@/assets/images/mobile-view-archive.webp'

export default {
  props: {
    show: { type: Boolean, required: true }
  },
  name: 'WhakapapaListHelper',
  data () {
    return {
      items: [
        { src: addRecordURL, text: this.t('itemsStories') },
        { src: editArtefactURL, text: this.t('itemsArtefacts') },
        { src: viewArchiveURL, text: this.t('itemsViewAll') },
        { src: viewStoryURL, text: this.t('itemsIndividual') }
      ],
      mobileItems: [
        { src: mobileAddRecordURL, text: this.t('itemsStories') },
        { src: mobileEditArtefactURL, text: this.t('itemsArtefacts') },
        { src: mobileViewArchiveURL, text: this.t('itemsViewAll') }
      ]
    }
  },
  computed: {
    mobile () {
      return this.$vuetify.breakpoint.xs
    },
    examples () {
      if (this.mobile) return this.mobileItems
      return this.items
    }
  },
  methods: {
    cordovaBackButton () {
      this.close()
    },
    close () {
      this.$emit('close')
    },
    t (key, vars) {
      return this.$t('instructionsStory.' + key, vars)
    }
  }
}
</script>
<style scoped>
.image {
  display: block;
  margin-left: auto;
  margin-right: auto;
  width: auto;
  height:auto
}
</style>
