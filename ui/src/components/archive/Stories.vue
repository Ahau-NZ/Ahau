<template>
  <div>
    <v-row v-show="!showStory">
      <v-col cols="10" class="sub-headliner black--text pa-0 pl-4 pt-2" >
        {{ title }}
      </v-col>
    </v-row>
    <v-row v-if="stories && stories.length > 0">
      <v-col cols="12" xs="12" sm="12" md="9" :class="!showStory ? '':'pa-0'">
        <!-- <v-divider class="mt-6 mb-8" light></v-divider> -->
        <div v-if="!showStory">
          <v-row v-for="(story, i) in stories" :key="`story-${i}-id-${story.id}`">
            <StoryCard @updateDialog="updateDialog($event)" @toggleStory="toggleStory($event)" :story="story" />
          </v-row>
        </div>
        <div v-else>
          <v-row :class="mobile ? 'pa-0': 'px-6 top-margin'">
            <StoryCard
              :fullStory="true"
              :story.sync="currentStory"
              @updateDialog="updateDialog($event)"
              @submit="$emit('save', $event)"
              @close="toggleStory($event)"
              :reload="reload"
            />
          </v-row>
        </div>
      </v-col>
    </v-row>
    <v-row v-else>
      <v-col>
        <div v-if="!stories || (stories && stories.length < 1)">
          <div v-if="!stories">
            <v-card
              :width="mobile ? '100%' : '87%'"
              flat
              :ripple="false"
              light
              v-for="n in 4"
              :key="`skeleton-${n}`"
            >
              <v-skeleton-loader
                :width="mobile ? '100%' : '87%'"
                type="card, card-avatar"
              ></v-skeleton-loader>
            </v-card>
          </div>
          <div v-else
            class="px-8 subtitle-1 grey--text "
            :class="{ 'text-center': mobile }"
          >
            {{ $t('viewArchive.storyNotFound') }}
          </div>
        </div>
      </v-col>
    </v-row>
  </div>
</template>

<script>
import StoryCard from '@/components/archive/StoryCard.vue'
import { mapGetters, mapMutations, mapActions } from 'vuex'

export default {
  name: 'Stories',
  props: {
    stories: Array,
    title: String,
    reload: Function
  },
  components: {
    StoryCard
  },
  watch: {
    showStory (newVal, oldVal) {
      if (oldVal === false && newVal === true) {
        this.scrollPosition = window.pageYOffset
      } else if (oldVal === true && newVal === false) {
        setTimeout(() => {
          window.scrollTo({
            top: this.scrollPosition
          })
        }, 100)
      }
    }
  },
  computed: {
    ...mapGetters(['showStory', 'currentStory']),
    mobile () {
      return this.$vuetify.breakpoint.xs || this.$vuetify.breakpoint.sm
    }
  },
  methods: {
    ...mapMutations(['setStory', 'updateDialog']),
    ...mapActions(['setComponent', 'toggleShowStory', 'setDialog']),
    toggleArchiveHelper () {
      this.showArchiveHelper = !this.showArchiveHelper
    },
    toggleStory (story) {
      this.setStory(story)
      this.toggleShowStory()
      this.setDialog(null)
    },
    cordovaBackButton () {
      if (this.showStory) this.toggleStory()
    }
  },
  t (key, vars) {
    return this.$t('viewArchive.' + key, vars)
  }
}
</script>

<style>
.sub-headliner {
  font-size: 0.8em;
  text-transform: uppercase;
  font-weight: 400;
  letter-spacing: 5px;
}
</style>
