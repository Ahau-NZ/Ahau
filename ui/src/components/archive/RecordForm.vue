<template>
  <!-- <v-card light> -->
  <div>
    <v-form ref="form" v-model="form.valid" lazy-validation>
      <v-row class="px-3">
        <v-col cols="12" sm="12" md="12">
          <v-row>
            <v-col cols="12" class="pa-1">
              <v-text-field
                v-model="formData.title"
                label="Title"
                v-bind="customProps"
                class="title-input"
                style="text-align: start; font-size: 1.2em; font-weight: 500;"
              />
            </v-col>
            <v-col v-if="formData.artefacts && formData.artefacts.length > 0" cols="12" class="pl-0 pr-0">
              <ArtefactCarousel
                :artefacts="formData.artefacts"
                @delete="toggleDialog($event, 'delete')"
                @update="toggleDialog($event, 'new')"
                @processMediaFiles="processMediaFiles($event)"
                editing
              />
            </v-col>
            <v-col cols="6" >
              <div @click="$refs.fileInput.click()">
                <AddButton :size="mobile ? '40px' : '60px'" icon="mdi-image-plus"/>
                <p class="add-label clickable" >Add artefact</p>
              </div>
              <input v-show="false" ref="fileInput" type="file" accept="audio/*,video/*,image/*" multiple @change="processMediaFiles($event)" />
            </v-col>
            <v-col :cols="showLocation ? '12':'6'" class="py-0">
              <div v-if="!showLocation" @click="showLocation = true" class="pt-3">
                <AddButton :size="mobile ? '40px' : '60px'" icon="mdi-map-plus"/>
                <p class="add-label clickable" >Add location</p>
              </div>
              <v-row v-if="showLocation">
                <v-col :cols="formData.artefacts && formData.artefacts.length > 0 ? '6':'12'" class="pa-1">
                  <v-textarea
                    v-model="formData.location"
                    label="Location"
                    v-bind="customProps"
                    no-resize
                    rows="3"
                    auto-grow
                  >
                  </v-textarea>
                </v-col>
                <v-col :cols="formData.artefacts && formData.artefacts.length > 0 ? '6':'12'" class="pa-1">
                  <v-textarea
                    v-model="formData.locationDescription"
                    label="Location description"
                    v-bind="customProps"
                    no-resize
                    rows="3"
                    auto-grow
                  >
                  </v-textarea>
                </v-col>
              </v-row>
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

            <!-- ADD MENTIONS -->
            <v-col :cols="mobile ? '12' : formData.mentions && formData.mentions.length > 2 ? 'auto' : '3'" class="pr-0">
              <v-row v-if="!showMentions" class="pl-10 pt-2" @click="showMentions = true" >
                <v-icon small>mdi-plus</v-icon>
                <AddButton size="20px" icon="mdi-account" iconClass="pr-3" class="right: 0;" label="Mention" justify="start"/>
              </v-row>
              <ProfileSearchBar
                :selectedItems.sync="formData.mentions"
                :items="suggestions"
                :searchString.sync="searchString"
                :openMenu.sync="showMentions"
                placeholder="add mention"
                type="profile"
                item="preferredName"
                @getSuggestions="getSuggestions"
              />
              <AvatarGroup v-if="formData.mentions && formData.mentions.length > 0"
                :profiles="formData.mentions"
                show-labels
                size="40px"
                deletable
                @delete="removeItem(formData.mentions, $event)"
              />
              <v-divider v-if="mobile" light class="mt-6 mr-4"></v-divider>
            </v-col>

            <!-- ADD ACCESS -->
            <v-col :cols="mobile ? '12' : formData.access && formData.access.length > 1 ? 'auto' : '3'">
              <v-row v-if="!showAccess" @click="showAccess = true" class="pl-10 pt-2">
                <v-icon small>mdi-plus</v-icon>
                <AddButton size="20px" icon="mdi-file-key" iconClass="pr-3" label="Access" justify="start"/>
              </v-row>
              <ProfileSearchBar
                :selectedItems.sync="formData.access"
                :items="suggestions"
                :searchString.sync="searchString"
                :openMenu.sync="showAccess"
                type="profile"
                item="preferredName"
                placeholder="add access"
              />
              <AvatarGroup v-if="formData.access && formData.access.length > 0"
                :profiles="formData.access"
                show-labels
                size="40px"
                deletable
                @delete="removeItem(formData.access, $event)"
              />
              <v-divider v-if="mobile" light class="mt-6 mr-4"></v-divider>
            </v-col>

            <!-- ADD CREATOR -->
            <v-col :cols="mobile ? '12' : formData.creator ? 'auto' : '3'">
              <v-row v-if="!showCreator" @click="showCreator = true" class="pl-10 pt-2">
                <v-icon small>mdi-plus</v-icon>
                <AddButton size="20px" icon="mdi-account-circle" iconClass="pr-3" class="right: 0;" label="Creator" justify="start"/>
              </v-row>
              <!-- <AddButton label="Creator" @click="showCreator = true" /> -->
              <ProfileSearchBar
                :selectedItems.sync="formData.creator"
                :items="items"
                :searchString.sync="searchString"
                :openMenu.sync="showCreator"
                single
                type="profile"
                item="preferredName"
                placeholder="add creator"
              />
              <div v-if="formData.creator" class="pt-5 pl-5">
                <Avatar
                  style="width:50px"
                  size="40px"
                  :image="formData.creator.avatarImage"
                  :alt="formData.creator.preferredName"
                  :gender="formData.creator.gender"
                  :diedAt="formData.creator.diedAt"
                  :deceased="formData.creator.deceased"
                  showLabel
                  deletable
                  @delete="formData.creator = {}"
                />
              </div>
            </v-col>

           </v-row>
            <!-- TODO: ADD CATEGORIES -->
           <!-- <v-col :cols="mobile ? formData.categories.length > 2 ? 'auto' : '6' : formData.categories.length > 1 ? 'auto' : '3'">
              <v-row v-if="!showCategories" @click="showCategories = true" class="pl-10 pt-2">
                <v-icon small>mdi-plus</v-icon>
                <AddButton size="20px" icon="mdi-label" iconClass="pr-3"  label="Category" justify="start" />
              </v-row>
              <ProfileSearchBar
                :selectedItems.sync="formData.categories"
                :items="categories"
                :searchString.sync="searchString"
                :openMenu.sync="showCategories"
                item=""
                placeholder="add category"
              />
              <v-chip-group
                column
                v-if="formData.categories.length > 0"
              >
                <v-chip v-for="(category, i) in formData.categories" :key="i"
                  label
                  outlined
                  close
                  close-icon="mdi-close"
                  @click:close="removeItem(formData.categories, i)"
                >
                  {{ category.title }}
                </v-chip>
              </v-chip-group>
            </v-col> -->
            <!-- TODO: ADD COLLECTIONS -->
            <!-- <v-col :cols="mobile ? formData.categories.length > 0 ? '12' : '6' : formData.categories.length > 0 ? 'auto' : '3'">
              <v-row v-if="!showCollections" class="pl-10 pt-2" @click="showCollections = true">
                <v-icon small>mdi-plus</v-icon>
                <AddButton size="20px" icon="mdi-folder-multiple-image" iconClass="pr-3" label="Collection" justify="start"/>
              </v-row>
              <ProfileSearchBar
                :selectedItems.sync="formData.collections"
                :items="collections"
                :searchString.sync="searchString"
                :openMenu.sync="showCollections"
                type="collection"
                item="title"
                placeholder="add collection"
              />
              <ChipGroup :chips="formData.collections" deletable @delete="removeItem(formData.collections, $event)" />
            </v-col>-->
          <!-- TODO: ADD PROTOCOLS -->
          <!-- <v-col :cols="mobile ? '12' : formData.protocols.length > 0 ? 'auto' : '4'">
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
          </v-row> -->
        </v-col>
      </v-row>
      <v-divider/>
      <v-card-actions class="pt-2 pb-2 px-5">
        <v-row @click="show = !show" class="clickable">
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
          <v-row class="px-3">

            <!-- RELATED RECORDS -->
            <v-col :cols="mobile ? '12' : formData.relatedRecords && formData.relatedRecords.length > 0 ? 'auto' : '3'">
              <v-row v-if="!showRecords" @click="showRecords = true" class="pl-10">
                <v-icon small>mdi-plus</v-icon>
                <AddButton size="20px" icon="mdi-book-multiple" iconClass="pr-3" class="right: 0;" label="Related records"  justify="start"/>
              </v-row>
              <ProfileSearchBar
                :selectedItems.sync="formData.relatedRecords"
                :items="collections"
                :searchString.sync="searchString"
                :openMenu.sync="showRecords"
                type="collection"
                item="title"
                placeholder="add related records"
              />
              <ChipGroup type="story" :chips="formData.relatedRecords" deletable @delete="removeItem(formData.relatedRecords, $event)" />
              <v-divider v-if="mobile" light class="mt-6 mr-4"></v-divider>
            </v-col>
            <!-- ADD CONTRIBUTORS -->
            <!-- <v-col :cols="mobile ? formData.contributors.length > 2 ? 'auto' : '6' : formData.contributors.length > 1 ? 'auto' : '3'"> -->
            <v-col :cols="mobile ? '12' : formData.contributors && formData.contributors.length > 1 ? 'auto' : '3'">
              <v-row v-if="!showContributors" @click="showContributors = true" class="pl-10">
                <v-icon small>mdi-plus</v-icon>
                  <AddButton size="20px" icon="mdi-library" iconClass="pr-3" class="right: 0;" label="Contributor"  justify="start"/>
              </v-row>
              <ProfileSearchBar
                :selectedItems.sync="formData.contributors"
                :items="items"
                :searchString.sync="searchString"
                :openMenu.sync="showContributors"
                type="profile"
                item="preferredName"
                placeholder="contributors"
              />
              <AvatarGroup v-if="formData.contributors && formData.contributors.length > 0"
                :profiles="formData.contributors"
                show-labels
                size="40px"
                deletable
                @delete="removeItem(formData.contributors, $event)"
              />
            </v-col>

            <!-- ADD SUBMISSION DATE -->
            <v-col :cols="mobile ? '12' : '3'" class="pt-5 pa-1">
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
    <NewArtefactDialog
      v-if="newDialog"
      :show="newDialog"
      :index="index"
      :artefacts="formData.artefacts"
      @close="newDialog = false"
      @delete="toggleDialog($event, 'delete')"
      @submit="updateArtefacts($event)"
      @processMediaFiles="processMediaFiles($event)"
    />
    <DeleteArtefactDialog
      v-if="deleteDialog"
      :show="deleteDialog"
      :index="index"
      @close="deleteDialog = false"
      @submit="removeArtefact($event)"
    />
  </div>
</template>

<script>
import AvatarGroup from '@/components/AvatarGroup.vue'
import Avatar from '@/components/Avatar.vue'
import AddButton from '@/components/button/AddButton.vue'

import ChipGroup from '@/components/archive/ChipGroup.vue'
import ProfileSearchBar from '@/components/archive/ProfileSearchBar.vue'

import { findByName } from '@/lib/search-helpers.js'

import { personComplete } from '@/mocks/person-profile'
import { firstMocks } from '@/mocks/collections'
import { artefacts } from '@/mocks/artefacts'

import NewArtefactDialog from '@/components/dialog/artefact/NewArtefactDialog.vue'
import ArtefactCarousel from '@/components/artefact/ArtefactCarousel.vue'
import DeleteArtefactDialog from '@/components/dialog/artefact/DeleteArtefactDialog.vue'

import { RULES } from '@/lib/constants'
import { mapGetters } from 'vuex'

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
    ArtefactCarousel,
    DeleteArtefactDialog
  },
  props: {
    formData: {
      type: Object
    },
    editing: Boolean
  },
  data () {
    return {
      newDialog: false,
      deleteDialog: false,
      deleteRecordDialog: false,
      index: 0,
      ARTEFACTS: artefacts,
      search: false,
      model: 0,
      show: false,
      categories: [{ title: 'one' }, { title: 'two' }, { title: 'three' }, { title: 'four' }, { title: 'five' }, { title: 'six' }, { title: 'seven' }],
      collections: firstMocks,
      showLocation: false,
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
      suggestions: [],
      hasEndDate: false,
      form: {
        valid: true,
        rules: RULES
      }
    }
  },
  mounted () {
    this.showAdvanced()
  },
  computed: {
    ...mapGetters(['showStory']),
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
    showAdvanced () {
      if (this.showStory) this.show = true
    },
    async getSuggestions (name) {
      console.log('name: ', name)
      if (name) this.suggestions = await findByName(name)
      else this.suggestions = []
    },

    // clickedOff () {
    //   this.search = !this.search
    // },
    updateArtefacts (changes) {
      alert('WARNING, submission doesnt currently update artefacts')
    },
    toggleDialog ($event, dialog) {
      this.index = $event
      if (dialog === 'new') this.newDialog = !this.newDialog
      if (dialog === 'delete') this.deleteDialog = !this.deleteDialog
    },
    warn (field) {
      alert(`Cannot add ${field} yet`)
    },
    processMediaFiles ($event) {
      this.index = this.formData.artefacts ? this.formData.artefacts.length : 0
      const { files } = $event.target

      Array.from(files).forEach((file, i) => {
        this.formData.artefacts.push(this.processFile(file))
      })

      this.newDialog = true
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
      this.removeItem(this.formData.artefacts, this.index)

      if (this.formData.artefacts && this.formData.artefacts.length === 0) this.newDialog = false
    }
  }
}
</script>

<style scoped lang="scss">
.add-label {
  text-align: center;
  font-size: 0.8em;
  color: rgba(0, 0, 0, 0.6);
  padding-top: 4px;
}

.video-player {
  width: 500px;
}
.custom.v-text-field>.v-input__control>.v-input__slot:before {
  border-style: none;
}

.custom.v-text-field>.v-input__control>.v-input__slot:after {
  border-style: none;
}

.title-input >>> input{
  text-align: start !important;
  font-size: 1.2em;
  font-weight: 500;
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

.rounded-border {
  border: 0.5px solid rgba(0,0,0,0.3);
  border-radius: 5px;
  background-color: white;
}

.box-title {
  position: relative;
  bottom: 25px;
  left: 100px;
  background-color: white;
  width: 100px;
  padding-right: 0px;
}

.br {
  border-right: 0.5px solid rgba(0,0,0,0.8);
  width:100%
}

.icon-button {
    padding: 0px;
    width: 50px;
    display: flex;
    justify-content: flex-end;
}

.icon-search {
    width: 300px;
    display: flex;
    justify-items: flex-end;
}

</style>
