<template>
  <v-form ref="form" light class="px-4">
      <v-row>
        <!-- Upload profile photo -->

          <!-- Names -->
        <v-col cols="12" :sm="mobile ? '12' : '6'" class="pt-4">
            <v-row>
              <v-col cols="12" class="pa-1">
                <slot name="search">
                  <v-text-field
                    v-model="formData.preferredName"
                    label="First name / Preferred name"
                    v-bind="customProps"
                    outlined
                  />
                </slot>
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
                :sm="mobile ? '12' : '6'"
                class="pa-1"
              >
                <v-text-field
                  v-model="formData.altNames.value[index]"
                  :label="`Nick name / Alternative name`"
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
                :sm="mobile ? '12' : '6'"
                class="pa-1"
              >
                <v-text-field
                  v-model="formData.altNames.add[index]"
                  :label="`Nick name / Alternative name ${index + 1}`"
                  append-icon="mdi-delete"
                  @click:append="removeAltNameField(index)"
                  v-bind="customProps"
                  cols="12"
                  outlined
                />
              </v-col>
              <v-row class="mx-1">
                <v-col cols="8"></v-col>
                <AddButton :align="'flex-end'" :width="'50px'" label="Add name" @click="addAltNameField" row/>
              </v-row>
            </template>
          </v-row>

         
        </v-col>

      </v-row>
  </v-form>
</template>

<script>
import AddButton from '@/components/button/AddButton.vue'

export default {
  name: 'ProfileForm',
  components: {
    AddButton,
  },
  props: {
    profile: { type: Object, required: true },
    withRelationships: { type: Boolean, default: true },
    readonly: { type: Boolean, default: false },
    hideDetails: { type: Boolean, default: false },
    editRelationship: { type: Boolean, default: false },
    mobile: { type: Boolean, default: false },
    isEditing: { type: Boolean, default: false },
    isUser: { type: Boolean, default: false }
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
      deep: true,
      immediate: true,
      handler (newVal) {
        this.formData = newVal
      }
    },
    'formData.gender' (newValue) {
      console.log('gender: ', newValue)
      if (newValue === 'male') this.updateSelectedGender('male')
      if (newValue === 'female') this.updateSelectedGender('female')
    }
  },
  computed: {
    customProps () {
      // readonly = hasSelected || !isEditing
      return {
        readonly: this.readonly,
        flat: this.readonly,
        hideDetails: true,
        placeholder: ' ',
        class: this.readonly ? 'custom' : '',
        light: true
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
    updateSelectedGender (genderClicked) {
      // reset images to outlined
      this.$refs.taneImg.src = require('@/assets/tane-outlined.svg')
      this.$refs.wahineImg.src = require('@/assets/wahine-outlined.svg')
      // hightlight selected image
      this.genderSelected = genderClicked
      if (this.genderSelected === 'male') {
        this.$refs.taneImg.src = require('@/assets/tane.svg')
      }
      if (this.genderSelected === 'female') {
        this.$refs.wahineImg.src = require('@/assets/wahine.svg')
      }
      // update the gender
      this.formData.gender = this.genderSelected
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

<style scoped lang="scss">
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

    .gender-button {
      width: auto;
      height: 100px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 5px;

      .gender-image {
        margin-top:30px;
        width: 8em;
        height: 8em;
        border: 0.5px solid rgba(0,0,0,0.6);
        border-radius: 50%;
        cursor: pointer;
        transition: all 0.3s;

        &:hover {
          border: 2px solid rgba(0,0,0,0.87);
        }
      }

      .gender-image-mobile {
        width: 6em;
        height: 6em;
        border: 0.5px solid rgba(0,0,0,0.6);
        border-radius: 50%;
        cursor: pointer;
        transition: all 0.3s;

        &:hover {
          border: 2px solid rgba(0,0,0,0.87);
        }
      }
    }
  }
</style>
