<template>
  <div class="px-2">
    <div v-if="showStory" :class="{'showOverlay': showStory && !mobile}"></div>

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
        <div v-if="!filteredStories || (filteredStories && filteredStories.length < 1)">
          <div v-if="!filteredStories">
              <v-card
                :width="mobile ? '100%' : '87%'"
                flat
                :ripple="false"
                light
                v-for="n in 4"
                :key="`skeleton-${n}`"
                :class="mobile ? 'py-12' : 'pl-12 py-12'"
              >
                <v-skeleton-loader
                  :width="mobile ? '100%' : '87%'"
                  type="list-item-avatar-three-line"
                ></v-skeleton-loader>
              </v-card>
          </div>
          <div v-else
            class="px-8 subtitle-1 grey--text "
            :class="{ 'text-center': mobile }"
          >
            No stories found in this profile. Please add a story to this profile via Archive
          </div>
        </div>
      </v-col>
    </v-row>
  </div>
</template>

<script>
import TimelineCard from '@/components/story/TimelineCard'
import StoryCard from '@/components/archive/StoryCard.vue'
import isEmpty from 'lodash.isempty'

import { mapGetters, mapActions } from 'vuex'

import { saveStoryMixin, storiesApolloMixin } from '@/mixins/story-mixins.js'
import mapProfileMixins from '@/mixins/profile-mixins.js'

export default {
  name: 'Timeline',
  components: {
    TimelineCard,
    StoryCard
  },
  mixins: [
    saveStoryMixin,
    storiesApolloMixin,
    mapProfileMixins({
      mapApollo: ['profile']
    })
  ],
  data () {
    return {
      profile: {},
      stories: null,
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
    ...mapGetters(['showStory', 'currentStory', 'whoami']),
    mobile () {
      return this.$vuetify.breakpoint.xs || this.$vuetify.breakpoint.sm
    },
    filteredStories () {
      if (!this.stories) return null
      return this.stories.filter(story => !isEmpty(story.timeInterval))
    }
  },
  methods: {
    ...mapActions(['setDialog']),
    updateDialog (dialog) {
      this.$emit('setDialog', dialog)
    }
  }
}
</script>
<style lang="scss">

  .v-timeline {
    padding-top:0px
  }

  .v-timeline-item__divider {
    @media screen and (max-width: 420px) {
      right: 6px;
      min-width: 0;
    }
  }

  .v-timeline--dense .v-timeline-item__body {
    @media screen and (max-width: 420px) {
      max-width: calc(100% - 66px);
    }
  }

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
