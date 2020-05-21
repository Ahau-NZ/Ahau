<template>
  <v-card @click="showStory($event)" :class="customClass" :flat="fullStory" :ripple="false" class="mx-auto" :light="!this.showArtefact" width="100%">
    <v-list-item class="px-0" style="min-height:0; height:10px">
      <v-list-item-icon v-if="!fullStory" class="pt-0 mt-0" style="position:absolute; top:5px; right:1px; margin-right:0px">
        <v-list-item-subtitle v-if="!mobile" class="no-flex">contributors</v-list-item-subtitle>
        <AvatarGroup :profiles="story.contributors" customClass="ma-0 pa-0" style="position:relative; bottom:10px;" size="28px" spacing="pr-1"/>
      </v-list-item-icon>
    </v-list-item>
    <v-list-item>
      <v-list-item-content class="pb-0">
        <v-list-item-subtitle v-if="story.recordDate">
          {{ story.recordDate }} 
          <span v-if="story.recordEndDate.length"> - {{story.recordEndDate}} </span> 
        </v-list-item-subtitle>
        <v-list-item-title v-if="!showArtefact" class="headline mb-1 wrap-text">{{ story.title }}</v-list-item-title>
        <v-list-item-title v-else class="headline mb-1 wrap-text">{{ artefact.title }}</v-list-item-title>
      </v-list-item-content>
    </v-list-item>
    <v-list-item v-if="story.artefacts && story.artefacts.length" class="px-0">
      <v-list-item-content>
        <v-carousel v-model="model" hide-delimiters :show-arrows="!mobile && fullStory" :show-arrows-on-hover="!mobile" :height="showArtefact ? 'auto' : mobile ? '300px' : '500px'">
          <v-carousel-item v-for="(artefact,i) in story.artefacts" :key="artefact.id">
            <Artefact :model="model" :index="i" @showArtefact="toggleShowArtefact($event)" :artefact="artefact" />
          </v-carousel-item>
        </v-carousel>
        <!-- Artefact group component -->
      </v-list-item-content>
    </v-list-item>

    <v-list-item :disabled="disableClick" :ripple="false" @click.stop="showText()">
      <v-list-item-icon v-if="fullStory && !showArtefact" class="pt-0 mt-0" style="position:absolute; top:5px; right:1px; margin-right:0px">
        <EditStoryButton @click="toggleStoryEdit()"/>
      </v-list-item-icon>
      <v-list-item-icon v-if="showArtefact" class="pt-0 mt-0" style="position:absolute; top:5px; right:1px; margin-right:0px">
        <EditArtefactButton @click="toggleArtefactEdit()"/>
      </v-list-item-icon>
      <v-list-item-content>
        <v-list-item-subtitle class="pb-1" style="color:grey"> Description </v-list-item-subtitle>
        <p v-if="!showArtefact" ref="text" :class="turncateText ? 'description' : ''">
          {{ story.description }}
        </p>
        <p v-if="artefact.description" ref="text" style="color:white" :class="turncateText ? 'description' : ''">
          {{ artefact.description }}
        </p>
      </v-list-item-content>
    </v-list-item>
    <v-row v-if="!showArtefact">
      <v-col v-if="story.mentions.length" class="py-0" :cols="mobile ? '12' : 'auto'">
        <v-list-item-subtitle style="color:grey" class="ml-5 pb-1"> Mentions </v-list-item-subtitle>
        <AvatarGroup 
          style="position:relative; bottom:15px;" 
          :profiles="story.mentions" 
          show-labels :size="fullStory ? '50px': '30px'" 
          spacing="pr-2"
        />
      </v-col>
      <v-col v-if="story.location" class="pt-0" :cols="mobile ? '12' : '4'">
        <v-list-item-subtitle style="color:grey" class="ms-5 pa-0 pb-1"> Location </v-list-item-subtitle>
        <p class="mt-3 mb-5 ms-5">{{story.location}}</p>
      </v-col>
    </v-row>
    <div v-if="fullStory && !showArtefact">
      <v-row class="px-4">
        <v-col class="pt-0 pr-1" v-if="story.relatedRecords.length" :cols="mobile ? '12':''">
          <v-list-item-subtitle class="pb-1" style="color:grey"> Related records </v-list-item-subtitle>
          <ChipGroup :chips="story.relatedRecords" type="story"/>
        </v-col>
        <v-col class="pt-0 pb-8 pr-1" v-if="story.collections.length" :cols="mobile ? '12' : ''">
          <v-list-item-subtitle class="pb-1" style="color:grey"> Collections </v-list-item-subtitle>
          <ChipGroup :chips="story.collections" />
        </v-col>
        <v-col class="pt-0 pb-8 " v-if="story.categories.length" :cols="mobile ? '12' : ''">
          <v-list-item-subtitle  class="pb-1" style="color:grey"> Categories </v-list-item-subtitle>
          <v-chip-group column v-if="story.categories.length > 0">
            <v-chip v-for="(category, i) in story.categories" :key="i"
              label
              outlined
              width="30px"
            >
              {{ category.title }}
            </v-chip>
          </v-chip-group>
        </v-col>
      </v-row>
      <v-row class="px-4">
        <div class="py-0 px-0">
          <v-list-item-subtitle style="color:grey" class="ml-5 pb-1"> Access </v-list-item-subtitle>
          <AvatarGroup  
            v-if="story.access.length"
            :profiles="story.access"
            show-labels
            size="50px"
            style="position:relative; bottom:15px;"
          />
        </div>
        <div class="py-0 px-0">
          <v-list-item-subtitle style="color:grey" class="ml-5 pb-1"> Contributors </v-list-item-subtitle>
          <AvatarGroup style="position:relative; bottom:15px;" :profiles="story.contributors" show-labels size="50px" spacing="pr-2"/>
        </div>
        <v-col class="pt-0" style="min-width:188px; max-width:188px">
          <v-list-item-subtitle class="pb-1" style="color:grey">Submission date </v-list-item-subtitle>
            <p class="mt-3">{{story.submissionDate}}</p>
        </v-col>
        <div class="py-0 px-0" v-if="story.protocols.length" :cols="mobile ? '6' : '4'">
          <v-list-item-subtitle style="color:grey" class="ml-5 pb-1"> Protocol </v-list-item-subtitle>
          <AvatarGroup
            :profiles="story.protocols"
            show-labels
            size="50px"
            isView
            style="position:relative; bottom:15px;"
          />
        </div>
        <div class="pt-0" v-if="story.creator" :cols="mobile ? '3' : '3'">
          <v-list-item-subtitle style="color:grey" class="ml-5 pb-1"> Creator </v-list-item-subtitle>
            <Avatar
              size="50px"
              :image="story.creator.avatarImage"
              :alt="story.creator.preferredName"
              :gender="story.creator.gender"
              :bornAt="story.creator.bornAt"
              :deceased="story.creator.deceased"
              showLabel
              style="position:relative; bottom:8px;"
              class="ml-5"
            />
        </div>
      </v-row>
      <v-row class="px-4 mb-12">
        <v-col v-if="story.contributionNotes" cols="12" class="pb-6">
          <v-list-item-subtitle class="pb-1" style="color:grey"> Contribution notes </v-list-item-subtitle>
          <p>{{ story.contributionNotes }}</p>
        </v-col>
        <v-col v-if="story.locationDescription" cols="12" class="pb-6">
          <v-list-item-subtitle class="pb-1" style="color:grey"> Location description </v-list-item-subtitle>
          <p>{{ story.locationDescription }}</p>
        </v-col>
        <v-col v-if="story.culturalNarrative" cols="12" class="pb-6">
          <v-list-item-subtitle class="pb-1" style="color:grey"> Cultural narrative </v-list-item-subtitle>
          <p>{{ story.culturalNarrative }}</p>
        </v-col>
        <v-col v-if="story.format" :cols="mobile ? '6' : '3'">
          <v-list-item-subtitle class="pb-1" style="color:grey"> Format </v-list-item-subtitle>
          <p>{{ story.format }}</p>
        </v-col>
        <v-col v-if="story.identifier" :cols="mobile ? '6' : '3'">
          <v-list-item-subtitle class="pb-1" style="color:grey"> Identifier </v-list-item-subtitle>
          <p>{{ story.identifier }}</p>
        </v-col>
        <v-col v-if="story.source" :cols="mobile ? '6' : '3'">
          <v-list-item-subtitle class="pb-1" style="color:grey"> Source </v-list-item-subtitle>
          <p>{{ story.source }}</p>
        </v-col>
        <v-col v-if="story.language" :cols="mobile ? '6' : '3'">
          <v-list-item-subtitle class="pb-1" style="color:grey"> Language </v-list-item-subtitle>
          <p>{{ story.language }}</p>
        </v-col>
        <v-col v-if="story.transcription" cols="12" class="pb-6">
          <v-list-item-subtitle class="pb-1" style="color:grey"> Translation / Transcription </v-list-item-subtitle>
          <p>{{ story.transcription }}</p>
        </v-col>
      </v-row>
    </div>
    <div v-if="showArtefact">
      <v-row class="px-4">
        <v-col v-if="artefact.format" :cols="mobile ? '6' : '3'" class="pb-6">
          <v-list-item-subtitle class="pb-1" style="color:grey"> Format </v-list-item-subtitle>
          <p style="color:white">{{ artefact.format }}</p>
        </v-col>
        <v-col v-if="artefact.identifier" :cols="mobile ? '6' : '3'">
          <v-list-item-subtitle class="pb-1" style="color:grey"> Identifier </v-list-item-subtitle>
          <p style="color:white">{{ artefact.identifier }}</p>
        </v-col>
        <v-col v-if="artefact.source" :cols="mobile ? '6' : '3'">
          <v-list-item-subtitle class="pb-1" style="color:grey"> Source </v-list-item-subtitle>
          <p style="color:white">{{ artefact.source }}</p>
        </v-col>
        <v-col v-if="artefact.language" :cols="mobile ? '6' : '3'">
          <v-list-item-subtitle class="pb-1" style="color:grey"> Language </v-list-item-subtitle>
          <p style="color:white">{{ artefact.language }}</p>
        </v-col>
        <v-col v-if="artefact.translation" cols="12" class="pb-6">
          <v-list-item-subtitle class="pb-1" style="color:grey"> Translation / Transcription </v-list-item-subtitle>
          <p style="color:white">{{ artefact.translation }}</p>
        </v-col>
      </v-row>
    </div>
  </v-card>
</template>

<script>
import AvatarGroup from '@/components/AvatarGroup.vue'
import Avatar from '@/components/Avatar.vue'
import Artefact from '@/components/artefacts/Artefact.vue'
import ChipGroup from '@/components/archive/ChipGroup.vue'
import { mapActions, mapGetters } from 'vuex'
import EditStoryButton from '@/components/button/EditStoryButton.vue'
import EditArtefactButton from '@/components/button/EditArtefactButton.vue'


export default {
  name: 'StoryCard',
  props: {
    story: Object,
    fullStory: Boolean
  },
  components: {
    AvatarGroup,
    Avatar,
    Artefact,
    ChipGroup,
    EditStoryButton,
    EditArtefactButton
  },
  data () {
    return {
      show: false,
      turncateText: true,
      textHeight: 0,
      artefact: {},
      model: 0
    }
  },
  mounted () {
    console.log("story: ", this.story)
    // grab text height to figure out if we need to hide it or not
    this.textHeight = this.$refs.text.offsetHeight
    if (this.fullStory) {
      return this.turncateText = false
    }
  },
  computed: {
    ...mapGetters(['showArtefact']),
    customProps () {
      return {
        dense: false,
        readonly: true,
      }
    },
    mobile () {
      return this.$vuetify.breakpoint.xs || this.$vuetify.breakpoint.sm
    },

    // disable textTurncate click event when not needed
    disableClick () {
      if (this.fullStory) {
        return true
      } else if (this.textHeight > 60) return false
      return true
    },

    // style card based on current stories, story or artefact view
    customClass () {
      if (this.fullStory) {
        if (this.showArtefact) {
          return 'ontop disableCard'
        }
        return 'disableCard'
      }
      return ''
    }
  },
  watch: {
    model (newVal) {
      // show artefact details when viewing in carousel
      if (this.showArtefact) {
        this.artefact = this.story.artefacts[newVal]
      }
    }
  },
  methods: {
    ...mapActions(['setStory', 'setShowArtefact']),
    toggleStoryEdit () {
      this.$emit('updateDialog', 'editStoryDialog')
    },
    toggleArtefactEdit (artefact) {
      this.$emit('updateDialog', 'editArtefactDialog')
    },
    // toggle artefact view
    toggleShowArtefact (artefact) {
      if (this.fullStory) {
        this.artefact = artefact
        this.setShowArtefact()
      }
    },
    // toggle story view
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

// disable click events on v-card when viewing single story
.disableCard {
  user-select: none;
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
  border: 0.5px solid rgba(0,0,0,0.12);
  border-radius: 10px;
  background-color: white;
  margin-top: 20px;
}

v-list-item-subtitle {
  color: grey
}
</style>
