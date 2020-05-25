<template>
    <v-dialog v-model="show"
      transition="dialog-bottom-transition"
      class="pa-0 ma-0"
      fullscreen
      style="width: 100%;"
    >
      <v-card class="pa-0 ma-0" style="width: 100%;">
        <v-row>
          <v-col>
            <v-card-title>Edit Artefacts
              <v-btn icon absolute right top @click="close">
                <v-icon>mdi-close</v-icon>
              </v-btn>
            </v-card-title>
          </v-col>
        </v-row>
        <v-container>
          <v-row>
            <v-col cols="12" class="pt-12 pb-0 px-1">
              <v-text-field
                v-model="artefact.title"
                label="Title"
                v-bind="customProps"
              />
            </v-col>
            <v-col class="px-0">
              <ArtefactCarousel :artefacts="formData.artefacts" :index.sync="selectedIndex" :editing="editing"/>
            </v-col>
            <v-col cols="12">
              <AddButton size="20px" icon="mdi-account-multiple-plus" dark iconClass="pr-3" class="right: 0;" label="Mention" @click="showMentions = true" />
              <ProfileSearchBar
                :selectedItems.sync="artefact.mentions"
                :items="items"
                :searchString.sync="searchString"
                :openMenu.sync="showMentions"
                type="profile"
                item="preferredName"
              />
              <AvatarGroup v-if="artefact.mentions.length > 0"
                :profiles="artefact.mentions"
                show-labels
                size="40px"
                deletable
                @delete="removeItem(artefact.mentions, $event)"
              />
            </v-col>
            <v-col cols="12" class="py-2 px-1">
              <v-textarea
                v-model="artefact.description"
                label="Description"
                v-bind="customProps"
                no-resize
                rows="3"
                auto-grow
              />
            </v-col>
            <v-col cols="6" sm="12" md="3" class="py-2 px-1">
              <v-text-field
                v-model="artefact.format"
                label="Format"
                v-bind="customProps"
              />
            </v-col>
            <v-col cols="6" sm="12" md="3" class="py-2 px-1">
              <v-text-field
                v-model="artefact.identifier"
                label="Identifier"
                v-bind="customProps"
              />
            </v-col>
            <v-col cols="6" sm="12" md="3" class="py-2 px-1">
              <v-text-field
                v-model="artefact.language"
                label="Language"
                v-bind="customProps"
              />
            </v-col>
            <v-col cols="6" sm="12" md="3" class="py-2 px-1">
              <v-text-field
                v-model="artefact.licence"
                label="Licence"
                v-bind="customProps"
              />
            </v-col>
            <v-col cols="6" sm="12" md="3" class="py-2 px-1">
              <v-text-field
                v-model="artefact.rights"
                label="Rights"
                v-bind="customProps"
              />
            </v-col>
            <v-col cols="6" sm="12" md="3" class="py-2 px-1">
              <v-text-field
                v-model="artefact.source"
                label="Source"
                v-bind="customProps"
              />
            </v-col>
            <v-col cols="6" sm="12" md="3" class="py-2 px-1">
              <v-text-field
                v-model="artefact.duration"
                label="Duration"
                type="number"
                v-bind="customProps"
              />
            </v-col>
            <v-col cols="6" sm="12" md="3" class="py-2 px-1">
              <v-text-field
                v-model="artefact.size"
                label="Size"
                type="number"
                v-bind="customProps"
              />
            </v-col>
            <v-col cols="12" class="py-2 px-1">
              <v-textarea
                v-model="artefact.translation"
                label="Translation / Transcription"
                v-bind="customProps"
                no-resize
                rows="3"
                auto-grow
              />
            </v-col>
          </v-row>
        </v-container>
      </v-card>
    </v-dialog>
</template>

<script>
import ArtefactCarousel from '@/components/archive/ArtefactCarousel.vue'
import clone from 'lodash.clonedeep'
import { personComplete } from '@/mocks/person-profile'
import AddButton from '@/components/button/AddButton.vue'
import ProfileSearchBar from '@/components/archive/ProfileSearchBar.vue'
import AvatarGroup from '@/components/AvatarGroup.vue'

const EMPTY_ARTEFACT = {
  type: '',
  id: '',
  title: '',
  blob: '',
  description: '',
  format: '',
  identifier: '',
  language: '',
  licence: '',
  // "recps" // [String] Is this needed?
  rights: '',
  source: '',
  translation: '',
  duration: 0,
  size: 0,
  transcription: '',
  mentions: []
}

export default {
  name: 'NewArtefactDialog',
  props: {
    show: Boolean,
    story: Object,
    index: Number
  },
  components: {
    ArtefactCarousel,
    AddButton,
    ProfileSearchBar,
    AvatarGroup
  },
  data () {
    return {
      items: [...personComplete.children, ...personComplete.parents, ...personComplete.siblings],
      showMentions: false,
      editing: true,
      artefact: EMPTY_ARTEFACT,
      selectedIndex: 0,
      formData: clone(this.story)
    }
  },
  mounted () {
    this.artefact = this.formData.artefacts[0]
  },
  watch: {
    selectedIndex (newIndex) {
      if (newIndex) this.artefact = this.formData.artefacts[newIndex]
    }
  },
  computed: {
    storyDate () {
      var start = this.formData.recordDate
      var end = this.formData.recordEndDate
      if (start && end) {
        return start + '-' + end
      }
      return start
    },
    mobile () {
      return this.$vuetify.breakpoint.xs || this.$vuetify.breakpoint.sm
    },
    width () {
      if (this.mobile) return '100%'
      return '700px'
    },
    customProps () {
      return {
        flat: this.editing,
        // outlined: true,
        hideDetails: true,
        placeholder: ' ',
        class: this.editing ? '' : 'custom py-2 px-0',
        readonly: !this.editing,
        outlined: this.editing
      }
    }
  },
  methods: {
    selectedArtefact (index) {
      this.artefact = this.formData.artefacts[index]
      this.selectedIndex = index
    },
    close () {
      this.$emit('close')
    }
  }
}
</script>
<style scoped>
.custom.v-text-field > .v-input__control > .v-input__slot:before {
  border-style: none;
}
.custom.v-text-field > .v-input__control > .v-input__slot:after {
  border-style: none;
}
</style>
