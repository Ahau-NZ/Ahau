<template>
  <Dialog :show="show" :title="title" width="55vw" :goBack="close" enableMenu
    @submit="submit"
    @close="close"
    :hideActions="!editing && tab !== 'tab-3'"
  >
    <template v-if="!hideDetails" v-slot:pinned>
      <v-app-bar
        flat
        dense
        light
        color="#fff"
        height="60px"
        max-height="60px"
        fixed-tabs
      >
        <v-tabs v-model="tab" class="mt-n3">
          <v-tab href="#tab-1" :class="mobile ? 'mb-tabs':'desk-tabs'">
            <v-icon small v-if="!mobile"  left>
              mdi-account
            </v-icon>
            {{t('profile')}}
          </v-tab>
          <v-tab href="#tab-2" :class="mobile ? 'mb-tabs':'desk-tabs'">
            <v-icon small v-if="!mobile" left>
              mdi-form-select
            </v-icon>
            {{t('data')}}
          </v-tab>
          <v-tab href="#tab-3" :class="mobile ? 'mb-tabs':'desk-tabs'">
            <v-icon small v-if="!mobile" left>
              mdi-cog
            </v-icon>
            {{t('settings')}}
          </v-tab>
        </v-tabs>
      </v-app-bar>
      <v-divider/>
    </template>
    <template v-if="!hideDetails" v-slot:content>
      <v-tabs-items light v-model="tab">
        <v-tab-item value="tab-1">
          <v-col class="py-0">
            <CommunityForm :editing="editing" :communityProfile.sync="formData"/>
            <v-row justify="center" class="my-4">
              <v-btn v-if="editing" class="mx-4" color="secondary" dark @click="$emit('delete')">
                {{ $t('addCommunityForm.delete') }}
                <v-icon class="pl-2">mdi-delete</v-icon>
              </v-btn>
              <v-btn color="blue-grey" dark @click="nextTab">
                {{ $t('addCommunityForm.next') }}
                <v-icon class="pl-2">mdi-page-next-outline</v-icon>
              </v-btn>
            </v-row>
          </v-col>
        </v-tab-item>
        <v-tab-item value="tab-2">
          <DataModel :customFields.sync="formData.customFields"/>
          <v-divider class="my-10"></v-divider>
          <v-row class="ma-2">
            <v-col cols="12">
              <p>{{ t('form') }}</p>
            </v-col>
            <v-col cols="10" v-for="(question, i) in formData.joiningQuestions" :key="`j-q-${i}`" class="pa-1">
              <v-text-field
                v-model="formData.joiningQuestions[i].label"
                append-icon="mdi-delete"
                @click:append="removeJoiningQuestion(i)"
                :label="`Question ${i + 1}`"
                :placeholder="t('questionPlaceholder')"
                auto-focus
                outlined
                hide-details
              />
            </v-col>
            <v-col cols="12" justify="start" class="px-1">
              <v-btn color="#3b3b3b" class="white--text" @click="addQuestionField">
                <v-icon class="pr-1">mdi-plus</v-icon> {{ t('addQuestion') }}
              </v-btn>
            </v-col>
          </v-row>
          <v-row justify="center" class="my-4">
            <v-btn color="blue-grey" dark @click="nextTab">
              {{ $t('addCommunityForm.next') }}
              <v-icon class="pl-2">mdi-page-next-outline</v-icon>
            </v-btn>
          </v-row>
        </v-tab-item>
        <v-tab-item light value="tab-3">
          <TribeSettings :settings="settings" @change="updateSettings" />
          <v-divider/>
          <GroupsList :formData.sync="formData" :profile="profile" :mobile="mobile" :isEditing="editing"/>
          <v-divider/>
          <Permissions mobile />
        </v-tab-item>
      </v-tabs-items>
    </template>
    <template v-slot:before-actions>
    </template>
  </Dialog>
</template>

<script>
import { pick, isEmpty, isEqual } from 'lodash-es'
import { mapGetters } from 'vuex'

import Dialog from '@/components/dialog/Dialog.vue'
import CommunityForm from '@/components/community/CommunityForm.vue'
import { EMPTY_COMMUNITY, setDefaultCommunity } from '@/lib/community-helpers'
import { getObjectChanges } from '@/lib/get-object-changes'
import GroupsList from './GroupsList.vue'
import Permissions from './Permissions.vue'
import TribeSettings from './TribeSettings.vue'
import DataModel from './DataModel.vue'

export default {
  name: 'NewCommunityDialog',
  components: {
    Dialog,
    CommunityForm,
    GroupsList,
    Permissions,
    TribeSettings,
    DataModel
  },
  props: {
    show: { type: Boolean, required: true },
    profile: { type: Object, default () { return EMPTY_COMMUNITY } },
    title: { type: String, default: 'Create new tribe' },
    hideDetails: { type: Boolean, default: false },
    editing: Boolean
  },
  data () {
    return {
      formData: setDefaultCommunity(this.profile),
      tab: null
    }
  },
  watch: {
    tribeSettings: {
      deep: true,
      immediate: true,
      handler (settings) {
        if (!settings) return

        this.formData.allowWhakapapaViews = settings.allowWhakapapaViews
        this.formData.allowStories = settings.allowStories
        this.formData.allowPersonsList = settings.allowPersonsList
      }
    },
    'formData.joiningQuestions': {
      deep: true,
      immediate: true,
      handler (joiningQuestions) {
        if (joiningQuestions && joiningQuestions.length > 0) this.allowJoiningQuestions = true
        else this.allowJoiningQuestions = false
      }
    },
    tab (newVal) {
      if (newVal !== 'tab-2') return
      if (this.formData && this.formData.joiningQuestions && this.formData.joiningQuestions.length < 1) {
        this.formData.joiningQuestions.push({ label: '', type: 'input' })
      }
    }
  },
  computed: {
    ...mapGetters('tribe', ['tribeSettings']),
    mobile () {
      return this.$vuetify.breakpoint.xs
    },
    settings () {
      return pick(this.formData, ['allowWhakapapaViews', 'allowStories', 'allowPersonsList'])
    }
  },
  methods: {
    addQuestionField () {
      if (!this.formData.joiningQuestions) this.formData.joiningQuestions = []
      this.formData.joiningQuestions.push({ label: '', type: 'input' })
    },
    removeJoiningQuestion (index) {
      this.formData.joiningQuestions.splice(index, 1)
    },
    updateSettings ({ key, value }) {
      this.formData[key] = value
    },
    submit () {
      let output = {}
      if (this.editing) {
        // get all changes
        output = getObjectChanges(setDefaultCommunity(this.profile), this.formData)
      } else {
        output = getObjectChanges(setDefaultCommunity(EMPTY_COMMUNITY), this.formData)
      }

      if (this.formData.customFields && this.formData.customFields.length) {
        output.customFields = this.getCustomFieldChanges(this.profile.customFields, this.formData.customFields)
        if (isEmpty(output.customFields)) delete output.customFields
      }

      if (output.authors) output.authors = this.getAuthorChanges(output.authors)

      this.$emit('submit', output)
      this.close()
    },
    cordovaBackButton () {
      this.close()
    },
    close () {
      this.formData = setDefaultCommunity(EMPTY_COMMUNITY)
      this.$emit('close')
    },
    t (key, vars) {
      return this.$t('addCommunityForm.' + key, vars)
    },
    getCustomFieldChanges (initial, updated) {
      return updated
        .filter(updatedField => {
          if (!updatedField.key) return false

          return !initial.some(initialField => {
            return (initialField.key === updatedField.key) && isEqual(initialField, updatedField)
          })
        })
        .map(field => {
          delete field.__typename
          if (field.type === 'list' && typeof field.options === 'string' && field.options.length > 0) {
            field.options = field.options.split(',')
          }

          return field
        })
    },
    getAuthorChanges (authors) {
      if (authors.add) {
        authors.add = authors.add.map(k => k.feedId)
      }
      if (authors.remove) {
        authors.remove = authors.remove.map(k => k.feedId)
      }
      return authors
    },
    nextTab () {
      document.getElementById('app-dialog').scrollTop = 0
      let tab
      if (this.tab === 'tab-1') tab = 'tab-2'
      if (this.tab === 'tab-2') tab = 'tab-3'
      this.tab = tab
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
.close {
  top: -25px;
  right: -10px;
}
.v-input--checkbox label {
  font-size: 14px;
}

.v-input--radio-group__input label {
  font-size: 14px;
}

.mb-tabs {
  font-size: 0.8em;
  padding-left: 0px;
  padding-right: 0px
}

.desk-tabs {
  font-size: 0.9em;
  padding-right: 16px;
}

p {
  color: black
}
</style>
