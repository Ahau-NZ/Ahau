<template>
  <v-card @click="showStory($event)" :class="dynamicCard" :flat="fullStory" :ripple="false" class="mx-auto" :light="!this.showArtefact" width="100%">
    <v-list-item class="px-0" style="min-height:0; height:10px">
      <v-list-item-icon v-if="!fullStory" class="pt-0 mt-0" style="position:absolute; top:5px; right:1px; margin-right:0px">
        <v-list-item-subtitle v-if="contributorLabel" class="no-flex">contributors</v-list-item-subtitle>
        <AvatarGroup :profiles="story.contributors" customClass="ma-0 pa-0" style="position:relative; bottom:10px;" size="28px" spacing="pr-1"/>
      </v-list-item-icon>
    </v-list-item>
    <v-list-item>
      <v-list-item-content class="pb-0">
        <v-list-item-subtitle>{{ story.recordDate }}</v-list-item-subtitle>
        <v-list-item-title class="headline mb-1 wrap-text">{{ story.title }}</v-list-item-title>
      </v-list-item-content>
    </v-list-item>
    <v-list-item v-if="story.artefacts && story.artefacts.length" class="px-0">
      <v-list-item-content>
        <!-- <v-carousel hide-delimiters :show-arrows="!mobile && fullStory" :show-arrows-on-hover="!mobile" style="min-height:200px;max-height:60vh" :height="fullStory ? 'auto': mobile ? '300px' : '500px'"> -->
        <v-carousel hide-delimiters :show-arrows="!mobile && fullStory" :show-arrows-on-hover="!mobile" :height="mobile ? '300px' : '500px'">
          <v-carousel-item v-for="artefact in story.artefacts" :key="artefact.id">
            <Artefact @showArtefact="toggleShowArtefact($event)" :artefact="artefact" />
          </v-carousel-item>
        </v-carousel>
        <!-- TODO Artefact and Artefact group component -->
        <!-- <v-img src="../../assets/mocks/enuamanu.png" :height="mobile ? '300px' : '400px'"></v-img> -->
      </v-list-item-content>
    </v-list-item>

    <v-list-item :disabled="disableClick" :ripple="false" @click.stop="showText()">
      <v-list-item-content>
        <p ref="text" :class="turncateText ? 'description' : ''">
          {{ story.description }}
        </p>
      </v-list-item-content>
    </v-list-item>
    <v-row>
      <v-col class="py-0" :cols="mobile ? '12' : '8'">
        <v-list-item-subtitle style="color:grey" class="ml-5"> Mentions </v-list-item-subtitle>
        <AvatarGroup style="position:relative; bottom:15px;" :profiles="story.mentions" show-labels :size="fullStory ? '50px': '30px'" spacing="pr-2"/>
      </v-col>
      <v-col class="py-0" v-if="story.location" :cols="mobile ? '12' : '4'">
        <v-list-item-subtitle style="color:grey" class="ms-5"> Location </v-list-item-subtitle>
        <p class="mt-2 ms-5">{{story.location}}</p>
      </v-col>
    </v-row>
    <div v-if="fullStory">
      <v-row>
        <v-col class="py-0" :cols="mobile ? '12' : '6'">
          <v-list-item-subtitle style="color:grey" class="ml-5"> Contributors </v-list-item-subtitle>
          <AvatarGroup style="position:relative; bottom:15px;" :profiles="story.contributors" show-labels size="30px" spacing="pr-2"/>
        </v-col>
        <v-col class="py-0" v-if="story.location" :cols="mobile ? '12' : '4'">
          <v-list-item-subtitle style="color:grey" class="ms-5"> Collections </v-list-item-subtitle>
          <p class="mt-2 ms-5">{{story.location}}</p>
        </v-col>
      </v-row>
    </div>
  </v-card>
</template>

<script>
import AvatarGroup from '@/components/AvatarGroup.vue'
import Artefact from '@/components/artefacts/Artefact.vue'
import { mapActions, mapGetters } from 'vuex'

export default {
  name: 'StoryCard',
  props: {
    story: Object,
    fullStory: Boolean
  },
  components: {
    AvatarGroup,
    Artefact
  },
  data () {
    return {
      show: false,
      turncateText: true,
      textHeight: 0,
      artefact: {}
    }
  },
  mounted () {
    this.textHeight = this.$refs.text.offsetHeight
     if (this.fullStory) {
       return this.turncateText = false
     }
  },
  computed: {
    ...mapGetters(['showArtefact']),
    mobile () {
      return this.$vuetify.breakpoint.xs || this.$vuetify.breakpoint.sm
    },
    // show contributor label unless its getting too close to the title
    contributorLabel () {
      if (this.mobile && this.story.contributors.length > 6) return false
      return true
    },

    // disable textTurncate click event when not needed
    disableClick () {
      if (this.fullStory) {
        return true
      } else if (this.textHeight > 60) return false
      return true
    },

    // style card based on current view
    dynamicCard () {
      if (this.fullStory) {
       if (this.showArtefact) {
         return 'ontop ' + 'disableCard'
       }
       return 'disableCard'
      }
    }
  },
  methods: {
    ...mapActions(['setStory', 'setShowArtefact']),
    toggleShowArtefact (artefact) {
      if (this.fullStory){
        this.artefact = artefact
        this.setShowArtefact()
        this.$emit('artefactView')
      }
    },
    showStory (e) {
      if (!this.fullStory) {
        this.setStory(this.story)
        this.$emit('showStory')
      }
    },
    showText () {
      this.turncateText = !this.turncateText
    }
  }
}
</script>

<style lang="scss" scoped>
.wrapper {
    width: 100%;
}

.people-circle {
    width: 50px;
    margin: 5px;
    border-radius: 50%;
    background-color: lightgrey;
    background-position-y: 10px;
}

// Need to keep many contributors in single row
.no-flex {
  flex: unset !important;
}

// Dont cut off a long title
.wrap-text {
  white-space: unset !important;
}

p {
  font-size: 0.9em;
  line-height: 1.6;
  color: #383838;
  margin-bottom: 0 !important;
// cut of a long description
  &.description {
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 3; /* number of lines to show */
    -webkit-box-orient: vertical;
  }
}

.disableCard {
  user-select: none;
  cursor: default;
}

.v-card::before {
  opacity: 0 !important;
}

.ontop {
  z-index:6
}

</style>
