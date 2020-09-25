<template>
  <div>
    <v-timeline light dense>

      <v-timeline-item
        class="timeItem py-6"
        v-for="(item, index) in sortedData"
        :key="index"
        :color="getDotColour(item.storyTypeIcon)"
        :icon="item.storyTypeIcon"
        :icon-color="getIconColour(item.storyTypeIcon)"
        right
        small
        light
      >

        <!-- TIMELINE DOT -->
        <template v-slot:icon>
          <!-- <v-avatar v-if="item.img">
            <img :src="item.img">
          </v-avatar> -->
        </template>

        <!-- Date opposite timeline dot (not shown in dense view) -->
        <template v-slot:opposite>
          <span v-if="!mobile" class="opposite-width-force overline">{{formatTimeInterval(item.timeInterval)}}</span>
        </template>
        <!-- <p class="dateTitle">{{formatTimeInterval(item.timeInterval)}}</p> -->

        <v-card
          class="timeCard elevation-2 ma-0 pa-0 "
          @click.prevent="showStory(item)"
          :width="getWidth"

          @mouseenter="unhide(index)"
          @mouseleave="hide()"
        >

        <!-- CONTRIBUTORS TOP CORNER **Hidden** -->
        <!-- <transition
          name="fade"
          v-on:enter="enter(index)"
          v-on:after-leave="afterLeave(index, $event)"
        >
          <v-row v-if="show == index" class="ma-0"  style="height: 50px;">
            <v-list-item class="px-0" style="min-height:0; height:10px">
              <v-list-item-icon v-if="!mobile" class="pt-2 mt-0"
                style="position:absolute; top:5px; right:1px; margin-right:0px;">
                <v-list-item-subtitle class="no-flex">contributors</v-list-item-subtitle>
                <AvatarGroup :profiles="item.contributors.map(c => c.profile)" customClass="ma-0 pa-0 no-wrap"
                  style="position:relative; bottom:15px; left:10px;" :size="mobile ? '25px':'30px'" spacing="pr-1" />
              </v-list-item-icon>
            </v-list-item>
          </v-row>
        </transition> -->

          <v-row class="ma-0">
            <!-- show == index ? item.description : shorten(item.description) -->
            <Chip
              :title="item.title"
              :description="animation == index ? item.description : shorten(item.description)"
              :index="index"
              :type="'story'"
              :chip="item"
              light
              timeline
            />
          </v-row>

        <!-- <transition name="fade"> -->
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
        <!-- </transition> -->

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
    getWidth () {
      if (this.mobile) {
        return '100%'
      } else {
        return '70%'
      }
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
      // if (!this.fullStory) {
      this.$emit('toggleStory', story)
      // }
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
    // afterLeave (index, el) {
    //   this.animation = -1
    // },
    shorten (description) {
      if (description) {
        if (description.length > 120) {
          return description.slice(0, 120) + ' ...'
        } else {
          return description
        }
      }
    }
  }
}
</script>

<style scoped>
  /* .timeItem {
    position:relative;
    left:-95px;
  } */
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

/* test */
/* .v-timeline--dense .v-timeline-item__opposite {
  display: inline-block !important;
} */

/* .v-timeline-item__opposite {
  flex: none;
} */

/* line */
.v-timeline {
  left: 80px;
}

.opposite-width-force {
  display: inline-block !important;
  width: 95px;
  text-align: right;
  color: black
}

</style>
