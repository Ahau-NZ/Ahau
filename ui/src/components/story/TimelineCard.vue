<template>
  <div>
    <v-timeline align-start justify-start dense light>
      <v-timeline-item v-for="(item, index) in data.slice().reverse()" :key="index" fillDot large :icon="item.storyTypeIcon"
        :color="getDotColour(item.storyTypeIcon)" :icon-color="getIconColour(item.storyTypeIcon)">

        <!-- TIMELINE DOT -->
        <template v-slot:icon>
          <span style="font-size: 0.8em; text-align: center;font-weight:600;">{{formatTimeInterval(item.timeInterval)}}</span>
          <!-- <v-avatar v-if="item.img">
            <img :src="item.img">
          </v-avatar> -->
        </template>
        <!-- <span slot="opposite" class="timelineDate">{{formatTimeInterval(item.timeInterval)}}</span> -->
        <v-card class="elevation-2" @click.prevent="showStory(item)">

          <!-- CONTRIBUTORS TOP CORNER -->
          <v-list-item class="px-0" style="min-height:0; height:10px">
              <v-list-item-icon v-if="!mobile" class="pt-2 mt-0" style="position:absolute; top:5px; right:1px; margin-right:0px;">
                <v-list-item-subtitle class="no-flex">contributors</v-list-item-subtitle>
                <AvatarGroup :profiles="item.contributors.map(c => c.profile)" customClass="ma-0 pa-0 no-wrap" style="position:relative; bottom:15px; left:10px;" :size="mobile ? '25px':'30px'" spacing="pr-1"/>
              </v-list-item-icon>
            </v-list-item>

          <!-- TIMELINE STORY TITLE -->
          <v-row>
            <v-card-title :class="[mobile ? 'mobileTitle' : 'headline']">{{item.title}}</v-card-title>
          </v-row>

          <!-- TIMELINE STORY DESCRIPTION -->
          <v-row>
            <v-card-text class="pt-2 pb-2">
              {{item.description}}
            </v-card-text>
          </v-row>

          <v-row>
              <v-slide-group
              v-if="!showArtefact && item.artefacts && item.artefacts.length > 1"
              v-model="model"
              class="pa-0 background"
              dark
              center-active
              style="width:100vw;margin-top:-2px"
            >
              <v-slide-item
                v-for="({ artefact }, i) in item.artefacts"
                :key="`a-s-g-${i}`"
                v-slot:default="{ active, toggle }"
                transition="fade-transition"
                style="width:100px;height:100px; background-color:rgba(30,30,30)"
                class="pa-1"
              >
                <v-scale-transition>
                  <ArtefactCarouselItem :artefact="artefact"
                    :selected="active"
                    @click.capture="toggle"
                  />
                </v-scale-transition>
              </v-slide-item>
            </v-slide-group>
          </v-row>

          <!-- Dropdown expansion -->
          <v-card-actions class="pt-0">

            <v-row class="px-4">
                <!-- MENTIONS -->
                <v-col v-if="item.mentions && item.mentions.length > 0" style="height: 100px; ">
                  <v-list-item-subtitle style="color:#a7a3a3">Mentions</v-list-item-subtitle>
                  <AvatarGroup
                    style="position:relative; bottom:15px; right:15px"
                    :profiles="item.mentions.map(m => m.profile)"
                    show-labels :size="'30px'"
                    spacing="pr-2"
                  />
                </v-col>
                <!-- CONTRIBUTORS (IF MOBILE) -->
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
                <!-- LOCATION -->
                <v-col v-if="item.location" class="pt-0" cols="12" sm="12" md="auto">
                  <v-list-item-subtitle style="color:#a7a3a3" class="ms-5 pa-0 pb-1">Location</v-list-item-subtitle>
                  <p class="mt-3 mb-5 ms-5">{{ item.location }}</p>
                </v-col>
                <!-- ACCESS -->
                <!-- <v-col v-if="story.access && story.access.length > 0" cols="12" sm="12" md="auto">
                  <v-list-item-subtitle style="color:#a7a3a3">Access</v-list-item-subtitle>
                  <AvatarGroup
                    style="position:relative; bottom:15px;"
                    :profiles="story.access.map(m => m.profile)"
                    show-labels :size="fullStory ? '50px': '30px'"
                    spacing="pr-2"
                    @profile-click="openProfile($event)"
                    :clickable="fullStory"
                  />
                </v-col> -->
               
            </v-row>
          </v-card-actions>
          
        </v-card>
      </v-timeline-item>
    </v-timeline>
  </div>
</template>

<script>
import Contributors from '@/components/Contributors.vue'
import AvatarGroup from '@/components/AvatarGroup.vue'

import { mapGetters } from 'vuex'

import { dateIntervalToString } from '@/lib/date-helpers.js'

export default {
  props: ['data'],
  components: {
    Contributors,
    AvatarGroup
  },
  data: () => ({
    show: false
  }),
  computed: {
    ...mapGetters(['showArtefact']),
    mobile () {
      return this.$vuetify.breakpoint.xs 
    },
  },
  methods: {
    getDotColour (iconType) {
      return '#b12526'
    },
    getIconColour (iconType) {
      return '#ffffff'
    },
    formatTimeInterval(date) {
      return dateIntervalToString(date)
    },
    showStory (story) {
      // if (!this.fullStory) {
        console.log("show story:",story)
        this.$emit('toggleStory', story)
      // }
    },
  }
}
</script>

<style scoped>
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

  .mobileTitle, .timelineDate {
    font-size: 1rem !important;
    line-height: 1.5rem;
    font-weight: 400;
    margin: 0;
    padding: 0px 25px;
    word-break: normal;
    color: rgba(0,0,0,0.6)
  }
</style>
