<template>
  <div style="width: 100%; height: 100%;" :class="{'showArtefactMobileDialog': mobileShowArtefact}">
    <v-card
      v-click-outside="onClickOutside"
      class="mx-auto"
      width="100%"
      :class="customClass"
      :ripple="false"
      :light="!showArtefact"
      :elevation="(!mobile && !showArtefact && fullStory) ? 24 : 3"
      @click.passive="showStory()"
    >
      <v-list-item  v-if="!fullStory" class="px-0" style="min-height:0; height:0">
        <v-list-item-icon class="pt-1 mt-0" style="position:absolute; top:10px; right:0; margin-right:0px">
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
      <v-list-item :class="mobile && fullStory ? 'px-6':''">
        <v-list-item-content class="pb-0">
          <v-list-item-subtitle v-if="time" class="mt-n2 pb-1">
            <span>{{ time }}</span>
          </v-list-item-subtitle>
          <v-list-item-title v-if="!showArtefact" class="headline mb-1 wrap-text">{{ story.title }}</v-list-item-title>
          <v-list-item-title v-else class="headline mb-1 wrap-text" style="max-width:90%">{{ artefact.title }}</v-list-item-title>
        </v-list-item-content>
      </v-list-item>
      <v-list-item v-if="artefacts && artefacts.length > 0" class="px-0">
        <v-list-item-content>
          <ArtefactCarousel
            :artefacts="artefacts"
            :fullStory="fullStory"

            :selectedIndex.sync="selectedIndex"
          />
        </v-list-item-content>
      </v-list-item>
      <v-list-item v-if="!showArtefact && story.description" :disabled="disableClick" :ripple="false" @click.stop="showText()">
        <v-list-item-content>
          <v-list-item-subtitle v-if="fullStory" class="pb-1" style="color:#a7a3a3"> Description </v-list-item-subtitle>
          <p ref="text" :class="truncateText ? 'description' : ''">
            <span v-for="(line, index) in story.description.split('\n')" :key="index">{{line}}<br></span>
          </p>
        </v-list-item-content>
      </v-list-item>
      <v-list-item v-else-if="showArtefact && artefact.description" :class="mobile && fullStory ? 'px-6':''">
        <v-list-item-content >
          <v-list-item-subtitle class="pb-1" style="color:#a7a3a3"> Description </v-list-item-subtitle>
          <p ref="text" style="color:white" class="text-justify">
            <span v-for="(line, index) in artefact.description.split('\n')" :key="index">{{line}}<br></span>
          </p>
        </v-list-item-content>
      </v-list-item>
      <v-row v-if="!showArtefact" class="px-4 pb-0">
        <v-col v-if="access && access.length" cols="auto" class="pb-0">
          <v-list-item-subtitle style="color:#a7a3a3">Access</v-list-item-subtitle>
          <AvatarGroup
            style="position:relative; bottom:15px; right:15px"
            :profiles="access"
            show-labels :size="fullStory ? '50px': '30px'"
            spacing="pr-2"
            :clickable="fullStory"
          />
        </v-col>
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
        <v-col v-if="story.tiaki && story.tiaki.length > 0" cols="auto" class="pb-0">
          <v-list-item-subtitle style="color:#a7a3a3">Kaitiaki</v-list-item-subtitle>
          <AvatarGroup
            style="position:relative; bottom:15px; right:15px"
            :profiles="story.tiaki"
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
          <v-col class="pt-0 pr-1" v-if="story.relatedRecords && story.relatedRecords.length > 0" cols="12" md="6">
            <v-list-item-subtitle class="pb-1" style="color:#a7a3a3">Related records</v-list-item-subtitle>
            <ChipGroup
              :chips="story.relatedRecords.map(r => r.story)"
              type="story"
              @click="showRelatedStory"
            />
          </v-col>
          <v-col class="pt-0 pr-1" v-if="story.collections && story.collections.length > 0" cols="12" md="6">
            <v-list-item-subtitle class="pb-1" style="color:#a7a3a3">Collections</v-list-item-subtitle>
            <ChipGroup
              :chips="story.collections.map(c => c.collection)"
              type="collection"
              @click="showRelatedCollection"
            />
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
      <!-- ARTEFACT FIELDS -->
      <div v-if="showArtefact">
        <v-row class="px-4">
          <v-col v-if="artefact.blob.mimeType" cols="12" sm="12" md="3" class="py-1 pt-2" >
            <v-list-item-subtitle class="pb-1" style="color:#a7a3a3">Format</v-list-item-subtitle>
            <p style="color:white">{{ artefact.blob.mimeType }}</p>
          </v-col>
          <v-col v-if="artefact.blob.size" cols="12" sm="12" md="3" class="py-1 pt-2" >
            <v-list-item-subtitle class="pb-1" style="color:#a7a3a3">Size</v-list-item-subtitle>
            <p style="color:white">{{ size }}</p>
          </v-col>
          <v-col v-if="artefact.language" cols="12" sm="12" md="3" class="py-1 pt-2" >
            <v-list-item-subtitle class="pb-1" style="color:#a7a3a3">Language</v-list-item-subtitle>
            <p style="color:white">{{ artefact.language }}</p>
          </v-col>
          <v-col v-if="artefact.licence" cols="12" sm="12" md="3" class="py-1 pt-2" >
            <v-list-item-subtitle class="pb-1" style="color:#a7a3a3">License</v-list-item-subtitle>
            <p style="color:white">{{ artefact.licence }}</p>
          </v-col>
          <v-col v-if="artefact.rights" cols="12" sm="12" md="4" class="py-1 pt-6" >
            <v-list-item-subtitle class="pb-1" style="color:#a7a3a3">Rights</v-list-item-subtitle>
            <p style="color:white">{{ artefact.rights }}</p>
          </v-col>
          <v-col v-if="artefact.source" cols="12" sm="12" md="4" class="py-1 pt-6" >
            <v-list-item-subtitle class="pb-1" style="color:#a7a3a3">Source</v-list-item-subtitle>
            <p style="color:white">{{ artefact.source }}</p>
          </v-col>
          <v-col v-if="artefact.duration" cols="12" sm="12" md="4" class="py-1 pt-2" >
            <v-list-item-subtitle class="pb-1" style="color:#a7a3a3">Duration</v-list-item-subtitle>
            <p style="color:white">{{ artefact.duration }}</p>
          </v-col>
          <v-col v-if="artefact.translation" cols="12" class="pt-6" >
            <v-list-item-subtitle class="pb-1" style="color:#a7a3a3">Translation/Transcription</v-list-item-subtitle>
            <p style="color:white">{{ artefact.translation }}</p>
          </v-col>
          <v-col v-if="artefact.location" cols="12" class="pt-6" >
            <v-list-item-subtitle class="pb-1" style="color:#a7a3a3">Location</v-list-item-subtitle>
            <p style="color:white">{{ artefact.location }}</p>
          </v-col>
        </v-row>
      </div>
      <v-card-actions v-if="fullStory" class="justify-end">
        <v-list-item-icon v-if="fullStory && !showArtefact" class="pt-0 mt-0">
          <EditStoryButton v-if="story.canEdit" @click="toggleDialog('edit-story')"/>
        </v-list-item-icon>
        <v-list-item-icon v-if="showArtefact" class="pt-0 mt-12">
          <EditArtefactButton v-if="story.canEdit" @click="toggleDialog('edit-artefact')"/>
        </v-list-item-icon>
        <v-list-item-icon v-if="showArtefact && !mobile" class="pt-0 mt-0"
        style="position:absolute; top:0px; right:0px;">
          <v-btn dark text large fab @click="setShowArtefact()">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-list-item-icon>
        <v-list-item-icon v-else-if="mobileShowArtefact" class="pt-0 mt-0"
        style="position:absolute; top:-68px; left:-12px;">
          <v-btn dark text fab @click="setShowArtefact()">
            <v-icon>mdi-arrow-left</v-icon>
          </v-btn>
        </v-list-item-icon>
      </v-card-actions>
      <NewRecordDialog
        v-if="dialog === 'edit-story'"
        :show="dialog === 'edit-story'"
        :title="`Edit ${story.title || 'Story'}`"
        editing
        :story="story"
        @close="finishEditing()"
        @delete="dialog = 'delete-story'"
        @submit="$emit('submit', $event)"
      />
      <DeleteRecordDialog
        v-if="dialog === 'delete-story'"
        :show="dialog === 'delete-story'"
        @close="dialog = 'edit-Story'"
        @submit="processDeleteStory"
      />
      <NewArtefactDialog
        v-if="dialog === 'edit-artefact'"
        :show="dialog === 'edit-artefact'"
        :index.sync="selectedIndex"
        :artefacts="formData.artefacts"
        editing
        @close="finishEditing()"
        @delete="dialog = 'delete-artefact'"
        @submit="saveArtefact($event)"
        @artefacts="processArtefacts($event)"
      />
      <DeleteArtefactDialog
        v-if="dialog === 'delete-artefact'"
        :show="dialog === 'delete-artefact'"
        :index="selectedIndex"
        @close="dialog = 'edit-artefact'"
        @submit="removeArtefact($event)"
      />
    </v-card>
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'

import AvatarGroup from '@/components/AvatarGroup.vue'
import ChipGroup from '@/components/archive/ChipGroup.vue'
import EditStoryButton from '@/components/button/EditStoryButton.vue'
import EditArtefactButton from '@/components/button/EditArtefactButton.vue'
import ArtefactCarousel from '@/components/artefact/ArtefactCarousel.vue'
import NewRecordDialog from '@/components/dialog/archive/NewRecordDialog.vue'
import DeleteRecordDialog from '@/components/dialog/archive/DeleteRecordDialog.vue'
import NewArtefactDialog from '@/components/dialog/artefact/NewArtefactDialog.vue'
import DeleteArtefactDialog from '@/components/dialog/artefact/DeleteArtefactDialog.vue'

import { colours } from '@/lib/colours.js'
import { setDefaultStory } from '@/lib/story-helpers.js'
import { dateIntervalToString, formatSubmissionDate } from '@/lib/date-helpers.js'
import { getObjectChanges } from '@/lib/get-object-changes.js'
import { convertBytes } from '@/lib/artefact-helpers.js'

import { methods as mapStoryMethods } from '@/mixins/story-mixins.js'
import { artefactMixin } from '@/mixins/artefact-mixins.js'

export default {
  name: 'StoryCard',
  props: {
    story: Object,
    fullStory: Boolean,
    loading: Boolean,
    reload: Function
  },
  mixins: [
    artefactMixin,
    {
      methods: {
        getStory: mapStoryMethods.getStory
      }
    }
  ],
  components: {
    AvatarGroup,
    ChipGroup,
    EditStoryButton,
    EditArtefactButton,
    ArtefactCarousel,
    NewRecordDialog,
    DeleteRecordDialog,
    NewArtefactDialog,
    DeleteArtefactDialog
  },
  data () {
    return {
      show: false,
      truncateText: true,
      textHeight: 0,
      selectedIndex: 0,
      dialog: null
    }
  },
  async mounted () {
    // grab text height to figure out if we need to hide it or not
    this.textHeight = this.$refs.text ? this.$refs.text.offsetHeight : 0
    if (this.fullStory) {
      this.truncateText = false
    }
  },
  computed: {
    ...mapGetters(['storeDialog', 'whoami']),
    ...mapGetters('archive', ['showArtefact']),
    ...mapGetters('tribe', ['tribeProfile']),
    access () {
      return [this.tribeProfile].filter(Boolean)
    },
    artefacts () {
      return this.story.artefacts.map(link => link.artefact)
    },
    artefact () {
      const artefact = this.artefacts[this.selectedIndex]
      if (artefact) return artefact
      return {}
    },
    mobile () {
      return this.$vuetify.breakpoint.xs || this.$vuetify.breakpoint.sm
    },
    // used for updating artefacts direct from story card
    formData () {
      return setDefaultStory(this.story)
    },
    time () {
      if (this.story.timeInterval) {
        return dateIntervalToString(this.story.timeInterval, this.monthTranslations)
      }
      return ''
    },
    submissionDate () {
      if (this.story.submissionDate) {
        return formatSubmissionDate(this.story.submissionDate, this.monthTranslations)
      }
      return ''
    },
    // disable truncateText click event when not needed
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
        window.scrollTo(0, 0)
        if (this.showArtefact) {
          return 'ontop disableCard'
        }
        if (this.storeDialog === 'edit-story') return 'disableCard'
        else return 'disableCard recordView'
      }
      return 'rounded-border'
    },
    mobileShowArtefact () {
      return this.mobile && this.showArtefact
    },
    size () {
      return convertBytes(this.artefact.blob.size)
    }
  },
  watch: {
    story (newVal, oldVal) {
      // show any changes to showArtefact if artefacts change
      const changes = { ...getObjectChanges(oldVal, newVal) }
      if (changes.artefacts) {
        if (this.showArtefact && changes.artefacts.remove) {
          this.setShowArtefact()
        } else if (this.showArtefact && changes.artefacts.add) {
          this.artefact = changes.artefacts.add[this.selectedIndex].artefact
        }
      }
    }
  },
  methods: {
    ...mapActions('archive', ['setCurrentStory', 'setShowArtefact', 'toggleShowStory']),
    ...mapActions('story', ['deleteStory']),
    //  save artefact from showArtefact
    saveArtefact ($event) {
      this.updateArtefacts($event)
      // get all changes
      const output = {
        id: this.story.id,
        ...getObjectChanges(setDefaultStory(this.story), this.formData)
      }
      this.$emit('submit', output)
    },
    finishEditing () {
      setTimeout(() => {
        this.dialog = null
      }, 500)
    },
    openProfile ($event) {
      this.$emit('openProfile', $event)
    },
    async showRelatedStory (relatedRecord) {
      if (this.deletable) return

      window.scrollTo(0, 0)
      const story = await this.getStory(relatedRecord.id)
      this.setCurrentStory(story)
    },
    showRelatedCollection (collection) {
      let name
      if (this.$route.name === 'community/collection') name = 'community/collection'
      else name = this.$route.name.split('/archive')[0] + '/collection'

      this.$router.push({
        name,
        params: { collectionId: collection.id }
      })
        .catch(err => !err.message.match(/redundant navigation/) && console.error(err))
      this.close()
    },
    onClickOutside () {
      if (!this.fullStory || this.dialog) return
      if (!this.storeDialog && !this.mobile) {
        if (this.showArtefact) this.setShowArtefact()
        else {
          this.toggleShowStory()
        }
      }
    },
    async processDeleteStory () {
      await this.deleteStory(this.story.id)

      await this.reload()
      this.close()
    },
    colour (index) {
      return colours[index]
    },
    toggleDialog (dialog) {
      this.dialog = dialog
    },

    // toggle story view
    showStory () {
      if (!this.fullStory) {
        this.$emit('toggleStory', this.story)
      }
    },
    showText () {
      this.truncateText = !this.truncateText
    },
    close () {
      this.$emit('close')
    },
    monthTranslations (key, vars) {
      return this.$t('months.' + key, vars)
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
 /* cut of a long description */
  &.description {
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 3; /* number of lines to show */
    -webkit-box-orient: vertical;
  }
}

/* disable click events on v-card when viewing single story */
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
  border-radius: 10px;
  background-color: white;
  margin-bottom:20px
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

.showArtefactMobileDialog {
  margin-top: -68px;
  padding-top: 68px;
  z-index: 7;
}
</style>
