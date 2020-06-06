<template>
  <v-form ref="form" light>
    <v-col>
      <v-row>

        <!-- Upload profile photo -->
        <v-col order-sm="2" class="mt-5">
          <v-row>
            <v-col cols="12" class="pa-0">
              <!-- Avatar -->
              <Avatar class="big-avatar" size="200px" :image="formData.avatarImage" :alt="formData.preferredName"
                :gender="formData.gender" :bornAt="formData.bornAt" :deceased="formData.deceased" />
            </v-col>
            <!-- Upload Profile Photo Button -->
            <v-col v-if="!readonly" cols="12" justify="center" align="center" class="pa-0">
              <ImagePicker @updateAvatar="formData.avatarImage = $event" :avatarLoaded="formData.avatarImage"
                type="avatar" />
            </v-col>
          </v-row>
        </v-col>

        <!-- Names -->
        <v-col cols="12" sm="6" class="pt-4">
          <v-row>
            <v-col cols="12" class="pa-1">
              <slot name="search">
                <v-text-field v-model="formData.preferredName" label="Community preferred name" v-bind="customProps"
                  outlined />
              </slot>
            </v-col>
            <v-col cols="12" class="pa-1">
              <v-text-field v-model="formData.legalName" label="Community legal name" v-bind="customProps" outlined />
            </v-col>
          </v-row>
        </v-col>
      </v-row>

      <v-row>
        <v-col cols="12">
          <v-row>
            <!-- Description textarea -->
            <v-col cols="12" class="pa-1">
              <v-textarea v-model="formData.description" label="Description" v-bind="customProps" no-resize rows="4"
                auto-grow outlined>
              </v-textarea>
            </v-col>
          </v-row>
          <v-row>
            <v-col cols="12" sm="6">
              <v-row>
                <v-col cols="12" class="pa-1">
                  <!-- Address -->
                  <v-text-field v-model="formData.address" label="Address" v-bind="customProps" outlined />
                </v-col>
              </v-row>
            </v-col>
            <v-col cols="12" sm="6">
              <v-row>
                <v-col cols="12" class="pa-1">
                  <!-- City, Country -->
                  <v-text-field v-model="formData.location" label="City, Country" v-bind="customProps" outlined />
                </v-col>
              </v-row>
            </v-col>
          </v-row>
        </v-col>
      </v-row>

      <div class="divider"></div>
      <v-row class="pl-1">
        <p>Kaitiaki</p>
      </v-row>
      <v-row>
        <v-col cols="12" sm="6">
          <!-- Email -->
          <v-row>
            <v-col cols="12" class="pa-1">
              <v-text-field v-model="formData.email" label="Email" v-bind="customProps" outlined />
            </v-col>
          </v-row>
          <!-- Phone -->
          <v-row>
            <v-col cols="12" class="pa-1">
              <v-text-field v-model="formData.phone" label="Phone" v-bind="customProps" outlined />
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
import NodeDatePicker from '@/components/NodeDatePicker.vue'

import {
  GENDERS,
  RELATIONSHIPS
} from '@/lib/constants'

export default {
  name: 'ProfileForm',
  components: {
    Avatar,
    ImagePicker,
    AddButton,
    NodeDatePicker
  },
  props: {
    profile: {
      type: Object,
      required: true
    },
    withRelationships: {
      type: Boolean,
      default: true
    },
    readonly: {
      type: Boolean,
      default: false
    },
    hideDetails: {
      type: Boolean,
      default: false
    },
    editRelationship: {
      type: Boolean,
      default: false
    }
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
        case 'whangai':
          return true
        case 'adopted':
          return true
        default:
          return false
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
  .custom.v-text-field>.v-input__control>.v-input__slot:before {
    border-style: none;
  }

  .custom.v-text-field>.v-input__control>.v-input__slot:after {
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
    color: rgba(0, 0, 0, 0.6);
    font-size: 0.8em;
    margin: 0;
  }

  .radio-button>input[type="radio"] {
    opacity: 0;
    position: fixed;
    width: 0;
  }

  .radio-button>label {
    display: inline-block;
    background-color: #ddd;
    padding: 10px 20px;
    font-family: sans-serif, Arial;
    font-size: 16px;
    border: 2px solid #444;
    border-radius: 4px;
  }

  .radio-button>label:hover {
    background-color: #dfd;
  }

  .radio-button>input[type="radio"]:focus+label {
    border: 2px dashed #444;
  }

  .radio-button>input[type="radio"]:checked+label {
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
        width: 6em;
        height: 6em;
        border: 0.5px solid rgba(0, 0, 0, 0.6);
        border-radius: 50%;
        cursor: pointer;
        transition: all 0.3s;

        &:hover {
          border: 2px solid rgba(0, 0, 0, 0.87);
        }
      }
    }
  }

  .divider {
    border-bottom: 1px solid rgba(0, 0, 0, 0.08);
    margin-bottom: 20px;
  }
</style>
