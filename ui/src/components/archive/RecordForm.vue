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
                class="title-input"
              />
            </v-col>

            <!-- <v-col v-if="!formData.artefacts.length" cols="6" class="my-2">
              <input v-show="false" ref="fileInput" type="file" accept="audio/*,video/*,image/*" multiple @change="processMediaFiles($event)" />
              <AddButton size="40px" icon="mdi-image-plus" iconClass="pr-3" class="right: 0;" @click="$refs.fileInput.click()" label="Attach media or files"/>
            </v-col>

            <v-col v-if="formData.artefacts.length" cols="12" class="pl-0 pr-0">
              <ArtefactCarousel :artefacts="formData.artefacts"
                @delete="removeItem(formData.artefacts, $event)"
                @processMediaFiles="processMediaFiles($event)"
              />
            </v-col>

            <v-col v-if="!showLocation" cols="6" class="my-2">
              <AddButton size="40px" icon="mdi-map" iconClass="pr-3" class="right: 0;" @click="showLocation = true" label="Add location information`"/>
            </v-col>

            <v-row v-if="showLocation" cols="12" class="px-3">
              <v-col cols="12" sm="12" md="6" class="pa-1">
                <v-textarea
                  v-model="formData.location"
                  label="Location"
                  v-bind="customProps"
                  no-resize
                  rows="3"
                  auto-grow
                />
              </v-col>
              <v-col cols="12" sm="12" md="6" class="pa-1">
                <v-textarea
                  v-model="formData.locationDescription"
                  label="Location description"
                  v-bind="customProps"
                  no-resize
                  rows="3"
                  auto-grow
                />
              </v-col> -->
            </v-row>

            <v-col cols="12">
              <input v-show="false" ref="fileInput" type="file" accept="audio/*,video/*,image/*" multiple @change="processMediaFiles($event)" />
              <AddButton @click="$refs.fileInput.click()" label="Attact media or files"/>
          </v-col>
          <v-col v-if="formData.artefacts.length > 0" cols="12" class="pl-0 pr-0">
            <ArtefactCarousel :artefacts="formData.artefacts"
              @delete="removeArtefact($event)"
              @update="toggleDialog($event, 'new-artefact')"
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

            <v-col :cols="mobile ? formData.mentions.length > 2 ? 'auto' : '6' : formData.mentions.length > 1 ? 'auto' : '3'">
              <v-row class="pl-2 pt-2">
                <v-icon small>mdi-plus</v-icon>
                <AddButton size="20px" icon="mdi-account" iconClass="pr-3" class="right: 0;" label="Mention" @click="showMentions = true" justify="start"/>
              </v-row>
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

            <v-col :cols="mobile ? formData.access.length > 2 ? 'auto' : '6' : formData.access.length > 1 ? 'auto' : '3'">
              <v-row @click="showAccess = true" class="pl-2 pt-2">
                <v-icon small>mdi-plus</v-icon>
                <AddButton size="20px" icon="mdi-file-key" iconClass="pr-3" label="Access" justify="start"/>
              </v-row>
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

           <v-col :cols="mobile ? formData.categories.length > 2 ? 'auto' : '6' : formData.categories.length > 1 ? 'auto' : '3'">
              <v-row @click="showCategories = true" class="pl-2 pt-2">
                <v-icon small>mdi-plus</v-icon>
                <AddButton size="20px" icon="mdi-label" iconClass="pr-3"  label="Category" justify="start" />
              </v-row>
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
            <v-col :cols="mobile ? formData.categories.length > 2 ? 'auto' : '6' : formData.categories.length > 1 ? 'auto' : '3'">
              <v-row class="pl-2 pt-2">
                <v-icon small>mdi-plus</v-icon>
                <AddButton size="20px" icon="mdi-folder-multiple-image" iconClass="pr-3" label="Collection" @click="showCollections = true" justify="start"/>
              </v-row>
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
           <!-- </v-row> -->
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
            <v-col :cols="mobile ? '12' : formData.contributors.length > 0 ? 'auto' : '3'">

             <v-row class="pl-2">
              <v-icon small>mdi-plus</v-icon>
                <AddButton size="20px" icon="mdi-library" iconClass="pr-3" class="right: 0;" label="Contributor" @click="showContributors = true" justify="start"/>
              </v-row>
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
            <v-col :cols="mobile ? '12' : formData.creator.id ? 'auto' : '3'">
              <v-row>
                <v-icon small>mdi-plus</v-icon>
                <AddButton size="20px" icon="mdi-account-circle" iconClass="pr-3" class="right: 0;" label="Creator" @click="showCreator = true" justify="start"/>
              </v-row>
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
            <v-col :cols="mobile ? '12' : formData.relatedRecords.length > 0 ? 'auto' : '3'">
              <v-row>
                <v-icon small>mdi-plus</v-icon>
                <AddButton size="20px" icon="mdi-book-multiple" iconClass="pr-3" class="right: 0;" label="Related records" @click="showRecords = true" justify="start"/>
              </v-row>
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
            <v-col :cols="mobile ? '12' : '3'" class="pt-0 pa-1">
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
      v-if="dialog === 'new-artefact'" 
      :index="index" 
      :artefacts="formData.artefacts" 
      @close="dialog = false" 
      @delete="removeArtefact($event)" 
      @submit="updateArtefacts($event)"
    />
    <DeleteArtefactDialog v-if="dialog === 'delete-artefact'"
      :show="dialog"
      :index="index"
      @close="dialog = false" 
      @submit="deleteArtefact($event)"/>
    />
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
      dialog: null,
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
    // clickedOff () {
    //   this.search = !this.search
    // },
    updateArtefacts (changes) {
      alert('WARNING, submission doesnt currently update artefacts')
    },
    toggleDialog ($event, dialog) {
      this.index = $event
      this.dialog = dialog
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

<style scoped lang="scss">
.video-player {
  width: 500px;
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
  border: 0.5px solid rgba(0,0,0,0.8);
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
