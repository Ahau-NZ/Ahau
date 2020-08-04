<template>
  <div style="width: 100%; height: 100%;">
  <v-card @click.prevent="showStory()" :class="customClass" flat :ripple="false" class="mx-auto" :light="!showArtefact" width="100%" :elevation="!mobile && !showArtefact && fullStory ? '24':''" @blur="close">
    <v-list-item class="px-0" style="min-height:0; height:10px">
      <v-list-item-icon v-if="!fullStory" class="pt-1 mt-0" style="position:absolute; top:5px; right:1px; margin-right:0px">
        <v-list-item-subtitle v-if="!mobile" class="no-flex">contributors</v-list-item-subtitle>
        <AvatarGroup :profiles="story.contributors.map(c => c.profile)" customClass="ma-0 pa-0" style="position:relative; bottom:15px; left:10px" :size="mobile ? '25px':'30px'" spacing="pr-1"/>
      </v-list-item-icon>
    </v-list-item>
    <v-btn v-if="fullStory && !showArtefact && !mobile" @click="close"
      text large fab
      class="secondary--text recordCloseButton"
    >
      <v-icon color="secondary">mdi-close</v-icon>
    </v-btn>
    <v-list-item>
      <v-list-item-content class="pb-0">
        <v-list-item-subtitle v-if="time" class="mt-n2 pb-1">
          <span>{{ time }}</span>
        </v-list-item-subtitle>
        <v-list-item-title v-if="!showArtefact" class="headline mb-1 wrap-text">{{ story.title }}</v-list-item-title>
        <v-list-item-title v-else class="headline mb-1 wrap-text">{{ artefact.title }}</v-list-item-title>
      </v-list-item-content>
    </v-list-item>
    <v-list-item v-if="story.artefacts && story.artefacts.length > 0" class="px-0" >
      <v-list-item-content>
        <v-carousel
          v-model="model"
          hide-delimiters
          :show-arrows="!mobile && fullStory && story.artefacts && story.artefacts.length > 1" :show-arrows-on-hover="!mobile" :height="showArtefact ? 'auto' : mobile ? '300px' : '500px'" style="background-color:#1E1E1E">
          <v-carousel-item v-for="({ artefact } , i) in story.artefacts" :key="`story-card-artefact-${i}`">
            <Artefact :model="model" :index="i" @showArtefact="toggleShowArtefact($event)" :artefact="artefact" />
          </v-carousel-item>
        </v-carousel>
        <v-slide-group
          v-if="!showArtefact && story.artefacts && story.artefacts.length > 1"
          v-model="model"
          class="pa-0 background"
          dark
          center-active
          style="width:100vw;margin-top:-2px"
        >
          <v-slide-item
            v-for="({ artefact }, i) in story.artefacts"
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

      </v-list-item-content>
    </v-list-item>
    <v-list-item :disabled="disableClick" :ripple="false" @click.stop="showText()">
      <v-list-item-content >
        <v-list-item-subtitle v-if="fullStory || showArtefact" class="pb-1" style="color:#a7a3a3"> Description </v-list-item-subtitle>
        <p v-if="!showArtefact" ref="text" :class="turncateText ? 'description' : ''">
          {{ story.description }}
        </p>
        <p v-if="artefact.description" ref="text" style="color:white" >
          {{ artefact.description }}
        </p>
      </v-list-item-content>
    </v-list-item>
    <v-row v-if="!showArtefact" class="px-4 pb-0">
      <v-col v-if="story.mentions && story.mentions.length > 0" cols="auto"  class="pb-0">
        <v-list-item-subtitle style="color:#a7a3a3">Mentions</v-list-item-subtitle>
        <AvatarGroup
          style="position:relative; bottom:15px; right:15px"
          :profiles="story.mentions.map(m => m.profile)"
          show-labels :size="fullStory ? '50px': '30px'"
          spacing="pr-2"
          @profile-click="openProfile($event)"
          :clickable="fullStory"
        />
      </v-col>
      <v-col v-if="story.kaitiaki && story.kaitiaki.length > 0" cols="auto" class="pb-0">
        <v-list-item-subtitle style="color:#a7a3a3">Kaitiaki</v-list-item-subtitle>
        <AvatarGroup
          style="position:relative; bottom:15px; right:15px"
          :profiles="story.kaitiaki"
          show-labels :size="fullStory ? '50px': '30px'"
          spacing="pr-2"
          @profile-click="openProfile($event)"
          :clickable="fullStory"
        />
      </v-col>
      <v-col v-if="story.location" class="pt-0" cols="12" sm="12" md="auto">
        <v-list-item-subtitle style="color:#a7a3a3" class="ms-5 pa-0 pb-1">Location</v-list-item-subtitle>
        <p class="mt-3 mb-5 ms-5">{{ story.location }}</p>
      </v-col>
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
      <v-col v-if="story.contributors && story.contributors.length > 0 && fullStory" cols="auto">
        <v-list-item-subtitle style="color:#a7a3a3">Contributors</v-list-item-subtitle>
        <AvatarGroup
          style="position:relative; bottom:15px; right:15px"
          :profiles="story.contributors.map(m => m.profile)"
          show-labels :size="fullStory ? '50px': '30px'"
          spacing="pr-2"
          @profile-click="openProfile($event)"
          :clickable="fullStory"
        />
      </v-col>
      <v-col v-if="fullStory">
        <v-list-item-subtitle class="pb-1" style="color:#a7a3a3">Submission date</v-list-item-subtitle>
        <p class="mt-3">{{ submissionDate }}</p>
      </v-col>
    </v-row>
    <div v-if="fullStory && !showArtefact">
      <v-row class="px-4">
        <v-col v-if="story.creators && story.creators.length > 0 && fullStory" cols="auto">
          <v-list-item-subtitle style="color:#a7a3a3">Creators</v-list-item-subtitle>
          <AvatarGroup
            style="position:relative; bottom:15px; right:15px"
            :profiles="story.creators.map(m => m.profile)"
            show-labels :size="fullStory ? '50px': '30px'"
            spacing="pr-2"
            @profile-click="openProfile($event)"
            :clickable="fullStory"
          />
        </v-col>
      </v-row>
      <v-row class="px-4">
        <v-col class="pt-0 pr-1" v-if="story.relatedRecords && story.relatedRecords.length > 0" cols="12" sm="12" md="auto">
          <v-list-item-subtitle class="pb-1" style="color:#a7a3a3">Related records</v-list-item-subtitle>
          <ChipGroup :chips="story.relatedRecords.map(r => r.story)" type="story"/>
        </v-col>
      </v-row>
      <v-row class="px-4 mb-12">
        <v-col v-if="story.contributionNotes" cols="12" class="pb-6">
          <v-list-item-subtitle class="pb-1" style="color:#a7a3a3">Contribution notes</v-list-item-subtitle>
          <p>{{ story.contributionNotes }}</p>
        </v-col>
        <v-col v-if="story.locationDescription" cols="12" class="pb-6">
          <v-list-item-subtitle class="pb-1" style="color:#a7a3a3">Location description</v-list-item-subtitle>
          <p>{{ story.locationDescription }}</p>
        </v-col>
        <!-- <v-col v-if="story.culturalNarrative" cols="12" class="pb-6">
          <v-list-item-subtitle class="pb-1" style="color:#a7a3a3">Cultural narrative</v-list-item-subtitle>
          <p>{{ story.culturalNarrative }}</p>
        </v-col> -->

        <v-col v-if="story.identifier" :cols="mobile ? '6' : '3'">
          <v-list-item-subtitle class="pb-1" style="color:#a7a3a3">Identifier</v-list-item-subtitle>
          <p>{{ story.identifier }}</p>
        </v-col>
        <v-col v-if="story.source" :cols="mobile ? '6' : '3'">
          <v-list-item-subtitle class="pb-1" style="color:#a7a3a3">Source</v-list-item-subtitle>
          <p>{{ story.source }}</p>
        </v-col>
        <v-col v-if="story.language" :cols="mobile ? '6' : '3'">
          <v-list-item-subtitle class="pb-1" style="color:#a7a3a3">Language</v-list-item-subtitle>
          <p>{{ story.language }}</p>
        </v-col>
        <v-col v-if="story.transcription" cols="12" class="pb-6">
          <v-list-item-subtitle class="pb-1" style="color:#a7a3a3">Translation / Transcription</v-list-item-subtitle>
          <p>{{ story.transcription }}</p>
        </v-col>
      </v-row>
    </div>
    <v-card-actions v-if="fullStory" class="justify-end">
      <v-list-item-icon v-if="fullStory && !showArtefact" class="pt-0 mt-0">
        <EditStoryButton v-if="story.canEdit" @click="toggleDialog('edit-story')"/>
      </v-list-item-icon>
      <v-list-item-icon v-if="showArtefact" class="pt-0 mt-12">
        <EditArtefactButton v-if="story.canEdit" @click="toggleDialog('edit-story')"/>
      </v-list-item-icon>
      <v-list-item-icon v-if="showArtefact && !mobile" class="pt-0 mt-0"
      style="position:absolute; top:0px; right:0px;">
        <v-btn dark text large fab @click="setShowArtefact()">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-list-item-icon>
      <v-list-item-icon v-else-if="showArtefact && mobile" class="pt-0 mt-0"
      style="position:absolute; top:-68px; left:-12px;">
        <v-btn dark text fab @click="setShowArtefact()">
          <v-icon>mdi-arrow-left</v-icon>
        </v-btn>
      </v-list-item-icon>
    </v-card-actions>
    <NewRecordDialog
      v-if="dialog === 'edit-story'"
      :show="dialog === 'edit-story'"
      :title="`Edit ${story.title}`"
      editing
      :story="story"
      @close="dialog = null"
      @delete="dialog = 'delete-story'"
      @submit="$emit('submit', $event)"
    />
    <DeleteRecordDialog
      v-if="dialog === 'delete-story'"
      :show="dialog === 'delete-story'"
      @close="dialog = null"
      @submit="deleteStory()"
    />
  </v-card>
</div>
</template>

<script>
import AvatarGroup from '@/components/AvatarGroup.vue'
// import Avatar from '@/components/Avatar.vue'
import Artefact from '@/components/artefact/Artefact.vue'
import ChipGroup from '@/components/archive/ChipGroup.vue'
import { mapActions, mapMutations, mapGetters } from 'vuex'
import EditStoryButton from '@/components/button/EditStoryButton.vue'
import EditArtefactButton from '@/components/button/EditArtefactButton.vue'
import { colours } from '@/lib/colours.js'
import ArtefactCarouselItem from '@/components/artefact/ArtefactCarouselItem.vue'
import NewRecordDialog from '@/components/dialog/archive/NewRecordDialog.vue'
import DeleteRecordDialog from '@/components/dialog/archive/DeleteRecordDialog.vue'
import { DELETE_STORY } from '@/lib/story-helpers.js'
import { dateIntervalToString, dateToString } from '@/lib/date-helpers.js'

export default {
  name: 'StoryCard',
  props: {
    story: Object,
    fullStory: Boolean
  },
  components: {
    AvatarGroup,
    // Avatar,
    Artefact,
    ChipGroup,
    EditStoryButton,
    EditArtefactButton,
    ArtefactCarouselItem,
    NewRecordDialog,
    DeleteRecordDialog
  },
  data () {
    return {
      show: false,
      turncateText: true,
      textHeight: 0,
      artefact: {},
      model: 0,
      dialog: null
    }
  },
  mounted () {
    // grab text height to figure out if we need to hide it or not
    this.textHeight = this.$refs.text.offsetHeight
    if (this.fullStory) {
      this.turncateText = false
    }
  },
  computed: {
    ...mapGetters(['showArtefact', 'currentProfile', 'storeDialog']),
    mobile () {
      return this.$vuetify.breakpoint.xs || this.$vuetify.breakpoint.sm
    },

    time () {
      if (this.story.timeInterval) {
        return dateIntervalToString(this.story.timeInterval)
      }
      return ''
    },
    submissionDate () {
      if (this.story.submissionDate) {
        return dateToString(this.story.submissionDate)
      }
      return ''
    },
    // disable textTurncate click event when not needed
    disableClick () {
      if (this.fullStory) {
        return true
      } else if (this.textHeight > 60) {
        return false
      }
      return true
    },

    // style card based on current stories, story or artefact view
    customClass () {
      if (this.fullStory) {
        if (this.showArtefact) {
          return 'ontop disableCard'
        }
        if (this.storeDialog === 'edit-story') return 'disableCard'
        else return 'disableCard recordView'
      }
      return 'rounded-border'
    }
  },
  watch: {
    model (newVal) {
      // show artefact details when viewing in carousel
      if (this.showArtefact) {
        this.artefact = this.story.artefacts[newVal].artefact
      }
    }
  },
  methods: {
    ...mapMutations(['deleteStoryFromStories']),
    ...mapActions(['setShowArtefact', 'setDialog', 'setProfileById', 'setShowStory']),

    async deleteStory () {
      const res = await this.$apollo.mutate(DELETE_STORY(this.story.id, new Date()))

      if (res.errors) {
        console.error('failed to delete story', res.errors)
        return
      }

      this.deleteStoryFromStories(this.story)
      this.$emit('close', null)
    },
    colour (index) {
      return colours[index]
    },
    toggleDialog (dialog) {
      this.dialog = dialog
    },

    // toggle artefact view
    toggleShowArtefact (artefact) {
      console.log('click artefact')
      if (this.fullStory) {
        this.artefact = artefact
        this.setShowArtefact()
      }
    },
    // toggle story view
    showStory () {
      if (!this.fullStory) {
        this.$emit('toggleStory', this.story)
      }
    },
    showText () {
      this.turncateText = !this.turncateText
    },
    openProfile (profile) {
      this.setProfileById({ id: profile.id, type: 'preview' })
      this.setDialog({ active: 'view-edit-node', type: 'preview' })
    },
    updateModel (event) {
      this.model = event
    },
    close () {
      this.$emit('close')
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
    background-color: light#a7a3a3;
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

// disable click events on v-card when viewing single story
.disableCard {
  // user-select: none;
  cursor: default;
}
.v-card::before {
  opacity: 0 !important;
}

// put ontop of overlay for artefact view
.ontop {
  z-index:6
}

.rounded-border {
  border: 0.5px solid rgba(0,0,0,0.3);
  border-radius: 10px;
  background-color: white;
}

v-list-item-subtitle {
  color: #a7a3a3
}

.recordView {
  z-index: 2;
}

.recordCloseButton {
  position: absolute;
  right: 0;
  top: 0;
  cursor: pointer;
  z-index: 3;
}

.background {
  background-color: #1E1E1E;
}
</style>
