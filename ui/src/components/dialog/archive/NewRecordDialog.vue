<template>
  <Dialog :show="show" :title="title" @close="close" width="70%" :goBack="close" enableMenu>

      <!-- FORM -->
      <template v-slot:content>
        <RecordForm ref="recordForm" :editing="editing" :formData.sync="formData"/>
      </template>

      <template v-if="editing" v-slot:before-actions>
        <v-col cols="12" sm="auto" class="mt-4">
          <v-btn text @click="$emit('delete')">
            Delete this record
            <v-icon class="pl-2">mdi-delete</v-icon>
          </v-btn>
        </v-col>
      </template>

      <template v-slot:actions>
        <v-btn @click="close"
          text large fab
          class="secondary--text"
          :class="mobile ? 'mr-4':''"
        >
          <v-icon>mdi-close</v-icon>
        </v-btn>
        <v-btn @click="submit"
            text large fab
            class="blue--text"
          >
            <v-icon>mdi-check</v-icon>
          </v-btn>
      </template>
    </Dialog>
</template>

<script>
import pick from 'lodash.pick'
import isEmpty from 'lodash.isempty'
import isEqual from 'lodash.isequal'

import Dialog from '@/components/dialog/Dialog.vue'
import RecordForm from '@/components/archive/RecordForm.vue'
import clone from 'lodash.clonedeep'
import { mapActions } from 'vuex'

const EMPTY_STORY = {
  id: '',
  title: '',
  description: '',
  timeInterval: '',
  startDate: '',
  endDate: '',
  location: '',
  locationDescription: '',
  submissionDate: '',
  creator: {},
  contributionNotes: '',

  format: '',
  identifier: '',
  source: '',
  language: '',
  translation: '',
  culturalNarrative: '',

  mentions: [],
  categories: [],
  collections: [],
  access: [],
  contributors: [],
  protocols: [],
  relatedRecords: [],
  artefacts: []
}

function setDefaultStory (newStory) {
  var story = clone(newStory)
  var timeInterval = ['', '']
  if (story.timeInterval) {
    timeInterval = story.timeInterval.split('/')
  }
  var artefacts = story.artefacts

  if (artefacts && artefacts.length > 0) {
    artefacts = artefacts.map(a => a.artefact)
  }

  return {
    id: story.id,
    title: story.title,
    description: story.description,
    timeInterval: story.timeInterval,
    startDate: timeInterval[0],
    endDate: timeInterval[1],
    location: story.location,
    locationDescription: story.locationDescription,
    creator: story.creator,
    submissionDate: story.submissionDate,
    contributionNotes: story.contributionNotes,

    format: story.format,
    identifier: story.identifier,
    source: story.source,
    language: story.language,
    translation: story.translation,
    culturalNarrative: story.culturalNarrative,

    mentions: story.mentions,
    categories: story.categories,
    collections: story.collections,
    access: story.access,
    contributors: story.contributors,
    protocols: story.protocols,
    relatedRecords: story.relatedRecords,
    artefacts
  }
}

function storyChanges (initial, updated) {
  let changes = []
  Object.entries(updated).forEach(([key, value]) => {
    if (!isEqual(updated[key], initial[key])) {
      switch (true) {
        case Array.isArray(updated[key]) && key !== 'artefacts':
          changes[key] = { add: [], remove: [] }
          changes[key].add = arrayChanges(updated[key], initial[key])
          changes[key].remove = arrayChanges(initial[key], updated[key])

          if (changes[key].add.length === 0) delete changes[key].add
          if (changes[key].remove.length === 0) delete changes[key].remove

          // means the same item was remove then added back in
          if (isEmpty(changes[key])) delete changes[key]
          break
        default:
          changes[key] = updated[key]
          break
      }
    }
  })

  //Update the submissionDate with the new record 
  var submissionDate = new Date().toISOString().slice(0,10)
  changes['submissionDate'] = submissionDate

  return changes
}

function arrayChanges (array1, array2) {
  return array1.filter(item => !array2.some(item2 => item.id === item2.id))
    .map(item => item.id) // map it to id
}

const PERMITTED_STORY_ATTRS = Object.keys(setDefaultStory(EMPTY_STORY))

function storySubmission (newStory) {
  var output = {}
  var story = pick(newStory, [...PERMITTED_STORY_ATTRS])
  Object.entries(story).forEach(([key, value]) => {
    if (!isEmpty(value)) {
      output[key] = value
    }
  })
  var timeInterval = story.startDate + '/' + story.endDate
  output['timeInterval'] = timeInterval
  
  var submissionDate = new Date().toISOString().slice(0,10)
  output['submissionDate'] = submissionDate

  return Object.assign({}, output)
}

export default {
  name: 'NewRecordDialog',
  components: {
    Dialog,
    RecordForm
  },
  props: {
    show: { type: Boolean, required: true },
    story: { type: Object, default () { return EMPTY_STORY } },
    title: String,
    editing: { type: Boolean, default: false }
  },
  data () {
    return {
      formData: setDefaultStory(this.story)
    }
  },
  computed: {
    mobile () {
      return this.$vuetify.breakpoint.xs
    }
  },
  watch: {
    story: {
      handler (newVal) {
      },
      deep: true
    },
    'formData.startDate' (newVal) {
      if (this.formData.timeInterval) {
        var dates = this.formData.timeInterval.split('/')
        this.formData.timeInterval = (newVal || '') + '/' + (dates[1] || '')
      } else {
        this.formData.timeInterval = (newVal || '') + '/'
      }
    },
    'formData.endDate' (newVal) {
      if (this.formData.timeInterval) {
        var dates = this.formData.timeInterval.split('/')
        this.formData.timeInterval = (dates[0] || '') + '/' + (newVal || '')
      } else {
        this.formData.timeInterval = '/' + (newVal || '')
      }
    }
  },
  methods: {
    ...mapActions(['setDialog']),
    close () {
      this.formData = setDefaultStory(this.story)
      this.$emit('close')
    },
    submit () {
      var output = {}
      if (this.editing) {
        // get all changes
        output = { id: this.story.id, ...storyChanges(this.story, this.formData) }
      } else {
        output = storySubmission(this.formData)
      }
      this.$emit('submit', output)
      this.close()
    }
  }
}
</script>

<style scoped lang="scss">
.custom.v-text-field > .v-input__control > .v-input__slot:before {
  border-style: none;
}
.custom.v-text-field > .v-input__control > .v-input__slot:after {
  border-style: none;
}
.close {
  top: -25px;
  right: -10px;
}
.big-avatar {
  position: relative;
  top: -20px;
}
.v-input--checkbox label {
  font-size: 14px;
}

.v-input--radio-group__input label {
  font-size: 14px;
}
</style>
