<template>
  <Dialog :show="show" @close="close" width="720px" :goBack="close" enableMenu>
    <v-form ref="form" v-model="form.valid" lazy-validation>
      <v-card>
        <v-container width="100%" class="pa-0">
          <v-card-text>
            <v-row class="px-2">
              <v-col cols="12" sm="5" order-sm="2">
                <v-row class="pa-0">
                  <v-col v-if="!mobile" cols="offset-7 4 " class="pa-0" align="right">
                    <!-- Dialog close button -->
                    <v-btn @click="close" fab text top right color="secondary" class="close">
                      <v-icon>mdi-close</v-icon>
                    </v-btn>
                  </v-col>
                  <v-col v-if="formData.gender !== '' || showAvatar" cols="12" class="pa-0">
                    <!-- Avatar -->
                    <Avatar
                      class="big-avatar"
                      size="250px"
                      :image="formData.avatarImage"
                      :alt="formData.preferredName"
                      :gender="formData.gender"
                      :bornAt="formData.bornAt"
                      :diedAt="formData.diedAt"
                    />
                  </v-col>
                  <v-col v-if="!hasSelection" cols="12" justify="center" align="center" class="pa-0">
                    <ImagePicker @updateAvatar="formData.avatarImage = $event "/>
                  </v-col>
                    <!-- END of Avatar -->
                </v-row>
              </v-col>
              <v-col cols="12" sm="7" class="border-right">
                <v-row>
                  <!-- DIALOG TITLE -->
                  <v-col cols="12" class="pa-0 pb-5">
                    <h1> {{ hasSelection ? `Add ${formData.preferredName} as a ${title}` : `${title}` }} </h1>
                  </v-col>

                  <!-- PREFERRED NAME + Search -->
                  <v-col cols="12" class="pa-1">
                    <v-combobox
                        v-model="formData.preferredName"
                        :items="suggestions"
                        label="Preferred name. This is the name show on your profile"
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
                              <!-- <v-list-item-icon class="mt-0 mb-0">

                              </v-list-item-icon> -->
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
                                  <small>{{ data.item.bornAt }}</small>
                                </v-col>
                              </v-row>

                            </v-list-item>
                          </template>
                        </template>
                      </v-combobox>
                  </v-col>

                  <!-- LEGAL NAME -->
                  <v-col cols="12" class="pa-1">
                    <v-text-field
                      v-model="formData.legalName"
                      label="Legal name."
                      v-bind="customProps"
                    />
                  </v-col>
                  <template v-if="hasSelection">
                    <v-col v-for="(altName, index) in formData.altNames"
                      :key="`a-${index}`"
                      cols="12"
                      sm="6"
                      class="pa-1"
                    >
                      <v-text-field
                        v-model="formData.altNames[index]"
                        :label="`Alternative name ${index + 1}`"
                        v-bind="customProps"
                        cols="12"
                      />
                    </v-col>
                  </template>
                  <template v-else>
                    <v-col v-for="(altName, index) in formData.altNames.add"
                      :key="`b-${index}`"
                      cols="12"
                      sm="6"
                      class="pa-1"
                    >
                      <v-text-field
                        v-model="formData.altNames.add[index]"
                        :label="`Alternative name ${ index + 1}`"
                        append-icon="mdi-delete"
                        @click:append="deleteFromDialog(index)"
                        v-bind="customProps"
                      />
                    </v-col>
                    <v-col cols="12" class="pa-1">
                      <AddButton label="Add name" @click="addAltNameField" row/>
                  </v-col>
                  </template>

                  <!-- DATE OF BIRTH -->
                  <v-col cols="12" sm="6" class="pa-1">
                    <NodeDatePicker
                      :value="formData.bornAt"
                      label="Date of birth"
                      @date="formData.bornAt = $event"
                      :readonly="hasSelection"
                    />
                  </v-col>

                  <!-- ORDER OF BIRTH -->
                  <v-col cols="12" sm="6" class="pa-1">
                    <v-text-field
                      v-model="formData.birthOrder"
                      type="number"
                      label="Order of birth"
                      min="1"
                      v-bind="customProps"
                    />
                  </v-col>

                  <!-- DIED AT CHECKBOX -->
                  <v-col cols="12" sm="6" class="pa-1" v-if="!hasSelection">
                    <v-checkbox v-model="formData.isDeceased"
                      label="No longer living" :hide-details="true"
                    />
                  </v-col>

                  <!-- DIED AT PICKER -->
                  <v-col cols="12" sm="6" class="pa-1">
                    <NodeDatePicker
                      v-if="formData.isDeceased || hasSelection"
                      label="Date of death"
                      :value="formData.diedAt"
                      @date="formData.diedAt = $event"
                      :readonly="hasSelection"
                    />
                  </v-col>

                  <!-- GENDER VIEW -->
                  <v-col v-if="hasSelection" cols="6" sm="6" class="pa-1">
                    <v-text-field
                      v-model="formData.gender"
                      label="Gender"
                      v-bind="customProps"
                    />
                  </v-col>

                  <!-- GENDER EDIT -->
                  <v-col v-else cols="6"  sm="6" class="pa-1">
                    <small>Gender</small>
                    <v-radio-group v-model="formData.gender" row class="mt-0 pt-0" hide-details>
                      <v-radio v-for="(gender, index) in genders"
                      :value="gender" :key="index" :label="gender"
                      class="ma-0 pa-0  pr-2"/>
                    </v-radio-group>
                  </v-col>

                  <!-- RELATED BY -->
                  <v-col cols="12" sm="6" class="pa-1">
                    <v-select
                      v-model="formData.relationshipType"
                      label="Related By"
                      :rules="form.rules.relationshipType"
                      :items="relationshipTypes"
                      :menu-props="{ light: true }"
                      placeholder=" "
                    />
                  </v-col>

                  <v-col v-if="showLegallyAdopted" cols="6" class="pa-1">
                      <v-checkbox v-model="formData.legallyAdopted" label="Legally Adopted"
                        hide-details class="pa-0"
                      />
                  </v-col>

                  <!-- Description textarea -->
                  <v-col cols="12" class="pa-1" v-if="!hasSelection">
                    <v-textarea v-if="formData.description || showDescription"
                      v-model="formData.description"
                      label="Description"
                      v-bind="customProps"
                      no-resize
                      rows="1"
                      auto-grow
                    >
                    </v-textarea>

                    <!-- Description button -->
                    <AddButton v-else label="Add description" @click="toggleDescription" row/>
                  </v-col>
                </v-row>
              </v-col>
            </v-row>
            <v-row>
              <v-col :align="mobile ? '' : 'right'" class="pt-0 pb-o">
                <v-btn @click="close"
                  text large fab
                  class="secondary--text"
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
          </v-card-text>
        </v-container>
      </v-card>
    </v-form>
  </Dialog>
</template>

<script>
import Dialog from '@/components/dialog/Dialog.vue'
import Avatar from '@/components/Avatar.vue'
import ImagePicker from '@/components/ImagePicker.vue'
import NodeDatePicker from '@/components/NodeDatePicker.vue'
import AddButton from '@/components/button/AddButton.vue'

import { GENDERS, RELATIONSHIPS, RULES, PERMITTED_PROFILE_ATTRS } from '@/lib/constants'
import isEmpty from 'lodash.isempty'
import pick from 'lodash.pick'

function defaultData (withRelationships, profile) {
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
    // title: '',
    bornAt: '',
    diedAt: '',
    birthOrder: '',
    description: ''
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
    Dialog,
    Avatar,
    NodeDatePicker,
    AddButton,
    ImagePicker
  },
  props: {
    show: {
      type: Boolean,
      required: true
    },
    withRelationships: {
      type: Boolean,
      default: true
    },
    title: {
      type: String,
      default: 'Create a new person'
    },
    suggestions: {
      type: Array
    }
  },
  data () {
    return {
      genders: GENDERS,
      relationshipTypes: RELATIONSHIPS,
      permitted: PERMITTED_PROFILE_ATTRS,
      formData: defaultData(this.withRelationships, {}),
      selected: null,
      hasSelection: false,
      avatar: {
        new: null,
        showEditor: false
      },
      showAvatar: false,
      isDeceased: false,
      showDescription: false,
      radios: 'radio-1',
      altNameCount: 0,
      form: {
        valid: true,
        rules: RULES
      }
    }
  },
  computed: {
    customProps () {
      return {
        readonly: this.hasSelection,
        flat: this.hasSelection,
        // appendIcon: this.isEditing ? '' ? 'mdi-delete' : 'mdi-pencil',
        hideDetails: true,
        placeholder: ' ',
        class: this.hasSelection ? 'custom' : ''
      }
    },
    mobile () {
      return this.$vuetify.breakpoint.xs
    },
    showLegallyAdopted () {
      switch (this.formData.relationshipType) {
        case 'whangai': return true
        case 'adopted': return true
        default: return false
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
    isDeceased (newValue) {
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

  },
  methods: {
    close: function () {
      // reset the form properties
      // this.formData = defaultForm()
      // TODO: figure out when is a good time to reset these?

      this.$emit('close')
    },
    toggleShowAvatar () {
      this.showAvatar = !this.showAvatar
    },
    toggleAvatar (file) {
      this.avatar.new = this.avatar.new ? null : file
      this.avatar.showEditor = !this.avatar.showEditor
    },
    updateAvatar (avatarImage) {
      this.formData.avatarImage = avatarImage
      this.toggleAvatar(null)
    },
    addAltNameField () {
      this.formData.altNames.add.push(null)
    },
    toggleDescription () {
      this.showDescription = true
    },
    submit () {
      if (!this.$refs.form.validate()) {
        alert('Empty form cannot be submitted')
        console.log('not submitted')
        return
      }

      var submission = Object.assign({}, this.submission)

      this.hasSelection
        ? this.$emit('submit', pick(this.formData, ['id', 'relationshipType', 'legallyAdopted']))
        : this.$emit('submit', submission)

      this.close()
    },
    setFormData (profile) {
      this.hasSelection = true
      this.formData = profile
    },
    resetFormData () {
      if (this.hasSelection) {
        this.hasSelection = false
        this.formData = defaultData()
      }
    },
    deleteFromDialog (index) {
      this.formData.altNames.add.splice(index, 1)
    }
  }
}
</script>
