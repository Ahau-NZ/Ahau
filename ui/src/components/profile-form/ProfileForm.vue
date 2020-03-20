<template>
  <v-form ref="form" >
    <v-row>
      <v-col order-sm="2">
        <v-row>
          <v-col cols="12" class="pa-0">
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
          <v-col v-if="!readonly" cols="12" justify="center" align="center" class="pa-0">
            <ImagePicker @updateAvatar="formData.avatarImage = $event"/>
          </v-col>
        </v-row>
      </v-col>
      <v-col cols="12" sm="6" class="pt-0">
        <v-row>
          <v-col cols="12" class="pa-1">
            <slot name="search">
              <v-text-field
                v-model="formData.preferredName"
                label="Preferred name"
                v-bind="customProps"
              />
            </slot>
          </v-col>
          <v-col cols="12" class="pa-1">
            <v-text-field
              v-model="formData.legalName"
              label="Legal name."
              v-bind="customProps"
            />
          </v-col>

          <template>
            <v-col v-for="(altName, index) in formData.altNames.value"
              :key="`value-alt-name-${index}`"
              cols="12"
              sm="6"
              class="pa-1"
            >
              <v-text-field
                v-model="formData.altNames.value[index]"
                :label="`Alternative name ${index + 1}`"
                :append-icon="readonly ? '' : 'mdi-delete'"
                @click:append="removeAltName(formData.altNames.value[index], index)"
                readonly
                v-bind="customProps"
              />
            </v-col>
          </template>
          <template v-if="!readonly">
            <v-col v-for="(altName, index) in formData.altNames.add"
              :key="`add-alt-name-${index}`"
              cols="12"
              sm="6"
              class="pa-1"
            >
              <v-text-field
                v-model="formData.altNames.add[index]"
                :label="`Alternative name ${index + 1}`"
                append-icon="mdi-delete"
                @click:append="removeAltNameField(index)"
                v-bind="customProps"
                cols="12"
              />
            </v-col>
            <v-col cols="12" class="pa-1">
              <AddButton label="Add name" @click="addAltNameField" row />
            </v-col>
          </template>
          <!-- DATE OF BIRTH -->
          <v-col cols="12" sm="6" class="pa-1">
            <NodeDatePicker
              :value="formData.bornAt"
              label="Date of birth"
              @date="formData.bornAt = $event"
              :readonly="readonly"
            />
          </v-col>
          <!-- ORDER OF BIRTH -->
          <v-col v-if="!readonly || formData.birthOrder" cols="12" sm="6" class="pa-1">
            <v-text-field
              v-model="formData.birthOrder"
              type="number"
              label="Order of birth"
              min="1"
              v-bind="customProps"
            />
          </v-col>
          <!-- DIED AT CHECKBOX -->
          <v-col cols="12" sm="6" class="pa-1" v-if="!readonly">
            <v-checkbox v-model="formData.isDeceased"
              label="No longer living" :hide-details="true"
            />
          </v-col>
          <!-- DIED AT PICKER -->
          <v-col cols="12" sm="6" class="pa-1" v-if="readonly ? hideDetails : true">
            <NodeDatePicker
              v-if="formData.isDeceased || readonly"
              label="Date of death"
              :value="formData.diedAt"
              @date="formData.diedAt = $event"
              :readonly="readonly"
            />
          </v-col>
          <!-- GENDER VIEW -->
          <v-col v-if="readonly" cols="12" sm="6" class="pa-1">
            <v-text-field
              v-model="formData.gender"
              label="Gender"
              v-bind="customProps"
            />
          </v-col>
          <!-- GENDER EDIT -->
          <v-col v-else cols="12"  sm="6" class="pa-1">
            <small>Gender</small>
            <v-radio-group v-model="formData.gender" row class="mt-0 pt-0" hide-details>
              <v-radio v-for="(gender, index) in genders"
                :value="gender" :key="index" :label="gender"
                class="ma-0 pa-0  pr-2"
              />
            </v-radio-group>
          </v-col>
          <!-- Related By view mode-->
          <!-- TODO: hide if relationship is unknown -->
          <v-col v-if="(readonly && !hideDetails && !editRelationship)" cols="6" sm="6" class="pa-1">
            <v-text-field
              v-model="formData.relationshipType"
              label="Related By"
              v-bind="customProps"
            />
          </v-col>
          <!-- Related By edit mode-->
          <v-col v-if="!readonly || editRelationship" cols="6" sm="6" class="pa-1">
            <v-select
              v-model="formData.relationshipType"
              label="Related By"
              :items="relationshipTypes"
              :menu-props="{ light: true }"
              placeholder=" "
              :append-icon="readonly ? '' : 'mdi-chevron-down'"
            />
          </v-col>
          <v-col v-if="showLegallyAdopted" cols="6" class="pa-1">
              <v-checkbox v-model="formData.legallyAdopted" label="Legally Adopted"
                hide-details class="pa-0"
              />
          </v-col>

          <!-- Description textarea -->
          <v-col cols="12" class="pa-1" v-if="form.showDescription || readonly">
            <v-textarea
              v-model="formData.description"
              label="Description"
              v-bind="customProps"
              no-resize rows="1" auto-grow
            >
            </v-textarea>
          </v-col>
          <!-- Description button -->
          <v-col v-else cols="12" class="pa-1">
            <AddButton label="Add description" @click="form.showDescription = true" row/>
          </v-col>
        </v-row>
      </v-col>
    </v-row>
  </v-form>
</template>
<script>

import Avatar from '@/components/Avatar.vue'
import ImagePicker from '@/components/ImagePicker.vue'
import AddButton from '@/components/button/AddButton.vue'
import NodeDatePicker from '@/components/NodeDatePicker.vue'

import { GENDERS, RELATIONSHIPS } from '@/lib/constants'

export default {
  name: 'ProfileForm',
  components: {
    Avatar,
    ImagePicker,
    AddButton,
    NodeDatePicker
  },
  props: {
    profile: { type: Object, required: true },
    withRelationships: { type: Boolean, default: true },
    readonly: { type: Boolean, default: false },
    hideDetails: { type: Boolean, default: false },
    editRelationship: { type: Boolean, default: false }
  },
  data () {
    return {
      genders: GENDERS,
      relationshipTypes: RELATIONSHIPS,
      formData: this.profile,
      form: {
        valid: true,
        showDescription: false
      }
    }
  },
  watch: {
    profile: {
      handler (newVal) {
        this.formData = newVal
      }
    },
    deep: true
  },
  computed: {
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
    showLegallyAdopted () {
      switch (this.formData.relationshipType) {
        case 'whangai': return true
        case 'adopted': return true
        default: return false
      }
    },
    altNames () {
      return [...this.formData.altNames.value, ...this.formData.altNames.add]
    }
  },
  methods: {
    addAltNameField () {
      this.formData.altNames.add.push(null)
    },
    removeAltName (altName, index) {
      this.formData.altNames.value.splice(index, 1)
      this.formData.altNames.remove.push(altName)
    },
    removeAltNameField (index) {
      this.formData.altNames.add.splice(index, 1)
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
