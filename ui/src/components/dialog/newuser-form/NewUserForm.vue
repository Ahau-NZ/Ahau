<template>
  <v-form ref="form" light >
    <v-col>
      <v-row>

        <!-- Upload profile photo -->
        <v-col order-sm="2" class="mt-5">
          <v-row >
            <v-col cols="12" class="pa-0" >
              <!-- Avatar -->
              <Avatar
                class="big-avatar"
                size="200px"
                :image="formData.avatarImage"
                :alt="formData.preferredName"
                :gender="formData.gender"
                :bornAt="formData.bornAt"
                :diedAt="formData.diedAt"
              />
            </v-col>
            <!-- Upload Profile Photo Button -->
            <v-col v-if="!readonly" cols="12" justify="center" align="center" class="pa-0">
              <!-- <ImagePicker @updateAvatar="formData.avatarImage = $event"/> -->
              <ImagePicker @updateAvatar="formData.avatarImage = $event" :avatarLoaded="formData.avatarImage"/>
            </v-col>
          </v-row>
        </v-col>
      
        <!-- Names -->
        <v-col cols="12" sm="6" class="pt-4">
          <v-row>
            <v-col cols="12" class="pa-1">
              <!-- <slot name="search"> -->
                <v-text-field
                  v-model="formData.preferredName"
                  label="Preferred name"
                  v-bind="customProps"
                  outlined
                />
              <!-- </slot> -->
            </v-col>
            <v-col cols="12" class="pa-1">
              <v-text-field
                v-model="formData.legalName"
                label="Legal name."
                v-bind="customProps"
                outlined
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
                  outlined
                />
              </v-col>
            </template>

            <!-- Add Names -->
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
                  outlined
                />
              </v-col>
              <v-col cols="12" class="pa-1">
                <AddButton :align="'flex-end'" label="Add name" @click="addAltNameField" row />
              </v-col>
            </template>
          </v-row>

            <!-- DATE OF BIRTH -->
          <v-row>
            <v-col cols="12" class="pa-1">
              <NodeDatePicker
                :value="formData.bornAt"
                label="Date of birth"
                @date="formData.bornAt = $event"
                :readonly="readonly"
              />
            </v-col>
          </v-row>
          <!-- ORDER OF BIRTH -->
          <v-row>
            <v-col v-if="!readonly || formData.birthOrder" cols="12" class="pa-1">
              <v-text-field
                v-model="formData.birthOrder"
                type="number"
                label="Order of birth"
                min="1"
                v-bind="customProps"
                outlined
              />
            </v-col>
          </v-row>

        </v-col>
      </v-row>

      <v-row>  
        <!-- GENDER VIEW -->
        <v-col  v-if="readonly" cols="12" sm="6" class="pa-1">
          <v-text-field
            v-model="formData.gender"
            label="Gender"
            v-bind="customProps"
          />
        </v-col>
        <!-- GENDER EDIT -->
        <v-col v-else class="pa-1"  cols="12" sm="6" >
          <p class="text-field">Gender</p>
          <!-- <v-radio-group v-model="formData.gender" row class="mt-0 pt-0" hide-details>
            <v-radio v-for="(gender, index) in genders"
              :value="gender" :key="index" :label="gender"
              class="ma-0 pa-0  pr-2 radio-button"
              :id="gender"
            />
          </v-radio-group> -->
          <v-row class="gender-button-row">
            <GenderButton v-for="(gender, index) in genders" 
              :key="index" 
              :gender="gender" 
              @updateSelectedGender="updateGender"
              class="pa-0" 
            />
          </v-row>
        </v-col>

        <!-- DESCRIPTION -->
        <!-- Description textarea -->
        <!-- <v-col class="ml-4" v-if="form.showDescription || readonly"> -->
        <v-col class="pa-1"  cols="12" sm="6" >
          <v-textarea
            v-model="formData.description"
            label="Description"
            v-bind="customProps"
            no-resize 
            rows="4" 
            auto-grow
            outlined
          >
          </v-textarea>
        </v-col>
        <!-- Description button -->
        <!-- <v-col v-else cols="12" sm="6" class="pa-1 ml-4">
          <AddButton label="Add description" @click="form.showDescription = true" row />
        </v-col> -->
      </v-row>

      <v-row> 
        <v-col cols="12" sm="6" >
          <!-- Contact -->
          <v-row>
            <v-col cols="12" class="pa-1">
                <v-text-field
                  v-model="formData.contact"
                  label="Email"
                  v-bind="customProps"
                  outlined
                />
              </v-col>
          </v-row>
          <!-- Profession -->
          <v-row>
            <v-col cols="12" class="pa-1">
              <v-text-field
                v-model="formData.profession"
                label="Occupation"
                v-bind="customProps"
                outlined
              />
            </v-col>
          </v-row>
        </v-col>
      
        <v-col cols="12" sm="6" >
          <v-row>
            <v-col cols="12" class="pa-1">
              <!-- Location -->
              <v-text-field
                v-model="formData.location"
                label="Location"
                v-bind="customProps"
                outlined
              />
            </v-col>
          </v-row>
        </v-col>
      </v-row>
      
    </v-col>
  </v-form>
</template>
<script>

import Avatar from '@/components/Avatar.vue'
import ImagePicker from '@/components/ImagePicker.vue'
import AddButton from '@/components/button/AddButton.vue'
import GenderButton from '@/components/button/GenderButton.vue'
import NodeDatePicker from '@/components/NodeDatePicker.vue'

import { GENDERS, RELATIONSHIPS } from '@/lib/constants'

export default {
  name: 'ProfileForm',
  components: {
    Avatar,
    ImagePicker,
    AddButton,
    NodeDatePicker,
    GenderButton
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
      },
      selectedGender: ''
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
    updateGender(gender) {
      console.log("got gender: ", gender)
      this.formData.gender = gender;
    },
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

<style>

</style>

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

.v-text-field input {
  text-align: center !important;
}

.text-field {
  color: rgba(0,0,0,0.6);
  font-size: 0.8em;
  margin: 0;
}

.radio-button  > input[type="radio"] {
  opacity: 0;
  position: fixed;
  width: 0;  
}

.radio-button >  label {
    display: inline-block;
    background-color: #ddd;
    padding: 10px 20px;
    font-family: sans-serif, Arial;
    font-size: 16px;
    border: 2px solid #444;
    border-radius: 4px;
}

.radio-button >  label:hover {
  background-color: #dfd;
}

.radio-button >  input[type="radio"]:focus + label {
    border: 2px dashed #444;
}

.radio-button >  input[type="radio"]:checked + label {
    background-color: #bfb;
    border-color: #4c4;
}

.gender-button-row {
  width: 100%;
  margin: 0px;
}

</style>
