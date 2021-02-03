<template>
  <v-form ref="form" light>
    <v-col class="px-0">
      <v-row>

        <!-- Upload profile photo -->
        <v-col order-sm="2" class="mt-5">
          <v-row>
            <v-col cols="12" class="pa-0">
              <!-- Avatar -->
              <Avatar class="big-avatar" size="200px" :image="formData.avatarImage" :alt="formData.preferredName" isView />
            </v-col>
            <!-- Upload Profile Photo Button -->
            <v-col v-if="!readonly" cols="12" justify="center" align="center" class="pa-0">
              <ImagePicker @updateAvatar="formData.avatarImage = $event" :avatarLoaded="formData.avatarImage" type="avatar" isView />
            </v-col>
          </v-row>
        </v-col>

        <!-- Names -->
        <v-col cols="12" sm="6" class="pt-4">
          <v-row>
            <v-col cols="12" class="pa-1">
              <!-- <slot name="search"> -->
                <v-text-field v-model="formData.preferredName" label="Community name" v-bind="customProps"/>
              <!-- </slot> -->
            </v-col>
          </v-row>
          <v-row>
            <!-- Description textarea -->
            <v-col cols="12" class="pa-1">
              <v-textarea v-model="formData.description" label="Community description" v-bind="customProps" no-resize rows="4"
                auto-grow>
              </v-textarea>
            </v-col>
          </v-row>
        </v-col>
      </v-row>

      <v-row>
        <v-col cols="12">
          <v-row>
            <v-col cols="12" sm="6" class="py-0">
              <v-row>
                <v-col cols="12" class="pa-1">
                  <!-- Address -->
                  <v-text-field v-model="formData.address" label="Address" v-bind="customProps" />
                </v-col>
              </v-row>
            </v-col>
            <v-col cols="12" sm="6" class="py-0">
              <v-row>
                <v-col cols="12" class="pa-1">
                  <!-- City, Country -->
                  <v-text-field v-model="formData.location" label="City, Country" v-bind="customProps" />
                </v-col>
              </v-row>
            </v-col>
          </v-row>
          <v-row>
            <v-col cols="12" sm="6" class="py-0">
              <v-row>
                <v-col cols="12" class="pa-1">
                  <!-- Email -->
                  <v-text-field v-model="formData.email" label="Email" v-bind="customProps" />
                </v-col>
              </v-row>
            </v-col>
            <v-col cols="12" sm="6" class="py-0">
              <v-row>
                <v-col cols="12" class="pa-1">
                  <!-- Phone -->
                  <v-text-field v-model="formData.phone" label="Phone" v-bind="customProps" />
                </v-col>
              </v-row>
            </v-col>
          </v-row>
        </v-col>
      </v-row>

      <v-row v-for="(q, i) in joiningQuestions" :key="`joining-question-${i}`">
        <v-col cols="8">
          <v-text-field
            v-model="joiningQuestions[i].label"
            v-bind="customProps"
          />
        </v-col>
        <v-col cols="3">
          <v-select
            v-model="joiningQuestions[i].type"
            label="Form Field Type"
            :items="['Small Text Box', 'Large Text Box']"
            outlined
            :menu-props="{light: true}"
          />
        </v-col>
        <v-col cols="1">
          <v-btn @click="removeQuestion(i)" icon>
            <v-icon light > mdi-delete </v-icon>
          </v-btn>
        </v-col>
      </v-row>
      <v-row>
        <v-col cols="4">
          <v-row @click="addQuestion" class="pl-5">
            <!-- <v-icon small>mdi-plus</v-icon> -->
              <AddButton size="20px" iconClass="pr-3" label="Add a joining question"  justify="start"/>
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

export default {
  name: 'CommunityForm',
  components: {
    Avatar,
    ImagePicker,
    AddButton
  },
  props: {
    formData: Object,
    readonly: {
      type: Boolean,
      default: false
    },
    hideDetails: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      form: {
        valid: true,
        showDescription: false
      },
      selectedGender: '',
      showJoiningQuestions: false,
      joiningQuestions: []
    }
  },
  watch: {
    profile: {
      handler (newVal) {
        this.formData = newVal
      },
      deep: true
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
        class: this.readonly ? 'custom' : '',
        outlined: true
      }
    }
  },
  methods: {
    addQuestion () {
      this.joiningQuestions.push({ label: null, type: null })
    },
    // removeAltName (altName, index) {
    //   this.formData.altNames.currentState.splice(index, 1)
    //   this.formData.altNames.remove.push(altName)
    // },
    removeQuestion (index) {
      this.joiningQuestions.splice(index, 1)
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
