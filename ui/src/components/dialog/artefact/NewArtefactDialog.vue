<template>
  <v-dialog v-model="show"
    transition="dialog-bottom-transition"
    :fullscreen="mobile"
    width="70%"
    :content-class="mobile ? '':'artefact-dialog'"
    overlay-opacity="0.8"
  >
    <v-card tile flat style="overflow-x:hidden">
      <DialogTitleBanner title="edit artefact" :mobile="mobile" @close="close"/>
      <v-container :class="mobile ? 'px-2':'px-2'" :style="`width:${width};`">
        <v-row>
          <v-col cols="12">
            <h1>
              <v-tooltip top open-delay="700">
                <template v-slot:activator="{ on }">
                  <v-text-field
                    v-on="on"
                    v-if="show"
                    v-model="artefact.title"
                    label="Title"
                    v-bind="customProps"
                    dark
                  />
                </template>
                <span>Provide a name for this artefact</span>
              </v-tooltip>
            </h1>
          </v-col>
          <v-col cols="12" class="px-0">
            <ArtefactCarousel :artefacts="formData" :index.sync="selectedIndex" :editing="!editing" @delete="$emit('delete', $event)" @artefacts="$emit('artefacts', $event)"/>
          </v-col>
          <!-- <v-col cols="12" class="pl-10 py-6">
            <AddButton size="20px" icon="mdi-account-multiple-plus" dark iconClass="pr-3" class="right: 0;" label="Mention" @click="showMentions = true"  justify="start"/>
            <ProfileSearchBar
              :selectedItems.sync="artefact.mentions"
              :items="items"
              :searchString.sync="searchString"
              :openMenu.sync="showMentions"
              type="profile"
              item="preferredName"
            />
            <AvatarGroup v-if="artefact.mentions && artefact.mentions.length > 0"
              :profiles="artefact.mentions"
              show-labels
              size="40px"
              deletable
              @delete="removeItem(artefact.mentions, $event)"
              dark
            />
          </v-col> -->

          <v-col cols="12" class=py-1>
            <v-tooltip top open-delay="700">
              <template v-slot:activator="{ on }">
                <v-textarea
                  v-on="on"
                  v-if="show"
                  v-model="artefact.description"
                  label="Description"
                  v-bind="customProps"
                  no-resize
                  rows="3"
                  auto-grow
                >
                </v-textarea>
              </template>
              <span>Provide some context about the artefact</span>
            </v-tooltip>
          </v-col>
          <v-col cols="12" md="6" class="pt-0 pb-1">
            <NodeDatePicker
              :value.sync="artefact.createdAt"
              label="Date Created"
              min="0000-01-01"
              dark
            />
          </v-col>
          <v-col cols="12" sm="12" md="3" class="py-1 pt-2">
            <v-tooltip top open-delay="700">
              <template v-slot:activator="{ on }">
                <v-text-field
                  v-on="on"
                  v-if="show"
                  readonly
                  :value="artefact.blob.mimeType"
                  label="Format"
                  v-bind="customProps"
                >
                </v-text-field>
              </template>
              <span>The current digital form of this artefact being recorded</span>
            </v-tooltip>
          </v-col>
           <v-col  class="py-1 pt-2" cols="12" sm="12" md="3">
            <v-tooltip top open-delay="700">
              <template v-slot:activator="{ on }">
                <v-text-field
                  v-on="on"
                  v-if="show"
                  readonly
                  :value="artefact.blob.size"
                  label="Size"
                  type="number"
                  v-bind="customProps"
                  suffix="bytes"
                >
                </v-text-field>
              </template>
              <span>This file size of this uploaded digital artefact</span>
            </v-tooltip>
          </v-col>
          <!-- <v-col cols="12" sm="12" md="3">
            <v-tooltip top open-delay="700">
              <template v-slot:activator="{ on }">
                <v-text-field
                  v-on="on"
                  v-if="show"
                  v-model="artefact.identifier"
                  label="Identifier"
                  v-bind="customProps"
                >
                </v-text-field>
              </template>
              <span>A unique, unambigous reference to the artefact</span>
            </v-tooltip>
          </v-col> -->
          <v-col class=py-1 cols="12" sm="12" md="3">
            <v-tooltip top open-delay="700">
              <template v-slot:activator="{ on }">
                <v-text-field
                  v-on="on"
                  v-if="show"
                  v-model="artefact.language"
                  label="Language"
                  v-bind="customProps"
                >
                </v-text-field>
              </template>
              <span>The Language that is recorded in the artefact</span>
            </v-tooltip>
          </v-col>
          <v-col class=py-1 cols="12" sm="12" md="3">
            <v-tooltip top open-delay="700">
              <template v-slot:activator="{ on }">
                <v-text-field
                  v-on="on"
                  v-if="show"
                  v-model="artefact.licence"
                  label="Licence"
                  v-bind="customProps"
                >
                </v-text-field>
              </template>
              <span>Is there a license associated to use of the artefact</span>
            </v-tooltip>
          </v-col>
          <v-col class=py-1 cols="12" sm="12" md="3">
            <v-tooltip top open-delay="700">
              <template v-slot:activator="{ on }">
                <v-text-field
                  v-on="on"
                  v-if="show"
                  v-model="artefact.rights"
                  label="Rights"
                  v-bind="customProps"
                >
                </v-text-field>
                </template>
              <span>Are there any rights associated to the use of the artefact</span>
            </v-tooltip>
          </v-col>
          <v-col class=py-1 cols="12" sm="12" md="3">
            <v-tooltip top open-delay="700">
              <template v-slot:activator="{ on }">
                <v-text-field
                  v-on="on"
                  v-if="show"
                  v-model="artefact.source"
                  label="Source"
                  v-bind="customProps"
                >
                </v-text-field>
                </template>
              <span>The original source of the artefact</span>
            </v-tooltip>
          </v-col>
          <v-col class=py-1 cols="12" sm="12" md="3" v-if="artefact.type === 'audio' || artefact.type === 'video'">
            <v-tooltip top open-delay="700">
              <template v-slot:activator="{ on }">
                <v-text-field
                  v-on="on"
                  v-if="show"
                  v-model="artefact.duration"
                  label="Duration"
                  type="number"
                  v-bind="customProps"
                >
                </v-text-field>
                </template>
              <span>The time duration of the recorded artefact </span>
            </v-tooltip>
          </v-col>
          <v-col class=py-1 cols="12">
            <v-tooltip top open-delay="700">
              <template v-slot:activator="{ on }">
                <v-textarea
                  v-on="on"
                  v-if="show"
                  v-model="artefact.translation"
                  label="Translation / Transcription"
                  v-bind="customProps"
                  no-resize
                  rows="3"
                  auto-grow
                >
                </v-textarea>
              </template>
              <span>An abstraction, transcription or translation to the artefact</span>
            </v-tooltip>
          </v-col>

          <!-- Location test field -->
         <v-col cols="12">
            <h1>
              <v-tooltip top open-delay="700">
                <template v-slot:activator="{ on }">
                  <v-text-field
                    v-on="on"
                    v-if="show"
                    v-model="artefact.location"
                    label="Location"
                    v-bind="customProps"
                    dark
                  />
                </template>
                <span>Where was this artefact captured</span>
              </v-tooltip>
            </h1>
          </v-col>
          <v-col cols="12">
            <v-card-actions>
              <v-row>
                <v-btn :class="mobile ? 'mt-4':'mt-7'" text @click="$emit('delete', selectedIndex)">
                  Delete this artefact
                  <v-icon class="pl-2">mdi-delete</v-icon>
                </v-btn>

                <v-col
                  :align="mobile ? '' : 'right'"
                  :class="{
                    'pt-3': mobile,
                    'pb-0': true,
                    'd-flex': mobile,
                    'justify-space-between': mobile
                  }"
                >
                  <v-btn @click="close"
                    text large fab
                    class="secondary--text"
                    :class="!mobile ? 'mr-5':''"
                  >
                    <v-icon color="secondary">mdi-close</v-icon>
                  </v-btn>
                  <v-btn @click="submit"
                    text large fab
                    class="blue--text"
                  >
                    <v-icon>mdi-check</v-icon>
                  </v-btn>
                </v-col>

              </v-row>
            </v-card-actions>
          </v-col>
        </v-row>
      </v-container>
    </v-card>
  </v-dialog>
</template>

<script>
import DialogTitleBanner from '@/components/dialog/DialogTitleBanner.vue'
import ArtefactCarousel from '@/components/artefact/ArtefactCarousel.vue'

import clone from 'lodash.clonedeep'

import { personComplete } from '@/mocks/person-profile'
// import AddButton from '@/components/button/AddButton.vue'
// import ProfileSearchBar from '@/components/archive/ProfileSearchBar.vue'
// import AvatarGroup from '@/components/AvatarGroup.vue'

import NodeDatePicker from '@/components/NodeDatePicker.vue'

export default {
  name: 'NewArtefactDialog',
  props: {
    show: Boolean,
    artefacts: Array,
    index: Number,
    editing: Boolean
  },
  components: {
    ArtefactCarousel,
    // AddButton,
    // ProfileSearchBar,
    // AvatarGroup,
    DialogTitleBanner,
    NodeDatePicker
  },
  data () {
    return {
      items: [...personComplete.children, ...personComplete.parents, ...personComplete.siblings],
      showMentions: false,
      searchString: '',
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
    removeItem (array, index) {
      array.splice(index, 1)
    },
    close () {
      this.$emit('close')
    },
    submit () {
      this.$emit('submit', this.formData)
      this.$emit('close')
    }
  }
}
</script>
<style lang="scss">
.artefact-dialog {
    max-height: 91% !important;
}
.v-input--is-focused {
  color: yellow !important;
}
</style>
