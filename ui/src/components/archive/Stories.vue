<template>
  <div>
    <v-row v-show="!showStory">
      <v-col cols="4" :align-self="mobile ? 'center' : 'end'" class="sub-headliner black--text pa-0 pl-4 pt-2">
        {{ title }}
      </v-col>
      <v-col cols="1" :class="`pa-0 pl-4 ${mobile ? '' : 'mt-6'}`">
        <TimelineButton v-if="timelineStories.length" @toggle="$emit('toggleTimeline')" :timeline="timeline"/>
      </v-col>
      <v-col
        v-if="stories.length > 0"
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
        <!-- <v-divider class="mt-6 mb-8" light></v-divider> -->
    <v-row v-if="filteredStories && filteredStories.length > 0">
      <v-col cols="12" xs="12" sm="12" md="9" :class="!showStory ? '':'pa-0'">
        <div v-if="!showStory">
          <v-row v-for="(story, i) in filteredStories" :key="`story-${i}-id-${story.id}`">
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
        <div v-if="!filteredStories || (filteredStories && filteredStories.length < 1)">
          <div v-if="!filteredStories">
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
import { isEmpty } from 'lodash-es'
import { mapGetters, mapMutations, mapActions } from 'vuex'

import StoryCard from '@/components/archive/StoryCard.vue'
import TimelineButton from '@/components/button/TimelineButton.vue'

export default {
  name: 'StoriesList',
  props: {
    stories: Array,
    title: String,
    reload: Function,
    timeline: Boolean
  },
  components: {
    StoryCard,
    TimelineButton
  },
  data () {
    return {
      storySearchString: '',
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
      if (!this.storySearchString) return this.stories

      return this.stories.filter(story => {
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
    },
    timelineStories () {
      return this.filteredStories.filter(story => !isEmpty(story.timeInterval))
    }
  },
  methods: {
    ...mapMutations(['updateDialog']),
    ...mapActions(['setDialog']),
    ...mapActions('archive', ['setCurrentStory', 'toggleShowStory']),
    setString (name) {
      if (isEmpty(name)) return ''
      return name.toLowerCase().trim()
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
    toggleFilteredStories () {
      this.$emit('toggleFilteredStories')
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
