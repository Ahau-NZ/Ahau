<template>
    <v-dialog v-model="show"
      transition="dialog-bottom-transition"
      class="pa-0 ma-0"
      fullscreen
    >
      <v-card tile flat>
        <v-container style="width: 900px" class="pa-0">
          <v-row>
            <v-col cols="12">
              <v-card-actions>
                <v-btn absolute right icon>
                  <v-icon>mdi-close</v-icon>
                </v-btn>
              </v-card-actions>
            </v-col>
            <v-col cols="12">
              <h1>
                <v-text-field
                  v-model="artefact.title"
                  label="Title"
                  v-bind="customProps"
                />
              </h1>
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
                dark
              />
            </v-col>
            <v-col cols="12">
              <v-textarea
                v-model="artefact.description"
                label="Description"
                v-bind="customProps"
                no-resize
                rows="3"
                auto-grow
              />
            </v-col>
            <v-col cols="6" sm="12" md="3">
              <v-text-field
                v-model="artefact.format"
                label="Format"
                v-bind="customProps"
              />
            </v-col>
            <v-col cols="6" sm="12" md="3">
              <v-text-field
                v-model="artefact.identifier"
                label="Identifier"
                v-bind="customProps"
              />
            </v-col>
            <v-col cols="6" sm="12" md="3">
              <v-text-field
                v-model="artefact.language"
                label="Language"
                v-bind="customProps"
              />
            </v-col>
            <v-col cols="6" sm="12" md="3">
              <v-text-field
                v-model="artefact.licence"
                label="Licence"
                v-bind="customProps"
              />
            </v-col>
            <v-col cols="6" sm="12" md="3">
              <v-text-field
                v-model="artefact.rights"
                label="Rights"
                v-bind="customProps"
              />
            </v-col>
            <v-col cols="6" sm="12" md="3">
              <v-text-field
                v-model="artefact.source"
                label="Source"
                v-bind="customProps"
              />
            </v-col>
            <v-col cols="6" sm="12" md="3">
              <v-text-field
                v-model="artefact.duration"
                label="Duration"
                type="number"
                v-bind="customProps"
              />
            </v-col>
            <v-col cols="6" sm="12" md="3">
              <v-text-field
                v-model="artefact.size"
                label="Size"
                type="number"
                v-bind="customProps"
              />
            </v-col>
            <v-col cols="12">
              <v-textarea
                v-model="artefact.translation"
                label="Translation / Transcription"
                v-bind="customProps"
                no-resize
                rows="3"
                auto-grow
              />
            </v-col>
            <v-col cols="10"/>
            <v-col cols="1">
              <v-card-actions>
                <v-btn @click="close"
                  text large fab
                  class="secondary--text"
                >
                  <v-icon color="secondary">mdi-close</v-icon>
                </v-btn>
                <v-btn @click="submit"
                  text large fab
                  class="blue--text"
                >
                  <v-icon>mdi-check</v-icon>
                </v-btn>
              </v-card-actions>
            </v-col>
          </v-row>
        </v-container>
      </v-card>
    </v-dialog>
</template>

<script>
import ArtefactCarousel from '@/components/archive/ArtefactCarousel.vue'

import clone from 'lodash.clonedeep'
import isEmpty from 'lodash.isempty'
import isEqual from 'lodash.isequal'
import pick from 'lodash.pick'

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

const PERMITTED_ARTEFACT_ATTRS = Object.keys(EMPTY_ARTEFACT)

function artefactChanges (initial, updated, searchNested) {
  let changes = []
  Object.entries(updated).forEach(([key, value]) => {
    if (!isEqual(updated[key], initial[key])) {
      switch (true) {
        case Array.isArray(updated[key]):
          changes[key] = { add: [], remove: [] }
          changes[key].add = arrayChanges(updated[key], initial[key])
          changes[key].remove = arrayChanges(initial[key], updated[key])

          if (changes[key].add.length === 0) delete changes[key].add
          if (changes[key].remove.length === 0) delete changes[key].remove

          // means the same item was remove then added back in
          if (isEmpty(changes[key])) delete changes[key]

          break
        default:
          if (searchNested) {
            changes[key] = artefactChanges(initial[key], updated[key], false)
          } else {
            changes[key] = updated[key]
          }
          break
      }
    }
  })
  return changes
}

function arrayChanges (array1, array2) {
  return array1.filter(item => !array2.some(item2 => item.id === item2.id))
    .map(item => item.id) // map it to id
}

function artefactSubmission (newArtefact) {
  var output = {}
  var artefact = pick(newArtefact, [...PERMITTED_ARTEFACT_ATTRS])
  Object.entries(artefact).forEach(([key, value]) => {
    if (!isEmpty(artefact[key])) {
      output[key] = value
    }
  })
  return Object.assign({}, output)
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
      confirm('Are you sure you want to close without saving? All changes will be lost!') && this.$emit('close')
    },
    submit () {
      var output = {}
      if (this.editing) {
        // get all changes
        output = artefactChanges(this.story.artefacts, this.formData.artefacts, true)
      } else {
        output = artefactSubmission(this.formData)
      }

      console.log('output', output)

      this.$emit('submit', output)
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
