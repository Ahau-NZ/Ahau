<template>
  <!-- <v-card light> -->
  <div>
    <v-form ref="form" v-model="form.valid" lazy-validation>
      <v-row>
        <v-col cols="12" sm="12" md="12">
          <v-row>
            <v-col cols="12" class="pa-1">
              <v-text-field
                v-model="formData.title"
                label="Title"
                v-bind="customProps"
              />
            </v-col>
            <v-col cols="12">
              <input v-show="false" ref="fileInput" type="file" accept="audio/*,video/*,image/*" multiple @change="processMediaFiles($event)" />
              <AddButton @click="$refs.fileInput.click()" label="Attact media or files"/>
          </v-col>
          <v-col v-if="formData.artefacts.length > 0" cols="12" class="pl-0 pr-0">
            <ArtefactCarousel :artefacts="formData.artefacts"
              @delete="removeArtefact($event)"
              @update="toggleDialog($event)"
              editing
            />
          </v-col>
            <v-col cols="12">
              <AddButton @click="warn('location')" label="Add location"/>
            </v-col>
            <v-col cols="12" class="pa-1">
              <v-textarea
                v-model="formData.description"
                label="Description"
                v-bind="customProps"
                no-resize
                rows="3"
                auto-grow
              >
              </v-textarea>
            </v-col>
            <v-col cols="12" sm="12" md="6" class="pa-1">
              <v-text-field
                v-model="formData.recordDate"
                label="Date"
                v-bind="customProps"
              />
            </v-col>
            <v-col cols="12" sm="12" md="6" class="pa-1">
              <v-checkbox v-model="hasEndDate" v-if="!hasEndDate"
                label="include an end date" :hide-details="true"
                v-bind="customProps"
              />
              <v-text-field
                v-else
                v-model="formData.recordEndDate"
                label="End Date"
                v-bind="customProps"
                @click:clear="hasEndDate = false"
              />
            </v-col>

            <v-col :cols="mobile ? '12' : formData.mentions.length > 2 ? 'auto' : '4'">
              <AddButton size="20px" icon="mdi-account-multiple-plus" iconClass="pr-3" class="right: 0;" label="Mention" @click="showMentions = true" />
              <ProfileSearchBar
                :selectedItems.sync="formData.mentions"
                :items="items"
                :searchString.sync="searchString"
                :openMenu.sync="showMentions"
                type="profile"
                item="preferredName"
              />
              <AvatarGroup v-if="formData.mentions.length > 0"
                :profiles="formData.mentions"
                show-labels
                size="40px"
                deletable
                @delete="removeItem(formData.mentions, $event)"
              />
            </v-col>
            <v-col :cols="mobile ? '12' : formData.categories.length > 0 ? 'auto' : '4'">
              <AddButton label="Category" @click="showCategories = true" />
              <ProfileSearchBar
                :selectedItems.sync="formData.categories"
                :items="categories"
                :searchString.sync="searchString"
                :openMenu.sync="showCategories"
                item=""
              />
              <v-chip-group
                column
                v-if="formData.categories.length > 0"
              >
                <v-chip v-for="(category, i) in formData.categories" :key="category"
                  label
                  outlined
                  close
                  close-icon="mdi-close"
                  @click:close="removeItem(formData.categories, i)"
                >
                  {{ category.title }}
                </v-chip>
              </v-chip-group>
            </v-col>
            <v-col :cols="mobile ? '12' : formData.collections.length > 0 ? 'auto' : '4'">
              <AddButton label="Collection" @click="showCollections = true" />
              <ProfileSearchBar
                :selectedItems.sync="formData.collections"
                :items="collections"
                :searchString.sync="searchString"
                :openMenu.sync="showCollections"
                type="collection"
                item="title"
              />
              <ChipGroup :chips="formData.collections" deletable @delete="removeItem(formData.collections, $event)" />
            </v-col>
            <v-col :cols="mobile ? '12' : formData.access.length > 0 ? 'auto' : '4'">
              <AddButton label="Access" @click="showAccess = true" />
              <ProfileSearchBar
                :selectedItems.sync="formData.access"
                :items="items"
                :searchString.sync="searchString"
                :openMenu.sync="showAccess"
                type="profile"
                item="preferredName"
              />
              <AvatarGroup v-if="formData.access.length > 0"
                :profiles="formData.access"
                show-labels
                size="40px"
                deletable
                @delete="removeItem(formData.access, $event)"
              />
            </v-col>
            <v-col :cols="mobile ? '12' : formData.protocols.length > 0 ? 'auto' : '4'">
              <AddButton label="Protocol" @click="showProtocols = true" />
              <ProfileSearchBar
                :selectedItems.sync="formData.protocols"
                :items="items"
                :searchString.sync="searchString"
                :openMenu.sync="showProtocols"
                type="profile"
                item="preferredName"
              />
              <AvatarGroup v-if="formData.protocols.length > 0"
                :profiles="formData.protocols"
                show-labels
                size="40px"
                deletable
                isView
                @delete="removeItem(formData.protocols, $event)"
              />
            </v-col>
          </v-row>
        </v-col>
      </v-row>
      <v-divider/>
      <v-card-actions class="pt-2 pb-2">
        <v-row @click="show = !show" ripple class="clickable">
          <v-col>
            <span class="pa-0 ma-0">Advanced</span>
          </v-col>
          <v-btn icon right>
            <v-icon>{{ show ? 'mdi-chevron-up' : 'mdi-chevron-down' }}</v-icon>
          </v-btn>
        </v-row>
      </v-card-actions>
      <v-divider v-if="!show"/>
      <v-expand-transition>
        <div v-show="show">
          <v-row>
            <v-col :cols="mobile ? '12' : formData.contributors.length > 0 ? 'auto' : '2'">
              <AddButton label="Contributor" @click="showContributors = true" />
              <ProfileSearchBar
                :selectedItems.sync="formData.contributors"
                :items="items"
                :searchString.sync="searchString"
                :openMenu.sync="showContributors"
                type="profile"
                item="preferredName"
              />
              <AvatarGroup v-if="formData.contributors.length > 0"
                :profiles="formData.contributors"
                show-labels
                size="40px"
                deletable
                @delete="removeItem(formData.contributors, $event)"
              />
            </v-col>
            <v-col :cols="mobile ? '12' : formData.creator.id ? 'auto' : '2'">
              <AddButton label="Creator" @click="showCreator = true" />
              <ProfileSearchBar
                :selectedItems.sync="formData.creator"
                :items="items"
                :searchString.sync="searchString"
                :openMenu.sync="showCreator"
                single
                type="profile"
                item="preferredName"
              />
              <div v-if="formData.creator.id" class="pt-5">
                <Avatar
                  style="width:50px"
                  size="40px"
                  :image="formData.creator.avatarImage"
                  :alt="formData.creator.preferredName"
                  :gender="formData.creator.gender"
                  :bornAt="formData.creator.bornAt"
                  :deceased="formData.creator.deceased"
                  showLabel
                  deletable
                  @delete="formData.creator = {}"
                />
              </div>
            </v-col>
            <v-col :cols="mobile ? '12' : formData.relatedRecords.length > 0 ? 'auto' : '4'">
              <AddButton label="Related records" @click="showRecords = true" />
              <ProfileSearchBar
                :selectedItems.sync="formData.relatedRecords"
                :items="collections"
                :searchString.sync="searchString"
                :openMenu.sync="showRecords"
                type="collection"
                item="title"
              />
              <ChipGroup :chips="formData.relatedRecords" deletable @delete="removeItem(formData.relatedRecords, $event)" />
            </v-col>
            <v-col :cols="mobile ? '12' : '4'" class="pt-0 pa-1">
              <v-text-field
                v-model="formData.submissionDate"
                label="Submission Date"
                v-bind="customProps"
              />
            </v-col>
            <v-col cols="12" class="pa-1">
              <v-textarea
                v-if="show"
                v-model="formData.contributionNotes"
                label="Contribution notes"
                v-bind="customProps"
                no-resize
                rows="3"
                auto-grow
              >
              </v-textarea>
            </v-col>
            <v-col cols="12" class="pa-1">
              <v-textarea
                v-if="show"
                v-model="formData.locationDescription"
                label="Location description"
                v-bind="customProps"
                no-resize
                rows="3"
                auto-grow
              >
              </v-textarea>
            </v-col>
            <v-col cols="12" class="pa-1">
              <v-textarea
                v-if="show"
                v-model="formData.culturalNarrative"
                label="Cultural Narrative"
                v-bind="customProps"
                no-resize
                rows="3"
                auto-grow
              >
              </v-textarea>
            </v-col>
            <v-col :cols="mobile ? '6' : '3'" class="pa-1">
              <v-text-field
                v-model="formData.format"
                label="Format"
                v-bind="customProps"
              />
            </v-col>
            <v-col :cols="mobile ? '6' : '3'" class="pa-1">
              <v-text-field
                v-model="formData.identifier"
                label="Identifier"
                v-bind="customProps"
              />
            </v-col>
            <v-col :cols="mobile ? '6' : '3'" class="pa-1">
              <v-text-field
                v-model="formData.source"
                label="Source"
                v-bind="customProps"
              />
            </v-col>
            <v-col :cols="mobile ? '6' : '3'" class="pa-1">
              <v-text-field
                v-model="formData.language"
                label="Language"
                v-bind="customProps"
              />
            </v-col>
            <v-col cols="12" class="pa-1">
              <v-textarea
                v-model="formData.translation"
                label="Translation/Transcription"
                v-bind="customProps"
                no-resize
                rows="3"
                auto-grow
              >
              </v-textarea>
            </v-col>
          </v-row>
        </div>
      </v-expand-transition>
    </v-form>
  <!-- </v-card> -->
  <NewArtefactDialog v-if="dialog" :show="dialog" :index="index" :artefacts="formData.artefacts" @close="dialog = false" @delete="removeArtefact($event)"/>
  </div>
</template>

<script>
import AvatarGroup from '@/components/AvatarGroup.vue'
import Avatar from '@/components/Avatar.vue'

import ChipGroup from '@/components/archive/ChipGroup.vue'

import ProfileSearchBar from '@/components/archive/ProfileSearchBar.vue'
import AddButton from '@/components/button/AddButton.vue'

import { personComplete } from '@/mocks/person-profile'
import { firstMocks } from '@/mocks/collections'
import { artefacts } from '@/mocks/artefacts'

import NewArtefactDialog from '@/components/archive/NewArtefactDialog.vue'
import ArtefactCarousel from '@/components/archive/ArtefactCarousel.vue'

import {
  RULES
} from '@/lib/constants'

const imageRegex = /^image\//
const audioRegex = /^audio\//
const videoRegex = /^video\//

export default {
  name: 'RecordForm',
  components: {
    Avatar,
    AddButton,
    ProfileSearchBar,
    AvatarGroup,
    ChipGroup,
    NewArtefactDialog,
    ArtefactCarousel
  },
  props: {
    formData: {
      type: Object
    },
    editing: Boolean
  },
  data () {
    return {
      dialog: false,
      index: 0,
      ARTEFACTS: artefacts,
      model: 0,
      show: false,
      categories: [{title: 'one'}, {title: 'two'}, {title: 'three'}, {title: 'four'}, {title: 'five'} , {title: 'six'}, {title: 'seven'}],
      collections: firstMocks,
      showMentions: false,
      showCategories: false,
      showContributors: false,
      showCreator: false,
      showCollections: false,
      showAccess: false,
      showProtocols: false,
      showRecords: false,
      searchString: '',
      items: [...personComplete.children, ...personComplete.parents, ...personComplete.siblings],
      hasEndDate: false,
      form: {
        valid: true,
        rules: RULES
      }
    }
  },
  computed: {
    mobile () {
      return this.$vuetify.breakpoint.xs || this.$vuetify.breakpoint.sm
    },
    customProps () {
      return {
        outlined: true,
        hideDetails: true,
        placeholder: ' ',
        class: 'custom',
        clearable: true
      }
    }
  },
  methods: {
    toggleDialog ($event) {
      this.index = $event
      this.dialog = true
    },
    warn (field) {
      alert(`Cannot add ${field} yet`)
    },
    processMediaFiles ($event) {
      this.index = this.formData.artefacts.length
      const { files } = $event.target

      Array.from(files).forEach((file, i) => {
        this.formData.artefacts.push(this.processFile(file))
      })

      this.dialog = true
    },
    processFile (file) {
      var attrs = {}

      const type = this.getFileType(file.type)
      const title = this.getFileName(file.name)
      const format = this.getFormat(file.type)
      const blob = URL.createObjectURL(file)

      if (type === 'video' || type === 'audio') {
        attrs = {
          duration: '',
          size: file.size,
          transcription: ''
        }
      }

      attrs = {
        ...attrs,
        type,
        blob,
        title,
        description: '',
        format,
        identifier: '',
        language: '',
        licence: '',
        rights: '',
        source: '',
        translation: '',
        mentions: []
      }

      return attrs
    },
    getFileType (type) {
      switch (true) {
        case imageRegex.test(type):
          return 'photo'
        case audioRegex.test(type):
          return 'audio'
        case videoRegex.test(type):
          return 'video'
        default:
          return ''
      }
    },
    getFormat (fileType) {
      return fileType.replace(/.*\//, '')
    },
    getFileName (fileName) {
      return fileName.replace(/\.[^/.]+$/, '')
    },
    removeItem (array, $event) {
      array.splice($event, 1)
    },
    removeArtefact ($event) {
      console.error('deleting an artefact not fully implemented')
      // either remove from the database or from formData
      confirm('Are you sure you want to delete this artefact?') && this.removeItem(this.formData.artefacts, $event)

      if (this.formData.artefacts.length === 0) this.dialog = false
    }
  }
}
</script>

<style scoped>
.video-player {
  width: 500px;
}
  .custom.v-text-field>.v-input__control>.v-input__slot:before {
    border-style: none;
  }

  .custom.v-text-field>.v-input__control>.v-input__slot:after {
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

  .v-chip__close {
    font-size: 16px !important;
  }

  .field {
    color: rgba(0, 0, 0, 0.6);
  }

  .clickable {
    cursor: pointer;
  }
</style>
