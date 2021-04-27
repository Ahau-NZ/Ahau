<template>
  <Dialog :title="t('titleArchive')" :show="show" @close="close" :width="`700px`" :goBack="close">
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
  </Dialog>
</template>

<script>
import Dialog from '@/components/dialog/Dialog.vue'

export default {
  props: {
    show: { type: Boolean, required: true }
  },
  name: 'WhakapapaListHelper',
  data () {
    return {
      items: [
        { src: require('../../../assets/images/add-record.png'),
          text: this.t('itemsStories') },
        { src: require('../../../assets/images/edit-artefact.png'),
          text: this.t('itemsArtefacts') },
        { src: require('../../../assets/images/view-archive.png'),
          text: this.t('itemsViewAll') },
        { src: require('../../../assets/images/view-story.png'),
          text: this.t('itemsIndividual') }
      ],
      mobileItems: [
        { src: require('../../../assets/images/mobile-add-record.png'),
          text: this.t('itemsStories') },
        { src: require('../../../assets/images/mobile-edit-artefact.png'),
          text: this.t('itemsArtefacts') },
        { src: require('../../../assets/images/mobile-view-archive.png'),
          text: this.t('itemsViewAll') }
      ]
    }
  },
  components: {
    Dialog
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
