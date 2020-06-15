<template>
    <v-dialog v-model="show"
      transition="dialog-bottom-transition"
      :fullscreen="mobile"
      width="70%"
      content-class="artefact-dialog"
    >
      <v-card tile flat style="overflow-x:hidden">
        <v-container :class="mobile ? 'px-1':'pa-0'" :style="`width:${width};`">
          <v-row>
            <v-col cols="12" >
              <v-card-actions>
                <v-btn absolute right icon @click="close">
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
                  dark
                />
              </h1>
            </v-col>
            <v-col cols="12" class="px-0">
              <ArtefactCarousel :artefacts="formData" :index.sync="selectedIndex" :editing="!editing" @processMediaFiles="$emit('processMediaFiles',$event)" @delete="$emit('delete', $event)"/>
            </v-col>
            <v-col cols="12">
              <AddButton size="20px" icon="mdi-account-multiple-plus" dark iconClass="pr-3" class="right: 0;" label="Mention" @click="showMentions = true"  justify="start"/>
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
            <v-col cols="12" class=py-1>
              <v-textarea
                v-model="artefact.description"
                label="Description"
                v-bind="customProps"
                no-resize
                rows="3"
                auto-grow
              />
            </v-col>
            <v-col cols="12" sm="12" md="3" class=py-1>
              <v-text-field
                v-model="artefact.format"
                label="Format"
                v-bind="customProps"
              />
            </v-col>
            <v-col class=py-1 cols="12" sm="12" md="3">
              <v-text-field
                v-model="artefact.identifier"
                label="Identifier"
                v-bind="customProps"
              />
            </v-col>
            <v-col class=py-1 cols="12" sm="12" md="3">
              <v-text-field
                v-model="artefact.language"
                label="Language"
                v-bind="customProps"
              />
            </v-col>
            <v-col class=py-1 cols="12" sm="12" md="3">
              <v-text-field
                v-model="artefact.licence"
                label="Licence"
                v-bind="customProps"
              />
            </v-col>
            <v-col class=py-1 cols="12" sm="12" md="3">
              <v-text-field
                v-model="artefact.rights"
                label="Rights"
                v-bind="customProps"
              />
            </v-col>
            <v-col class=py-1 cols="12" sm="12" md="3">
              <v-text-field
                v-model="artefact.source"
                label="Source"
                v-bind="customProps"
              />
            </v-col>
            <v-col class=py-1 cols="12" sm="12" md="3">
              <v-text-field
                v-model="artefact.duration"
                label="Duration"
                type="number"
                v-bind="customProps"
              />
            </v-col>
            <v-col class=py-1 cols="12" sm="12" md="3">
              <v-text-field
                v-model="artefact.size"
                label="Size"
                type="number"
                v-bind="customProps"
              />
            </v-col>
            <v-col class=py-1 cols="12">
              <v-textarea
                v-model="artefact.translation"
                label="Translation / Transcription"
                v-bind="customProps"
                no-resize
                rows="3"
                auto-grow
              />
            </v-col>
            <v-col cols="12">
              <v-spacer/>
              <v-btn text @click="$emit('delete', selectedIndex)">
                Delete this artefact
                <v-icon class="pl-2">mdi-delete</v-icon>
              </v-btn>
              <v-spacer/>
            </v-col>
            <v-col>
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

function artefactChanges (initial, updated) {
  let changes = []
  Object.entries(updated).forEach(([key, value]) => {
    if (!isEqual(updated[key], initial[key])) {
      if (typeof updated[key] === 'object') {
        if (Array.isArray(updated[key])) {
          changes[key] = { add: [], remove: [] }
          changes[key].add = arrayChanges(updated[key], initial[key])
          changes[key].remove = arrayChanges(initial[key], updated[key])

          if (changes[key].add.length === 0) delete changes[key].add
          if (changes[key].remove.length === 0) delete changes[key].remove

          // means the same item was remove then added back in
          if (isEmpty(changes[key])) delete changes[key]
        } else {
          changes[key] = artefactChanges(initial[key], updated[key])
        }
      } else {
        changes[key] = updated[key]
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
    artefacts: Array,
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
      searchString: '',
      editing: true,
      selectedIndex: this.index,
      formData: clone(this.artefacts)
    }
  },
  watch: {
    selectedIndex (newIndex) {
      if (newIndex) this.artefact = this.formData[newIndex]
    },
    index (newIndex) {
      if (newIndex) this.selectedIndex = newIndex
    },
    artefacts: {
      deep: true,
      handler (newValue) {
        this.formData = clone(newValue)
        if (newValue.length === this.selectedIndex) this.selectedIndex--
      }
    }
  },
  mounted () {
    this.artefact = this.formData[this.selectedIndex]
  },
  computed: {
    mobile () {
      return this.$vuetify.breakpoint.xs || this.$vuetify.breakpoint.sm
    },
    artefact: {
      get () {
        return this.formData[this.selectedIndex]
      },
      set (artefact) {
        this.formData[this.selectedIndex] = artefact
      }
    },
    storyDate () {
      var start = this.formData.recordDate
      var end = this.formData.recordEndDate
      if (start && end) {
        return start + '-' + end
      }
      return start
    },
    width () {
      if (this.mobile) return '100%'
      return '99%'
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
    processMediaFiles ($event) {
      this.index = this.formData.artefacts.length
      const { files } = $event.target

      Array.from(files).forEach((file, i) => {
        this.formData.artefacts.push(this.processFile(file))
      })

    // this.newDialog = true
    },
    removeItem (array, index) {
      array.splice(index, 1)
    },
    close () {
      this.$emit('close')
    },
    submit () {
      var output = {}
      if (this.editing) {
        // get all changes
        output = artefactChanges(this.artefacts, this.formData)
      } else {
        output = artefactSubmission(this.formData)
      }
      this.$emit('submit', output)
      this.$emit('close')
    }
  }
}
</script>
<style lang="scss">
/* .custom.v-text-field > .v-input__control > .v-input__slot:before {
  border-style: none;
}
.custom.v-text-field > .v-input__control > .v-input__slot:after {
  border-style: none;
} */

.artefact-dialog {
    max-height: 91% !important;
}

 .v-input--is-focused {
  color: yellow !important;

}
// .v-input--is-focused {
//   border-color: yellow !important;
// }

.v-text-field .primary--text {
    // color: yellow !important;
}

</style>
