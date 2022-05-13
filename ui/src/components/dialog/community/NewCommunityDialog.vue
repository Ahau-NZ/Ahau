<template>
  <Dialog :show="show" :title="title" width="55vw" :goBack="close" enableMenu
    @submit="submit"
    @close="close"
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
            {{t('registration')}}
          </v-tab>
          <v-tab v-if="formData.authors && formData.authors.length" href="#tab-3" :class="mobile ? 'mb-tabs':'desk-tabs'">
            <v-icon small v-if="!mobile" left>
              mdi-account-group-outline
            </v-icon>
            {{$t('groups.groups')}}
          </v-tab>
          <v-tab v-if="formData.authors && formData.authors.length" href="#tab-4" :class="mobile ? 'mb-tabs':'desk-tabs'">
            <v-icon small v-if="!mobile" left>
              mdi-account-multiple-check
            </v-icon>
            {{t('permissions')}}
          </v-tab>
          <v-tab href="#tab-5" :class="mobile ? 'mb-tabs':'desk-tabs'">
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
            <CommunityForm :editing="editing" :communityProfile.sync="formData" />
          </v-col>
        </v-tab-item>
        <v-tab-item value="tab-2">
          <v-row class="ma-2">
            <v-col cols="12">
              <p>{{ $t('addCommunityForm.form') }}</p>
            </v-col>
            <v-col cols="10" v-for="(question, i) in formData.joiningQuestions" :key="`j-q-${i}`" class="pa-1">
              <v-text-field
                v-model="formData.joiningQuestions[i].label"
                append-icon="mdi-delete"
                @click:append="removeJoiningQuestion(i)"
                :label="`Question ${i + 1}`"
                :placeholder="$t('addCommunityForm.questionPlaceholder')"
                auto-focus
                outlined
                hide-details
              />
            </v-col>
            <v-col cols="12" justify="start" class="px-1">
              <v-btn color="#3b3b3b" class="white--text" @click="addQuestionField">
                <v-icon class="pr-1">mdi-plus</v-icon> {{ $t('addCommunityForm.addQuestion') }}
              </v-btn>
            </v-col>
          </v-row>
          <DataModel />
        </v-tab-item>
        <v-tab-item light value="tab-3">
          <GroupsList :formData.sync="formData" :profile="profile" :mobile="mobile" />
        </v-tab-item>
        <v-tab-item light value="tab-4">
          <Permissions mobile />
        </v-tab-item>
        <v-tab-item light value="tab-5">
          <TribeSettings :settings="settings" @change="updateSettings" />
        </v-tab-item>
      </v-tabs-items>
    </template>
    <template v-slot:before-actions>
      <v-col justify="center">
        <v-btn v-if="editing" text @click="$emit('delete')">
          {{ t('delete') }}
          <v-icon class="pl-2">mdi-delete</v-icon>
        </v-btn>
      </v-col>
    </template>
  </Dialog>
</template>

<script>
import pick from 'lodash.pick'

import Dialog from '@/components/dialog/Dialog.vue'
import CommunityForm from '@/components/community/CommunityForm.vue'
import { EMPTY_COMMUNITY, setDefaultCommunity } from '@/lib/community-helpers.js'
import { getObjectChanges } from '@/lib/get-object-changes.js'
import GroupsList from './GroupsList.vue'
import Permissions from './Permissions.vue'
import TribeSettings from './TribeSettings.vue'
import DataModel from './DataModel.vue'

import { mapGetters } from 'vuex'

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
    title: { type: String, default: 'Create a new community' },
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

      if (output.authors) {
        if (output.authors.add) {
          output.authors.add = output.authors.add.map(k => k.feedId)
        }
        if (output.authors.remove) {
          output.authors.remove = output.authors.remove.map(k => k.feedId)
        }
      }

      this.$emit('submit', output)
      this.close()
    },
    cordovaBackButton () {
      this.close()
    },
    close () {
      this.formData = setDefaultCommunity(this.profile)
      this.$emit('close')
    },
    t (key, vars) {
      return this.$t('addCommunityForm.' + key, vars)
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
