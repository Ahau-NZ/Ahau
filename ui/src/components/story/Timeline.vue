<template>
  <div class="">
    <div v-if="showStory" :class="{'showOverlay': showStory && !mobile}"></div>
    <v-row v-show="!showStory">
      <v-col cols="4" :align-self="mobile ? 'center' : 'end'" class="sub-headliner black--text pa-0 pl-4 pt-2">
        {{ t('timeline') }}
      </v-col>
      <v-col cols="1" :class="`pa-0 pl-4 ${mobile ? '' : 'mt-6'}`">
        <TimelineButton v-if="filteredStories && filteredStories.length" @toggle="$emit('toggleTimeline')" :timeline="timeline"/>
      </v-col>
      <v-col
        v-if="filteredStories && filteredStories.length"
        cols="12" md="4" class="mr-auto pa-0 mt-6"
      >
        <v-combobox
          v-model="storySearchString"
          :search-input.sync="storySearchString"
          :menu-props=" { light: true } "
          light
          hide-selected
          hide-details
          dense
          v-bind="customProps"
        >
        </v-combobox>
        <!-- Turning this off for now -->
        <!-- <v-btn @click="toggleFilteredStories" fab x-small color="#241023">
        <v-icon color="white" >mdi-information</v-icon>
        </v-btn> -->
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
              :fullStory="true"
              :story.sync="currentStory"
              :reload="reload"
              @updateDialog="updateDialog($event)"
              @submit="$emit('save', $event)"
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
           {{ t('noStories') }}
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
import TimelineButton from '@/components/button/TimelineButton.vue'

import { mapGetters, mapMutations, mapActions } from 'vuex'

// import { saveStoryMixin, storiesApolloMixin } from '@/mixins/story-mixins'
// import mapProfileMixins from '@/mixins/profile-mixins'

export default {
  name: 'StoryTimeline',
  props: {
    stories: Array,
    title: String,
    reload: Function,
    timeline: Boolean
  },
  components: {
    TimelineCard,
    StoryCard,
    TimelineButton
  },
  // mixins: [
  //   saveStoryMixin,
  //   storiesApolloMixin,
  //   mapProfileMixins({
  //     mapApollo: ['profile']
  //   })
  // ],
  data () {
    return {
      // profile: {},
      // stories: null,
      scrollPosition: 0,
      storySearchString: ''
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
    // ...mapGetters(['whoami']),
    ...mapGetters('archive', ['showStory', 'currentStory']),
    mobile () {
      return this.$vuetify.breakpoint.xs || this.$vuetify.breakpoint.sm
    },
    customProps () {
      return {
        outlined: true,
        appendIcon: '',
        placeholder: 'Search',
        noDataText: 'no suggestions',
        header: null,
        style: 'background-color: white; border-radius: 10px;'
      }
    },
    filteredStories () {
      if (!this.stories) return null
      const filteredStories = this.stories.filter(story => !isEmpty(story.timeInterval))
      if (this.storySearchString) {
        return filteredStories.filter(story => {
          const search = this.setString(this.storySearchString)
          const title = this.setString(story.title)
          const location = this.setString(story.location)

          let mentionsMatch = false
          story.mentions.forEach(mention => {
            mentionsMatch = this.storyProfileMatchesSearch(mention.profile, search)
          })

          let contributorsMatch = false
          story.contributors.forEach(contributor => {
            contributorsMatch = this.storyProfileMatchesSearch(contributor.profile, search)
          })

          return (
            title.includes(search) ||
            mentionsMatch ||
            location.includes(search) ||
            contributorsMatch
          )
        })
      } else return filteredStories
    }
  },
  methods: {
    ...mapMutations(['updateDialog']),
    ...mapActions(['setDialog']),
    ...mapActions('archive', ['setCurrentStory', 'toggleShowStory']),
    updateDialog (dialog) {
      this.$emit('setDialog', dialog)
    },
    toggleStory (story) {
      this.setCurrentStory(story)
      this.toggleShowStory()
      this.setDialog(null)
    },
    storyProfileMatchesSearch (mention, search) {
      const mentionPreferredName = this.setString(mention.preferredName)
      const mentionLegalName = this.setString(mention.legalName)

      let altNameMatch = false
      if (mention.altNames && mention.altNames.length > 0) {
        mention.altNames.forEach(alt => {
          const currName = this.setString(alt)
          if (currName.includes(search)) altNameMatch = true
        })
      }

      return (
        mentionPreferredName.includes(search) ||
        mentionLegalName.includes(search) ||
        altNameMatch
      )
    },
    t (key, vars) {
      return this.$t('timeline.' + key, vars)
    },
    setString (name) {
      if (isEmpty(name)) return ''
      return name.toLowerCase().trim()
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
