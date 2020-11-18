<template>
  <div class="px-2">
    <div :class="{'showOverlay': showStory && !mobile}"></div>

    <v-row v-if="!showStory" class="top-margin mb-5">
      <v-col class="headliner black--text pa-0 pl-4 pt-2">
        Timeline
      </v-col>
    </v-row>

    <v-row v-if="filteredStories && filteredStories.length > 0" >
      <v-col cols="12" sm="12" md="9" :class="!showStory ? '':'pa-0'">
        <div v-if="!showStory">
          <TimelineCard :data="filteredStories" @toggleStory="toggleStory($event)" />
        </div>
        <!-- Full story view -->
        <div v-else>
          <v-row :class="mobile ? 'pa-0': 'px-6 top-margin'">
            <StoryCard
              @updateDialog="updateDialog($event)"
              :fullStory="true"
              :story.sync="currentStory"
              @submit="saveStory($event)"
              @close="toggleStory($event)"
            />
          </v-row>
        </div>
      </v-col>
    </v-row>
    <v-row v-else>
      <v-col>
        <div class="px-8 subtitle-1 grey--text " :class="{ 'text-center': mobile }">
          No records found in this profile. Please add record to this profile via Archive
        </div>
      </v-col>
    </v-row>
  </div>
</template>

<script>
import TimelineCard from '@/components/story/TimelineCard'
import StoryCard from '@/components/archive/StoryCard.vue'
import isEmpty from 'lodash.isempty'

import { mapGetters, mapActions, mapMutations } from 'vuex'

import mapStoryMixins from '@/mixins/story-mixins.js'

export default {
  name: 'Timeline',
  props: {
    profile: {
      type: Object
    }
  },
  components: {
    TimelineCard,
    StoryCard
  },
  mixins: [
    mapStoryMixins({
      mapMethods: ['saveStory', 'processLinks', 'saveArtefact', 'getStory', 'saveLink', 'removeLink'],
      mapApollo: ['stories']
    })
  ],
  data () {
    return {
      stories: [],
      scrollPosition: 0
    }
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
    ...mapGetters(['currentProfile', 'showStory', 'currentStory', 'whoami']),
    mobile () {
      return this.$vuetify.breakpoint.xs || this.$vuetify.breakpoint.sm
    },
    filteredStories () {
      return this.stories.filter(story => !isEmpty(story.timeInterval))
    }
  },
  methods: {
    ...mapMutations(['setStory']),
    ...mapActions(['setShowStory', 'setDialog', 'getAllStories']),
    updateDialog (dialog) {
      this.$emit('setDialog', dialog)
    },

    toggleStory (story) {
      this.setStory(story)
      this.setShowStory()
      this.setDialog(null)
    }
  }
}
</script>
<style lang="scss">

  .top-margin {
    margin-top: 80px
  }

  .headliner {
    font-size: 1em;
    text-transform: uppercase;
    font-weight: 400;
    letter-spacing: 5px;
  }

  .addBtn {
    position: fixed;
    top: 80px;
    right: 100px
  }

  .addBtnMob {
    position: absolute;
    top: 80px;
    right: 20px
  }

  .showOverlay {
    z-index: 1;
    height: 100%;
    width: 100%;
    position: fixed;
    overflow: auto;
    top: 0px;
    left: 0px;
    background: rgba(0, 0, 0, 0.81);
  }

</style>
