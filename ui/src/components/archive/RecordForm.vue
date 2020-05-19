<template>
  <!-- <v-card light> -->
  <div>
    <v-form ref="form" v-model="form.valid" lazy-validation>
      <v-row>
        <v-col cols="12" sm="12" md="6">
          <v-row>
            <v-col cols="12">
              <v-text-field
                v-model="formData.title"
                label="Title"
                v-bind="customProps"
              />
            </v-col>
            <v-col cols="12">
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
            <v-col cols="12" sm="12" md="6">
              <v-text-field
                v-model="formData.recordDate"
                label="Date"
                v-bind="customProps"
              />
            </v-col>
            <v-col cols="12" sm="12" md="6">
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
            <v-col :cols="mobile ? '12' : formData.mentions.length > 0 ? 'auto' : '4'">
              <AddButton label="Mention" @click="showMentions = true" />
              <ProfileSearchBar
                :selectedItems.sync="formData.mentions"
                :items="items"
                :searchString.sync="searchString"
                :openMenu.sync="showMentions"
                type="profile"
              />
              <AvatarGroup v-if="formData.mentions.length > 0"
                :profiles="formData.mentions"
                show-labels
                size="50px"
                deletable
                @delete="removeMention($event)"
              />
            </v-col>
            <v-col :cols="mobile ? '12' : formData.categories.length > 0 ? 'auto' : '4'">
              <AddButton label="Category" @click="showCategories = true" />
              <ProfileSearchBar
                :selectedItems.sync="formData.categories"
                :items="categories"
                :searchString.sync="searchString"
                :openMenu.sync="showCategories"
              />
              <v-chip-group
                column
                v-if="formData.categories.length > 0"
              >
                <v-chip v-for="category in formData.categories" :key="category"
                  label
                  outlined
                  close
                  close-icon="mdi-close"
                  @click:close="removeCategory(category)"
                >
                  {{ category }}
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
              />
              <!-- <v-card>
                <v-container fluid>
                  <v-row>
                    <v-col
                      v-for="collection in formData.collections"
                      :key="collection.title"
                    >
                      <v-card flat tile class="d-flex">
                        <v-img :src="collection.image.uri" />
                        <v-card-title>{{ collection.title }}</v-card-title>
                      </v-card>
                    </v-col>
                  </v-row>
                </v-container>
              </v-card> -->
            </v-col>
          </v-row>
        </v-col>
        <v-col cols="12" sm="12" md="6">
          <v-row>
            <!-- <v-spacer/> -->
            <!-- <v-col cols="12" sm="12" md="6">
              <v-select
                v-model="formData.type"
                label="Record Type"
                :items="['Life Event']"
                v-bind="customProps"
              />
            </v-col> -->
            <!-- <v-spacer/> -->
            <v-col cols="12">
              <AddButton @click="$refs.fileInput.click()" label="Attact media or files"/>
              <input v-show="false" ref="fileInput" type="file" accept="audio/*,video/*,image/*" multiple @change="processMediaFiles($event)" />
            </v-col>
            <!-- <v-col>
              <MediaCard :artefacts.sync="formData.artefacts"/>
            </v-col> -->
            <v-col cols="12">
              <AddButton @click="" label="Add location"/>
            </v-col>
          </v-row>
        </v-col>
      </v-row>
      <v-divider/>
      <v-card-actions class="pt-2 pb-2">
        <v-row>
          <v-col>
            <span class="pa-0 ma-0">Advanced</span>
          </v-col>
          <!-- <v-col> -->
            <v-btn icon @click="show = !show" right>
              <v-icon>{{ show ? 'mdi-chevron-up' : 'mdi-chevron-down' }}</v-icon>
            </v-btn>
          <!-- </v-col> -->
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
              />
              <AvatarGroup v-if="formData.contributors.length > 0"
                :profiles="formData.contributors"
                show-labels
                size="50px"
                deletable
                @delete="removeContributor($event)"
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
              />
              <div v-if="formData.creator.id" class="pt-5">
                <Avatar
                  style="width:50px"
                  size="50px"
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
            <v-col :cols="mobile ? '12' : formData.relatedRecords.length > 0 ? 'auto' : '2'">
              <AddButton label="Related Records" @click="showCreator = true" />
            </v-col>
            <v-col :cols="mobile ? '12' : '6'" class="pt-0">
              <v-text-field
                v-model="formData.submissionDate"
                label="Submission Date"
                v-bind="customProps"
              />
            </v-col>
            <v-col cols="12">
              <v-textarea
                v-model="formData.contributionNotes"
                label="Contribution notes"
                v-bind="customProps"
                no-resize
                rows="3"
                auto-grow
              >
              </v-textarea>
            </v-col>
            <v-col cols="12">
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
            <v-col cols="12">
              <v-textarea
                v-model="formData.culturalNarrative"
                label="Cultural Narrative"
                v-bind="customProps"
                no-resize
                rows="3"
                auto-grow
              >
              </v-textarea>
            </v-col>
            <v-col :cols="mobile ? '6' : '3'">
              <v-text-field
                v-model="formData.format"
                label="Format"
                v-bind="customProps"
              />
            </v-col>
            <v-col :cols="mobile ? '6' : '3'">
              <v-text-field
                v-model="formData.identifier"
                label="Identifier"
                v-bind="customProps"
              />
            </v-col>
            <v-col :cols="mobile ? '6' : '3'">
              <v-text-field
                v-model="formData.source"
                label="Source"
                v-bind="customProps"
              />
            </v-col>
            <v-col :cols="mobile ? '6' : '3'">
              <v-text-field
                v-model="formData.language"
                label="Language"
                v-bind="customProps"
              />
            </v-col>
            <v-col cols="12">
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
  </div>
</template>

<script>
// import Avatar from '@/components/Avatar.vue'
// import ImagePicker from '@/components/ImagePicker.vue'
import NodeDatePicker from '@/components/NodeDatePicker.vue'
import AddButton from '@/components/button/AddButton.vue'
import AddItemCard from '@/components/archive/AddItemCard.vue'
import AvatarGroup from '@/components/AvatarGroup.vue'
import Avatar from '@/components/Avatar.vue'

import SearchBar from '@/components/button/SearchBar.vue'
import ProfileSearchBar from '@/components/archive/ProfileSearchBar.vue'

import MediaCard from '@/components/archive/MediaCard.vue'
import { personComplete } from '@/mocks/person-profile'

import { COLLECTIONS } from '@/mocks/collection'

import {
  RULES
} from '@/lib/constants'

// const EMPTY_WHAKAPAPA = {
//   name: '',
//   description: '',
//   mode: 'descendants',
//   focus: 'self',
//   image: null
// }

// function setDefaultWhakapapa (whakapapa) {
//   return {
//     name: whakapapa.name,
//     description: whakapapa.description,
//     mode: whakapapa.mode,
//     focus: whakapapa.focus,
//     image: whakapapa.image
//   }
// }
const imageRegex = /^image\//
const audioRegex = /^audio\//
const videoRegex = /^video\//

export default {
  name: 'RecordForm',
  components: {
    Avatar,
    // ImagePicker,
    AddButton,
    ProfileSearchBar,
    AvatarGroup
  },
  props: {
    // view: { type: Object, default () { return setDefaultWhakapapa(EMPTY_WHAKAPAPA) } },
    readonly: {
      type: Boolean,
      default: false
    },
    hideDetails: {
      type: Boolean,
      default: false
    }
  },
  watch: {
    'formData.artefacts': {
      deep: true,
      handler (newValue) {
        // console.log(newValue)
      }
    }
  },
  data () {
    return {
      show: false,
      categories: ['one', 'two', 'three', 'four', 'five', 'six', 'seven'],
      collections: COLLECTIONS,
      showMentions: false,
      showCategories: false,
      showContributors: false,
      showCreator: false,
      showCollections: false,
      searchString: '',
      items: [...personComplete.children, ...personComplete.parents, ...personComplete.siblings],
      hasEndDate: false,
      // formData: setDefaultWhakapapa(this.view),
      formData: {
        title: null,
        description: null,
        startDate: null,
        endDate: null,
        mentions: [],
        categories: [],
        collections: [],
        contributors: [],
        relatedRecords: [],
        protocols: [],
        submissionDate: null,
        contributionNotes: null,
        locationDescription: null,
        culturalNarrative: null,
        fileFormat: null,
        identifier: null,
        source: null,
        language: null,
        translation: null,
        artefacts: [],
        creator: {}
      },
      form: {
        valid: true,
        rules: RULES
      },
      mockdata: [{
        id: 123,
        preferredName: 'Ian',
        whakapapaName: 'Tairea whanau',
        avatarImage: {
          uri: require('@/assets/koro.svg')
        },
        image: {
          uri: require('@/assets/mock1.jpg')
        }
      },
      {
        id: 456,
        preferredName: 'Ben',
        whakapapaName: 'Horne whanau',
        avatarImage: {
          uri: require('@/assets/kuia.svg')
        },
        image: {
          uri: require('@/assets/mock2.jpg')
        }
      }
      ],
      panel: [0, 1]
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
        class: 'mt-3',
        clearable: true,
        dense: true
      }
    }
  },
  methods: {
    doSomething (data) {
      console.log(data)
    },
    processMediaFiles ($event) {
      const { files } = $event.target

      files.forEach((file, i) => {
        this.formData.artefacts.push(this.processFile(file))
      })
    },
    processFile (file) {
      var attrs = {}
      const type = this.getFileType(file.type)
      const title = this.getFileName(file.name)
      const format = this.getFormat(file.type)
      const blob = new Blob([file], { type: file.type })
      const url = URL.createObjectURL(file)

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
        fileType: file.type,
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
        url
      }

      return attrs
    },
    getFileType (type) {
      /*
        Video, Audio {
          type: String,
          blob: String,
          recps: Recps,
          title: String,
          description: String,
          format: String,
          identifier: String,
          language: String,
          licence: String,
          rights: String,
          source: String,
          tombstone: Tombstone,
          translation: String,
          duration: Number,
          size: Integer,
          transcription: String
        }

        Photo {
          type: String, YES
          blob: String, ?
          title: String, FILENAME
          description: String, ?
          format: String, YES
          identifier: String, ?
          language: String, ?
          licence: String, ?
          recps: Recps, ?
          rights: String, ?
          source: String, ?
          tombstone: Tombstone, ?
          translation: String ?
        }

      */
      var type
      switch (true) {
        case imageRegex.test(type):
          type = 'photo'
          break
        case audioRegex.test(type):
          type = 'audio'
          break
        case videoRegex.test(type):
          type = 'video'
          break
        default:
          type = ''
          break
      }

      return type
    },
    getFormat (fileType) {
      return fileType.replace(/.*\//, '')
    },
    getFileName (fileName) {
      return fileName.replace(/\.[^/.]+$/, '')
    },
    addMention () {
      this.formData.mentions.push({
        id: 1,
        preferredName: 'Temp',
        avatarImage: {
          uri: require('@/assets/kuia.svg')
        }
      })
      console.warn('add mention not implemented yet')
    },
    removeMention ($event) {
      this.formData.mentions.splice(this.formData.mentions.findIndex(person => person.id === $event.id), 1)
    },
    removeCategory ($event) {
      this.formData.categories.splice(this.formData.categories.findIndex(category => category === $event), 1)
    },
    removeContributor ($event) {
      this.formData.contributors.splice(this.formData.mentions.findIndex(person => person.id === $event.id), 1)
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
</style>
