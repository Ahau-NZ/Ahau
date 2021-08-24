<template>
  <!-- <v-card light> -->
  <div>
    <v-form ref="form" v-model="form.valid">
      <v-row class="px-3">
        <v-col cols="12" sm="12" md="12">
          <v-row>
            <v-col cols="12" class="pa-1">
              <v-tooltip top open-delay="700">
                <template v-slot:activator="{ on }">
                  <v-text-field
                    v-on="on"
                    v-model="formData.title"
                    :label="t('title')"
                    v-bind="customProps"
                    class="title-input"
                    style="text-align: start; font-size: 1.2em; font-weight: 700;"
                    counter
                    :hide-details="false"
                    :rules="rules.titleLength"
                  />
                </template>
                <span>{{ t('titleTooltip') }}</span>
              </v-tooltip>
            </v-col>
            <v-col v-if="formData.artefacts && formData.artefacts.length > 0" cols="12" class="pl-0 pr-0">
              <ArtefactCarousel
                :artefacts="formData.artefacts"
                @delete="toggleDialog($event, 'delete')"
                @update="toggleDialog($event, 'new')"
                @artefacts="processArtefacts($event)"
                editing
              />
            </v-col>
            <v-tooltip top center open-delay="700">
              <template v-slot:activator="{ on }">
                <v-col v-on="on" cols="6" >
                  <UploadArtefactButton showLabel @artefacts="processArtefacts($event)"/>
                </v-col>
              </template>
              <span>{{ t('uploadArtefactButtonTooltip') }}'</span>
            </v-tooltip>
            <v-tooltip top open-delay="700">
              <template v-slot:activator="{ on }">
                <v-col v-on="on" :cols="showLocation ? '12':'6'" class="py-0">
                  <div v-if="!showLocation" @click="showLocation = true" class="pt-3">
                    <AddButton :size="mobile ? '40px' : '60px'" icon="mdi-map-plus"/>
                    <p class="add-label clickable" >{{ t('addLocation') }}</p>
                  </div>
                  <v-row v-if="showLocation">
                    <v-col :cols="formData.artefacts && formData.artefacts.length > 0 ? '6':'12'" class="pa-1">
                      <v-textarea
                        v-on="on"
                        v-model="formData.location"
                        :label="t('location')"
                        v-bind="customProps"
                        no-resize
                        rows="3"
                        auto-grow
                        :hide-details="false"
                        :counter="totalCharLength"
                        :rules="rules.recordLength"
                      >
                      </v-textarea>
                    </v-col>
                  </v-row>
                </v-col>
              </template>
              <span>{{ t('locationTooltip') }}</span>
            </v-tooltip>
                <!-- <v-col :cols="formData.artefacts && formData.artefacts.length > 0 ? '6':'12'" class="pa-1">
                  <v-textarea
                    v-model="formData.locationDescription"
                    label="Location description"
                    v-bind="customProps"
                    no-resize
                    rows="3"
                    auto-grow
                  >
                  </v-textarea>
                </v-col> -->

            <v-col cols="12" class="pa-1">
              <v-tooltip top open-delay="700">
                <template v-slot:activator="{ on }">
                  <v-textarea
                    v-on="on"
                    v-model="formData.description"
                    :label="t('description')"
                    v-bind="customProps"
                    no-resize
                    rows="3"
                    auto-grow
                    :hide-details="false"
                    :counter="totalCharLength"
                    :rules="rules.recordLength"
                  >
                  </v-textarea>
                </template>
                <span>{{ t('descriptionTooltip') }}</span>
              </v-tooltip>
            </v-col>
            <DateIntervalPicker
              class="px-3"
              :label="t('date')"
              :endLabel="t('endDate')"
              allowInterval
              :interval.sync="formData.timeInterval"
              :hasEndDate.sync="hasEndDate"
              :checkbox-label="t('includeEndDate')"
              :cols="mobile ? '12' : '6'"
              :showCheckbox="!hasEndDate"
            />
            <!-- ADD MENTIONS -->
            <v-col cols="12" md="4" class="pa-5">
              <v-tooltip top open-delay="700" :disabled="showMentions">
                <template v-slot:activator="{ on }">
                  <div v-on="on">
                    <v-row v-if="!showMentions" @click="showMentions = true; mentions = []" class="pl-5">
                      <v-icon small>mdi-plus</v-icon>
                      <AddButton size="20px" icon="mdi-account" iconClass="pr-3" :label="t('mention')" justify="start"/>
                    </v-row>
                  </div>
                </template>
                <span>{{ t('mentionTooltip') }}</span>
              </v-tooltip>
              <ProfileSearchBar
                :selectedItems.sync="formData.mentions"
                :items="mentions"
                :openMenu.sync="showMentions"
                :placeholder="t('addMention')"
                item="preferredName"
                @getSuggestions="getSuggestions('mentions', $event)"
              />
              <AvatarGroup v-if="formData.mentions && formData.mentions.length > 0"
                :profiles="formData.mentions"
                show-labels
                size="40px"
                deletable
                @delete="removeItem(formData.mentions, $event)"
              />
            </v-col>

            <!-- ADD CONTRIBUTORS -->
            <v-col cols="12" md="4" class="pa-5">
              <v-tooltip top open-delay="700" :disabled="showContributors">
                <template v-slot:activator="{ on }">
                  <div v-on="on">
                    <v-row v-if="!showContributors" @click="showContributors = true; contributors = []" class="pl-5">
                      <v-icon small>mdi-plus</v-icon>
                        <AddButton size="20px" icon="mdi-library" iconClass="pr-3" :label="t('contributor')"  justify="start"/>
                    </v-row>
                  </div>
                </template>
                <span>{{ t('contributorTooltip') }}</span>
              </v-tooltip>

              <ProfileSearchBar
                :selectedItems.sync="formData.contributors"
                :items="contributors"
                :openMenu.sync="showContributors"
                item="preferredName"
                :placeholder="t('addContributor')"
                @getSuggestions="getSuggestions('contributors', $event)"
              />
              <AvatarGroup v-if="formData.contributors && formData.contributors.length > 0"
                :profiles="formData.contributors"
                show-labels
                size="40px"
                deletable
                @delete="removeItem(formData.contributors, $event)"
              />
            </v-col>
            <!-- <v-divider v-if="mobile" light class="mt-6 mr-4"></v-divider> -->
            <!-- ADD KAITIAKI -->
            <v-col cols="12" md="auto" class="pa-5">
              <v-row class="pl-5">
                <AddButton size="20px" icon="mdi-library" iconClass="pr-3" :label="t('kaitiaki')"  justify="start"/>
              </v-row>
              <AvatarGroup v-if="formData.tiaki && formData.tiaki.length > 0"
                :profiles="formData.tiaki"
                show-labels
                size="40px"
              />
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
          <!-- TODO: ADD PROTOCOLS -->
          <!-- <v-col :cols="mobile ? '12' : formData.protocols.length > 0 ? 'auto' : '4'">
              <AddButton label="Protocol" @click="showProtocols = true" />
              <ProfileSearchBar
                :selectedItems.sync="formData.protocols"
                :items="items"
                :searchString.sync="searchString"
                :openMenu.sync="showProtocols"
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
            <span class="pa-0 ma-0">{{ t('advanced') }}</span>
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
            <!-- RELATED RECORDS aka STORIES -->
            <v-col cols="12" md="auto" class="pa-5">
              <v-tooltip top open-delay="700" :disabled="showRecords">
                <template v-slot:activator="{ on }">
                  <div v-on="on">
                    <v-row v-if="!showRecords" @click="showRecords = true" class="pl-5">
                      <v-icon small>mdi-plus</v-icon>
                      <AddButton size="20px" icon="mdi-book-multiple" iconClass="pr-3" :label="t('relatedRecords')"  justify="start"/>
                    </v-row>
                  </div>
                </template>
                <span>{{ t('relatedRecordsTooltip') }}</span>
              </v-tooltip>

              <ProfileSearchBar
                :selectedItems.sync="formData.relatedRecords"
                :items="filteredStories"
                :openMenu.sync="showRecords"
                :placeholder="t('storyPlaceholder')"
                item="title"
              />
              <ChipGroup
                v-if="formData.relatedRecords && formData.relatedRecords.length > 0"
                type="story"
                :chips="formData.relatedRecords"
                deletable
                @delete="removeItem(formData.relatedRecords, $event)"
              />
              <v-divider v-if="mobile" light class="mt-6 mr-4"></v-divider>
            </v-col>
            <!-- COLLECTIONS -->
            <v-col cols="12" md="auto" class="pa-5">
              <v-tooltip top open-delay="700" :disabled="showCollections">
                <template v-slot:activator="{ on }">
                  <div v-on="on">
                    <v-row v-if="!showCollections" @click="showCollections = true" class="pl-5">
                      <v-icon small>mdi-plus</v-icon>
                      <AddButton size="20px" icon="mdi-folder" iconClass="pr-3" :label="t('collections')"  justify="start"/>
                    </v-row>
                  </div>
                </template>
                <span>{{ t('collectionTooltip') }}</span>
              </v-tooltip>

              <ProfileSearchBar
                :selectedItems.sync="formData.collections"
                :items="filteredCollections"
                :openMenu.sync="showCollections"
                :placeholder="t('collectionPlaceholder')"
                item="name"
              />
              <ChipGroup
                v-if="formData.collections && formData.collections.length > 0"
                type="collection"
                :chips="this.formData.collections"
                :deletable="!this.collection"
                @delete="removeItem(formData.collections, $event)"
              />
              <v-divider v-if="mobile" light class="mt-6 mr-4"></v-divider>
            </v-col>
            <!-- ADD CREATOR -->
            <!-- <v-col cols="12" md="4" class="pa-5">
              <v-tooltip top open-delay="700" :disabled="showCreators">
                <template v-slot:activator="{ on }">
                  <div v-on="on">
                    <v-row v-if="!showCreators" @click="showCreators = true; creators = []" class="pl-5">
                      <v-icon small>mdi-plus</v-icon>
                        <AddButton size="20px" icon="mdi-library" iconClass="pr-3" label="Creators"  justify="start"/>
                    </v-row>
                  </div>
                </template>
                <span>A Creator is the person that is primarily responsible for providing the essential knowledge that goes into the story</span>
              </v-tooltip>

              <ProfileSearchBar
                :selectedItems.sync="formData.creators"
                :items="creators"
                :searchString.sync="searchString"
                :openMenu.sync="showCreators"
                item="preferredName"
                placeholder="creators"
                @getSuggestions="getSuggestions('creators', $event)"
              />
              <AvatarGroup v-if="formData.creators && formData.creators.length > 0"
                :profiles="formData.creators"
                show-labels
                size="40px"
                deletable
                @delete="removeItem(formData.creators, $event)"
              />
            </v-col> -->

            <v-col cols="12" class="pa-1">
              <v-tooltip top open-delay="700">
                <template v-slot:activator="{ on }">
                  <v-textarea
                    v-on="on"
                    v-model="formData.contributionNotes"
                    :label="t('contributionNotes')"
                    v-bind="customProps"
                    no-resize
                    rows="3"
                    auto-grow
                    :hide-details="false"
                    :counter="totalCharLength"
                    :rules="rules.recordLength"
                  >
                  </v-textarea>
                </template>
                <span>{{ t('contributorNotesTooltip') }}</span>
              </v-tooltip>
            </v-col>

            <!-- <v-col cols="12" class="pa-1">
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
            </v-col> -->
            <v-col :cols="mobile ? '6' : '3'" class="pa-1">
              <v-tooltip top open-delay="700">
                <template v-slot:activator="{ on }">
                  <v-text-field
                    v-on="on"
                    v-model="formData.format"
                    :label="t('format')"
                    v-bind="customProps"
                  />
                </template>
                <span>{{ t('formatTooltip') }}</span>
              </v-tooltip>
            </v-col>
            <v-col :cols="mobile ? '6' : '3'" class="pa-1">
              <v-tooltip top open-delay="700">
                <template v-slot:activator="{ on }">
                  <v-text-field
                    v-on="on"
                    v-model="formData.identifier"
                    :label="t('identifier')"
                    v-bind="customProps"
                  />
                </template>
                <span>{{ t('identifierTooltip') }}</span>
              </v-tooltip>
            </v-col>
            <v-col :cols="mobile ? '6' : '3'" class="pa-1">
              <v-tooltip top open-delay="700">
                <template v-slot:activator="{ on }">
                  <v-text-field
                    v-on="on"
                    v-model="formData.source"
                    :label="t('source')"
                    v-bind="customProps"
                  />
                </template>
                <span>{{ t('sourceTooltip') }}</span>
              </v-tooltip>
            </v-col>
            <v-col :cols="mobile ? '6' : '3'" class="pa-1">
              <v-tooltip top open-delay="700">
                <template v-slot:activator="{ on }">
                  <v-text-field
                    v-on="on"
                    v-model="formData.language"
                    :label="t('language')"
                    v-bind="customProps"
                  />
                </template>
                <span>{{ t('languageTooltip') }}</span>
              </v-tooltip>
            </v-col>
            <v-col cols="12" class="pa-1">
              <v-tooltip top open-delay="700">
                <template v-slot:activator="{ on }">
                  <v-textarea
                    v-on="on"
                    v-model="formData.transcription"
                    :label="t('transcription')"
                    v-bind="customProps"
                    no-resize
                    rows="3"
                    auto-grow
                    :hide-details="false"
                    :counter="totalCharLength"
                    :rules="rules.recordLength"
                  >
                  </v-textarea>
                </template>
                <span>{{ t('transcriptionTooltip') }}</span>
              </v-tooltip>
            </v-col>
          </v-row>
        </div>
      </v-expand-transition>
    </v-form>
  <!-- </v-card> -->
    <NewArtefactDialog
      v-if="dialog === 'edit-artefact'"
      :show="dialog === 'edit-artefact'"
      :index="index"
      :artefacts="formData.artefacts"
      editing
      @close="dialog = null"
      @delete="toggleDialog($event, 'delete')"
      @submit="updateArtefacts($event)"
      @artefacts="processArtefacts($event)"
    />
    <DeleteArtefactDialog
      v-if="dialog === 'delete-artefact'"
      :show="dialog === 'delete-artefact'"
      :index="index"
      @close="dialog = null"
      @submit="removeArtefact($event)"
    />
  </div>
</template>

<script>
import AvatarGroup from '@/components/AvatarGroup.vue'
// import Avatar from '@/components/Avatar.vue'
import AddButton from '@/components/button/AddButton.vue'
import UploadArtefactButton from '@/components/artefact/UploadArtefactButton.vue'
import DateIntervalPicker from '@/components/DateIntervalPicker.vue'

import ChipGroup from '@/components/archive/ChipGroup.vue'
import ProfileSearchBar from '@/components/archive/ProfileSearchBar.vue'

import { findByName } from '@/lib/search-helpers.js'

import NewArtefactDialog from '@/components/dialog/artefact/NewArtefactDialog.vue'
import ArtefactCarousel from '@/components/artefact/ArtefactCarousel.vue'
import DeleteArtefactDialog from '@/components/dialog/artefact/DeleteArtefactDialog.vue'

import { mapGetters, mapMutations } from 'vuex'

import { storiesApolloMixin } from '@/mixins/story-mixins.js'
import { artefactMixin } from '@/mixins/artefact-mixins.js'

import { getAllStories } from '@/lib/story-helpers.js'

export default {
  name: 'RecordForm',
  components: {
    // Avatar,
    AddButton,
    UploadArtefactButton,
    ProfileSearchBar,
    AvatarGroup,
    ChipGroup,
    NewArtefactDialog,
    ArtefactCarousel,
    DeleteArtefactDialog,
    DateIntervalPicker
  },
  props: {
    formData: {
      type: Object
    },
    editing: Boolean,
    access: Object,
    collection: Object
  },
  mixins: [
    storiesApolloMixin,
    artefactMixin
  ],
  data () {
    return {
      stories: [],
      dialog: null,
      index: 0,
      search: false,
      model: 0,
      show: false,
      collections: [],
      // categories: [{ title: 'one' }, { title: 'two' }, { title: 'three' }, { title: 'four' }, { title: 'five' }, { title: 'six' }, { title: 'seven' }],
      showLocation: false,
      mentions: [],
      contributors: [],
      creators: [],
      showMentions: false,
      // showCategories: false,
      showContributors: false,
      showCreators: false,
      showCollections: false,
      showProtocols: false,
      showRecords: false,
      searchString: '',
      suggestions: [],
      hasEndDate: false,
      rules: {
        recordLength: [v => (this.totalCharLength <= 4000) || this.t('maxLength')],
        titleLength: [v => (v.length <= 200) || this.t('titleLength')]
      },
      form: {
        valid: true
      },
      currentLimit: null
    }
  },
  watch: {
    async access (group) {
      if (!group) return

      const groupId = group.recps[0]
      var storyRes = await this.$apollo.query(getAllStories({ groupId }))
      this.stories = storyRes.data.stories
      this.collections = await this.$store.dispatch('collection/getCollectionsByGroup', groupId)
    },
    form: {
      deep: true,
      handler () {
        this.setAllowSubmissions(this.form.valid)
      }
    }
  },
  mounted () {
    this.showAdvanced()
  },
  computed: {
    ...mapGetters(['showStory', 'whoami']),
    mobile () {
      return this.$vuetify.breakpoint.xs || this.$vuetify.breakpoint.sm
    },
    totalCharLength () {
      var data = this.formData
      function calc (src) {
        return src ? src.length : 0
      }
      return [calc(data.description), calc(data.contributionNotes), calc(data.location), calc(data.translation)].reduce((a, b) => a + b, 0)
    },
    customProps () {
      return {
        outlined: true,
        hideDetails: true,
        placeholder: ' ',
        class: 'custom',
        clearable: true
      }
    },
    filteredStories () {
      if (this.editing) {
        return this.stories.filter(story => story.id !== this.formData.id)
      }
      return this.stories
    },
    filteredCollections () {
      return this.collections
    }
  },
  methods: {
    ...mapMutations(['setAllowSubmissions']),
    processArtefacts (artefacts) {
      this.index = this.formData.artefacts ? this.formData.artefacts.length : 0

      artefacts.forEach(artefact => {
        this.formData.artefacts.push(artefact)
      })

      this.dialog = 'edit-artefact'
    },
    showAdvanced () {
      if (this.showStory) this.show = true
      if (this.formData.endDate && this.formData.endDate.length > 0) this.hasEndDate = true
    },
    async getSuggestions (array, $event) {
      if (!$event) return
      var suggestions = []
      if ($event) suggestions = await findByName($event)

      // filter out suggestions not in this tribe
      if (!suggestions) return
      suggestions = suggestions.filter(record => {
        if (!record.recps) return false // dont suggest public profiles?

        return record.recps.includes(this.access.recps[0])
      })

      this[array] = suggestions
    },
    toggleDialog ($event, dialog) {
      this.index = $event
      if (dialog === 'new') this.dialog = 'edit-artefact'
      if (dialog === 'delete') this.dialog = 'delete-artefact'
    },
    warn (field) {
      alert(`Cannot add ${field} yet`)
    },
    updateItem (array, update, index) {
      // update the item in the array at the index
      array.splice(index, 1, update)
    },
    t (key, vars) {
      return this.$t('addStoryForm.' + key, vars)
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
