<template>
  <Dialog :show="show" @close="close" width="720px" :goBack="close" enableMenu>
    <template v-slot:title>
      <h1>{{ title }}</h1>
    </template>
    <template v-if="!hideDetails" v-slot:content>
      <v-col class="pb-0 pt-0">
        <ProfileForm :profile.sync="formData" :readonly="hasSelection" :editRelationship="hasSelection">
          <template v-slot:search>
            <v-combobox
              v-model="formData.preferredName"
              :items="suggestions"
              label="Preferred name"
              item-text="preferredName"
              item-value="preferredName"
              :menu-props="{ light: true }"
              :clearable="hasSelection"
              hide-no-data
              append-icon=""
              v-bind="customProps"
              @click:clear="resetFormData()"
              no-data-text="no suggestions"
              :search-input.sync="formData.preferredName"
            >
              <template v-slot:item="data">
                <template>
                  <v-list-item @click="setFormData(data.item)">
                    <v-row>
                      <v-col class="pa-0" cols="2">
                        <Avatar size="40px" :image="data.item.avatarImage" :alt="data.item.preferredName" :gender="data.item.gender" :bornAt="data.item.bornAt" />
                      </v-col>
                      <v-col cols="2">
                        <small>{{ data.item.preferredName }}</small>
                      </v-col>
                      <v-col cols="5">
                        <small>{{ data.item.legalName }}</small>
                      </v-col>
                      <v-col cols="3">
                        <small>{{ data.item.bornAt ? data.item.bornAt.slice(0, 10) : '' }}</small>
                      </v-col>
                    </v-row>
                  </v-list-item>
                </template>
              </template>
            </v-combobox>
          </template>
        </ProfileForm>
      </v-col>
    </template>
    <template v-slot:actions>
      <v-btn @click="close"
        text large fab
        class="secondary--text"
      >
        <v-icon color="secondary">mdi-close</v-icon>
      </v-btn>
      <v-btn @click="submit"
        text large fab
        class="blue--text ml-5"
      >
        <v-icon>mdi-check</v-icon>
      </v-btn>
    </template>
  </Dialog>
</template>

<script>
import Dialog from '@/components/dialog/Dialog.vue'

import ProfileForm from '@/components/profile-form/ProfileForm.vue'
import Avatar from '@/components/Avatar.vue'
import isEmpty from 'lodash.isempty'
import pick from 'lodash.pick'

function setDefaultData (withRelationships) {
  const formData = {
    preferredName: '',
    legalName: '',
    altNames: {
      add: []
    },
    gender: '',
    relationshipType: 'birth',
    legallyAdopted: false,
    children: [],
    avatarImage: {},
    bornAt: '',
    diedAt: '',
    birthOrder: '',
    description: '',
    location: '',
    profession: '',
    address: '',
    email: '',
    phone: '',
  }

  formData.isDeceased = !!formData.diedAt

  if (!withRelationships) {
    delete formData.relationshipType
    delete formData.legallyAdopted
  }

  return formData
}

export default {
  name: 'NewNodeDialog',
  components: {
    Avatar,
    Dialog,
    ProfileForm
  },
  props: {
    show: { type: Boolean, required: true },
    withRelationships: { type: Boolean, default: true },
    title: { type: String, default: 'Create a new person' },
    suggestions: { type: Array },
    hideDetails: { type: Boolean, default: false },
    selectedProfile: { type: Object }
  },
  data () {
    return {
      formData: setDefaultData(this.withRelationships),
      hasSelection: false
    }
  },
  computed: {
    mobile () {
      return this.$vuetify.breakpoint.xs
    },
    customProps () {
      // readonly = hasSelected || !isEditing
      return {
        readonly: this.readonly,
        flat: this.readonly,
        hideDetails: true,
        placeholder: ' ',
        class: this.readonly ? 'custom' : ''
      }
    },
    submission () {
      let submission = {}
      Object.entries(this.formData).map(([key, value]) => {
        if (!isEmpty(this.formData[key])) {
          if (key === 'birthOrder') {
            submission[key] = parseInt(value)
          } else {
            submission[key] = value
          }
        }
      })
      return submission
    }
  },
  methods: {
    submit () {
      var submission = Object.assign({}, this.submission)
      this.hasSelection
        ? this.$emit('create', pick(this.formData, ['id', 'relationshipType', 'legallyAdopted']))
        : this.$emit('create', submission)
      this.close()
    },
    cordovaBackButton () {
      this.close()
    },
    close () {
      this.$emit('close')
    },
    setFormData (profile) {
      this.hasSelection = true
      this.formData = profile
      this.formData.relationshipType = 'birth'
      this.formData.legallyAdopted = false
    },
    resetFormData () {
      if (this.hasSelection) {
        this.hasSelection = false
        this.formData = setDefaultData(this.withRelationships)
      }
    }

  },
  watch: {
    'formData.relationshipType' (newValue, oldValue) {
      // make sure adoption status can't be set true when relationship type is birth
      if (newValue === 'birth') this.formData.legallyAdopted = false
    },
    // watch for changes to avatarImage to decide when to show avatar
    'formData.avatarImage' (newValue) {
      if (!isEmpty(this.formData.avatarImage)) {
        this.showAvatar = true
      }
    },
    'formData.isDeceased' (newValue) {
      if (newValue === false) {
        this.formData.diedAt = ''
      }
    },
    'formData.preferredName' (newValue) {
      if (!newValue) return
      if (newValue.length > 2) {
        if (!this.hasSelection) {
          this.$emit('getSuggestions', newValue)
        }
      } else {
        this.$emit('getSuggestions', null)
      }
    },
    hasSelection (newValue) {
      if (newValue) {
        this.$emit('getSuggestions', null)
      }
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
</style>
