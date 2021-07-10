<template>
  <Dialog :show="show" :title="title" width="60vw" :goBack="close" enableMenu
    @submit="submit"
    @close="close"
  >
    <template v-if="!hideDetails" v-slot:content>
      <v-tabs v-model="tab" class="mt-n3">
        <v-tab href="#tab-1" :class="mobile ? 'ml-n5 mb-tabs':'desk-tabs'">
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
            mdi-security
          </v-icon>
          {{t('kaitiaki')}}
        </v-tab>
        <v-tab v-if="formData.authors && formData.authors.length" href="#tab-4" :class="mobile ? 'mb-tabs':'desk-tabs'">
          <v-icon small v-if="!mobile" left>
            mdi-account-multiple-check
          </v-icon>
          {{t('permissions')}}
        </v-tab>
      </v-tabs>
      <v-divider></v-divider>
      <v-tabs-items light v-model="tab">
        <v-tab-item value="tab-1">
          <v-col class="py-0">
            <CommunityForm :editing="editing" :formData.sync="formData" />
          </v-col>
        </v-tab-item>
        <v-tab-item value="tab-2">
          <v-row class="ma-2">
            <v-col cols="12">
              <p>{{ $t('addCommunityForm.form') }}</p>
            </v-col>
            <div>
              <v-col cols="12" v-for="(question, i) in formData.joiningQuestions" :key="`j-q-${i}`" class="pa-1">
                <v-text-field
                  v-model="formData.joiningQuestions[i].label"
                  append-icon="mdi-delete"
                  @click:append="removeJoiningQuestion(i)"
                  :label="`Question ${i + 1}`"
                  auto-focus
                  outlined
                  hide-details
                />
              </v-col>
            </div>
            <v-col cols="12" justify="start" class="px-1">
              <v-btn color="black" class="white--text" @click="addQuestionField">
                <v-icon class="pr-1">mdi-plus</v-icon> {{ $t('addCommunityForm.addQuestion') }}
              </v-btn>
            </v-col>
          </v-row>
        </v-tab-item>
        <v-tab-item light value="tab-3">
          <v-col cols="12" class="pa-5">
            <p class="mb-5">{{ t('kaitiakiDescription') }}</p>

            <!-- Displays Tribal Kaitiaki in rows, new and existing ones that havent been removed -->
            <v-row  v-for="(kaitiaki , i) in formData.authors" :key="i" class="justify-center align-center mx-4 mt-4">
              <v-col cols="1" class="pt-0 px-0">
                <Avatar :size="mobile ? '50px' : '40px'" :image="kaitiaki.avatarImage" :alt="kaitiaki.preferredName" :gender="kaitiaki.gender"/>
              </v-col>
              <v-col :class="mobile ? 'pl-5':'py-0'">
                <p style="color:black;">{{ getDisplayName(kaitiaki) }}</p>
              </v-col>
              <v-col v-if="formData.authors && formData.authors.length >= 2">
                <v-btn depressed color="white" @click="deleteKaitiaki(kaitiaki)">
                  <v-icon>mdi-delete</v-icon>
                </v-btn>
              </v-col>
            </v-row>

            <!-- Displays the button to add new kaitiaki - shows the drop down when clicked -->
            <v-row v-if="!showKaitiaki" class="pa-5">
              <v-btn color="black" class="white--text" @click="showKaitiaki = true">
                <v-icon small class="pr-2">mdi-plus</v-icon> {{ t('kaitiaki') }}
              </v-btn>
            </v-row>

            <!-- The drop down for selecting members as kaitiaki -->
            <v-row v-else class="pa-5">
              <v-col cols="12" md="6" class="pa-0">
                <v-autocomplete
                  v-model="kaitiaki"
                  :items="members"
                  v-bind="customProps"
                  outlined
                  :label="t('selectMember')"
                  dense
                  bottom
                >
                  <template v-slot:item="data">
                    <template>
                      <v-list-item @click="addKaitiaki(data.item)">
                        <v-list-item-avatar>
                          <img :src="profileImage(data.item)">
                        </v-list-item-avatar>
                        <v-list-item-content>
                          <v-list-item-title> {{ getDisplayName(data.item) }}</v-list-item-title>
                        </v-list-item-content>
                      </v-list-item>
                    </template>
                  </template>
                </v-autocomplete>
              </v-col>
            </v-row>
          </v-col>
        </v-tab-item>
        <v-tab-item light value="tab-4">
          <Permissions mobile />
        </v-tab-item>
      </v-tabs-items>
    </template>
    <template v-slot:before-actions>
      <v-col justify="center">
        <v-btn v-if="editing" text @click="$emit('delete')">
          {{ t('deleteCommunity') }}
          <v-icon class="pl-2">mdi-delete</v-icon>
        </v-btn>
      </v-col>
    </template>
  </Dialog>
</template>

<script>
import Dialog from '@/components/dialog/Dialog.vue'
import CommunityForm from '@/components/community/CommunityForm.vue'
import { EMPTY_COMMUNITY, setDefaultCommunity } from '@/lib/community-helpers.js'
import { getObjectChanges } from '@/lib/get-object-changes.js'
import { getDisplayName } from '@/lib/person-helpers.js'
import Avatar from '@/components/Avatar.vue'
import avatarHelper from '@/lib/avatar-helpers.js'
import Permissions from './Permissions'

export default {
  name: 'NewCommunityDialog',
  components: {
    Dialog,
    CommunityForm,
    Avatar,
    Permissions
  },
  props: {
    show: { type: Boolean, required: true },
    profile: { type: Object, default () { return EMPTY_COMMUNITY } },
    title: { type: String, default: 'Create a new community' },
    hideDetails: { type: Boolean, default: false },
    editing: Boolean,
    tribe: Object
  },
  data () {
    return {
      formData: setDefaultCommunity(this.profile),
      tab: null,
      showKaitiaki: false,
      kaitiaki: this.profile.kaitiaki
    }
  },
  watch: {
    'formData.joiningQuestions': {
      deep: true,
      immediate: true,
      handler (joiningQuestions) {
        if (joiningQuestions && joiningQuestions.length > 0) this.allowJoiningQuestions = true
        else this.allowJoiningQuestions = false
      }
    },
    tab (newVal) {
      if (newVal === 'tab-2' && this.formData.joiningQuestions.length < 1) {
        this.formData.joiningQuestions.push({ label: '', type: 'input' })
      }
    }
  },

  computed: {
    mobile () {
      return this.$vuetify.breakpoint.xs
    },
    members () {
      return this.tribe.members
        .filter((member) => {
          return !this.formData.authors.some(kaitiaki => {
            return kaitiaki.id === member.id
          })
        })
    },
    customProps () {
      return {
        hideDetails: true,
        menuProps: { bottom: true, offsetY: true, light: true },
        light: true,
        autoFocus: true
      }
    }
  },
  methods: {
    getDisplayName,
    addKaitiaki (tiaki) {
      this.formData.authors.push(tiaki)
      this.showKaitiaki = false
    },
    deleteKaitiaki (tiaki) {
      const index = this.formData.authors.indexOf(tiaki)
      if (index > -1) {
        this.formData.authors.splice(index, 1)
      }
    },
    profileImage (profile) {
      if (profile.avatarImage && profile.avatarImage.uri) return profile.avatarImage.uri
      else return avatarHelper.defaultImage()
    },
    addQuestionField () {
      this.formData.joiningQuestions.push({ label: '', type: 'input' })
    },
    removeJoiningQuestion (index) {
      this.formData.joiningQuestions.splice(index, 1)
    },
    submit () {
      var output = {}
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
