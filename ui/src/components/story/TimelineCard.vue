<template>
  <div>
    <v-timeline light dense :class="mobile ? 'mobile-time-line':'time-line'">

      <v-timeline-item
        class="py-6"
        :class="{ 'desktop-timeItem': !mobile }"
        v-for="(item, index) in sortedData"
        :key="index"
        :color="getDotColour(item.storyTypeIcon)"
        :icon="item.storyTypeIcon"
        :icon-color="getIconColour(item.storyTypeIcon)"
        right
        small
        light
      >
        <!-- Date opposite timeline dot (not shown in mobile view) -->
        <template v-slot:opposite>
          <span v-if="!mobile" class="opposite-width-force overline" :class="{'opposite-desktop': !mobile}">
            {{formatTimeInterval(item.timeInterval)}}
          </span>
        </template>
        <p v-if="mobile" class="dateTitle">{{formatTimeInterval(item.timeInterval)}}</p>
        <v-card
          class="timeCard ma-0 pa-0 rounded-border"
          flat
          @click.prevent="showStory(item)"
          @mouseenter="unhide(index)"
          @mouseleave="hide()"
        >
          <v-row class="ma-0">
            <Chip
              :title="item.title"
              :description="item.description"
              :index="index"
              :type="'story'"
              :chip="item"
              light
              expanded
            />
          </v-row>
          <v-card-actions v-if="show == index" class="pt-0">
            <v-row class="px-4">
              <v-col v-if="item.mentions && item.mentions.length > 0" style="height: 100px; ">
                <v-list-item-subtitle style="color:#a7a3a3">Mentions</v-list-item-subtitle>
                <AvatarGroup
                  style="position:relative; bottom:15px; right:15px"
                  :profiles="item.mentions.map(m => m.profile)"
                  show-labels :size="'30px'"
                  spacing="pr-2"
                />
              </v-col>
              <v-col v-if="mobile && item.contributors && item.contributors.length > 0" style="height: 100px;">
                <v-list-item-subtitle style="color:#a7a3a3">Contributors</v-list-item-subtitle>
                <AvatarGroup
                  style="position:relative; bottom:15px; right:15px"
                  :profiles="item.contributors.map(m => m.profile)"
                  show-labels :size="'30px'"
                  spacing="pr-2"
                  customClass="no-wrap pa-2 pl-4"
                />
              </v-col>
              <v-col v-if="item.location" class="pt-0" cols="12" sm="12" >
                <v-list-item-subtitle style="color:#a7a3a3" class="ms-5 pa-0 pb-1">Location</v-list-item-subtitle>
                <p class="mt-3 mb-5 ms-5">{{ item.location }}</p>
              </v-col>
              <v-col v-if="item.access && item.access.length > 0" cols="12" sm="12" >
                <v-list-item-subtitle style="color:#a7a3a3">Access</v-list-item-subtitle>
                <AvatarGroup
                  style="position:relative; bottom:15px;"
                  :profiles="item.access.map(m => m.profile)"
                  show-labels :size="fullStory ? '50px': '30px'"
                  spacing="pr-2"
                  @profile-click="openProfile($event)"
                  :clickable="fullStory"
                />
              </v-col>
            </v-row>
          </v-card-actions>
        </v-card>
      </v-timeline-item>
    </v-timeline>
  </div>
</template>

<script>
import AvatarGroup from '@/components/AvatarGroup.vue'
import Chip from '@/components/archive/Chip.vue'

import { mapGetters } from 'vuex'
import { yearMonthDay, convertToTime } from '@/lib/date-helpers.js'

export default {
  props: ['data'],
  components: {
    AvatarGroup,
    Chip
  },
  data: () => ({
    show: -1,
    animation: -1
  }),
  computed: {
    ...mapGetters(['showArtefact']),
    mobile () {
      return this.$vuetify.breakpoint.xs
    },
    sortedData () {
      var sortedData = this.sortDesc(this.data)
      return sortedData
    }

  },
  methods: {
    sortDesc (data) {
      var sortDescending = data.sort((a, b) => convertToTime(a.timeInterval) - convertToTime(b.timeInterval))
      return sortDescending
    },
    getDotColour (iconType) {
      return '#b12526'
    },
    getIconColour (iconType) {
      return '#ffffff'
    },
    formatTimeInterval (date) {
      return yearMonthDay(date)
    },
    showStory (story) {
      this.$emit('toggleStory', story)
    },
    // hide methods animate the card, contributor, mentions
    unhide (cardIndex) {
      this.show = cardIndex
    },
    hide () {
      this.show = -1
    },
    // enter and leave methods animate the description shorten
    enter (index) {
      this.animation = index
    },
    afterLeave (index, el) {
      this.animation = -1
    }
  }
}
</script>

<style scoped>
  .rounded-border {
    border: 0.5px solid rgba(0,0,0,0.3);
    border-radius: 10px;
    background-color: white;
  }

  .desktop-timeItem {
    position:relative;
    left:-95px;
  }

  .timeCard {
    overflow:hidden;
    min-height: 100px;
    height: auto;
    max-height: 100px;
    transition: all 0.9s ease-in-out;
  }

  .timeCard:hover {
    max-height: 1000px;
  }

  .relativeCorner {
    position: absolute;
    top: 0;
    right: 0;
  }

  .people-circle {
    width: 50px;
    margin: 5px;
    border-radius: 50%;
    background-color: lightgrey;
    background-position-y: 10px;
  }

  .mobileTitle
  .timelineDate {
    font-size: 1rem !important;
    line-height: 1.5rem;
    font-weight: 400;
    margin: 0;
    padding: 0px 25px;
    word-break: normal;
    color: rgba(0, 0, 0, 0.6)
  }

  .dateTitle {
    font-size: 0.8em;
    text-transform: uppercase;
    font-weight: 400;
    letter-spacing: 2px;
    color: rgba(0, 0, 0, 0.5)
  }

  .fade-enter-active, .fade-leave-active {
    transition: all 0.7s ease-in-out;
  }

  .fade-enter,
  .fade-leave-to {
    opacity: 0;
    transform: translateY(30px);
  }

  .time-line {
    left: 80px;
  }

  .mobile-time-line {
    right: 20px;
  }

  .opposite-width-force {
    display: inline-block !important;
    width: 95px;
    text-align: right;
    color: black;
    flex: none
  }

  .desktop-opposite {
    position: relative;
    left:90px;
  }

</style>
